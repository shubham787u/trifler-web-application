import { useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isSignup = searchParams.get("mode") === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const returnTo = location.state?.from || "/profile";

  if (loading) {
    return (
      <main className="message-page">
        <div className="loading-spinner" aria-label="Checking your account" />
      </main>
    );
  }
  if (user) return <Navigate to={returnTo} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isSignup) await signUp({ name, email, password });
      else await signIn({ email, password });
    } catch (requestError) {
      setError(
        requestError.message || "We couldn't sign you in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextSignup) {
    setError("");
    setSearchParams(nextSignup ? { mode: "signup" } : {}, {
      state: location.state,
    });
  }

  return (
    <main className="auth-page page-container">
      <section className="auth-card">
        <Link to="/" className="back-link">
          ← Back to discover
        </Link>
        <span className="eyebrow">
          {isSignup ? "Your next chapter starts here" : "Good to have you back"}
        </span>
        <h1>{isSignup ? "Find your people." : "Welcome back."}</h1>
        <p className="auth-subtitle">
          {isSignup
            ? "Create an account to host experiences and book your next good plan."
            : "Sign in to see your plans and pick up where you left off."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            className={!isSignup ? "is-active" : ""}
            onClick={() => switchMode(false)}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            className={isSignup ? "is-active" : ""}
            onClick={() => switchMode(true)}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-field">
              <label htmlFor="auth-name">Your name</label>
              <input
                id="auth-name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="How should we call you?"
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={isSignup ? 8 : undefined}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
            />
            {isSignup && (
              <span className="field-hint">Use at least 8 characters.</span>
            )}
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="button button-primary form-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Please wait…"
              : isSignup
                ? "Create my account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-terms">
          By continuing, you agree to use Trifler respectfully and keep your
          account details secure.
        </p>
      </section>
    </main>
  );
}
