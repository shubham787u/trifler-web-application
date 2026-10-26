import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { cities, useLocationPreference } from "../context/LocationContext.js";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { city, setCity } = useLocationPreference();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="nav-inner page-container">
        <Link to="/" className="brand" aria-label="Trifler home">
          <span className="brand-mark" aria-hidden="true">t.</span>
          <span>trifler</span>
        </Link>
        <nav
          className={`main-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Main navigation"
        >
          <Link to="/event/all" onClick={closeMenu}>Upcoming Events</Link>
          <Link to="/blog" onClick={closeMenu}>Blogs</Link>
          <Link to="/FAQ" onClick={closeMenu}>FAQ</Link>
          <Link to="/contact-us" onClick={closeMenu}>Contact Us</Link>
        </nav>
        <div className="nav-actions">
          <label className="nav-city-picker">
            <span aria-hidden="true">⌖</span>
            <span className="visually-hidden">Select your city</span>
            <select value={city} onChange={(event) => setCity(event.target.value)}>
              {cities.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {!loading && (
            <Link className="nav-account" to={user ? "/profile" : "/auth"}>
              {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in"}
            </Link>
          )}
          <Link className="button button-nav" to="/benefits">
            Create your event <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
