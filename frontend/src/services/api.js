const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/+$/, "");

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function fetchEvents(city = "", category = "", options = {}) {
  const query = new URLSearchParams();
  if (city) query.set("city", city.trim());
  if (category) query.set("category", category);
  const queryString = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/events${queryString ? `?${queryString}` : ""}`,
    { credentials: "include", ...options },
  );
  return handleResponse(response);
}

export async function fetchEventById(id, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}/events/${encodeURIComponent(id)}`,
    { credentials: "include", ...options },
  );
  return handleResponse(response);
}

export async function createEvent(eventData, options = {}) {
  const response = await fetch(`${API_BASE_URL}/events`, {
    credentials: "include",
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: JSON.stringify(eventData),
  });
  return handleResponse(response);
}

export async function bookEventTickets(bookingData, options = {}) {
  const response = await fetch(`${API_BASE_URL}/bookings/book`, {
    credentials: "include",
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: JSON.stringify(bookingData),
  });
  return handleResponse(response);
}

export async function getCurrentUser(options = {}) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
    ...options,
  });
  return handleResponse(response);
}

export async function signIn(credentials, options = {}) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    ...options,
  });
  return handleResponse(response);
}

export async function signUp(details, options = {}) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
    ...options,
  });
  return handleResponse(response);
}

export async function signOut(options = {}) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    credentials: "include",
    method: "POST",
    ...options,
  });
  return handleResponse(response);
}

export async function fetchMyBookings(options = {}) {
  const response = await fetch(`${API_BASE_URL}/bookings/mine`, {
    credentials: "include",
    ...options,
  });
  return handleResponse(response);
}

export async function fetchMyEvents(options = {}) {
  const response = await fetch(`${API_BASE_URL}/events/mine`, {
    credentials: "include",
    ...options,
  });
  return handleResponse(response);
}

export async function initializeBooking(booking, options = {}) {
  const response = await fetch(`${API_BASE_URL}/bookings/book`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
    ...options,
  });
  return handleResponse(response);
}

export async function verifyPayment(payment, options = {}) {
  const response = await fetch(`${API_BASE_URL}/bookings/verify-payment`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
    ...options,
  });
  return handleResponse(response);
}
