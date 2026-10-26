import { useEffect, useState } from "react";
import AuthContext from "./AuthContext.js";
import {
  getCurrentUser,
  signIn as requestSignIn,
  signOut as requestSignOut,
  signUp as requestSignUp,
} from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser({ signal: controller.signal })
      .then((result) => {
        setUser(result.user);
        setAuthError("");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setUser(null);
        if (error.status !== 401) {
          setAuthError("We couldn't verify your session. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function refreshSession() {
    setLoading(true);
    setAuthError("");
    try {
      const result = await getCurrentUser();
      setUser(result.user);
    } catch (error) {
      setUser(null);
      setAuthError(
        error.status === 401
          ? ""
          : "We couldn't verify your session. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function signIn(credentials) {
    const result = await requestSignIn(credentials);
    setUser(result.user);
    setAuthError("");
    return result.user;
  }

  async function signUp(details) {
    const result = await requestSignUp(details);
    setUser(result.user);
    setAuthError("");
    return result.user;
  }

  async function signOut() {
    await requestSignOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, authError, refreshSession, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}