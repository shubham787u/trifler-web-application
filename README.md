# Trifler

Trifler helps people discover local events and experiences, or publish an event
of their own. The project has a Vite/React frontend and an Express/MongoDB API.

## Run locally

Requirements: Node.js 18 or later and MongoDB.

1. Start MongoDB. Copy `web-backend/.env.example` to `web-backend/.env`,
   generate a unique `JWT_SECRET` with at least 32 characters, and configure
   `MONGO_URI`. Add Razorpay test/live keys to enable paid checkout.
2. Start the API:

   ```powershell
   cd web-backend
   npm install
   npm run dev
   ```

3. In another terminal, configure the frontend API URL and start the UI:

   ```powershell
   cd web-frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

The frontend defaults to `http://localhost:5000/api`. Set `VITE_API_URL` to the
deployed API base URL when building for another environment. Frontend quality
checks are `npm run lint` and `npm run build` from `web-frontend`.

Accounts use secure, HTTP-only session cookies. Paid bookings require valid
Razorpay keys; free events can be booked without payment. Set `FRONTEND_URL`
to the deployed frontend origin (or comma-separated origins) in production.
The API requires `MONGO_URI` and a 32-character `JWT_SECRET` to start in
production.