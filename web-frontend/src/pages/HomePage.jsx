import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { cities, useLocationPreference } from "../context/LocationContext.js";
import { fetchEvents } from "../services/api";

const categories = [
  "Pool Parties",
  "House Parties",
  "Game Nights",
  "Travelling Experiences",
  "Club Nights",
  "Government Events",
  "Online Events",
  "Seminars",
  "Workshops",
  "Food and Drinks",
  "Fitness Sessions",
  "Kitty Parties",
  "Sports",
  "Concert",
];

const outingTypes = [
  { title: "Gym", description: "Work out with new people.", icon: "✦" },
  { title: "Dining", description: "Find your next table.", icon: "♡" },
  { title: "Activities", description: "Try something different.", icon: "↗" },
  { title: "Events", description: "Make a plan together.", icon: "✧" },
  { title: "Sports", description: "Play, cheer, and connect.", icon: "◉" },
];

export default function HomePage({ showAll = false }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { city, setCity } = useLocationPreference();
  const [category, setCategory] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchEvents(city, freeOnly ? "" : category, {
          signal: controller.signal,
        });
        setEvents(result.data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("We couldn't load experiences right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEvents();
    return () => controller.abort();
  }, [city, category, freeOnly, refresh]);

  const visibleEvents = freeOnly
    ? events.filter((event) => Number(event.price) === 0)
    : events;
  const featuredEvents = showAll ? visibleEvents : visibleEvents.slice(0, 4);
  const freeEvents = events.filter((event) => Number(event.price) === 0).slice(0, 4);

  function selectCategory(value) {
    setCategory(value);
    setFreeOnly(false);
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-inner page-container">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              Good plans, better people
            </span>
            <h1>
              Socialise your
              <br />
              <span>routine with</span>
            </h1>
            <p>
              Gym, dining, events and activities are better when shared.
              Discover experiences and meet people who are up for the same
              things.
            </p>
            <a className="button button-primary hero-cta" href="#events">
              Discover experiences <span aria-hidden="true">↗</span>
            </a>
            <div className="hero-proof">
              <span className="proof-avatars" aria-hidden="true">
                <i>A</i>
                <i>R</i>
                <i>M</i>
              </span>
              <span>Meet your kind of people, nearby.</span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Friends enjoying a live event"
            role="img"
          >
            <div className="hero-art-label">
              <span className="live-dot" />
              <span>Make this weekend count</span>
            </div>
            <div className="hero-note">
              <span className="hero-note-icon" aria-hidden="true">
                ✦
              </span>
              <span>
                <strong>Good plans.</strong>
                <br />
                Better people.
              </span>
            </div>
          </div>
        </div>
        <div className="hero-bottom page-container">
          <span>Find your people</span>
          <span className="hero-bottom-line" />
          <span>Make real-life connections</span>
        </div>
      </section>

      <section className="discovery-section page-container" id="events">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Discover nearby plans</span>
            <h2>{showAll ? `All upcoming events in ${city}` : `Upcoming events in ${city}`}</h2>
            <p>Choose a city or category to find something worth going out for.</p>
          </div>
          <label className="city-picker">
            <span aria-hidden="true">⌖</span>
            <span className="visually-hidden">Choose your city</span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              {cities.map((item) => <option key={item}>{item}</option>)}
            </select>
            <span className="select-chevron" aria-hidden="true">
              ⌄
            </span>
          </label>
        </div>

        <div className="city-grid" aria-label="Explore events by city">
          {cities.map((item) => (
            <button
              className={`city-card${item === city ? " is-selected" : ""}`}
              key={item}
              type="button"
              aria-pressed={item === city}
              onClick={() => setCity(item)}
            >
              <span aria-hidden="true">⌖</span>
              <span>{item}</span>
              <small>Explore events</small>
            </button>
          ))}
        </div>

        <div className="category-list" aria-label="Filter experiences by category">
          <button
            className={`category-chip${!category && !freeOnly ? " is-active" : ""}`}
            type="button"
            aria-pressed={!category && !freeOnly}
            onClick={() => { setCategory(""); setFreeOnly(false); }}
          >
            ✦ All experiences
          </button>
          <button
            className={`category-chip${freeOnly ? " is-active" : ""}`}
            type="button"
            aria-pressed={freeOnly}
            onClick={() => { setFreeOnly(true); setCategory(""); }}
          >
            Free events
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`category-chip${category === item ? " is-active" : ""}`}
              aria-pressed={category === item}
              onClick={() => selectCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="results-heading">
          <h3>{freeOnly ? "Free events" : category || "All upcoming events"}</h3>
          <span>{visibleEvents.length} experiences</span>
        </div>

        {loading ? (
          <div className="event-grid" aria-label="Loading experiences">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="event-skeleton" key={index}>
                <div className="skeleton-image" />
                <div className="skeleton-copy" />
                <div className="skeleton-copy short" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="message-card inline-message" role="alert">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setRefresh((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              ✦
            </span>
            <h3>No plans found just yet</h3>
            <p>Try another category or city. Your next great story is close.</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => { setCategory(""); setFreeOnly(false); }}
            >
              Show all experiences
            </button>
          </div>
        ) : (
          <div className="event-grid">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        {!showAll && !loading && !error && visibleEvents.length > 4 && (
          <div className="section-action">
            <Link className="button button-secondary" to="/event/all">
              View all upcoming events <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>

      {!loading && !error && freeEvents.length > 0 && !freeOnly && (
        <section className="home-section page-container">
          <div className="section-heading section-heading-compact">
            <div>
              <span className="eyebrow">Good times, no ticket price</span>
              <h2>Free events</h2>
            </div>
            <button className="text-link" type="button" onClick={() => { setFreeOnly(true); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}>
              View all →
            </button>
          </div>
          <div className="event-grid">
            {freeEvents.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        </section>
      )}

      <section className="home-section category-section page-container">
        <div className="section-heading section-heading-compact">
          <div>
            <span className="eyebrow">Browse by interest</span>
            <h2>Events for every kind of day</h2>
          </div>
        </div>
        <div className="browse-category-grid">
          {categories.slice(0, 10).map((item, index) => (
            <button
              className="browse-category-card"
              key={item}
              type="button"
              onClick={() => selectCategory(item)}
            >
              <span aria-hidden="true">{["◉", "♡", "✧", "↗"][index % 4]}</span>
              <strong>{item}</strong>
              <small>Discover {item.toLowerCase()} near you</small>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section outing-section">
        <div className="page-container">
          <div className="section-heading section-heading-compact">
            <div>
              <span className="eyebrow">More than events</span>
              <h2>Browse personal outings</h2>
              <p>Meet like-minded people through shared experiences.</p>
            </div>
          </div>
          <div className="outing-grid">
            {outingTypes.map((outing) => (
              <a className="outing-card" href="#events" key={outing.title}>
                <span aria-hidden="true">{outing.icon}</span>
                <h3>{outing.title}</h3>
                <p>{outing.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section page-container how-it-works">
        <div>
          <span className="eyebrow">Start with a shared interest</span>
          <h2>How Trifler works</h2>
          <p>Find an experience, book your place, and meet people in real life.</p>
        </div>
        <ol>
          <li><span>01</span><strong>Discover</strong><p>Explore local events and outings by city or category.</p></li>
          <li><span>02</span><strong>Book</strong><p>Choose an experience and reserve your place online.</p></li>
          <li><span>03</span><strong>Connect</strong><p>Show up, share the experience, and make a new connection.</p></li>
        </ol>
      </section>

      <section className="app-promo">
        <div className="page-container app-promo-inner">
          <div>
            <span className="eyebrow">Take Trifler with you</span>
            <h2>More experiences, right in your pocket.</h2>
            <p>Get the app for event updates, offers, and a simpler way to discover plans.</p>
          </div>
          <div className="app-promo-actions">
            <a className="button button-primary" href="https://play.google.com/store/apps/details?id=in.trifler.app&hl=en" target="_blank" rel="noreferrer">
              Google Play <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="https://apps.apple.com/in/app/trifler/id6472542239" target="_blank" rel="noreferrer">
              App Store <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
