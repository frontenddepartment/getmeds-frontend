# Branch `feature/new-ordering-setup` — v2 + the new ordering setup

**Base:** exact copy of `getmeds-frontend-v2` @ `bf98aa5` (branch `getmedsfuture`), checked out as a git branch in
`getmeds-low-fedelity`. All v2 code, images, fonts, design and content are unchanged except the edits listed below.
**Not merged / not pushed.** The original `getmeds-frontend-v2` repo was only read, never modified.
**Low-fi prototype backup:** `Desktop/getmeds-low-fedelity-lowfi-backup/` (source of the ported flows).

## The rule this branch follows
Everything **looks** like v2. Every **click, form and tracking step** follows the low-fidelity prototype
(`docs/new-setup/HANDOFF-getmeds-redesign.md`), with two decisions from the business owner:
1. **No cart, no prices, no checkout.** v2 policy: prescription medicines are ordered by inquiry. "Shop Medicines" =
   browse → product page → v2's product inquiry.
2. **Prototype mode for the new flows.** New forms save to the browser (localStorage) with a reference number and
   tracking; they are clearly marked "Prototype — saved on this device only, not sent to Getmeds yet". They never call
   the live backend. Swap `src/newsetup/services/mock.ts` for real API clients when the backend supports references,
   RFQ/PO uploads and tracking.

## Click paths (identical to the low-fi prototype)
| Where you click | What happens |
|---|---|
| Navbar **Order Medicines ▾** (hover) | Sheet with the 4 customer types + their options + "Track a request" |
| Navbar **Patient Assistance ▾** (hover) | PCSO, DSWD, Eligibility & Requirements (`#requirements`), How to Apply (`#steps`), Start assistance request |
| Floating **Track your request** button (top of the WhatsApp / Viber / Messenger stack, every page) | `/track-order` |
| Home **Find the medicine you need** | Instant suggestions (v2 search index) → product page; Enter → `/product-range?q=` |
| Home **Need help ordering your medicines?** tabs | Full-width navy band, photo of the selected customer type on the right (v2 `/assets/order-medicines/ordermedicine*.jpg`). Patient: Upload Prescription / Browse Medicines (no manual entry) · Doctor / Distributor / Hospital: Start … Request + direct link |
| Home **PCSO / DSWD** cards | `/patient-assistance-program/pcso` · `/dswd` |
| Home **Need help? / Track request** | `/contact-us` · `/track-order` |
| `/order-medicines` **What do you need?** | Each customer type's options |
| **Patients** page | "How would you like to order?" → **Shop Medicines** (`/product-range`) or **Upload Prescription or Medicine List** (inline 3-step form, `#request-form`): **upload only** (prescription / medicine list — no manual medicine entry; patients who know the medicine use the product range → product page → inquiry) → patient & delivery → review → **GM-REQ** → tracking |
| **Doctors** page | On-page professional request (`#request-form`, 2 steps; PRC / specialty / affiliation asked only for documentation, supply, patient access) → **GM-PRO**; Patient access / CSP → `/csp-inquiry` → **GM-CSP** |
| **Distributors** page | On-page wholesale quotation (`#request-form`, upload product list / RFQ, no registration, 2 steps) → **GM-RFQ**; Check availability → `/contact-us`; Register → `/partner-registration` (3 steps, FDA LTO upload) → **GM-REG** → when verified "Go to partner ordering"; Existing partner / Repeat orders → `/partner-portal` (demo ID `PARTNER-DEMO`, or a verified GM-REG) |
| **Hospitals** page | On-page procurement request (`#request-form`): Formal RFQ · Regular · Urgent · Government bidding · Purchase order (cards on the left or the dropdown), upload-only, 2 steps → **GM-RFQ** (quotation → review → submit PO) or **GM-PO** |
| **PAP** page | Agency cards → PCSO / DSWD guidance pages → `/patient-assistance-program/request` (upload-first, "not an official application" acknowledgement) → **GM-PAP** |
| `/track-order` / `/request-confirmation` | Status, timeline, history, upload missing documents, prototype "simulate back-office" controls |

