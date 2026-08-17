# Northline Roofing & Exteriors — Config-Driven Estimator & Owner Panel

A modern, production-grade, full-stack web application built for **Northline Roofing & Exteriors** (Columbus, OH). The system provides a **100% config-driven public cost estimator** for homeowners and an **authenticated owner panel** for the business owner (Dale) and bookkeeper (Marcus).

---

## Key Features & Highlights

### 1. Public Estimator (Surface 1)
- **Zero Frontend Hardcoding:** Form questions, options, limits, and rates are fetched dynamically from the database at runtime (`GET /api/config`). No questions or pricing formulas exist in client code.
- **Mobile-Responsive Multi-Step Wizard:** Step-by-step questionnaire with dynamic question types (`number`, `select`), visual selectable cards, input validation, and animated progress bar.
- **Contact Capture:** Captures customer Name, Phone, and Email prior to revealing the calculated price.
- **Server-Side Estimation Engine:** Protects proprietary contractor pricing formulas and prevents browser calculation tampering.
- **Transparent Output Card:** Displays low/high price range ($E_{\text{low}}$ to $E_{\text{high}}$), midpoint estimate, cost per sq ft range, and detailed cost breakdown accordion.

### 2. Owner Panel (Surface 2)
- **Authenticated Access:** Protected by JWT and HTTP Basic Auth.
  - **Username:** `admin`
  - **Password:** `roofing2026!`
- **Rates & Configuration Editor:** Allows non-technical users (Marcus the bookkeeper) to edit material rates per sqft, pitch multipliers, tear-off rates, story multipliers, and modifiers (waste factor, permit fees, range spread).
- **Question Manager:** Toggle questions on/off (active/inactive) or add new options with instant zero-downtime updates.
- **Captured Leads CRM:** Real-time table displaying all submitted leads, contact details, timestamps, calculated price ranges, and expandable customer questionnaire answers.
- **1-Click CSV Export:** Download formatted CSV of all leads.
- **Audit Version History:** Changelog tracking previous config versions, timestamps, and modification summaries.

---

## Technology Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & HTTP Basic Auth Middleware
- **Testing:** Vitest (Unit testing suite for pricing arithmetic & edge cases)

---

## Local Setup & Installation

Follow these simple steps to run the application locally from a clean clone:

### Prerequisites
- Node.js (v18.x or higher)
- Local MongoDB running on `mongodb://127.0.0.1:27017` OR a free MongoDB Atlas connection string.

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/northline-roofing-estimator.git
cd northline-roofing-estimator
```

### 2. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 3. Configure Environment Variables
Create a `.env` file in the `server/` directory (or use default values):
```bash
cp server/.env.example server/.env
```

`server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/northline_roofing
ADMIN_USERNAME=admin
ADMIN_PASSWORD=roofing2026!
JWT_SECRET=northline_super_secure_jwt_secret_2026_wantace_key
NODE_ENV=development
```

### 4. Populate Seed Data
Migrate the initial Version 3 configuration and 3 historical seed leads:
```bash
npm run seed
```

### 5. Run the Application
Start both the Express API and Vite React frontend concurrently:
```bash
npm run dev
```

- **Public Estimator:** Open `http://localhost:3000`
- **Owner Panel:** Open `http://localhost:3000` and click **Owner Portal** in top right (or navigate to `/admin`).
- **Backend API:** Running on `http://localhost:5000/api`

---

## Running Automated Tests

Run the backend unit test suite:
```bash
npm test
```
Tests validate:
- Exact mathematical calculation of $E_{\text{low}}$, $E_{\text{high}}$, and $E_{\text{mid}}$.
- String-to-number multiplier parsing (e.g. `"1.12"`).
- Omission and safe defaults for inactive questions.
- Dynamic input validation (minimum 300 sq ft, maximum 12,000 sq ft, valid select options).

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/config` | Public | Returns active questions and business metadata |
| `POST` | `/api/estimate` | Public | Validates answers, computes price, captures lead |
| `POST` | `/api/auth/login` | Public | Authenticates admin credentials and issues JWT |
| `GET` | `/api/auth/verify` | Protected | Validates session token |
| `GET` | `/api/admin/config` | Protected | Returns full config including rates and inactive questions |
| `PUT` | `/api/admin/config` | Protected | Updates rates, questions, modifiers & increments version |
| `GET` | `/api/admin/leads` | Protected | Returns all captured leads |
| `GET` | `/api/admin/leads/export-csv` | Protected | Downloads leads as CSV file |
| `GET` | `/api/admin/history` | Protected | Returns configuration version changelog |

---

## Repository Structure

```
northline-roofing-estimator/
├── client/                     # Frontend App (React/Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Badges
│   │   │   ├── dynamic/        # DynamicField, NumberField, SelectField
│   │   │   ├── estimator/      # EstimatorWizard, ContactStep, EstimateResult
│   │   │   └── owner/          # OwnerPanel, RatesEditor, LeadsCRM, HistoryLog, AdminLogin
│   │   ├── services/           # API fetch client & Auth token manager
│   │   ├── App.jsx             # Main Application router & layout
│   │   ├── index.css           # Tailwind design tokens & utilities
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                     # Backend API (Express.js + Mongoose)
│   ├── src/
│   │   ├── config/             # MongoDB connection & seed runner
│   │   ├── controllers/        # configController, estimateController, leadController, authController
│   │   ├── middleware/         # authMiddleware (JWT + Basic Auth)
│   │   ├── models/             # Config, Lead, ConfigHistory Mongoose schemas
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # pricingEngine.js (Server-side calculation logic)
│   │   └── index.js            # Express server entry point
│   ├── tests/                  # pricingEngine.test.js (Vitest unit tests)
│   ├── package.json
│   └── .env.example
├── DECISIONS.md                # Architectural decisions & formula rationale
├── AI_LOG.md                   # AI usage documentation & engineering log
├── README.md                   # Complete setup, credentials & documentation
└── package.json                # Root orchestration scripts
```

---

## Owner Test Credentials

| Role | Username | Password |
|---|---|---|
| Owner / Bookkeeper | `admin` | `roofing2026!` |

---

## Deployment Guide (Render / Vercel)

1. **Database:** Deploy a free MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and obtain the connection string.
2. **Backend (Render / Railway):**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
3. **Frontend (Vercel / Netlify):**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set `VITE_API_URL` or proxy to your deployed backend URL.
