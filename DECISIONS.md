# Architectural Decisions & Technical Tradeoffs

**Project:** Config-Driven Estimator & Owner Panel  
**Client:** Northline Roofing & Exteriors (Columbus, OH)  
**Author:** Kajal Dalai  
**Date:** August 2026  

---

## 1. Plain-Language Cost Formula Explanation

The estimation formula is engineered to mirror the true operational economics of residential roofing contractors in Columbus, OH while maintaining server-side security:

$$\text{Base Material Cost} = \text{Roof Area } (A) \times \text{Material Rate } (R_m) \times (1 + \text{Waste Factor } W)$$

$$\text{Tear-Off Cost} = \text{Roof Area } (A) \times \text{Tear-Off Rate } (R_t)$$

$$\text{Adjusted Subtotal} = (\text{Base Material Cost} + \text{Tear-Off Cost}) \times \text{Pitch Multiplier } (M_p) \times \text{Stories Multiplier } (M_s)$$

$$\text{Midpoint Estimate } (E_{\text{mid}}) = \text{Adjusted Subtotal} + \text{Permit Flat Fee } (F_p)$$

$$\text{Estimate Low } (E_{\text{low}}) = \text{Round}\left(E_{\text{mid}} \times (1 - \text{Range Spread } S)\right)$$

$$\text{Estimate High } (E_{\text{high}}) = \text{Round}\left(E_{\text{mid}} \times (1 + \text{Range Spread } S)\right)$$

### Step-by-Step Breakdown:
1. **Gross Material Footprint & Waste Buffer ($10\%$):** Valleys, hips, starter strips, and ridge cuts consume more shingles than the bare roof area. A $10\%$ waste factor is added directly to material costs so the contractor doesn't under-quote.
2. **Old Roof Removal (Tear-off):** Removing existing layers requires dumpster rentals and labor. Tear-off rates scale linearly with square footage and layer count.
3. **Safety & Steepness Multipliers:** Multi-story homes ($2+$ stories) and steep roofs (medium/steep pitch) require scaffolding, harness tie-offs, and slower material staging. These multipliers compound upon the combined material and tear-off labor.
4. **City Code Permits ($350 Flat Fee):** Added directly to the subtotal to account for municipal building inspections in Franklin County.
5. **Estimate Range ($\pm 12\%$):** Rather than giving a misleading single number, we present a realistic band ($E_{\text{low}}$ to $E_{\text{high}}$) to set customer expectations before Dale's on-site visit.

---

## 2. Assumptions Made Where the Brief Was Silent

| Topic | Assumption Made | Architectural Rationale |
|---|---|---|
| **Database Choice** | MongoDB with Mongoose | The dynamic config document (nested arrays of questions, options, modifiers) naturally fits a JSON document model. It also matches the provided seed schema without requiring complex relational joins. |
| **Authentication Flow** | Dual-mode JWT & Basic Auth | Implemented JWT token exchange for the React UI while retaining HTTP Basic Auth compatibility so automated testing tools or browser prompt dialogs can authenticate seamlessly. |
| **Contact Capture Timing** | Gated as the final wizard step | Homeowners invest effort answering roof details first (sunk cost heuristic), increasing conversion rates when asked for name, phone, and email right before viewing their price. |
| **Dynamic Inactivity** | Default multiplier to $1.0$ if deactivated | When Dale toggles a question off (e.g. "Stories"), the backend calculation engine safely defaults its multiplier to neutral $1.0$ rather than failing or assuming $0$. |
| **Currency Representation** | Dynamic currency symbol support | Currency defaults to USD (`$`) from `config.business.currency`, but is read dynamically to support future multi-region expansion. |

---

## 3. Scope Deliberately Excluded (and Why)

In a 24-hour sprint, shipping a reliable, bug-free core flow is far more valuable than half-finishing bloated features:

