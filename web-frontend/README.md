# Trifler Web Frontend

The Trifler frontend is a responsive React single-page application built with
Vite. It lets visitors discover events, view event details, create an account,
publish events, book tickets, and view their account activity.

## Contents

- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Folder and file structure](#folder-and-file-structure)
- [How the application works](#how-the-application-works)
- [Routes and features](#routes-and-features)
- [Frontend-to-backend integration](#frontend-to-backend-integration)
- [Styling and responsive behavior](#styling-and-responsive-behavior)
- [Available commands](#available-commands)
- [Production deployment](#production-deployment)
- [Notes and current limitations](#notes-and-current-limitations)

## Prerequisites

- Node.js 18 or later
- npm
- The Trifler backend running and reachable from the browser
- MongoDB configured for the backend
- Razorpay credentials on the backend to enable paid bookings

## Getting started

Run these commands from the `web-frontend` directory:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Vite prints the local development URL when it starts. By default, the frontend
expects the backend at `http://localhost:5000/api`.

To check the frontend before running it, use:

```powershell
npm run lint
npm run build
```

## Environment configuration

Vite exposes frontend environment variables prefixed with `VITE_`. The frontend
uses this variable:

| Variable | Required | Purpose | Default |
|---|---:|---|---|
| `VITE_API_URL` | No | Base URL for the backend API, including the `/api` path | `http://localhost:5000/api` |

Set it in the local `.env` file, for example:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

For production, set `VITE_API_URL` to the deployed backend API base URL **when
building** the frontend. Vite embeds `VITE_` values into the built JavaScript;
changing a server environment variable after the build does not change the
already-built frontend.

Do not put private keys, database credentials, or other server secrets in
frontend environment variables. Frontend variables can be read by anyone using
the website.

## Folder and file structure

```text
web-frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── EventCard.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   └── Navbar.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── AuthContext.jsx
│   │   ├── LocationContext.js
│   │   └── LocationContext.jsx
│   ├── hooks/
│   │   ├── useFetchEvents.jsx
│   │   └── useGeolocation.jsx
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── CreateEventPage.jsx
│   │   ├── EventDetailsPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── InfoPages.jsx
│   │   └── Profile.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env                       Local environment variables (not committed)
├── .env.example               Example frontend environment configuration
├── .gitignore                 Files and directories excluded from Git
├── eslint.config.js           ESLint configuration
├── index.html                 HTML document loaded by the browser
├── package-lock.json          Exact npm dependency versions
├── package.json               Project metadata, dependencies, and scripts
├── README.md                  This guide
└── vite.config.js             Vite and React plugin configuration
```

`node_modules/` is created by `npm install`. `dist/` is created by
`npm run build`. Both are generated directories and should not be edited by
hand.

### Root-level files

| File | What it does |
|---|---|
| `index.html` | Browser entry document. Contains the React mount point, page title, metadata, favicon link, and script reference to `src/main.jsx`. |
| `package.json` | Lists React, React DOM, React Router, Vite, ESLint, and the commands used to run, lint, and build the frontend. |
| `package-lock.json` | Locks exact dependency versions so installs are repeatable. Update it through npm when changing dependencies. |
| `vite.config.js` | Configures Vite and enables its React plugin. |
| `eslint.config.js` | Configures JavaScript/JSX lint rules, React Hooks checks, and React Fast Refresh checks. |
| `.env.example` | Safe template showing the frontend API URL setting. Copy it to `.env` for local development. |
| `.env` | Local environment values. Keep secrets out of it because `VITE_` values are included in browser code. |
| `.gitignore` | Prevents generated files, dependencies, logs, and local environment files from being committed. |
| `README.md` | Explains setup, project organization, routes, integrations, and deployment. |

### `public/`

Files in `public/` are served as static files and retain their names in the
deployed website. Use this folder for files that need a stable URL.

| File | What it does |
|---|---|
| `favicon.svg` | Browser tab/site icon referenced by `index.html`. |
| `icons.svg` | Static SVG icon resource. |

### `src/`

All application source code lives here. Vite processes JavaScript, JSX, CSS,
and imported assets from this directory.

#### `src/main.jsx`

The JavaScript entry point. It imports the global stylesheets, finds the
`#root` element from `index.html`, and renders the React application inside
React `StrictMode`.

#### `src/App.jsx`

The application’s route map and global providers:

- `AuthProvider` makes the signed-in user and authentication actions available
  throughout the app.
- `Router` and `Routes` map browser paths to page components.
- `LocationProvider` shares the selected city across navigation and event
  creation, and saves that choice in browser storage.
- `Layout` wraps each route with the common site header and footer.
- `ProtectedRoute` blocks profile, event publishing, and checkout until the
  user is signed in; it retains the requested path so sign-in can return them
  to it.
- `NotFoundPage` displays the custom page for an unknown route.

#### `src/index.css`

Global CSS defaults, such as base typography, sizing, focus-visible outlines,
and browser-wide styles.

#### `src/App.css`

The main application stylesheet. Contains the layout, page and component
styles, interactive states, loading visuals, and responsive breakpoints for
smaller screens.

### `src/assets/`

Source assets imported or bundled by the application.

| File | What it does |
|---|---|
| `hero.png` | Local hero artwork available for use by the frontend. |

### `src/components/`

Reusable pieces of UI used by multiple routes or repeated in a page.

| File | What it does |
|---|---|
| `Layout.jsx` | Shared site frame. Places the navbar above route content and the footer below it. |
| `Navbar.jsx` | Main navigation, responsive menu, city selector, sign-in/profile link, and event-hosting link. |
| `Footer.jsx` | Shared site footer, navigation links, app store links, and contact information. |
| `EventCard.jsx` | Displays event details, interested count, a browser-saved favorite, and a booking action. |

### `src/context/`

React Context modules provide shared state to components without passing props
through every intermediate component.

| File | What it does |
|---|---|
| `AuthContext.jsx` | Implements `AuthProvider`. Loads the current session from the backend and exposes the user, loading/error state, sign-in, sign-up, sign-out, and session-refresh actions. |
| `AuthContext.js` | Defines the authentication context and exports the `useAuth()` hook for reading it. Kept separate from the provider component to satisfy the configured Fast Refresh lint rule. |
| `LocationContext.js` | Exports the shared location context, supported cities, and `useLocationPreference()` hook. |
| `LocationContext.jsx` | Provides and persists the selected city for event discovery and event creation. |

### `src/hooks/`

Hooks are reusable functions for sharing React behavior, such as data loading
or browser geolocation.

| File | Status |
|---|---|
| `useFetchEvents.jsx` | Empty placeholder. Event discovery currently fetches data directly in `HomePage.jsx` using `services/api.js`. |
| `useGeolocation.jsx` | Reserved hook file; city selection is currently manual and does not request browser location. |

### `src/pages/`

Each page is a full screen associated with one or more routes.

| File | Route | What it does |
|---|---|---|
| `HomePage.jsx` | `/`, `/event/all` | Offers city and category discovery, event listings, free-event filtering, activity categories, app promotion, and event cards. `/event/all` displays the complete matching event list. |
| `InfoPages.jsx` | `/blog`, `/FAQ`, `/contact-us` | Provides introductory editorial guides, event/booking FAQs, and a contact form that opens the visitor’s email application. |
| `EventDetailsPage.jsx` | `/events/:id` | Loads and displays a single event, including its date, location, host, description, and ticket price. |
| `AuthPage.jsx` | `/auth` | Provides sign-in and account-creation forms. Add `?mode=signup` to open the create-account view. |
| `CreateEventPage.jsx` | `/create-event`, `/benefits` | Validates the host’s form in the browser and submits a new event to the backend. `/benefits` redirects here. Requires a signed-in user. |
| `CheckoutPage.jsx` | `/checkout/:id` | Loads an event, lets the user choose up to 10 tickets and apply the `TRIFLER10` discount, then initializes checkout. Free bookings are confirmed directly; paid bookings use Razorpay when configured. Requires sign-in. |
| `Profile.jsx` | `/profile` | Shows the signed-in user’s bookings and events they have hosted, and provides sign-out. Requires a signed-in user. |

In `/events/:id` and `/checkout/:id`, `:id` is the event’s database ID supplied
as part of the URL.

### `src/services/`

| File | What it does |
|---|---|
| `api.js` | Centralizes calls from the browser to the backend. It builds the API base URL, sends session cookies, converts JSON responses, and raises errors for unsuccessful requests. |

The service exposes functions for event listing/details and creation, session
lookup, sign-in/sign-up/sign-out, hosted events, booking history, booking
initialization, and payment verification.

## How the application works

Typical startup and request flow:

```text
Browser
  └── index.html
       └── src/main.jsx
            ├── imports index.css and App.css
            └── src/App.jsx
                 ├── AuthProvider checks the saved backend session
                 ├── Router selects the matching page
                 └── Layout displays Navbar + current page + Footer

Page
  └── src/services/api.js
       └── HTTP request to the backend
            └── page renders returned data or an error/loading state
```

For example, event discovery follows this path:

```text
HomePage → fetchEvents() in services/api.js → GET /api/events → EventCard
```

Event publishing follows this path:

```text
CreateEventPage → createEvent() → authenticated POST /api/events
                → navigate to /events/:id
```

## Routes and features

| Route | Access | Main feature |
|---|---|---|
| `/` | Public | Discover and filter upcoming experiences. |
| `/events/:id` | Public | View event information. |
| `/auth` | Public | Sign in or create an account. |
| `/checkout/:id` | Signed-in user | Start ticket booking for an event. |
| `/create-event` | Signed-in user | Publish a hosted event. |
| `/profile` | Signed-in user | View bookings and hosted events. |
| Any other path | Public | See the not-found page. |

If someone opens a protected route while signed out, the app sends them to
`/auth`. After successful sign-in or sign-up, it returns them to the protected
page they originally requested.

## Frontend-to-backend integration

`services/api.js` uses `VITE_API_URL` as the API base URL. Requests include
`credentials: "include"` so the browser sends the backend’s HTTP-only session
cookie with protected actions.

The frontend expects the backend to provide these API capabilities:

| Capability | Endpoint |
|---|---|
| List upcoming events, optionally filtered by city/category | `GET /api/events` |
| Read one event | `GET /api/events/:id` |
| Read the current signed-in user | `GET /api/auth/me` |
| Create an account / sign in / sign out | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Publish an event and list the signed-in user’s events | `POST /api/events`, `GET /api/events/mine` |
| Initialize a booking and list the signed-in user’s bookings | `POST /api/bookings/book`, `GET /api/bookings/mine` |
| Verify a paid booking | `POST /api/bookings/verify-payment` |

The backend must allow the deployed frontend origin in its CORS configuration.
For production, session cookies require HTTPS, and the backend’s allowed
frontend origin must match the deployed site.

## Styling and responsive behavior

The site styling is hand-written CSS rather than Tailwind:

- `index.css` contains site-wide browser and type defaults.
- `App.css` contains the page/component styles and mobile/tablet breakpoints.
- Components use class names defined in `App.css`.
- The CSS includes visible keyboard-focus styles and reduced-motion behavior.

When adding a UI class, add its CSS rule to `App.css` or an intentionally
created stylesheet, and check both desktop and narrow mobile widths.

## Available commands

Run commands from `web-frontend`:

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies from `package-lock.json`. |
| `npm run dev` | Run the Vite development server with hot reload. |
| `npm run lint` | Run ESLint across the frontend. |
| `npm run build` | Create optimized production files in `dist/`. |
| `npm run preview` | Serve the last production build locally for inspection. |

## Production deployment

1. Configure `VITE_API_URL` to the public backend API URL (including `/api`)
   in the frontend build environment.
2. Run `npm ci` and `npm run build`.
3. Publish the contents of `dist/` to a static web host.
4. Configure the backend’s `FRONTEND_URL` with the deployed website origin so
   credentialed API requests are allowed.
5. Use HTTPS for both the website and API so secure session cookies and the
   payment provider work correctly.
6. Configure payment provider credentials **on the backend only**. Do not add
   secret credentials to this frontend project.
7. Configure the static host to serve `index.html` for application routes such
   as `/events/:id`, `/profile`, and `/checkout/:id`; otherwise, reloading one
   of those URLs may return a host-level 404 instead of the React application.

## Notes and current limitations

- `LocationContext.jsx`, `useFetchEvents.jsx`, and `useGeolocation.jsx` are
  currently empty placeholders. They do not add active behavior.
- The location selector currently offers a fixed list of cities; location is
  not automatically detected.
- Paid checkout depends on Razorpay being configured on the backend. The
  frontend verifies the provider response through the backend rather than
  marking paid orders as successful on its own.
- The project currently defines lint and build scripts, but does not define an
  automated frontend test script.