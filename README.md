<div align="center">

  <img src="./images/logo.png" alt="Locora Logo" width="180" />

  <h1>Locora</h1>
  <p><strong>The Social Layer of Every Neighbourhood</strong></p>

  <p>
    <a href="https://locora.sumitksr.xyz" target="_blank">
      <img src="https://img.shields.io/badge/🌐_Live_Demo-locora.sumitksr.xyz-E8820C?style=for-the-badge" alt="Live Demo" />
    </a>
    <a href="https://locora-h2f0.onrender.com" target="_blank">
      <img src="https://img.shields.io/badge/⚙️_API-onrender.com-339933?style=for-the-badge" alt="API" />
    </a>
    <a href="https://github.com/sumitksr" target="_blank">
      <img src="https://img.shields.io/badge/GitHub-sumitksr-181717?style=for-the-badge&logo=github" alt="GitHub" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=white" alt="Render" />
  </p>

</div>

---

## 📖 What is Locora?

**Locora** is a full-stack, hyperlocal community platform that connects neighbours within the same street, building, or locality. It is built to solve one of the most overlooked social problems — *people living next to each other for years without ever meaningfully connecting*.

With Locora, residents can:
- **Discover and host local activities** — morning jogs, cricket matches, study groups, garage sales
- **Recover lost & found items** — report a lost pet, found wallet, or missing keys and connect privately with neighbours
- **Share service visits** — if a plumber is coming to your flat, broadcast it so nearby neighbours can book the same slot and split the call-out fee
- **Stay informed via community alerts** — water cuts, power outages, road works, building maintenance announcements

The platform uses **JWT-based authentication** (access token in memory + refresh token in an HttpOnly cookie), **Socket.io for real-time chat**, **Cloudinary for image uploads**, and **GeoJSON + MongoDB 2dsphere indexes** for geospatial proximity filtering.

---

## 🔗 Live Links

