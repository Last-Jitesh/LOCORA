<div align="center">
  <img src="./project-images/logo.png" alt="Locora Logo" width="220" />

  <h1>Locora</h1>
  <p><strong>The Social Layer of Every Neighbourhood</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary" />
  </p>
</div>

---

Locora is a **hyperlocal community platform** that connects neighbours within the same street or locality. It lets residents find local activity partners, recover lost & found items, share service visits to split costs, and stay informed through community service alerts — all without passwords, thanks to an OTP-based email sign-in.

---

## ✨ Features

| Module | What it does |
|---|---|
| 🏃 **Community Activities** | Post and discover nearby activities (walks, sports, study groups). Join, chat in real-time, and leave when done. |
| 🔍 **Lost & Found Board** | Report lost pets, keys, wallets, or found items. Interested neighbours can open a private chat to claim items. |
| 🔧 **Service Piggybacking** | Broadcast that a plumber, electrician, etc. is visiting, so neighbours can book the same slot and split the call-out fee. |
| 📢 **Service Alerts** | Community-wide announcements about water cuts, power outages, road works, and other local disruptions. |
| 👤 **User Profiles** | View your own activity history, hosted items, and public profile. Block abusive users. |
| 🔒 **Passwordless Auth** | Sign in with just an email — an OTP is sent and verified. No password to forget. |
| 💬 **Real-time Chat** | Socket.io-powered group chat per activity and per lost-found claim thread. |

---

## 🗂️ Repository Structure

```
locora/
├── client/          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── api/         # Axios instances & endpoint functions
│   │   ├── components/  # Shared UI components (Layout, Sidebar, MapView, …)
│   │   ├── context/     # AuthContext, SocketContext
│   │   ├── hooks/       # useAuth, useSocket, useGeolocation, …
│   │   ├── pages/       # Route-level page components
│   │   ├── routes/      # Route guards / wrappers
│   │   └── types/       # Shared TypeScript types
│   └── public/
│
├── server/          # Node.js + Express + TypeScript backend
│   └── src/
│       ├── config/      # DB connection, Cloudinary, env loader
│       ├── controllers/ # Business logic handlers
│       ├── middleware/  # Auth, error handling, file upload
│       ├── models/      # Mongoose schemas
│       ├── routes/      # Express router definitions
│       ├── services/    # Mailer and other service helpers
│       ├── sockets/     # Socket.io event handlers
│       └── utils/       # Geo helpers, API response wrappers
│
├── project-images/  # Brand assets (logo, background)
├── images/          # Additional project media
└── implementation   # Detailed technical specification document
```

---