## Files changed in v2 (small, commented `NEW SETUP`)
| File | Change |
|---|---|
| `src/components/Navbar.tsx` | Order Medicines + PAP hover sheets (v2 search bar kept as-is). **Every link lands where its label says (low-fi map):** Product Range sheet adds All medicines · Prescription medicines · Therapeutic categories + "Browse by condition (A–Z)"; About Us › Global Presence → `/global-presence` (was `/global-network`), + Licenses & Compliance; Global Network sheet → Global Network · Where we operate (`#where-we-operate`) · Global Presence, with the 11 organizations listed as text (they have no pages of their own). Mobile menu rebuilt in the same order as desktop with indented sub-links. |
| `src/components/Navbar.tsx` (Product Range sheet) | Category and condition links open the **filtered product list** — `/product-range?category=<cat>[&condition=<slug>]#catalog` — instead of `/cancer-medicines` and `/conditions/<slug>` landing pages; `#catalog` lands on the results, not the hero |
| `src/app/product-range/ProductRangeClient.tsx` | `id="catalog"` on the list; `?condition=` accepts a slug or a name and selects the matching sidebar condition (e.g. `hodgkin-non-hodgkins-lymphoma` → "Hodgkin/Non-Hodgkin's Lymphoma") |
| `src/app/product-range/ProductRangeHub.tsx` | Optional `title` / `crumb` / `showRibbons` props so the hub can serve `/therapeutic-categories` |
| `src/app/page.tsx` | +4 sections (search, request switcher, PCSO/DSWD, help/track) — v2 sections untouched |
| `src/app/order-medicines/page.tsx` | "What do you need?" options block under the audience cards; PAP band shows the official PAP logo (`/images/newpaplogo.png`, as in the navbar) directly on the blue band instead of the hand icon + plain heading (the H2 is the logo, alt "Patient Assistance Program") |
| `src/app/order-medicines/[audience]/OrderMedicinesClient.tsx` | Options panel + low-fi flow; v2's original single-page forms kept in the file but switched off via `NEW_SETUP_FORMS = true` (flip to `false` to restore) |
| `src/app/patient-assistance-program/page.tsx` | Agency cards link to PCSO/DSWD pages; "Start an assistance request" link |
| `src/components/PapGuide.tsx` | `id="requirements"` anchor |
| `src/app/product-range/page.tsx` | Opens the searchable product list directly (search, category / dosage-form filters, sort) like the low-fi prototype; the hub with the cancer-ribbon strip is no longer shown (`ProductRangeHub.tsx` kept, unused) |
| `src/app/cancer-medicines/page.tsx` | Cancer-ribbon strip (`RibbonMarquee`) moved here from Product Range (it also stays on Conditions A–Z) |
| `src/lib/site.ts`, `src/lib/sitemapData.ts` | New indexable pages in the sitemap |
| `src/components/FloatingContactButtons.tsx`, `src/components/floating-contact.css` | "Track your request" button (`/track-order`) at the top of the floating chat stack, Getmeds blue with a white ring |
| `src/app/contact-us/page.tsx`, `src/app/employee-verification/EmployeeVerificationClient.tsx`, `src/app/careers/CareersJobs.tsx`, `src/components/ProductDetailClient.tsx` | **Site-wide form design, classes only** (no field, name, validation or submit changes): `ns-skin-panel` (light rounded panel around intro + form), `ns-skin-card` (raised white card), `ns-skin` on the `<form>` (grey filled fields, small labels, pill submit with white arrow circle), `ns-skin-select` on the product "Age" dropdown; each imports `@/newsetup/newsetup.css`. Careers and product forms are in drawers, so they get fields + button only. |

## Every customer type has its form on its own page (2026-11-14)
`/order-medicines/{patients,doctors,distributors,hospitals}` each show one request form (`#request-form`, `src/newsetup/AudienceFlow.tsx`) in the form panel, with that customer type's option cards in the left column (the separate options section above the form is no longer shown). The cards switch the request type in place (`?type=` / `?procurement=`); the dropdown in the form updates the URL and the highlighted card. Navbar, hub and homepage links point to these on-page forms; `/request-quotation` and `/professional-inquiry` still work as standalone pages.

| Customer | Form | Steps |
|---|---|---|
| Patients | Upload prescription / medicine list (no manual entry) | Upload → Patient & contact → Review |
| Doctors | Professional request: type dropdown, one "Medicine(s)" field, details | Your request → Your details & submit (credentials only for documentation, supply, patient access) |
| Distributors | Wholesale quotation: upload product list / RFQ | Requirements → Organization & submit |
| Hospitals | Procurement request: type dropdown, upload, PO no. / bid reference only when relevant | Requirements → Organization & submit |

Removed to unclog the forms: the product-row builder (`ProductLines.tsx`, deleted) and manual product entry, "I am requesting as" on the audience pages, payment preference, the optional RFQ reference, the separate credentials step. A specific medicine → product range → product page inquiry.

