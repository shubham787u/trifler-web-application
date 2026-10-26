import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocationPreference } from "../context/LocationContext.js";
import { createEvent } from "../services/api";

const initialForm = {
  title: "",
  description: "",
  category: "Travelling Experiences",
  organizer: "",
  date: "",
  time: "",
  location: "",
  city: "Delhi NCR",
  price: "",
  image: "",
};

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { city } = useLocationPreference();
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minimumDate = today.toISOString().slice(0, 10);
  const [formData, setFormData] = useState(() => ({ ...initialForm, city }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createEvent({
        ...formData,
        price: Number(formData.price),
      });
      navigate(`/events/${result.data._id}`);
    } catch (requestError) {
      setError(
        requestError.message || "Your experience could not be published.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page page-container">
      <Link to="/" className="back-link">
        ← Back to discover
      </Link>
      <div className="form-layout">
        <div className="form-intro">
          <span className="eyebrow">Bring people together</span>
          <h1>
            Make room for
            <br />
            <span>something memorable.</span>
          </h1>
          <p>
            Create an experience people will want to say yes to. Share the
            details and we’ll help you get the word out.
          </p>
          <div className="host-prompt">
            <span className="host-prompt-mark" aria-hidden="true">
              ✦
            </span>
            <p>
              <strong>Great experiences start with you.</strong>
              <br />
              Tell people what makes yours worth showing up for.
            </p>
          </div>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-card-heading">
            <span className="eyebrow">Event details</span>
            <h2>What are you planning?</h2>
            <p>Fields marked with * are required.</p>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="title">Event name *</label>
            <input
              id="title"
              name="title"
              required
              maxLength={100}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sunday morning art walk"
            />
          </div>
          <div className="form-field">
            <label htmlFor="description">What should people know?</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the experience, who it's for, and what to expect."
            />
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Travelling Experiences</option>
                <option>House Parties</option>
                <option>Sports</option>
                <option>Concert</option>
                <option>Pool Parties</option>
                <option>Free Events</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              >
                <option>Delhi NCR</option>
                <option>Mumbai</option>
                <option>Bangalore</option>
                <option>Pune</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="organizer">Host name *</label>
              <input
                id="organizer"
                name="organizer"
                required
                maxLength={80}
                value={formData.organizer}
                onChange={handleChange}
                placeholder="Your name or group"
              />
            </div>
            <div className="form-field">
              <label htmlFor="price">Price per person (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="0 for free"
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                min={minimumDate}
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="time">Start time *</label>
              <input
                id="time"
                name="time"
                type="time"
                required
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="location">Venue or meeting point *</label>
            <input
              id="location"
              name="location"
              required
              maxLength={160}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Lodhi Garden, New Delhi"
            />
          </div>
          <div className="form-field">
            <label htmlFor="image">Cover image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://…"
            />
            <span className="field-hint">
              Use a public image URL that represents your experience.
            </span>
          </div>
          <button
            className="button button-primary form-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Publishing your experience…" : "Publish experience"}
            {!loading && <span aria-hidden="true">↗</span>}
          </button>
        </form>
      </div>
    </main>
  );
}