## 🛠️ Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| TypeScript 5 | Type safety |
| React Router v6 | Client-side routing |
| TailwindCSS 4 | Utility-first styling |
| Zustand | Lightweight global state |
| TanStack Query | Server state & caching |
| Socket.io-client | Real-time communication |
| React Hook Form + Zod | Forms & validation |
| Leaflet / Mapbox GL | Interactive maps |
| React Hot Toast | Toast notifications |
| Lucide React | Icon set |
| `vite-plugin-pwa` | PWA support |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| Node.js + Express 4 | HTTP server & REST API |
| TypeScript 5 | Type safety |
| Mongoose + MongoDB Atlas | Data persistence |
| Socket.io 4 | Real-time bidirectional events |
| JSON Web Tokens | Stateless auth (access + refresh) |
| bcryptjs | Password / OTP hashing |
| Nodemailer | OTP email delivery (Gmail SMTP) |
| Cloudinary + Multer | Image upload & storage |
| Helmet | Security headers |
| express-rate-limit | Brute-force protection |
| express-validator | Request validation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (free tier works)
- A **Cloudinary** account (free tier works)
- A **Gmail** account with an [App Password](https://myaccount.google.com/apppasswords) for OTP emails

---

### 1 · Clone the repo

```bash
git clone https://github.com/your-username/locora.git
cd locora
```

### 2 · Configure the server

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in every value:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/Locora

# CORS — must match your client dev URL
CLIENT_URL=http://localhost:5173

# JWT secrets — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64-char-hex>
REFRESH_TOKEN_SECRET=<64-char-hex>

# Gmail SMTP (OTP emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx      # Gmail App Password
EMAIL_FROM="Locora" <noreply@locora.app>
```

Install dependencies and start the dev server:

```bash
npm install
npm run dev
# Server listens on http://localhost:5000
```

### 3 · Configure the client

```bash
cd ../client
cp .env.example .env
```

For local development you can leave `VITE_API_URL` empty — Vite's proxy forwards `/api` and `/socket.io` to the server automatically:

```env
# Leave empty for local dev
VITE_API_URL=
```

Install dependencies and start Vite:

```bash
npm install
npm run dev
# App opens on http://localhost:5173
```

---

## 📡 API Overview

All routes are prefixed with `/api`.

| Prefix | Description |
|---|---|
| `/api/auth` | OTP sign-in flow, token refresh, logout, `/me` |
| `/api/users` | Public profile view, block/unblock |
| `/api/activities` | CRUD, join/leave, participant list, chat messages |
| `/api/lost-found` | CRUD, claim threads, resolve |
| `/api/services` | Service piggybacking listings & interest |
| `/api/service-alerts` | Community alerts CRUD & interest tracking |
| `/api/blocks` | Block / unblock users |

Health check: `GET /health`

---

## 🔌 Socket.io Events

Real-time features use the following event contract:

| Event | Direction | Description |
|---|---|---|
| `join_activity_room` | client → server | Join a Socket.io room for an activity |
| `activity_message` | client → server | Send a chat message to an activity room |
| `new_message` | server → client | Broadcast a new chat message |
| `participant_joined` | server → client | Notify room of a new participant |
| `participant_left` | server → client | Notify room of a departure |
| `activity_status_changed` | server → client | Broadcast when organiser opens/closes an activity |
| `typing` / `stop_typing` | both | Typing indicators |
| `user_online` / `user_offline` | server → client | Presence tracking |
| `new_notification` | server → client | Push an in-app notification |

---

## 🗄️ Data Models

```
User            — profile, location (GeoJSON Point), role, reputation
Activity        — type, location, schedule, capacity, status (open/matched/closed)
ActivityParticipant — join/leave records
ActivityMessage — activity-room chat messages
LostFound       — lost/found reports with images and location
LostFoundChat   — claim thread messages
Service         — service piggybacking listings
ServiceAlert    — community disruption announcements
ServiceAlertInterest — neighbour interest in a service alert
Session         — refresh-token store
OtpRequest      — OTP code + expiry for passwordless auth
HostBlock       — user block relationships
```

All location fields use a **GeoJSON Point** with a `2dsphere` index for geospatial proximity queries (`$near`).

---

## 🔐 Authentication Flow

Locora is **passwordless**:

1. User enters their email on `/signin`.
2. Server generates a 6-digit OTP, hashes it, and emails it via Gmail SMTP.
3. User enters the OTP on `/signin/otp`.
4. Server verifies the OTP, issues a short-lived **JWT access token** (stored in memory) and a long-lived **refresh token** (stored in an `HttpOnly` cookie and in the `Session` collection).
5. All protected API calls include the `Authorization: Bearer <token>` header.
6. The client silently refreshes the access token using `POST /api/auth/refresh`.

---

## ☁️ Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — auto-deploy from `/client` |
| Backend | [Render](https://render.com) or [Railway](https://railway.app) — from `/server` |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) |
| Media | [Cloudinary](https://cloudinary.com) |

### Production environment variables (server)

Set all variables from `server/.env.example` in your hosting dashboard. Key additions for production:

```env
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
```

### Vercel client config

Set in the Vercel project settings:

```env
VITE_API_URL=https://your-render-api.onrender.com
```

The `client/vercel.json` already includes a rewrite rule to support client-side routing:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## 📁 Key Scripts

### Server
| Script | Command |
|---|---|
| Development | `npm run dev` |
| Production build | `npm run build` |
| Start compiled build | `npm start` |
| Type-check | `npm run lint` |

### Client
| Script | Command |
|---|---|
| Development | `npm run dev` |
| Production build | `npm run build` |
| Preview production build | `npm run preview` |
| Type-check | `npm run lint` |

---

## 🗺️ Roadmap

- [ ] Reputation & badge system (Newcomer → Local Legend)
- [ ] Web Push notifications (PWA / service worker)
- [ ] Global search across activities, lost-found, and services
- [ ] Admin moderation panel
- [ ] Business directory & reviews module
- [ ] Neighbourhood groups / society code system

---

## 🚫 Non-Goals (v1)

- No AI/ML — all matching and ranking is distance, time, and rule-based.
- No Redis — activity status is a simple enum field toggled by the organiser.
- No payments in v1.
- No image-similarity search for Lost & Found — browse + category filters only.

---

## 📄 License

ISC © Locora Contributors
