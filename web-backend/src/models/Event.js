const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    category: { type: String, required: true, index: true },
    organizer: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true, index: true },
    price: { type: Number, required: true, default: 0, min: 0, max: 1000000 },
    image: { type: String, default: "" },
    interestedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
