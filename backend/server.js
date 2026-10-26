const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  ...(process.env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
      ]),
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        frameSrc: ["'self'", "https://*.razorpay.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "https://*.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        connectSrc: ["'self'", "https://*.razorpay.com"],
        ...(process.env.NODE_ENV === "production"
          ? { upgradeInsecureRequests: [] }
          : {}),
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.use("/api/events", require("./src/routes/eventRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/bookings", require("./src/routes/bookingRoutes"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trifler Backend API is running.",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ success: false, error: error.message });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ success: false, error: "Invalid JSON body" });
  }
  console.error("Unhandled API error:", error);
  return res
    .status(500)
    .json({ success: false, error: "Internal server error" });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured before the API can start.");
  }
  if (
    !process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production" &&
      process.env.JWT_SECRET.length < 32)
  ) {
    throw new Error(
      "JWT_SECRET is required and must contain at least 32 characters in production.",
    );
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("Connected to MongoDB.");
  const server = app.listen(PORT, () =>
    console.log(`Trifler API listening on port ${PORT}.`),
  );

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(async () => {
        try {
          await mongoose.disconnect();
          process.exitCode = 0;
        } catch (error) {
          console.error("Database shutdown failed:", error);
          process.exitCode = 1;
        }
      });
    });
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start Trifler API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
