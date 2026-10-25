import { useState } from "react";
import { Link } from "react-router-dom";

const fallbackImage =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85";

export default function EventCard({ event }) {
  const [saved, setSaved] = useState(() => {
    const savedIds = JSON.parse(
      window.localStorage.getItem("trifler-saved-events") || "[]",
    );
    return savedIds.includes(event._id);
  });
  const eventDate = new Date(event.date);
  const dateLabel = Number.isNaN(eventDate.getTime())
    ? "Date to be announced"
    : eventDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
  const timeLabel = event.time
    ? new Date(`1970-01-01T${event.time}`).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  function toggleSaved() {
    const savedIds = JSON.parse(
      window.localStorage.getItem("trifler-saved-events") || "[]",
    );
    const nextIds = saved
      ? savedIds.filter((id) => id !== event._id)
      : [...savedIds, event._id];
    window.localStorage.setItem("trifler-saved-events", JSON.stringify(nextIds));
    setSaved(!saved);
  }

  return (
    <article className="event-card">
      <div className="event-card-image-wrap">
        <Link
          className="event-card-image-link"
          to={`/events/${event._id}`}
          aria-label={`View ${event.title}`}
        >
          <img
            className="event-card-image"
            src={event.image || fallbackImage}
            alt=""
            loading="lazy"
            onError={(imageEvent) => {
              imageEvent.currentTarget.src = fallbackImage;
            }}
          />
          <span className="event-category">{event.category}</span>
          <span className="event-date">{dateLabel}</span>
        </Link>
        <button
          className={`event-save${saved ? " is-saved" : ""}`}
          type="button"
          aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
          aria-pressed={saved}
          onClick={(clickEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            toggleSaved();
          }}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="event-card-content">
        <p className="event-location">
          <span aria-hidden="true">⌖</span>
          {event.location}{event.city ? ` · ${event.city}` : ""}
        </p>
        <h3><Link to={`/events/${event._id}`}>{event.title}</Link></h3>
        <p className="event-organizer">Hosted by {event.organizer}</p>
        <div className="event-meta">
          {timeLabel && <span>{timeLabel}</span>}
          {Number.isFinite(event.interestedCount) && (
            <span>{event.interestedCount} interested</span>
          )}
        </div>
        <div className="event-card-footer">
          <p className="event-price">
            <strong>{Number(event.price) === 0 ? "Free" : `₹${event.price}`}</strong>
            <span> / person</span>
          </p>
          <Link className="event-card-link" to={`/checkout/${event._id}`}>
            Book now <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