| | URL |
|---|---|
| 🌐 **Frontend** | [https://locora.sumitksr.xyz](https://locora.sumitksr.xyz) |
| ⚙️ **Backend API** | [https://locora-h2f0.onrender.com](https://locora-h2f0.onrender.com) |
| 🏥 **Health Check** | [https://locora-h2f0.onrender.com/health](https://locora-h2f0.onrender.com/health) |
| 👨‍💻 **Developer** | [github.com/sumitksr](https://github.com/sumitksr) |

> **Note:** The backend runs on Render's free tier, so the first request after inactivity may take ~30–60 seconds to cold-start. The frontend automatically pings `/health` on load to wake the server before you reach the sign-in page.

---

## ✨ Feature Modules

### 🏃 Community Activities
Browse and host local gatherings — sports matches, yoga sessions, study circles, garage sales, volunteering drives, and social meetups. Each activity has a **capacity limit**, real-time **participant count**, **category filters**, and **geospatial distance sorting** (2 km / 5 km / 15 km / 30 km). **Location is required** — activities are only shown near you, never globally. Joined members get access to a **real-time group chat** powered by Socket.io.

### 🔍 Lost & Found Board
Post reports for lost or found items with photos, category tags, and optional location. Neighbours who spot a match can **open a private claim thread** to coordinate the return. Each claim is a separate real-time chat conversation. Items can be marked as resolved once returned.

### 🔧 Service Piggybacking
A unique feature — when a tradesperson (plumber, electrician, pest control, etc.) is booked for your address, you broadcast it as a **service listing**. Nearby neighbours can express interest and contact you to share the same visit, splitting the call-out fee between multiple households.

### 📢 Service Alerts
Community-wide announcements about local disruptions — water supply cuts, power outages, road closures, lift maintenance, internet outages, etc. Neighbours can mark interest to receive updates.

### 👤 User Profiles
Each user has a **public profile** showing their name, avatar, bio, department/unit, and activity history. Users can **update their profile** including uploading a profile picture (stored on Cloudinary). A **block/unblock** system lets users protect themselves from harassment.

### 🔒 Secure Authentication
Email + password authentication backed by a **dual-token strategy**:
- **Access token** (15-minute JWT) — stored in JavaScript memory, sent as `Authorization: Bearer` header
- **Refresh token** (30-day JWT) — stored in an `HttpOnly`, `Secure`, `SameSite=None` cookie, invisible to JavaScript
- **Silent refresh** — the Axios interceptor automatically refreshes the access token on 401 responses
- **Sliding expiry** — each refresh call issues a new refresh token (rolling window)

### 💬 Real-time Chat (Socket.io)
Activity group chats and Lost & Found claim threads use Socket.io rooms. Features include: message delivery, typing indicators, online/offline presence, and join/leave notifications.

---

## 🛠️ Tech Stack

### Frontend (`/client`) — React + Vite + TypeScript

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | UI component framework |
| **Vite** | 5 | Build tool & dev server |
| **TypeScript** | 5 | End-to-end type safety |
| **React Router** | v6 | Client-side routing & protected routes |
| **TanStack Query** | v5 | Server state management & caching |
| **Axios** | Latest | HTTP client with interceptors |
| **Socket.io-client** | 4 | Real-time bidirectional events |
| **React Hook Form** | v7 | Form state management |
| **Zod** | v3 | Schema validation |
| **Lucide React** | Latest | Icon set |
| **React Hot Toast** | Latest | Toast notifications |

### Backend (`/server`) — Node.js + Express + TypeScript

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 18 | JavaScript runtime |
| **Express** | 4 | HTTP server & REST API framework |
| **TypeScript** | 5 | Type safety |
| **Mongoose** | 8 | MongoDB ODM with schema validation |
| **MongoDB Atlas** | — | Cloud-hosted NoSQL database |
| **Socket.io** | 4 | Real-time WebSocket server |
| **JSON Web Tokens** | 9 | Stateless auth (access + refresh tokens) |
| **bcryptjs** | — | Password hashing (salt rounds: 12) |
| **Cloudinary + Multer** | — | Image upload & CDN storage |
| **Helmet** | 8 | Security HTTP headers |
| **cookie-parser** | — | HttpOnly refresh token cookie parsing |
| **express-rate-limit** | 7 | Brute-force & DDoS protection |
| **express-validator** | 7 | Request body validation |
| **nodemon + ts-node** | — | Hot-reload TypeScript dev server |

### Infrastructure

| Service | Provider |
|---|---|
| Frontend hosting | Custom domain `locora.sumitksr.xyz` via Vercel |
| Backend hosting | [Render](https://render.com) (free tier) |
| Database | [MongoDB Atlas](https://cloud.mongodb.com) (free tier) |
| Media storage | [Cloudinary](https://cloudinary.com) (free tier) |

---

## 🗂️ Project Structure

```
locora/
├── client/                          # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── api/                     # Axios instance + per-resource API functions
│       │   ├── axios.ts             # Base config, token interceptors, auto-refresh on 401
│       │   ├── auth.ts              # signin, signup, refresh, logout, getMe, updateMe
│       │   ├── activity.ts          # Activity CRUD, join/leave, messages
│       │   ├── lostfound.ts         # Lost & Found CRUD, claims
│       │   ├── serviceAlerts.ts     # Service alerts CRUD
│       │   ├── services.ts          # Service piggybacking CRUD
│       │   └── places.ts            # Geolocation/places helpers
│       ├── components/              # Shared UI components
│       │   ├── Layout.tsx           # App shell (sidebar + outlet)
│       │   ├── Sidebar.tsx          # Navigation sidebar
│       │   ├── MapView.tsx          # Leaflet map component
│       │   └── NearbyPlaces.tsx     # Proximity-based place listing
│       ├── context/
│       │   └── AuthContext.tsx      # Auth state, login/logout, silent refresh on mount
│       ├── hooks/
│       │   ├── useGeolocation.ts    # Browser geolocation hook
│       │   └── useSocket.ts         # Socket.io connection hook
│       ├── pages/                   # Route-level page components
│       │   ├── Landing.tsx          # Public landing page (auth-aware redirect)
│       │   ├── Activities.tsx       # Activity feed — requires location
│       │   ├── ActivityDetails.tsx  # Activity detail + join/leave + group chat
│       │   ├── ActivityForm.tsx     # Create / edit activity form
│       │   ├── ActivityGroupChat.tsx
│       │   ├── LostFoundBoard.tsx   # Lost & found feed
│       │   ├── UserProfileView.tsx  # Public user profile
│       │   ├── auth/
│       │   │   ├── SignIn.tsx       # Auth guard: redirects to /app if already logged in
│       │   │   └── SignUp.tsx
│       │   ├── lost-found/
│       │   ├── services/
│       │   ├── service-alerts/
│       │   └── profile/
│       ├── routes/                  # Route guards (ProtectedRoute, etc.)
│       ├── types/                   # Shared TypeScript interfaces
│       ├── App.tsx                  # Root router
│       └── main.tsx
│
├── server/                          # Node.js + Express backend
│   └── src/
│       ├── config/
│       │   └── env.ts               # Typed env loader (dotenv)
│       ├── controllers/             # Request handlers / business logic
│       │   ├── authController.ts    # signup, signin, refresh, logout, getMe, updateMe
│       │   ├── activityController.ts # Location-required geospatial filtering
│       │   ├── lostFoundController.ts
│       │   ├── serviceController.ts
│       │   ├── serviceAlertController.ts
│       │   └── blockController.ts
│       ├── middleware/
│       │   ├── auth.ts              # JWT verification middleware
│       │   └── errorHandler.ts      # Global error + 404 handler
│       ├── models/                  # Mongoose schemas
│       │   └── User.ts              # User with GeoJSON Point, bcrypt pre-save hook
│       ├── routes/                  # Express router definitions
│       ├── scripts/
│       │   └── seed.ts              # Database seed script (BIT Mesra + distance test data)
│       ├── services/
│       │   └── tokenService.ts      # createAccessToken, createRefreshToken, verify
│       ├── sockets/                 # Socket.io event handlers
│       ├── utils/
│       │   └── apiResponse.ts       # sendSuccess / sendError wrappers
│       ├── app.ts                   # Express app, CORS, middleware, route mounting
│       └── server.ts                # HTTP server + Socket.io bootstrap
│
├── images/                          # Brand assets (logo, background)
├── implementation                   # Detailed technical specification document
└── package.json                     # Root workspace scripts
```

---

## 📡 REST API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <accessToken>`.

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | ❌ | Register with name, email, password |
| `POST` | `/signin` | ❌ | Login — returns accessToken in body + sets refreshToken cookie |
| `POST` | `/refresh` | 🍪 cookie | Exchange refresh token for new access token (sliding expiry) |
| `POST` | `/logout` | 🍪 cookie | Clear the refresh token cookie |
| `GET` | `/me` | ✅ | Get authenticated user's profile |
| `PATCH` | `/me` | ✅ | Update name, bio, address, department, avatarUrl |

### Activities — `/api/activities`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List activities — **requires** `lat`, `lng`, `radius` params |
| `POST` | `/` | ✅ | Create a new activity |
| `GET` | `/:id` | ✅ | Get activity details |
| `PATCH` | `/:id` | ✅ | Update activity (organiser only) |
| `DELETE` | `/:id` | ✅ | Delete activity (organiser only) |
| `POST` | `/:id/join` | ✅ | Join an activity |
| `POST` | `/:id/leave` | ✅ | Leave an activity |
| `GET` | `/:id/messages` | ✅ | Fetch chat history |

### Lost & Found — `/api/lost-found`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all reports (filter by type, category) |
| `POST` | `/` | ✅ | Create a report (with optional image) |
| `GET` | `/:id` | ✅ | Get report details |
| `PATCH` | `/:id` | ✅ | Update / resolve a report |
| `DELETE` | `/:id` | ✅ | Delete a report |
| `POST` | `/:id/claim` | ✅ | Open a claim thread |
| `GET` | `/chats` | ✅ | List all claim threads for current user |
| `GET` | `/chats/:id` | ✅ | Get messages in a claim thread |

### Services — `/api/services`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all service piggybacking listings |
| `POST` | `/` | ✅ | Post a new service listing |
| `GET` | `/:id` | ✅ | Get service details |
| `POST` | `/:id/interest` | ✅ | Express interest in sharing a service |

### Service Alerts — `/api/service-alerts`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all community alerts |
| `POST` | `/` | ✅ | Post a new alert |
| `GET` | `/:id` | ✅ | Get alert details |
| `DELETE` | `/:id` | ✅ | Delete alert (author only) |

### Users & Blocks — `/api/users`, `/api/blocks`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | ✅ | View a user's public profile |
| `POST` | `/blocks/:id` | ✅ | Block a user |
| `DELETE` | `/blocks/:id` | ✅ | Unblock a user |

### Health
```
GET /health  →  { "status": "ok", "timestamp": "..." }
```

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join_activity_room` | client → server | Join the Socket.io room for an activity |
| `leave_activity_room` | client → server | Leave a room on component unmount |
| `activity_message` | client → server | Send a chat message to an activity room |
| `new_message` | server → client | Broadcast a new chat message to the room |
| `participant_joined` | server → client | Notify room members when someone joins |
| `participant_left` | server → client | Notify room members when someone leaves |
| `activity_status_changed` | server → client | Broadcast open/close toggle by organiser |
| `typing` / `stop_typing` | both | Typing indicators in chat |
| `user_online` / `user_offline` | server → client | Presence tracking |
| `new_notification` | server → client | Push an in-app notification to a user |

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Sign In Flow                                  │
│                                                                  │
│  1. POST /api/auth/signin  { email, password }                   │
│                                                                  │
│  2. Server responds with:                                        │
│     • JSON body  → { accessToken: "eyJ..." }   (15-min JWT)     │
│     • Set-Cookie → refreshToken=eyJ...          (30-day JWT,    │
│                    HttpOnly, Secure, SameSite=None)             │
│                                                                  │
│  3. Client stores accessToken in JS memory only                  │
│     (never localStorage, never a readable cookie)                │
│                                                                  │
│  4. Every API request attaches:                                  │
│     Authorization: Bearer <accessToken>                          │
│                                                                  │
│  5. On 401 → Axios interceptor calls POST /api/auth/refresh      │
│     (browser sends refreshToken cookie automatically)            │
│     → Gets new accessToken, retries original request            │
│                                                                  │
│  6. On app load (mount) → checkAuth() calls /refresh             │
│     to restore session from the persisted HttpOnly cookie        │
└─────────────────────────────────────────────────────────────────┘
```

**Why this design?**
- `HttpOnly` + `SameSite=None; Secure` cookie → cannot be stolen by XSS, works cross-domain (Vercel → Render)
- In-memory access token → not persisted anywhere, no CSRF risk
- Short-lived access token (15 min) → limits blast radius if intercepted
- Sliding refresh token (30 days, renewed on each use) → seamless UX

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (free tier — [create one here](https://cloud.mongodb.com))
- A **Cloudinary** account (free tier — [create one here](https://cloudinary.com))

### 1 · Clone the repo

```bash
git clone https://github.com/sumitksr/locora.git
cd locora
```

### 2 · Set up the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/Locora

# CORS — must match your client dev URL
CLIENT_URL=http://localhost:5173

# JWT secrets — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64-char-random-hex>
REFRESH_TOKEN_SECRET=<64-char-random-hex>

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm install
npm run dev
# ✅ Server running on http://localhost:5000
```

### 3 · Seed the database (optional)

```bash
npx ts-node src/scripts/seed.ts
# Seeds 8 users, 12 activities (8 near + 4 distance-test), 9 lost/found items, services & alerts
# All users: password123
# Example: aarav.sharma@bitmesra.ac.in / password123
```

### 4 · Set up the client

```bash
cd ../client
cp .env.example .env
```

```env
# Leave empty for local dev — Vite proxy forwards /api to localhost:5000
VITE_API_URL=
```

```bash
npm install
npm run dev
# ✅ App running on http://localhost:5173
```

---

## ☁️ Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel — auto-deploy from `/client`, custom domain via DNS |
| Backend | [Render](https://render.com) — Web Service from `/server` |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) |
| Media | [Cloudinary](https://cloudinary.com) |

### Production env vars (server — set in Render dashboard)

```env
NODE_ENV=production
CLIENT_URL=https://locora.sumitksr.xyz
MONGO_URI=...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Client env (set in Vercel dashboard)

```env
VITE_API_URL=https://locora-h2f0.onrender.com
```

### CORS config — `server/src/app.ts`

```ts
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://locora-on.vercel.app',
  'https://locora.sumitksr.xyz',
];
```

---

## 📁 Scripts Reference

### Server (`/server`)

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | nodemon + ts-node hot-reload |
| Build | `npm run build` | Compile TypeScript to `dist/` |
| Start | `npm start` | Run compiled `dist/server.js` |
| Type-check | `npm run lint` | `tsc --noEmit` |
| Seed DB | `npx ts-node src/scripts/seed.ts` | Populate with sample data |

### Client (`/client`)

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Vite dev server on port 5173 |
| Build | `npm run build` | Type-check + Vite production build |
| Preview | `npm run preview` | Preview production build locally |

---

## 🗺️ Roadmap

- [ ] Reputation & badge system (Newcomer → Local Legend)
- [ ] Web Push notifications (PWA service worker)
- [ ] Global search across activities, lost-found, and services
- [ ] Admin moderation panel
- [ ] Business directory & community reviews
- [ ] Neighbourhood groups / society invite code system
- [ ] Mobile app (React Native)

---

## 🚫 Non-Goals (v1)

- **No AI/ML** — matching and proximity is purely distance + time + rule-based
- **No Redis** — activity status is a simple enum field toggled by the organiser
- **No payments** — service sharing is coordinated manually between neighbours
- **No image-similarity search** for Lost & Found — category + text filters only

---

## 📄 License

ISC © [Sumit Kumar](https://github.com/sumitksr) — Locora

---

<div align="center">
  <p>Built with ❤️ for communities everywhere</p>
  <p>
    <a href="https://locora.sumitksr.xyz">🌐 Live App</a> ·
    <a href="https://github.com/sumitksr">👨‍💻 GitHub</a> ·
    <a href="https://locora-h2f0.onrender.com/health">🏥 API Health</a>
  </p>
</div>