1. **Complex Multi-Tenancy / RBAC:** The brief specified Dale (owner) and Marcus (bookkeeper). A unified owner portal with a single admin role fulfills all operational needs without introducing database schema complexity.
2. **Live Payment Gateway (Stripe/PayPal):** Roofing jobs are high-ticket ($10k-$40k) and require an on-site physical inspection before contract signing. Collecting payments online at estimation stage would cause customer drop-off.
3. **Satellite Imagery AI / Roof Measurement API:** While Google Maps or Roofr APIs can measure roofs, introducing third-party API dependencies with paid credits would create failure points during assessment review. Manual input with intuitive size presets was the robust choice.
4. **"Forgot Password" Feature & DB User Table:** Because this is a single-tenant MVP, credentials are securely managed via server environment variables (`.env`) rather than a database table. Adding a "Forgot Password" flow would require an email service (SendGrid), token generation, and a dedicated Users schema, which is over-engineering for this phase.

---

## 4. Edge Cases, UX Polish & Anomalies Handled

During database migration, engine testing, and rigorous QA, several real-world quirks and UX flaws were identified and addressed:
- **String Float Multipliers:** In the seed configuration (Version 3), the medium pitch multiplier was formatted as a string (`"1.12"`). The calculation engine and schema parser normalize all incoming values with `Number()` to prevent string concatenation bugs.
- **Legacy Lead Schema Differences:** Seed lead `ld_0917` (Version 1) contained discontinued fields (`chimney_count`, `gutter_replace`). The `Lead` schema uses `mongoose.Schema.Types.Mixed` for `answers`, enabling the Owner Panel to render legacy answers seamlessly without migration errors.
- **Out-of-Bounds Area Entries:** Boundary validation enforces $300 \le \text{roof\_area} \le 12,000$ sq ft, preventing negative numbers or unrealistic industrial dimensions.
- **Disabled Question Progress Logic:** Identified a UX bug where the public wizard counted disabled questions in the "Step X of Y" progress counter. Refactored the step calculation to filter and count explicitly active questions only.
- **Native CSV Export:** Browser security often blocks `blob:` URL downloads on managed business networks. Engineered a native `File System Access API` (`showSaveFilePicker`) fallback to ensure reliable frontend CSV generation.
- **Audit Snapshot Viewer:** To ensure non-technical owners (Dale/Marcus) can actually understand the Version Audit History, replaced the raw JSON payload viewer with a clean, human-readable React component that translates modifiers and rate changes into simple terms.

---

## 5. Questions I Would Ask Dale Before Full Production Launch

1. **Material Surcharges by Season:** Do asphalt shingle prices fluctuate quarterly in Ohio? Should we allow automated supplier API price syncing (e.g., ABC Supply or Beacon)?
2. **Emergency Repair vs Full Replacement:** Do you want a branch in the wizard for small leak repairs versus whole-roof replacements?
3. **Notification Preferences:** When a new lead is captured, would you prefer an instant SMS alert (Twilio), an email digest (SendGrid), or direct CRM export (HubSpot / Jobber webhook)?
4. **Permit Fee Variations by Municipality:** Does the $350 permit fee vary between Columbus city limits and surrounding suburbs (Dublin, Westerville, Upper Arlington)?

---

## 6. What I Would Build Next (Given Another Week)

- **Admin Password Management (Self-Serve Security):** Currently, admin credentials are in the `.env` file. If the bookkeeper (Marcus) leaves the company, the non-technical owner (Dale) would have to contact the developer to change the password. Given more time, I would migrate authentication to MongoDB (using bcrypt) and build a "Change Password" UI in the portal so Dale can securely manage access himself.
- **Audit Log Pagination:** Currently, the API limits the audit history to the 20 most recent versions to prevent UI bloat. I would implement cursor-based pagination (Next/Previous) or infinite scroll so the owner can seamlessly browse all historical changes without querying the database directly.
- **Outbound Webhook Dispatcher:** Trigger real-time webhooks on new lead capture to push directly into Dale's CRM (Jobber / ServiceTitan).
- **Interactive Visual Roof Customizer:** A 2D/3D visual preview letting homeowners see what standing seam metal vs architectural shingles look like on a home facade.
- **Automated PDF Estimate Download:** Generate a branded PDF estimate quote with Northline Roofing letterhead that the homeowner can download or print.
- **SMS Two-Factor Auth:** Add OTP verification on the customer's phone number to eliminate fake phone numbers entirely.
