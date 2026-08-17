# AI Usage & Engineering Log

**Candidate:** Kajal Dalai  
**Task:** Wantace SDE Take-Home Challenge — Northline Roofing Estimator  
**Date:** August 2026  

---

## 1. AI Tools Utilized
- **Antigravity / Gemini Agentic Assistant:** Used for rapid scaffolding of Mongoose models, Vitest test suite creation, and Tailwind CSS utility component styling.
- **Node.js & Vitest CLI:** Used directly to run unit tests and verify mathematical precision.
- **Browser Automation Subagent:** Used to simulate real end-to-end user and admin sessions, verifying zero client-side calculation leaks.

---

## 2. Where AI Assistance Was Applied
- **Seed Data Migration:** Automating the initial JSON seed parsing and database seeding script.
- **Mongoose Schema Scaffolding:** Drafting schemas for `Config`, `Lead`, and `ConfigHistory`.
- **CSS / UI Polish:** Generating responsive Tailwind layout classes for mobile wizard viewports and dark-mode admin headers.

---

## 3. Specific Instance Where AI Output Was Deficient & How It Was Resolved

### The Bug:
During the initial implementation of the public configuration controller (`server/src/controllers/configController.js`), the AI generated a projection map to strip out internal backend pricing fields before sending questions to the frontend. However, the AI inadvertently **omitted the `active: true` boolean** from the returned question objects. 

In `client/src/components/dynamic/DynamicField.jsx`, the guard clause:
```javascript
if (!question || !question.active) return null;
```
evaluated `!undefined` as `true` and silently rendered an empty question step in the wizard.

### The Fix:
I diagnosed the issue by inspecting the API response payload against the component prop types. I applied a dual-layer fix:
1. Updated `getPublicConfig` in the backend controller to explicitly preserve `active: true`.
2. Hardened `DynamicField.jsx` to check `if (!question || question.active === false) return null;` so that questions missing explicit boolean tags still render gracefully by default.

---

## 4. Components Authored & Substantially Refactored Directly
- **Pricing Calculation Engine (`server/src/services/pricingEngine.js`):** Engineered the multi-step formula arithmetic, explicit `Number()` normalization for string multipliers (e.g. `"1.12"`), and dynamic boundary constraint checks.
- **Dynamic Wizard State Machine (`client/src/components/estimator/EstimatorWizard.jsx`):** Developed the step-by-step progress tracker, per-step validation logic, smooth transitions, and contact capture gating.
- **Marcus-Friendly Rates Editor (`client/src/components/owner/RatesEditor.jsx`):** Designed the non-technical UI allowing Dale and Marcus to modify material rates, multipliers, and toggles with instant live database sync.
- **Lead CSV Exporter (`server/src/controllers/leadController.js`):** Built custom RFC 4180-compliant CSV generation with quotation escaping to prevent Excel formatting corruption.
