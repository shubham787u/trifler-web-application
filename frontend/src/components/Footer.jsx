import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer" id="about">
      <div className="footer-inner page-container">
        <div className="footer-brand">
          <Link to="/" className="brand brand-footer">
            <span className="brand-mark" aria-hidden="true">t.</span>
            <span>trifler</span>
          </Link>
          <p>
            A little less online. A lot more out there. Find your people through
            the things you love.
          </p>
        </div>
        <div className="footer-links">
          <span className="footer-label">Explore</span>
          <Link to="/event/all">Upcoming events</Link>
          <Link to="/blog">Blogs</Link>
          <Link to="/FAQ">Frequently asked questions</Link>
          <Link to="/benefits">Create your event</Link>
        </div>
        <div className="footer-contact">
          <span className="footer-label">Say hello</span>
          <Link to="/contact-us">Contact us</Link>
          <a href="mailto:contact-us@trifler.in">contact-us@trifler.in</a>
          <span>New Delhi, India</span>
        </div>
      </div>
      <div className="footer-app-links page-container">
        <a href="https://play.google.com/store/apps/details?id=in.trifler.app&hl=en" target="_blank" rel="noreferrer">Google Play</a>
        <a href="https://apps.apple.com/in/app/trifler/id6472542239" target="_blank" rel="noreferrer">App Store</a>
      </div>
      <div className="footer-bottom page-container">
        <span>© {new Date().getFullYear()} Trifler. All rights reserved.</span>
        <span>Made for getting out there.</span>
      </div>
    </footer>
  );
}
