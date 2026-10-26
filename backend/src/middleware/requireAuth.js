const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  const token = req.cookies?.trifler_session || bearerToken;

  if (!token) {
    return res.status(401).json({ success: false, error: "Please sign in to continue." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.id || !mongoose.isValidObjectId(payload.id)) {
      return res.status(401).json({ success: false, error: "Your session is invalid. Please sign in again." });
    }
    req.userId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: "Your session has expired. Please sign in again." });
  }
}

module.exports = requireAuth;
