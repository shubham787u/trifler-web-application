import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEventById } from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=90";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(requestError.message || "We couldn't load this experience.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEvent();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="message-page">
        <div className="loading-spinner" aria-label="Loading event" />
      </main>
    );
  }
  if (error || !event) {
    return (
      <main className="message-page">
        <div className="message-card">
          <span className="eyebrow">Experience unavailable</span>
          <h1>
            {error
              ? "We couldn't find that plan."
              : "This event isn't available."}
          </h1>
          <p>
            {error || "It may have been removed or the link may be incorrect."}
          </p>
          <Link to="/" className="button button-primary">
            Back to discover
          </Link>
        </div>
      </main>
    );
  }

  const date = new Date(event.date);
  const formattedDate = Number.isNaN(date.getTime())
    ? "Date to be announced"
    : date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <main className="detail-page page-container">
      <Link to="/" className="back-link">
        ← Back to experiences
      </Link>
      <div className="detail-layout">
        <article className="detail-main">
          <div className="detail-image-wrap">
            <img
              className="detail-image"
              src={event.image || fallbackImage}
              alt={event.title}
              onError={(imageEvent) => {
                imageEvent.currentTarget.src = fallbackImage;
              }}
            />
            <span className="event-category">{event.category}</span>
          </div>
          <div className="detail-copy">
            <span className="eyebrow">{event.city}</span>
            <h1>{event.title}</h1>
            <p className="detail-intro">
              {event.description ||
                `Join ${event.organizer} for an experience designed to bring good people together. Come as you are; leave with a story.`}
            </p>
            <div className="detail-facts">
              <div>
                <span aria-hidden="true">◷</span>
                <p>
                  <strong>{formattedDate}</strong>
                  <small>{event.time}</small>
                </p>
              </div>
              <div>
                <span aria-hidden="true">⌖</span>
                <p>
                  <strong>{event.location}</strong>
                  <small>{event.city}</small>
                </p>
              </div>
              <div>
                <span aria-hidden="true">✦</span>
                <p>
                  <strong>Hosted by {event.organizer}</strong>
                  <small>Local experience host</small>
                </p>
              </div>
            </div>
          </div>
        </article>

        <aside className="booking-card">
          <span className="eyebrow">Your next good story</span>
          <h2>Make a plan.</h2>
          <p className="booking-price">
            <strong>
              {Number(event.price) === 0 ? "Free" : `₹${event.price}`}
            </strong>
            <span> per person</span>
          </p>
          <p className="booking-note">A few taps and it’s on your calendar.</p>
          <Link
            to={`/checkout/${event._id}`}
            className="button button-primary booking-button"
          >
            Get tickets <span aria-hidden="true">↗</span>
          </Link>
          <p className="secure-note">
            <span aria-hidden="true">✓</span> No pressure. Just good plans.
          </p>
        </aside>
      </div>
    </main>
  );
}
