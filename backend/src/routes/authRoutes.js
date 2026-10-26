const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many sign-in attempts. Please try again later." },
});
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setSessionCookie(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("trifler_session", token, sessionCookieOptions);
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    city: user.city,
    avatar: user.avatar,
  };
}

function clearSessionCookie(res) {
  res.clearCookie("trifler_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}

router.post("/signup", authLimiter, async (req, res) => {
  const { name, email, password, city } = req.body || {};
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 254 ||
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      error: "Enter a valid name and email, and a password of at least 8 characters.",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      city: typeof city === "string" && city.trim() ? city.trim().slice(0, 80) : "Delhi NCR",
    });
    setSessionCookie(res, user._id.toString());
    return res.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }
    console.error("Signup failed:", error);
    return res.status(500).json({ success: false, error: "Unable to create your account right now." });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({ success: false, error: "Enter your email and password." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }
    setSessionCookie(res, user._id.toString());
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ success: false, error: "Unable to sign in right now." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: "Account not found." });
    }
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return res.status(500).json({ success: false, error: "Unable to load your account." });
  }
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  return res.status(200).json({ success: true });
});

module.exports = router;
