const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/mine", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate("event", "title date time location city image category")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Booking history lookup failed:", error);
    return res.status(500).json({ success: false, error: "Unable to load your bookings." });
  }
});

router.post("/book", async (req, res) => {
  const { eventId, ticketsCount, couponCode } = req.body || {};
  if (
    !mongoose.isValidObjectId(eventId) ||
    !Number.isInteger(ticketsCount) ||
    ticketsCount < 1 ||
    ticketsCount > 10 ||
    (couponCode !== undefined &&
      (typeof couponCode !== "string" || couponCode.length > 40))
  ) {
    return res.status(400).json({ success: false, error: "Please check your event and ticket details." });
  }

  try {
    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found." });
    }
    if (
      new Date(event.date) <
      new Date(new Date().toISOString().slice(0, 10))
    ) {
      return res.status(400).json({ success: false, error: "This event has already taken place." });
    }

    const normalizedCoupon = couponCode?.trim().toUpperCase() || "";
    if (normalizedCoupon && normalizedCoupon !== "TRIFLER10") {
      return res.status(400).json({ success: false, error: "That discount code is not valid." });
    }
    const subtotalPaise = Math.round(Number(event.price) * ticketsCount * 100);
    const totalPaise = normalizedCoupon
      ? Math.round(subtotalPaise * 0.9)
      : subtotalPaise;
    const totalAmount = totalPaise / 100;

    if (totalPaise === 0) {
      const booking = await Booking.create({
        event: event._id,
        user: req.userId,
        ticketsCount,
        totalAmount: 0,
        couponCode: normalizedCoupon,
        paymentStatus: "Success",
      });
      return res.status(201).json({
        success: true,
        message: "Your free tickets are confirmed.",
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        amountToPay: 0,
      });
    }

    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        error: "Online payment is not configured yet. No booking or charge was created.",
      });
    }

    const receipt = `trifler_${crypto.randomUUID().replace(/-/g, "").slice(0, 30)}`;
    const gatewayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt,
        notes: { eventId: event._id.toString(), userId: req.userId },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!gatewayResponse.ok) {
      console.error("Payment provider rejected order creation:", gatewayResponse.status);
      return res.status(502).json({ success: false, error: "Payment provider could not start checkout. Please try again." });
    }
    const gatewayOrder = await gatewayResponse.json();
    if (!gatewayOrder.id || gatewayOrder.amount !== totalPaise) {
      console.error("Payment provider returned an invalid order response.");
      return res.status(502).json({ success: false, error: "Payment provider returned an invalid checkout." });
    }

    const booking = await Booking.create({
      event: event._id,
      user: req.userId,
      ticketsCount,
      totalAmount,
      couponCode: normalizedCoupon,
      razorpayOrderId: gatewayOrder.id,
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Payment checkout is ready.",
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      amountToPay: totalAmount,
      payment: {
        keyId: RAZORPAY_KEY_ID,
        orderId: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        eventName: event.title,
      },
    });
  } catch (error) {
    console.error("Booking initialization failed:", error);
    return res.status(502).json({ success: false, error: "Unable to initialize your booking. Please try again." });
  }
});

router.post("/verify-payment", async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body || {};
  if (
    !mongoose.isValidObjectId(bookingId) ||
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    razorpay_order_id.length > 100 ||
    razorpay_payment_id.length > 100 ||
    !/^[a-f0-9]{64}$/i.test(razorpay_signature)
  ) {
    return res.status(400).json({ success: false, error: "Invalid payment verification details." });
  }

  try {
    const booking = await Booking.findOne({ _id: bookingId, user: req.userId });
    if (!booking || booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(404).json({ success: false, error: "Booking not found for this payment." });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({ success: false, error: "Payment verification is not configured." });
    }
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();
    const receivedSignature = Buffer.from(razorpay_signature, "hex");
    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return res.status(400).json({ success: false, error: "Payment verification failed." });
    }

    if (booking.paymentStatus !== "Success") {
      booking.paymentStatus = "Success";
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save();
    }
    return res.status(200).json({
      success: true,
      message: "Payment confirmed. Your booking is complete.",
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ success: false, error: "Unable to verify this payment." });
  }
});

module.exports = router;
