import {
  BrowserRouter as Router,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/AuthContext.js";
import AuthPage from "./pages/AuthPage";
import CreateEventPage from "./pages/CreateEventPage";
import CheckoutPage from "./pages/CheckoutPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/Profile";
import { LocationProvider } from "./context/LocationContext.jsx";
import { BlogPage, ContactPage, FAQPage } from "./pages/InfoPages";

function NotFoundPage() {
  return (
    <main className="message-page">
      <div className="message-card">
        <span className="eyebrow">404 page not found</span>
        <h1>This page is not the map.</h1>
        <p>The link may be outdated, but there are plenty of plans to find.</p>
        <Link className="button button-primary" to="/">
          Explore experiences
        </Link>
      </div>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, authError, refreshSession } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="message-page">
        <div className="loading-spinner" aria-label="Checking your account" />
      </main>
    );
  }
  if (authError) {
    return (
      <main className="message-page">
        <div className="message-card" role="alert">
          <span className="eyebrow">Account connection</span>
          <h1>We can’t verify your session.</h1>
          <p>{authError}</p>
          <button
            className="button button-primary"
            type="button"
            onClick={refreshSession}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <LocationProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/event/all" element={<HomePage showAll />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route
                path="/checkout/:id"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/benefits" element={<Navigate to="/create-event" replace />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/FAQ" element={<FAQPage />} />
              <Route path="/contact-us" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </LocationProvider>
      </Router>
    </AuthProvider>
  );
}
