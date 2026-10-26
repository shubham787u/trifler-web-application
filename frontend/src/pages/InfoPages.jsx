import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "How do I find events near me?",
    answer:
      "Choose your city from the selector in the navigation or on the Discover page. You can also filter the event list by category.",
  },
  {
    question: "How do I book an event?",
    answer:
      "Open an event and select Get tickets or Book now. Sign in when prompted, choose your ticket quantity, and follow the checkout steps.",
  },
  {
    question: "Can I host my own event?",
    answer:
      "Yes. Select Create your event and sign in to submit your event details. Your hosted events are available from your profile.",
  },
  {
    question: "Where can I see my bookings?",
    answer:
      "Sign in and open your profile to review your booking history and any events you have hosted.",
  },
  {
    question: "How do I contact Trifler?",
    answer:
      "Email contact-us@trifler.in or use the contact form on our Contact Us page.",
  },
];

const guideCards = [
  {
    eyebrow: "Plan something social",
    title: "A simple guide to finding your next experience",
    copy: "Start with your city, browse a category you enjoy, and choose a plan that fits your schedule.",
  },
  {
    eyebrow: "For event hosts",
    title: "What to include in an event listing",
    copy: "A clear title, accurate timing, a useful location, and a good description help people decide if your event is right for them.",
  },
  {
    eyebrow: "Make the most of it",
    title: "Turn a shared interest into a real connection",
    copy: "Pick an activity you genuinely enjoy, arrive on time, and give yourself room to meet the people around you.",
  },
];

export function FAQPage() {
  return (
    <main className="info-page page-container">
      <header className="info-page-heading">
        <span className="eyebrow">A few helpful answers</span>
        <h1>Frequently asked questions</h1>
        <p>Need a hand finding an event, booking, or hosting?</p>
      </header>
      <div className="faq-list">
        {faqs.map(({ question, answer }) => (
          <details className="faq-item" key={question}>
            <summary>{question}<span aria-hidden="true">+</span></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <p className="info-page-callout">
        Still have a question? <Link to="/contact-us">Get in touch with us.</Link>
      </p>
    </main>
  );
}

export function BlogPage() {
  return (
    <main className="info-page page-container">
      <header className="info-page-heading">
        <span className="eyebrow">Ideas for getting out there</span>
        <h1>Trifler stories & guides</h1>
        <p>Practical inspiration for discovering events, hosting, and meeting people.</p>
      </header>
      <div className="guide-grid">
        {guideCards.map((card) => (
          <article className="guide-card" key={card.title}>
            <span className="eyebrow">{card.eyebrow}</span>
            <h2>{card.title}</h2>
            <p>{card.copy}</p>
            <Link to="/event/all">Explore experiences <span aria-hidden="true">↗</span></Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = `Trifler website enquiry from ${formData.get("name")}`;
    const body = [
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      "",
      formData.get("message"),
    ].join("\n");
    window.location.href = `mailto:contact-us@trifler.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <main className="info-page contact-page page-container">
      <header className="info-page-heading">
        <span className="eyebrow">We’re here to help</span>
        <h1>Contact Trifler</h1>
        <p>Questions about events, bookings, or hosting? Send us a message.</p>
      </header>
      <div className="contact-layout">
        <form className="form-card contact-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="contact-name">Your name</label>
            <input id="contact-name" name="name" autoComplete="name" required maxLength={100} />
          </div>
          <div className="form-field">
            <label htmlFor="contact-email">Your email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />
          </div>
          <div className="form-field">
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" required maxLength={3000} rows={6} />
          </div>
          <button className="button button-primary form-submit" type="submit">
            Open email to send <span aria-hidden="true">↗</span>
          </button>
          {submitted && (
            <p className="contact-submit-note" role="status">
              Your email app should open with your message ready. If it didn’t, email{" "}
              <a href="mailto:contact-us@trifler.in">contact-us@trifler.in</a>.
            </p>
          )}
        </form>
        <aside className="contact-details">
          <span className="eyebrow">Say hello</span>
          <h2>We’d love to hear from you.</h2>
          <p>Our team is here to help with your Trifler experience.</p>
          <a href="mailto:contact-us@trifler.in">contact-us@trifler.in</a>
          <span>South West, New Delhi, India</span>
        </aside>
      </div>
    </main>
  );
}