## Site-wide form design (2026-11-14)
One look for every form: light grey rounded panel; left = small grey eyebrow, headline with the **first word bold** and the rest light, intro, help line, verified contact rows (info@getmeds.ph, +63 919 076 9105); right = raised white card with the form; grey filled fields that turn white with a blue ring on focus; pill submit with a white arrow circle.
- New-setup forms: `FormPanel` in `src/newsetup/ui.tsx`; `NsPage layout="form" help="…"` on `/request-quotation`, `/csp-inquiry`, `/professional-inquiry`, `/partner-registration`, `/patient-assistance-program/request`, `/track-order`; the inline patient form on `/order-medicines/patients`. Field/choice/button styles in `newsetup.css` (`.ns-input`, `.ns-choice`, `.ns-form-card .ns-btn-primary`).
- v2 forms: see the row above. `newsetup.css` is unlayered, so it wins over Tailwind utility classes without `!important`.
- **Option cards in the form panel** (`src/newsetup/FormOptions.tsx`): the left column lists the customer's other routes as cards under the contact details. Patients: "Shop Medicines" + "Upload Prescription or Medicine List" (current one marked "You're here"; the separate options section above the form is no longer shown for patients). Other form pages list only *other* destinations + "Track a request" (quotation: availability, partner registration, partner ordering; doctors: CSP / professional options + Browse medicines; partner registration: quotation, availability, partner ordering; PAP request: PCSO, DSWD, requirements; track: the 4 customer types). On phones the cards come after the form.
- **Controls** (`forms.tsx` + `newsetup.css`): white fields with a fine border, soft shadow and blue focus ring; red required asterisk; error lines with an icon; dropdown with a divider + chevron; radio choice cards with a custom radio; boxed checkbox row with a custom check; upload = drop zone (icon, "Click to upload or drag and drop", types/size) with selected files listed as "Ready" rows (the real `<input type=file>` covers the zone, so click, drag-and-drop and tests work); form section headings with a rule.

## New files
- `src/newsetup/` — all added code: `services/` (records, references, statuses, mock CRM/Sales), `data/` (ordering options, assistance content, catalog adapter over v2's `lib/data.ts` products), `forms.tsx`, `ui.tsx` (v2-styled primitives, BreadcrumbList JSON-LD), `newsetup.css` (`ns-` classes), `b2b/` (Quotation, CSP, Professional inquiry, Partner registration, Portal), `requests/` (Patient request, Assistance request, PCSO/DSWD page), `tracking/`, `home/`, `OrderOptionsPanel`, `HubOptions`, `AudienceFlow`.
- Low-fi destinations that v2 lacked: `/therapeutic-categories` (v2's "All categories" hub, no ribbons), `/regulatory-information` (Licenses & Compliance; live-site facts only, numbers TO BE SUPPLIED).
- Navbar audit (`gm-e2e/nav-audit.mjs`): all 38 destinations return 200 with the matching H1; category links open the product list pre-filtered.
- Routes: `/professional-inquiry`, `/partner-registration`, `/request-quotation`, `/csp-inquiry`, `/partner-portal`, `/quotation-review`, `/request-confirmation`, `/track-order`, `/patient-assistance-program/{pcso,dswd,request}`. Private ones are `noindex`.

## Verification (2026-11-13)
- `tsc` clean; ESLint clean on all new code. v2's own pre-existing lint findings (3 errors, 9 warnings in Navbar/OrderMedicinesClient) are identical in the original repo.
- Dev server: every new/changed route returns 200.
- E2E (Playwright, outside the repo: `gm-e2e/e2e-v2.mjs`): **20/20 pass**; live-backend requests blocked during tests: 0; no console errors from our code (only v2's Tawk.to widget blocked on localhost).
- SEO (Rank Math script, target 90): homepage 56→59, order-medicines 52→52, patients 21→25, hospitals 55→59, PAP 70→74; new pages PCSO 66, DSWD 67, request-quotation 47, CSP inquiry 42. Remaining gap is mainly **content length (600+ words)** — needs real copy from Getmeds, not filler.
- **Not run:** `npm run build` (its prebuild syncs to the live Sanity CMS — run only when you decide to). `next build` was also not run because a dev server was using `.next`.

## Open items
- Patients' live prescription form (v2) is switched off on this branch; prescriptions submitted here are prototype-only until the backend accepts the new request format.
- v2 search bug (pre-existing): `/search?q=` redirects to `/product-range?search=`, which the page ignores. Homepage search here uses `?q=`.
- The "Check medicine availability" option opens v2's live contact form (same destination as the low-fi prototype); it has no tracking reference.
- Verify before production: PCSO/DSWD official requirements, director name/title wording, UNGC wording, license numbers (see HANDOFF §12).
