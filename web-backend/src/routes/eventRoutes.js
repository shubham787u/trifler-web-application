const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Event = require("../models/Event");
const requireAuth = require("../middleware/requireAuth");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// @route   GET /api/events
// @desc    Get all events filtered by city and category
router.get("/", async (req, res) => {
  try {
    const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
    const category =
      typeof req.query.category === "string" ? req.query.category.trim() : "";
    if (city.length > 80 || category.length > 80) {
      return res.status(400).json({ success: false, error: "Filter value is too long." });
    }
    const query = {};

    if (city) query.city = new RegExp(escapeRegex(city), "i");
    if (category) query.category = new RegExp(escapeRegex(category), "i");
    query.date = { $gte: new Date(new Date().toISOString().slice(0, 10)) };

    const events = await Event.find(query).sort({ date: 1 }).limit(100).lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Event listing failed:", error);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Unable to fetch events" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.userId })
      .sort({ date: 1 })
      .limit(100)
      .lean();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Hosted event lookup failed:", error);
    return res.status(500).json({ success: false, error: "Unable to load your hosted events." });
  }
});

// @route   GET /api/events/:id
// @desc    Get a single event
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Event lookup failed:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server Error: Unable to fetch event" });
  }
});

// @route   POST /api/events
// @desc    Create a new event (Organizer endpoint)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, category, organizer, date, time, location, city, price, image } = req.body || {};
    const eventDate = new Date(date);
    const today = new Date().toISOString().slice(0, 10);
    const valid =
      typeof title === "string" && title.trim().length >= 3 && title.trim().length <= 100 &&
      typeof category === "string" && category.trim().length > 0 && category.length <= 80 &&
      typeof organizer === "string" && organizer.trim().length > 0 && organizer.trim().length <= 80 &&
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      date >= today &&
      !Number.isNaN(eventDate.getTime()) &&
      eventDate.toISOString().slice(0, 10) === date &&
      typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) &&
      typeof location === "string" && location.trim().length > 0 && location.trim().length <= 160 &&
      typeof city === "string" && city.trim().length > 0 && city.trim().length <= 80 &&
      typeof price === "number" && Number.isFinite(price) && price >= 0 && price <= 1000000 &&
      (image === undefined || image === "" || (typeof image === "string" && image.length <= 2048 && /^https?:\/\//i.test(image))) &&
      (description === undefined || (typeof description === "string" && description.length <= 2000));
    if (!valid) {
      return res.status(400).json({ success: false, error: "Please provide valid event details. The date must be today or later." });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      category: category.trim(),
      organizer: organizer.trim(),
      date: eventDate,
      time,
      location: location.trim(),
      city: city.trim(),
      price: Number(price),
      image: image || "",
      createdBy: req.userId,
    });
    return res.status(201).json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    console.error("Event creation failed:", error);
    return res.status(500).json({ success: false, error: "Unable to publish this event right now." });
  }
});

module.exports = router;
