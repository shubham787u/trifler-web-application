import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { fetchMyBookings, fetchMyEvents } from "../services/api";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date to be announced"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchMyBookings({ signal: controller.signal }),
      fetchMyEvents({ signal: controller.signal }),
    ])
      .then(([bookingResult, eventResult]) => {
        setBookings(bookingResult.data);
        setHostedEvents(eventResult.data);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "We couldn't load your account activity.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/auth", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign out. Please try again.");
    }
  }

  return (
    <main className="profile-page page-container">
      <div className="profile-heading">
        <div className="profile-welcome">
          <span className="eyebrow">Your Trifler space</span>
          <h1>Hey, {user?.name?.split(" ")[0] || "there"}.</h1>
          <p>All your good plans, gathered in one place.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      {loading ? (
        <div className="message-card profile-loading">
          <div className="loading-spinner" aria-label="Loading your account" />
        </div>
      ) : (
        <>
          <section className="profile-section">
            <div className="profile-section-heading">
              <div><span className="eyebrow">Saved for your calendar</span><h2>Your bookings</h2></div>
              <span className="profile-count">{bookings.length}</span>
            </div>
            {bookings.length ? (
              <div className="profile-bookings">
                {bookings.map((booking) => (
                  <article className="profile-booking" key={booking._id}>
                    <div className="profile-booking-image">
                      {booking.event?.image ? <img src={booking.event.image} alt="" /> : <span aria-hidden="true">✦</span>}
                    </div>
                    <div className="profile-booking-info">
                      <span className="eyebrow">{booking.event?.category || "Experience"}</span>
                      <h3>{booking.event?.title || "Event no longer available"}</h3>
                      <p>{booking.event ? `${formatDate(booking.event.date)} · ${booking.event.city}` : "Event details unavailable"}</p>
                    </div>
                    <div className="profile-booking-status">
                      <span className={`booking-status ${booking.paymentStatus === "Success" ? "is-confirmed" : ""}`}>
                        {booking.paymentStatus === "Success" ? "Confirmed" : booking.paymentStatus}
                      </span>
                      <span>{booking.ticketsCount} {booking.ticketsCount === 1 ? "ticket" : "tickets"}</span>
                      <strong>₹{Number(booking.totalAmount).toFixed(2)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state profile-empty">
                <span className="empty-state-icon" aria-hidden="true">✦</span>
                <h3>Your next story starts here</h3>
                <p>You haven’t booked an experience yet. Find a plan worth getting out for.</p>
                <Link to="/" className="button button-secondary">Explore experiences</Link>
              </div>
            )}
          </section>

          <section className="profile-section">
            <div className="profile-section-heading">
              <div><span className="eyebrow">You brought people together</span><h2>Hosted experiences</h2></div>
              <span className="profile-count">{hostedEvents.length}</span>
            </div>
            {hostedEvents.length ? (
              <div className="profile-events">
                {hostedEvents.map((event) => (
                  <Link className="profile-hosted-event" to={`/events/${event._id}`} key={event._id}>
                    <span><strong>{event.title}</strong><small>{formatDate(event.date)} · {event.city}</small></span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="hosted-empty">
                <p>No hosted experiences yet. Got an idea? Make it happen.</p>
                <Link to="/create-event" className="button button-primary">Host an experience</Link>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
