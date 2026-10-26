import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import {
  fetchEventById,
  initializeBooking,
  verifyPayment,
} from "../services/api";

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchEventById(id, { signal: controller.signal });
        setEvent(result.data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "We couldn't load this event.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEvent();
    return () => controller.abort();
  }, [id]);

  const subtotal = tickets * Number(event?.price || 0);
  const discountAmount = discountApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discountAmount;

  function applyCoupon(eventSubmit) {
    eventSubmit.preventDefault();
    if (checkoutLoading || confirmedBooking) return;
    if (coupon.trim().toUpperCase() === "TRIFLER10") {
      setDiscountApplied(true);
      setCouponMessage("Your 10% discount has been applied.");
    } else {
      setDiscountApplied(false);
      setCouponMessage("That code isn’t valid. Please check and try again.");
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setPaymentError("");
    let checkoutOpened = false;
    try {
      const result = await initializeBooking({
        eventId: id,
        ticketsCount: tickets,
        ...(discountApplied ? { couponCode: "TRIFLER10" } : {}),
      });

      if (result.paymentStatus === "Success") {
        setConfirmedBooking(result);
        return;
      }

      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const checkout = new window.Razorpay({
        key: result.payment.keyId,
        amount: result.payment.amount,
        currency: result.payment.currency,
        name: "Trifler",
        description: result.payment.eventName,
        order_id: result.payment.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#7048be" },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
            setPaymentError("Checkout was closed. No payment was confirmed.");
          },
        },
        handler: async (payment) => {
          setCheckoutLoading(true);
          try {
            const verification = await verifyPayment({
              bookingId: result.bookingId,
              ...payment,
            });
            setConfirmedBooking(verification);
          } catch (verificationError) {
            setPaymentError(
              verificationError.message ||
                "Payment was received but we couldn't confirm your booking. Contact support before trying again.",
            );
          } finally {
            setCheckoutLoading(false);
          }
        },
      });
      checkoutOpened = true;
      checkout.open();
      setPaymentError("");
    } catch (requestError) {
      setPaymentError(requestError.message || "We couldn't start your booking.");
    } finally {
      if (!checkoutOpened) setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="message-page">
        <div className="loading-spinner" aria-label="Loading checkout" />
      </main>
    );
  }
  if (error || !event) {
    return (
      <main className="message-page">
        <div className="message-card">
          <span className="eyebrow">Checkout unavailable</span>
          <h1>We couldn't load your event.</h1>
          <p>{error || "This experience may no longer be available."}</p>
          <Link to="/" className="button button-primary">
            Back to discover
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page page-container">
      <Link to={`/events/${event._id}`} className="back-link">
        ← Back to event
      </Link>
      <div className="checkout-layout">
        <section className="checkout-main">
          <span className="eyebrow">One step closer</span>
          <h1>Make it official.</h1>
          <p className="checkout-subtitle">
            Review your tickets for this experience.
          </p>

          <div className="checkout-event">
            <img
              src={
                event.image ||
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=480&q=80"
              }
              alt=""
            />
            <div>
              <span>{event.category}</span>
              <h2>{event.title}</h2>
              <p>
                {event.date &&
                  new Date(event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                · {event.time}
              </p>
            </div>
          </div>

          <div className="ticket-quantity">
            <div>
              <strong>Tickets</strong>
              <span>Choose how many people are coming</span>
            </div>
            <div className="quantity-control">
              <button
                type="button"
                aria-label="Remove one ticket"
                disabled={tickets <= 1}
                onClick={() =>
                  setTickets((current) => Math.max(1, current - 1))
                }
              >
                −
              </button>
              <span aria-live="polite">{tickets}</span>
              <button
                type="button"
                aria-label="Add one ticket"
                disabled={tickets >= 10}
                onClick={() =>
                  setTickets((current) => Math.min(10, current + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          <form className="coupon-form" onSubmit={applyCoupon}>
            <label htmlFor="coupon">Have a discount code?</label>
            <div>
              <input
                id="coupon"
                value={coupon}
                onChange={(inputEvent) => {
                  setCoupon(inputEvent.target.value);
                  setDiscountApplied(false);
                  setCouponMessage("");
                }}
                placeholder="Enter promo code"
              />
              <button type="submit">Apply</button>
            </div>
            {couponMessage && (
              <p
                className={
                  discountApplied
                    ? "coupon-message is-success"
                    : "coupon-message"
                }
                role="status"
              >
                {couponMessage}
              </p>
            )}
          </form>
        </section>

        <aside className="order-card">
          <span className="eyebrow">Your order</span>
          <h2>Almost there.</h2>
          <div className="order-line">
            <span>
              {tickets} {tickets === 1 ? "ticket" : "tickets"}
            </span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountApplied && (
            <div className="order-line discount-line">
              <span>TRIFLER10 · 10% off</span>
              <span>−₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="order-total">
            <span>Total</span>
            <strong>{total === 0 ? "Free" : `₹${total.toFixed(2)}`}</strong>
          </div>
          {paymentError && <div className="form-error" role="alert">{paymentError}</div>}
          {confirmedBooking ? (
            <div className="checkout-success" role="status">
              <strong>Your booking is confirmed!</strong>
              <span>Booking reference: {confirmedBooking.bookingId}</span>
              <button type="button" className="button button-primary booking-button" onClick={() => navigate("/profile")}>
                View my bookings
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-notice">
                <strong>Secure payment by Razorpay</strong>
                <span>Your booking is confirmed only after the payment is verified.</span>
              </div>
              <button
                className="button button-primary booking-button"
                type="button"
                disabled={checkoutLoading}
                onClick={handleCheckout}
              >
                {checkoutLoading ? "Preparing secure checkout…" : `Pay ${total === 0 ? "₹0" : `₹${total.toFixed(2)}`}`}
              </button>
            </>
          )}
          <p className="secure-note">
            Your payment details are processed securely by Razorpay.
          </p>
        </aside>
      </div>
    </main>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Unable to load secure checkout. Please try again."));
    };
    document.body.appendChild(script);
  });
}
