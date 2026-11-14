# GETMEDS.PH REDESIGN — COMPLETE HANDOFF (as of 2026-11-13, incl. navigation & ordering restructure)

> **Purpose of this file:** a single, self-contained description of everything built and decided in the Getmeds.ph low-fidelity redesign. Hand it to another AI or developer to continue the work without losing context. Every on-page word below is what is in the build now.

---

## 0. HOW TO USE THIS FILE (instructions for the next AI)

1. Treat this file as the **source of truth** for structure, copy, SEO, buttons, and flows.
2. **Keep it low-fidelity** (neutral greys, 1px borders, placeholders, no real images, gradients, shadows, or animation) unless **Linus (UI/UX owner)** approves high-fidelity work.
3. **Never invent** prices, stock, FDA/PDEA license numbers, accreditations, clinical claims, testimonials, impact metrics, or article content. Items marked **[TO VERIFY]** or **[TO BE SUPPLIED]** must stay placeholders until Getmeds provides them.
4. Preserve the **live getmeds.ph URLs** (listed in §11) — they carry existing search rankings.
5. Keep the **homepage section order** in §5. Add sections only with a clear user purpose and owner approval.
6. **Navigation and information architecture follow Getmeds' own business structure** (§4, §6.0). Novartis was only a visual-quality benchmark (spacing, hierarchy, card patterns) — never copy its branding, imagery, copy, layouts, or IA.

---

## 1. PROJECT SUMMARY

| Item | Value |
|---|---|
| Company | Getmeds Philippines, Inc. (live site writes "Getmeds Philippines, Inc."; spec writes "Getmeds Philippines Inc." — confirm) |
| Website | https://getmeds.ph |
| Brand tagline | **Your Compassionate Health Ally** |
| What Getmeds is | FDA-licensed pharmaceutical importer, wholesale distributor, supplier, and retail pharmacy in the Philippines |
| Goal | Redesign as a functional, SEO-ready, low-fidelity prototype to validate UX, navigation, journeys, business processes, and content architecture before final UI |
| Primary audiences | Patients & Families · Doctors & Healthcare Professionals · Distributors & Pharmacies · Hospitals & Institutions |
| UI/UX owner | Linus — sole approver of high-fidelity visual design |
| Future backend | **Bishnoi One** — CRM, Sales, Inventory, Finance, Dispatch (mocked today) |
| Design benchmark | Novartis — patterns only |

### Verified business facts (from live getmeds.ph)
- Address: Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Talon Dos, Las Piñas City, Metro Manila 1747
- Phone / Viber / WhatsApp: +63 919 076 9105 · Email: info@getmeds.ph · WhatsApp link: https://wa.me/639190769105
- Messenger: official link **[TO BE SUPPLIED]** · Business hours **[TO BE SUPPLIED]**
- Licenses (wording as published): FDA Philippines License to Operate as drug importer, wholesaler/distributor, and retail pharmacy; PDEA licensed for applicable controlled substances; DSWD & PCSO accredited; UN Global Compact member. License numbers **[TO BE SUPPLIED]**.
- Payment: Cash on Delivery (COD), GCash, Bank Transfer; Guarantee Letter orders coordinated per agency coverage; credit terms for qualified institutions, subject to approval.
- Delivery: "Orders confirmed before 3:00 PM are delivered the same day within Metro Manila." "Provincial retail orders typically arrive within 3 to 5 business days, depending on the destination." Coverage: Luzon, Visayas, and Mindanao.
- Leader: Naresh Bishnoi — "United Nations Global Compact SDG Champion" (see UNGC naming conflict in §12).
- Company stats published on live site (NOT shown on new homepage — unverified): 128+ medicines, 160+ pharmacies, 300+ hospitals, 2M+ lives touched.

---

## 2. TECH STACK & ARCHITECTURE

- **Next.js 16.4 (App Router) + TypeScript + Tailwind CSS v4**, no UI libraries. `cacheComponents` disabled (static prototype). 177 static pages.
- **Project root:** `C:\Users\Getmeds Backend\Desktop\getmeds-low-fedelity`
- Run: `npm run build` then `npx next start -p 3217` → http://localhost:3217
- Validation: `node scripts/validate-site.mjs http://localhost:3217` (crawls all links; checks one H1 per page, unique titles, meta description, canonical, OG, JSON-LD).
- E2E: 31 Playwright journey tests (kept outside the repo at `C:\Users\Getmeds Backend\gm-e2e\e2e.mjs`). **Status: all 31 pass, 0 console errors; crawl 467 URLs, 0 issues** (after live navigation alignment).

### Folder map
| Path | Contents |
|---|---|
| `src/app/` | All routes (pages, `sitemap.ts`, `robots.ts`, `not-found.tsx`) |
| `src/components/ui.tsx` | Low-fi primitives: PageShell, Section, **SectionHeader**, **Band**, Breadcrumbs (+BreadcrumbList JSON-LD), Notice, LinkButton, Placeholder, Stepper, FlowSteps, KeyValue, JsonLd |
| `src/components/content.tsx` | ProductCard/Grid, CategoryGrid, FaqList (+FAQPage JSON-LD, `openFirst`), CustomerTypes, HelpBox, ContactAside, RxPolicyNote |
| `src/components/layout/` | Header (nav + dropdowns), Footer, CurrentYear |
| `src/components/SearchBox.tsx` | Combobox search with instant suggestions |
| `src/components/home/RequestSwitcher.tsx` | Homepage Section 06 tabs |
| `src/data/ordering.ts` + `src/components/ordering.tsx` | Ordering hierarchy: 4 customer types and their options (single source for `/order-medicines` and the four customer pages) |
| `src/components/UngcBlocks.tsx` | UNGC highlights, SDG action cards, SDG tags, timeline |
| `src/components/commerce/` | CatalogBrowser, BuyBox, CartView, CheckoutFlow, RecordTracker, PostOrder views |
| `src/components/requests/` | PatientRequestForm, AssistanceRequestForm, ProgramPageView, shared helpers |
| `src/components/b2b/` | Professional/CSP/Partner/Quotation/Contact forms, ProductLines, Portal (partner ordering, quotation review, request confirmation) |
| `src/data/` | site.ts, products.ts (62 products), categories.ts (17), conditions.ts (44), faqs.ts, pages.ts (info/policy content), articles.ts, assistance.ts, ungc.ts, routes.ts (route inventory) |
| `src/services/` | `types.ts` (interfaces), `statuses.ts` (status pipelines), `mock.ts` (localStorage mock), `index.ts` (single import point) |
| `src/lib/` | seo.ts, cart.tsx (external store), hydration.tsx, draft.ts (sessionStorage drafts), format.ts |
| `docs/plan/getmeds-home.md` | Approved homepage master spec + 3 update sections |

### Service layer (future Bishnoi One integration)
UI imports only from `@/services`; replace `mock.ts` with real API clients.

| Interface | Bishnoi One module | Today (mock) |
|---|---|---|
| InventoryService (list/search, get, availability) | Inventory | Static catalog + mock stock |
| CrmService (inquiries, partner lookup) | CRM | localStorage records |
| SalesService (orders, quotations, POs, accept quotation) | Sales | localStorage records |
| FinanceService (totals, payment instructions) | Finance | Mock prices/fees, no payment |
| DispatchService (delivery estimate) | Dispatch | Text estimate |
| RecordStore (get/list/update/patch) | All | localStorage |

**Reference prefixes:** GM-ORD (cart order) · GM-REQ (patient medicine request) · GM-PAP (PCSO/DSWD assistance) · GM-PRO (professional inquiry) · GM-CSP · GM-REG (partner registration) · GM-RFQ (quotation) · GM-PO (purchase order) · GM-SUP (support/contact).

---

## 3. DESIGN SYSTEM (LOW-FIDELITY)

**Benchmark patterns adopted from Novartis (patterns only):** full-width alternating bands with generous whitespace; consistent section header (eyebrow → H2 → one-line intro → "View all →" text link on the right); whole-card clickable links with descriptive CTA text; dated metadata line above article titles; trust signals directly under the hero; strong type hierarchy.

| Token / class | Spec |
|---|---|
| Font | System UI stack, 15px base, line-height 1.5 |
| H1 | 1.75rem mobile / 2.4rem ≥768px, bold, tight tracking |
| H2 | 1.3rem / 1.6rem, bold |
| H3 | 1rem bold |
| `.eyebrow` | 0.75rem, uppercase, letter-spacing .08em, grey #555 |
| `.lead` | 1.05rem, #333, max 42rem wide |
| `.band` / `.band-alt` | Full width; white / #f5f5f5; top border #d4d4d4; padding 2.5rem (3.5rem ≥768px) |
| `.card-link` | Whole card is one link: 1px #9ca3af border, white, 1.25rem padding, hover border #111; `.card-cta` underlined bold at bottom |
| `.btn` / `.btn-primary` | 1px black border, min-height 2.5rem; primary = dark fill, white text |
| `.label-tag` | Small uppercase bordered chip (e.g. "RX — PRESCRIPTION REQUIRED", SDG tags) |
| Placeholders | Dashed grey box with "[ label ]" in place of every image/logo/map |
| Focus | 2px black outline on `:focus-visible` |
| Prototype banner | Black strip on every page: "LOW-FIDELITY PROTOTYPE — prices, stock, orders and statuses are simulated. No real orders, payments or pharmacist approvals. Prototype guide" |

Element defaults live in Tailwind's `@layer base` so component classes override them (fixes underlined card text).

---

## 4. GLOBAL HEADER & FOOTER

### Header (all pages)
**Utility strip (top):** phone +63 919 076 9105 (left) · **Track Order** → `/track-order` · **Cart (n)** → `/cart` (right).

**Main row — follows the LIVE getmeds.ph header order (updated 2026-11-13):**
`[LOGO] Getmeds` · Home · Order Medicines ▾ · Product Range ▾ · About Us ▾ · UNGC · `[Patient Assistance Program]` ▾ · Contact Us · [Search medicine name… | Search] · `[Global Network]` ▾

- **Split-button pattern:** every label is a link to its landing page. Items with submenus get a separate **▾** button (accessible name "<Item> submenu", `aria-expanded`). Esc closes only the open submenu and returns focus to its toggle. Submenu links stay in the HTML for crawling. The current section is bold, with `aria-current="page"`.
- **Logo-style items:** the live site shows Patient Assistance Program and Global Network as logo badges, rendered here as dashed "logo" placeholders that keep their text labels.
- **Responsive:** the full single-row navigation shows from **1280px (xl)**. Below that: logo + search + Global Network + **Menu** (collapsible nav).

| # | Item → landing page | Submenu (▾) |
|---|---|---|
| 1 | **Home** → `/` | — |
| 2 | **Order Medicines** → `/order-medicines` | Patients & Families · Doctors & Healthcare Professionals · Distributors & Pharmacies · Hospitals & Institutions (`/order-medicines/…`) |
| 3 | **Product Range** → `/product-range` | All Medicines · Prescription Medicines · Over-the-Counter Medicines · Therapeutic Categories · Browse by Condition |
| 4 | **About Us** → `/about-us` | About Getmeds · Our Services `/services` · Blog & Health Articles `/blog` · Careers `/careers` · Licenses & Compliance `/regulatory-information` |
| 5 | **UNGC** → `/ungc` | — |
| 6 | **Patient Assistance Program** (logo) → `/patient-assistance-program` | PCSO Medical Assistance · DSWD Medical Assistance · Eligibility & Requirements · How to Apply |
| 7 | **Contact Us** → `/contact-us` | — |
| — | **Global Network** (logo, right of search) → `/global-network` | Global Network `/global-network` · Global Presence `/global-presence` |

**[TO VERIFY]** The live dropdown items load with JavaScript and could not be read, so the submenu contents above are prototype choices that only use existing pages. On the live site, Order Medicines and Patient Assistance Program show no caret; the ▾ submenus are kept because of the earlier requirement to expose the four customer types and PCSO/DSWD.
**URL fix:** `/global-network` is a live page (200), so the old redirect to `/global-presence` was removed and a `/global-network` page was added: H1 "Global Healthcare Without Borders", sections "One mission. Ten footholds." (10 locations: Philippines – Getmeds Philippines Incorporated; India – Getmeds Healthcare (India); Singapore – Getmeds HealthTech Pte. Ltd.; Pakistan; Vietnam; Cambodia; Laos; Myanmar; Saint Kitts and Nevis; Vanuatu) and "Grow beyond borders with Getmeds".

### Search behavior (header + homepage)
- Suggestions appear after 2+ characters (max 6; brand, strength, generic, form, Rx/OTC tag).
- ↑/↓ move, **Enter** opens highlighted product (or submits), **Esc** closes suggestions without clearing text.
- Submit → `/search?q=…` (noindex results page). Empty submit → "Enter a medicine name to search."
- No match → "No matching medicine. Press Search to see options, or request assistance."

### Footer (all pages)
- **Company block:** Getmeds Philippines, Inc. · Your Compassionate Health Ally · "FDA-licensed importer, wholesale distributor, and retail pharmacy supplying medicines to patients, doctors, pharmacies, and hospitals in the Philippines." · address.
- **Contact Details:** Phone / Viber · Email · WhatsApp · Messenger [official link to be supplied].
- **Quick Links (mirror live nav):** Order Medicines · Product Range · About Us · Our Services · Blog · UNGC · Patient Assistance Program · Global Network.
- **Customer Services:** Contact Us · Track Order / Request · Ordering Help (FAQs) · Prescription Policy · Shipping & Delivery Policy.
- **Licenses & Regulatory Information:** FDA Licenses & Compliance (`/regulatory-information`) · UN Global Compact · Medical Disclaimer.
- **Privacy & Legal:** Privacy Policy · Terms & Conditions · Prescription Policy · Delivery Policy · Returns / Refund Policy.
- **Bottom:** "Copyright © {current year} Getmeds Philippines, Inc." · Sitemap. (Year renders client-side so it never goes stale.)

---

## 5. HOMEPAGE — SECTION BY SECTION (`/`)

### SEO (follows the LIVE getmeds.ph keywords — overrides earlier approved text)
| Element | Value |
|---|---|
| `<title>` | **Getmeds \| Global Pharmaceutical Company** (live, verbatim) |
| Meta description | **Getmeds is an FDA-licensed pharmaceutical importer, wholesale distributor, supplier, and retail pharmacy in the Philippines. Order medicines online.** (live, verbatim) |
| Canonical | https://getmeds.ph |
| H1 (only one) | **Life-Saving Medicines for Patients, Doctors, Pharmacies & Hospitals in the Philippines** (live) |
| JSON-LD | WebSite, Pharmacy, Organization (with `memberOf` United Nations Global Compact), FAQPage |
| Target keywords | Getmeds; FDA-licensed / FDA Philippines Licensed; pharmaceutical importer, wholesale distributor, supplier, retail pharmacy; Philippines; order medicines online; life-saving medicines; patients, doctors, pharmacies & hospitals; therapeutic areas; featured products; Luzon, Visayas, and Mindanao; Patient Assistance Program; PCSO / DSWD medical assistance; UN Global Compact member; SDG; cold-chain |

Earlier approved (now replaced, owner sign-off pending): title "Getmeds Philippines | Buy Medicines Online & Healthcare Supply"; H1 "Buy Medicines Online in the Philippines"; brand headline "Life-Saving Medicines. Compassionate Care."

### Order and background rhythm
01 Hero (white) → 02 Find (grey) → 03 Categories (white) → 04 Featured Products (grey) → 05 Who We Serve (white) → 06 Requests (grey) → 07 Patient Assistance (white) → **Who we are / Caring (grey)** → **What we do (white)** → **08 Why Getmeds + Partner with us! (grey)** → **Customer Reviews (white)** → 09 Articles (grey) → 10 FAQs (white) → 11 Contact (grey). Header above, footer below.
The order from "Who we are" to "Customer Reviews" mirrors the live getmeds.ph homepage. The detailed UNGC/SDG band (former 08A) was **removed from the homepage** at the owner's request; that content now lives only on `/ungc`.

---

#### 01 — HERO
- **Purpose:** say what Getmeds is and give direct entry to medicines.
- **Eyebrow:** FDA-LICENSED PHARMACEUTICAL COMPANY · PHILIPPINES
- **H1:** Life-Saving Medicines for Patients, Doctors, Pharmacies & Hospitals in the Philippines
- **Brand line:** Your Compassionate Health Ally
- **Lead:** "Getmeds is an FDA-licensed pharmaceutical importer, wholesale distributor, supplier, and retail pharmacy in the Philippines. Order medicines online, upload your prescription, and get support for patients, doctors, pharmacies, and hospitals across Luzon, Visayas, and Mindanao."
- **Buttons:** **Shop Medicines** (primary) → `/product-range` · **Upload Prescription** → `/order-medicines/patients?mode=upload`
- **Small note:** "Prescription requirements depend on the medicine. Prescription-only medicines are verified by a licensed pharmacist."
- **Image:** placeholder "Human-centered healthcare image (Getmeds-owned)" — right on desktop, after text on mobile.
- **Trust strip (under hero, 4 items, icon + link):** FDA Philippines Licensed → `/regulatory-information` · PDEA Licensed → `/regulatory-information` · DSWD & PCSO Accredited → `/patient-assistance-program` · UN Global Compact Member → `/ungc`

#### 02 — FIND YOUR MEDICINE
- **Purpose:** find a specific medicine by brand/generic name.
- Eyebrow: SEARCH MEDICINES · **H2:** Find the Medicine You Need · Intro: "Search by brand or generic name to find medicine information and availability."
- Large search combobox (placeholder "Search medicine name...") + **Search**.
- Links: "Can't find your medicine? **Request assistance**" → `/order-medicines/patients?mode=manual` · **View All Medicines** → `/product-range`
- Rules: no permanently displayed example medicine; no category filters here.

#### 03 — THERAPEUTIC AREAS (categories)
- Eyebrow: EXPLORE MEDICINES BY CATEGORY · **H2:** Therapeutic Areas We Serve Across the Philippines (live keyword) · Intro: "Browse medicines by therapeutic area and find products relevant to your needs." · Top-right link: **View All Categories →** `/therapeutic-categories`
- 6 whole-card links (3 columns desktop, 2 mobile), icon placeholder + title + label:
  - Oncology (Solid Tumors) — Cancer care → `/cancer-medicines`
  - Oncology / Hematology — Blood-related conditions → `/blood-disorder-medicines`
  - Cardiology — Heart and cardiovascular care → `/heart-medicines`
  - Endocrinology — Diabetes — Diabetes-related medicines → `/diabetes-medicines`
  - Nephrology / Renal — Kidney-related care → `/kidney-medicines`
  - More Categories (dashed) — Anti-infectives, hormonal therapy, allergy, and more → `/therapeutic-categories`

#### 04 — FEATURED PRODUCTS (approved fallback for "Popular Medicines")
- No verified purchase data exists, so there is **no popularity claim**. Switch to "Popular Medicines" only with verified completed-B2C data (exclude cancelled, test, refunded, and wholesale transactions).
- Eyebrow: OUR MEDICINES · **H2:** Featured Products (live keyword) · Intro: "Explore medicines from the Getmeds catalog. View product information, prescription requirements, and available ordering options." · Link: **View All Medicines →**
- 3 whole-card links: image placeholder, tag "RX — PRESCRIPTION REQUIRED", **PazoGet-200 (Pazopanib)** 200 mg · Film-coated tablet; **IdaGet-5 (Idarubicin Hydrochloride)** 5 mg · Lyophilized powder for injection; **SevelaMed (Sevelamer Carbonate)** 800 mg · Film-coated tablet. Note "Price and availability confirmed when you order." CTA **View Medicine** → product page. (ErpoGet is featured on the live site but omitted until its URL is confirmed.)

#### 05 — WHO WE SERVE
- **Purpose:** route each audience to its own experience (separate from Section 06, which starts a request).
- Eyebrow: WHO WE SERVE · **H2:** Healthcare Solutions for Every Need · Intro: "Supporting patients, doctors, pharmacies, and hospitals in the Philippines with medicine access and pharmaceutical services."
- 2×2 whole-card links (1 per row on mobile), each with an image placeholder:
  | Card | Text | CTA → |
  |---|---|---|
  | Patients & Families | Find medicines, order online, and get prescription support. | Order Medicines → `/order-medicines/patients` (two choices: Shop Medicines / Upload) |
  | Doctors & Healthcare Professionals | Access medicine information, product inquiries, and professional assistance. | For Doctors → `/order-medicines/doctors` |
  | Distributors & Pharmacies | Explore wholesale medicine sourcing and partnership opportunities. | Wholesale Supply → `/order-medicines/distributors` |
  | Hospitals & Institutions | Request quotations and coordinate institutional medicine procurement. | Hospital Supply → `/order-medicines/hospitals` |

#### 06 — SMART MEDICINE REQUESTS & ORDERING
- Eyebrow: ORDER MEDICINES · **H2:** Need Help Ordering Your Medicines? · Intro: "Have a prescription, medicine list, or supply requirement? Upload your document or enter your request manually. Our team will guide you through the next steps."
- **"I am a:" tab switcher** (ARIA tabs; ←/→/Home/End), default **Patient**. Only the active panel shows.
  | Tab | Panel title / text | Buttons → | Secondary link |
  |---|---|---|---|
  | Patient | Patients & Families — "Upload your prescription or medicine list, or type the medicines you need. Prescription-only medicines are verified by a licensed pharmacist." | **Upload Prescription** `/order-medicines/patients?mode=upload` · **Enter Medicine List** `?mode=manual` | Browse Medicines `/product-range` |
  | Doctor | Doctors & Healthcare Professionals — "Check medicine availability, request product information and documentation, request supply, or start a patient access / CSP inquiry." | **Start Professional Request** `/order-medicines/doctors` | Product information & inquiries `/professional-inquiry` |
  | Distributor | Distributors & Pharmacies — "Request a wholesale quotation, check product availability, apply as a business partner, or place a repeat order. Upload your RFQ or product list if you have one." | **Start Wholesale Request** `/order-medicines/distributors` | Request a wholesale quotation `/request-quotation?type=distributor` |
  | Hospital | Hospitals & Institutions — "Submit an RFQ, regular or urgent medicine requirement, government bidding inquiry, or purchase order. Upload your procurement documents instead of retyping them." | **Start Procurement Request** `/order-medicines/hospitals` | Request a formal quotation `/request-quotation?type=institution` |

#### 07 — PATIENT ASSISTANCE PROGRAMS
- Eyebrow: PATIENT ASSISTANCE PROGRAM · **H2:** Helping You Access the Medicines You Need · Intro: "Get assistance with medicine quotations, document requirements, and guidance for applicable PCSO and DSWD medical assistance programs." · Link: **All assistance programs →** `/patient-assistance-program`
- 2 whole-card links: **PCSO Medical Assistance** — "Get help with medicine quotations, document requirements, and coordination involving an existing PCSO Guarantee Letter, when applicable." CTA **PCSO Assistance** → `/patient-assistance-program/pcso` · **DSWD Medical Assistance** — "Request medicine quotations and guidance on applicable DSWD medical assistance requirements." CTA **DSWD Assistance** → `/patient-assistance-program/dswd`
- Note: "Getmeds does not approve government assistance. PCSO and DSWD decide on applications under their own programs."

#### WHO WE ARE — CARING FOR OUR PATIENTS, PEOPLE, AND PLANET (compact live version)
- Eyebrow: WHO WE ARE · **H2:** Caring for Our Patients, People, and Planet. · Intro (live verbatim): "We advance Filipino healthcare, support our communities, and protect our environment through meaningful action and responsible practices."
- 3 whole-card links with image placeholders: **UN Global Compact — SDG Commitments ↗** → `/ungc` · **Our Identity — What Drives Us ↗** → `/about-us` · **Careers — Join our team ↗** → `/careers`

#### WHAT WE DO — CAPABILITIES (live content, verbatim)
- Eyebrow: WHAT WE DO · **H2:** Capabilities that move medicines, partnerships, and patients forward. · Side intro: "Getmeds operates across the pharmaceutical supply chain from global sourcing and regulatory compliance to nationwide distribution and last-mile delivery, helping make quality medicines accessible across the Philippines."
- Horizontal strip of 6 circular event-photo placeholders (live shows event photos, e.g. an exhibition in Japan, 21–23 April 2026).
- 10 numbered capability cards (titles + live text, data in `src/data/home.ts`):
  1. Global Network of Pharma Manufacturers — 50+ manufacturers across India, China, Europe, and the US; WHO, PIC/S, US FDA, "EU MHRA", UK MHRA recognized **[live text says "EU MHRA" — confirm whether "EU GMP" was meant]**
  2. Regulatory & Compliance — FDA Philippines, DOH, PDEA (S-4 and S-5), BOC, EDPMS; CPR application to license renewals
  3. Precision Supply Chain & Nationwide Distribution — WHO GSDP-compliant cold chain, batch-level traceability, Luzon, Visayas, and Mindanao
  4. Sales and Distribution — 160+ pharmacy accounts; account-managed service
  5. Government Bidding & Public Sector Access — oncology, hematology, anesthesia tenders
  6. Government Medical Assistance & Program Accreditation — DSWD, PCSO, and other programs
  7. Certificate of Listing of Identical Drug Product (CLIDP) Services
  8. International Operations & Pharmacy Footprint
  9. Digital & Smart Healthcare Solutions
  10. Physician-Direct Product Access — availability, medical documentation, CSP coordination
- Link: **Explore Our Services →** `/services`

#### 08 — WHY GETMEDS (live content; replaces the earlier 4 trust cards to avoid duplication)
- Eyebrow: WHY GETMEDS · **H2:** Why doctors, hospitals and pharmacies choose Getmeds. · Link: **Learn More →** `/about-us`
- 4 points: **First-to-market sourcing** — We move the moment a patent cliffs globally. · **Cold-chain excellence** — Biologics-ready logistics nationwide. · **Filipino-first portfolio** — Selected for local disease patterns. · **Patient Assistance Program** — Adherence, access, affordability.
- **H3 "Partner with us!"** — 3 credential cards linked to evidence: **World-Class Standards** ("Sourced from WHO, PIC/S, US FDA, EU GMP, and UK MHRA-recognized manufacturing facilities.") → Our capabilities `/services` · **UN Global Compact Member** ("Advancing the UN Sustainable Development Goals through ethical, responsible, and sustainable business.") → `/ungc` · **FDA Philippines Licensed** ("Fully licensed by the Food and Drug Administration of the Philippines as a wholesaler, importer, distributor and retail pharmacy.") → `/regulatory-information`
- The hero trust strip (FDA · PDEA · DSWD & PCSO · UNGC) is unchanged.

#### CUSTOMER REVIEWS (live, verbatim)
- Eyebrow: CUSTOMER REVIEWS · **H2:** What our customers say.
- 3 cards: ★★★★★ (read out as "5 out of 5 stars"), quote, initial avatar, name, "Google review":
  - **Mary C.** — "I only have positive things to say about their products and services. The staff is very accommodating, offering outstanding service. Their medications are affordable, and I appreciate the discounts they provide. You can easily buy medicine online with same-day delivery, making it very convenient. I highly recommend them."
  - **John Vergel L.** — "Affordable products and excellent service! … The staff took it upon themselves to organize shipping and were very accommodating throughout the process."
  - **Diana A.** — "Cindy was very helpful and made sure what I need were provided. She confirmed the availability and gave updates for the delivery. She even called me for faster transaction. Was really happy with the service. Will definitely order again with them"
- **No Review/AggregateRating structured data** — Google does not show self-serving reviews a business publishes about itself. Consider linking to the Google Business Profile once the URL is supplied.

#### 09 — HEALTH INSIGHTS & MEDICINE GUIDES
- Rule: feature **actual published articles only**; no invented articles or URLs.
- Eyebrow: HEALTH INSIGHTS · **H2:** Health Insights & Medicine Guides · Intro: "Explore practical information about medicines, prescription requirements, and healthcare access in the Philippines." · Link: **View All Health Articles →** `/blog`
- 3 whole-card links (image placeholder, "Category · Date" line above title, summary, **Read Article**):
  - Patient Assistance · February 20, 2025 — **PCSO Medicine Assistance: Requirements & How to Apply Online** → `/blog/how-to-apply-for-pcso-medical-assistance-program`
  - Patient Assistance · May 22, 2025 — **DSWD Medical Assistance through AICS: Requirements & How to Apply** → `/blog/how-to-get-medical-assistance-from-dswd-your-2025-ultimate-guide`
  - Medicine Guide · September 1, 2026 — **Generic Medicines Vs Branded: Safety, Price, and Quality Comparison 2026** → `/blog/generic-medicines-vs-branded`
- Article bodies are **[TO BE MIGRATED]**; author/pharmacist reviewer **[TO BE ADDED]** (not shown on live pages).

#### 10 — FREQUENTLY ASKED QUESTIONS
- Eyebrow: FAQS · **H2:** Frequently Asked Questions · Intro: "Find answers about Getmeds, medicine ordering, prescriptions, and delivery." · Link: **View All FAQs →** `/faqs`
- Accordion (native details/summary; **first item open by default**); FAQPage JSON-LD:
  1. **How do I order medicines from Getmeds?** — "Search for medicines or use our guided order form. Provide your medicine requirements, contact details, and delivery information. Getmeds will review your request and confirm the next steps."
  2. **Do I need a prescription to order?** — "Prescription-only medicines require a valid prescription and pharmacist verification. Other medicines may have different requirements."
  3. **Is Getmeds registered with FDA Philippines?** — "Yes. Getmeds Philippines, Inc. holds valid Licenses to Operate (LTO) from FDA Philippines as a drug importer, wholesaler, distributor, and retail pharmacy."
  4. **Is Getmeds legit?** — "Getmeds Philippines, Inc. is an FDA-licensed pharmaceutical company that also holds PDEA licensing for applicable controlled substances and is DSWD and PCSO accredited. Every prescription order is reviewed by a licensed pharmacist before dispatch."
  5. **How long does delivery take?** — "Orders confirmed before 3:00 PM are delivered the same day within Metro Manila. Provincial retail orders typically arrive within 3 to 5 business days, depending on the destination. Getmeds delivers to supported locations across Luzon, Visayas, and Mindanao, subject to product requirements and delivery arrangements."
- Moved to `/faqs` (still published there): "Can I order medicines for a family member?", "How can I track my medicine order?"

#### 11 — CONTACT & CUSTOMER SUPPORT
- Eyebrow: CUSTOMER SUPPORT · **H2:** Need Help? We're Here for You. · Intro: "Have questions about your order, medicine availability, or pharmaceutical services? Our team is ready to assist."
- 2 whole-card links: **Contact Our Team** — "For general concerns, product questions, and assistance with existing requests." CTA **Contact Us** → `/contact-us` · **Already Have a Request?** — "Check your order status, review updates, or respond to requests for more information." CTA **Track Request** → `/track-order`

---

## 6. CUSTOMER JOURNEYS (FLOWS)

### 6.0 Ordering hierarchy (restructured 2026-11-13)
`/order-medicines` (live H1 "Prescription Medicine Delivery in the Philippines — Order Online") is the **central landing page** for all ordering. It shows four customer-type cards; each lists its options and links to its own page. Below them: a buying / quotation / inquiry comparison table, nationwide delivery, a pointer to the Patient Assistance Program (kept separate), and FAQs.

All options come from one source, `src/data/ordering.ts` (rendered by `src/components/ordering.tsx`). Each option routes to **one existing specialized workflow**, so no forms are duplicated. The first option of each type is marked "Recommended start".

| Customer type → page | Options (→ workflow) |
|---|---|
| Patients & Families → `/order-medicines/patients` | **Shop Medicines** → `/product-range` (cart → checkout → tracking) · **Upload Prescription or Medicine List** → same page `#request-form` |
| Doctors & Healthcare Professionals → `/order-medicines/doctors` | **Medicine availability** `/professional-inquiry?type=availability` · Product information `?type=product_information` · Documentation `?type=professional_documentation` · Medicine supply `?type=medicine_supply` · Patient access / CSP coordination `/csp-inquiry` |
| Distributors & Pharmacies → `/order-medicines/distributors` | **Request wholesale quotation** `/request-quotation?type=distributor` · Check medicine availability `/contact-us?topic=availability` · Register as a partner `/partner-registration` · Existing partner ordering `/partner-portal` · Repeat purchase orders `/partner-portal` |
| Hospitals & Institutions → `/order-medicines/hospitals` | **Formal RFQ** `/request-quotation?type=institution&procurement=formal_rfq` · Regular procurement `…=regular` · Urgent medicine requirement `…=urgent` · Government bidding inquiry `…=government_bidding` · Purchase order submission `…=purchase_order` |

Breadcrumbs for every specialized workflow page start with Home / Order Medicines / <customer type>.

### A. Patients & Families — two distinct choices on `/order-medicines/patients`
The page H1 is "Order Medicines Online in the Philippines". The "How would you like to order?" section shows two choice cards. Below them is the **Upload Prescription or Medicine List** form (anchor `#request-form`); homepage "Upload Prescription" and "Request assistance" links go to `?mode=upload#request-form` or `?mode=manual#request-form`.
**A1. E-commerce purchase (knows the product):**
Homepage → Search / Browse → Product page → quantity (1–20) → **Add to Cart** or **Buy Now** → Cart → Checkout (5 steps) → Order confirmation → Tracking → Reorder.

- **Product page buy box:** mock price (labelled), quantity −/+; Rx note "You can add this to your cart now. You'll upload a valid prescription at checkout, and a licensed pharmacist must approve it before dispensing." Special states:
  - **Out of stock:** "Currently unavailable (mock status)" + **Request availability** → `/contact-us?topic=availability&product=…` + **See similar products**
  - **Institutional only** (e.g. IohexiGet contrast, MyxiGet): "Available to hospitals & institutions only" + **Request quotation** / **Professional inquiry**
  - **Controlled** (Tradmin, mock classification): extra safeguards note (original prescription and valid ID may be required)
- **Checkout steps:** 1 Contact (full name, email, PH mobile) → 2 Prescription (only if the cart has Rx items: **Upload now** [JPG/PNG/PDF ≤10 MB + prescribing doctor + SC/PWD checkbox] or **Send later** [order on hold]; valid-prescription checklist; controlled-medicine acknowledgment) → 3 Delivery (recipient, mobile, street, barangay, city, province, region → delivery estimate) → 4 Payment (COD / GCash / Bank Transfer; "You will not be charged now") → 5 Review (edit links; agree to Terms/Privacy/Prescription Policy; accuracy confirmation) → **Submit order for pharmacist review** (or **Submit order** if no Rx).
- Confirmation wording: "This order is SUBMITTED, not yet APPROVED…" Never shown as a paid or approved order.
- Order statuses: submitted → pharmacist_review → approved_for_dispensing → preparing → dispatched → out_for_delivery → delivered. Branches: awaiting_prescription, prescription_rejected (→ re-upload at `/prescription-upload?ref=`), additional_verification, out_of_stock_hold, cancelled.

**A2. Medicine request (has a prescription/list) — `/order-medicines/patients`** (H1 "Order Medicines Online in the Philippines"):
3 steps, guest, draft auto-saved (sessionStorage) across Back/reload:
1. **Medicine requirements:** choose **Upload documents** (type: Prescription / Medicine list / Doctor-provided medicine instructions; PDF/JPG/PNG ≤10 MB) or **Enter medicines manually** (rows: Medicine name, Strength (if known), Dosage form (if known), Quantity; **+ Add another medicine**); optional notes.
2. **Patient & contact:** For myself / For someone else → your full name, mobile, email (optional); if someone else: patient's full name + relationship; delivery recipient (optional, defaults to patient), delivery contact number, address (street, barangay, city, province), instructions.
3. **Review & submit:** review blocks with **Edit**; prescription-review notice; Privacy Policy consent → **Submit Medicine Request** → `/request-confirmation?ref=GM-REQ-…`
- Statuses: received → under_review → availability_ready → customer_confirmation → payment_confirmed → preparing → dispatched → delivered. Branches: action_required (customer uploads missing docs on the tracking page), cancelled_unavailable.

### B. Doctors & Healthcare Professionals
`/order-medicines/doctors` (landing: "What do you need?" option cards, flow, product info, CSP explainer, FAQs) → **Professional inquiry** `/professional-inquiry`. Request types: **Medicine availability** (default) · Product information · Documentation · Medicine supply · Patient access coordination. CSP goes to `/csp-inquiry`.
- **Preliminary inquiries (availability, product information) need no credentials:** 2 steps — Request (type, products, details) → Contact & submit (name, work email, mobile; optional hospital/clinic and PRC; privacy consent "to answer this inquiry"). Recorded with `credentialsRequired: false`; the tracking timeline skips "Credential verification".
- **Documentation, supply, patient access:** 3 steps — Request → Credentials (PRC license 5–8 digits, specialty, hospital/clinic, optional PRC ID upload) → Contact & consent.
- Confirmation GM-PRO → received → [credential_verification] → in_progress → resolved. Legacy `?type=order_coordination` maps to medicine_supply.
**CSP inquiry** `/csp-inquiry`: physician (named patient, initials only) or institution; medicine, strength, quantity, justification, documents; mandatory acknowledgment that approval is decided by FDA Philippines → GM-CSP → received → credential_verification → documents_review → submitted_to_fda → resolved.

### C. Distributors & Pharmacies — quotation first
`/order-medicines/distributors` → "What would you like to do?" The **Request wholesale quotation** option comes first and needs no registration. The quotation form for distributors offers "Wholesale quotation" or "Urgent requirement" and links existing partners to the portal. Availability checks use the minimal contact form (product and contact only).
- **Existing:** `/partner-portal` → sign in with account ID (demo: **PARTNER-DEMO**) → applicable partner pricing (mock) → enter quantities → **Request quotation** or enter PO number → **Place purchase order** → GM-PO → po_submitted → order_confirmed → preparing → dispatched → delivered → **Reorder** (prefills quantities).
- **New:** `/partner-registration` (3 steps: business type, name, TIN, address, region → FDA LTO number + validity + required LTO upload → authorized contact + consent) → GM-REG → received → business_verification → verified (→ "Go to partner ordering") / verification_failed.
- Price-first option: `/request-quotation?type=distributor` without an account.

### D. Hospitals & Institutions — upload-first procurement
`/order-medicines/hospitals` → "Select procurement type": **Formal RFQ** · Regular procurement · Urgent medicine requirement · Government bidding inquiry · Purchase order submission (the form also keeps CSP coordination) → `/request-quotation?type=institution&procurement=…`.
Three steps:
1. **Request type.**
2. **Requirements & delivery:** "How will you share your requirements?" — **Upload my document (recommended)** is the default for institutions; "Enter products manually" is the alternative (it becomes the default when the form opens with a `?product=` link). Conditional fields:
   - Formal RFQ: RFQ reference (optional).
   - Bidding: bid/PhilGEPS reference (required), bid deadline (optional), tender documents required.
   - PO: PO number and signed PO upload, both required.
   - Always: required delivery date, delivery location, payment preference (bank transfer / cash or check on delivery / credit terms, subject to approval / Guarantee Letter), notes.
3. **Organization & submit.**

Results:
- **RFQ, regular, urgent, bidding** → GM-RFQ: received → under_review → quotation_issued → **Review quotation & submit PO** (`/quotation-review`) → po_submitted → order_confirmed → dispatched → delivered.
- **Purchase order submission** → **GM-PO** (button "Submit purchase order"): po_submitted → order_confirmed → preparing → dispatched → delivered. Requested credit terms are not automatically approved.

### E. PCSO / DSWD assistance (upload-first)
`/patient-assistance-program` (hub) → `/patient-assistance-program/pcso` or `/dswd` (guidance: What Getmeds can help with · What the agency handles · Documents you may need · How to request a medicine quotation · Official program information [pcso.gov.ph / dswd.gov.ph] · FAQs) → **Start Assistance Request** → `/patient-assistance-program/request?program=pcso|dswd`:
1. **Purpose & upload:** program; purpose (I need a medicine quotation / I need help checking my documents / I already have a Guarantee Letter); upload what you have (prescription, medicine list, medical abstract, existing quotation, existing GL) **or** describe medicines.
2. **Minimal contact:** for self/someone else, contact name, mobile, email (optional), city/province (optional), patient name (optional).
3. **Review & submit:** acknowledgments "I understand this is not an official PCSO or DSWD application." + privacy → **Submit Assistance Request** → GM-PAP.
- Statuses: received → reviewing_documents → quotation_ready → awaiting_customer_action → assistance_coordination → closed. Branch: additional_documents_required (customer uploads from the tracking page).
- Compliance: Getmeds never claims to approve assistance or guarantee eligibility.

### F. Tracking (all request types)
`/track-order` (noindex): enter reference → status card with description, progress timeline, details, history, context actions (Upload prescription · Reorder · Review quotation · Go to partner ordering · Upload missing documents · Contact us about this). A dashed **PROTOTYPE CONTROL** panel simulates back-office status changes for demos. Records exist only in the same browser (localStorage).

---

## 7. OTHER KEY PAGES

| Page | H1 / purpose |
|---|---|
| `/product-range` | "Product Range: Prescription & Hospital Medicines" — search, category, Rx-only, hide unavailable, sort; URL-synced filters; legacy `?category=` keys supported |
| `/[category]` (17) | Category name, intro, products, related conditions, ordering options by audience; ItemList JSON-LD. OTC lists all non-Rx products |
| `/[category]/[product]` (62) | Full product name; badges; about; details table (pack size and FDA reg. no. [TO BE SUPPLIED]); conditions; "For healthcare professionals & institutions" links; product FAQs; related; buy box; Product+Drug JSON-LD (no `offers` until real prices exist) |
| `/conditions`, `/conditions/[slug]` (44) | Medicines by condition (mapping pending pharmacist review) |
| `/therapeutic-categories`, `/prescription-medicines`, `/search` | Category index; Rx listing; search results (noindex) |
| `/ungc` | Title "UN Global Compact Member: Responsible Healthcare in the Philippines - Getmeds"; H1 "United Nations Global Compact"; sections: highlights · What is UNGC? · How We Support the SDGs in Our Operations · SDG Ambition Accelerator Programme — Cohort 1 Completed (team + commitments) · Recent UN Global Compact Activity · The Ten Principles |
| `/global-network` | Live page: H1 "Global Healthcare Without Borders"; "One mission. Ten footholds." (10 locations); "Grow beyond borders with Getmeds" |
| `/regulatory-information` | "Licenses & Regulatory Compliance" — legal name, FDA LTO scope, license numbers/validity [TO BE SUPPLIED], PDEA, DSWD/PCSO, how to verify, Rx policy, CSP, adverse event reporting |
| `/patient-assistance-program` | Hub with anchors `#requirements`, `#how-to-apply` |
| `/blog`, `/blog/[slug]` | Featured real articles; article template (body to be migrated; Article JSON-LD) |
| `/about-us`, `/services`, `/global-presence`, `/csr`, `/careers` | Info pages; unverified content marked [TO BE MIGRATED] |
| Policies | `/prescription-policy`, `/shipping-and-delivery-policy`, `/return-and-refund-policy`, `/privacy-policy`, `/terms-of-service`, `/medical-disclaimer` — structure only; final text by Legal |
| `/faqs` | Groups: Ordering, Prescriptions & Tracking · About Getmeds · Prescription Details · Delivery & Payment · Doctors, Pharmacies & Hospitals · PCSO & DSWD Assistance |
| `/contact-us` | Topic (incl. availability, sourcing, PAP, partnership, careers), contact, optional reference, message → GM-SUP |
| `/sitemap`, `/prototype-guide` | HTML sitemap; reviewer guide (journey scripts, mocked-vs-implemented table, route inventory, reset demo data) |

---

## 8. SEO & TECHNICAL RULES (site-wide)
- Unique title + meta description + canonical + Open Graph per page; **exactly one H1**; logical H2/H3.
- Title template: "%s | Getmeds Philippines" (homepage and `/ungc` use absolute live titles).
- Breadcrumbs with BreadcrumbList JSON-LD on inner pages.
- `sitemap.xml` from a single route inventory (`src/data/routes.ts`); `robots.txt` disallows cart, checkout, confirmations, account, partner portal, quotation review, search, assistance request form, prototype guide, and any `?ref=` URL.
- noindex: tracking, search, transactional pages.
- Redirects: `/global-network`→`/global-presence`, `/faq`→`/faqs`, `/products`,`/shop`→`/product-range`, `/meditations`→`/blog`.
- Never index uploaded documents, tracking pages, or private records.

---

## 9. MOCKED vs IMPLEMENTED
| Implemented | Mocked / not built |
|---|---|
| Routing, navigation, dropdowns, breadcrumbs | Prices, stock, partner pricing, delivery fees (labelled "mock") |
| All SEO/structured data, sitemap, robots | Rx/controlled/institutional classifications (verify with Regulatory) |
| Search + suggestions + filters | Uploads (file names only; nothing uploaded; no extraction) |
| Cart, checkout, request forms, validation, drafts | Pharmacist/sales/dispatch decisions (simulated via prototype controls) |
| Status pipelines + tracking UI | Payment (none captured); emails/SMS; accounts/auth |
| Service interfaces for Bishnoi One | Secure tokenized tracking links, identity verification, malware scanning |

---

## 10. DECISIONS MADE TODAY (CHANGE LOG)
1. Built the full low-fi prototype (Next.js) using the live getmeds.ph business data, 62 product URLs, categories, conditions, and policy URLs.
2. Rebuilt the homepage to the approved 11-section spec; header/footer per spec; Account removed from header.
3. Added the patient 3-step medicine request form (`/order-medicines/patients`), PCSO/DSWD guidance pages + upload-first assistance form, `/search`, and article pages; OTC now lists non-Rx products.
4. Tracking supports uploading missing documents.
5. Fixed bugs found by testing: all form errors shown at once (no short-circuit); Esc in a dropdown no longer closes the mobile menu; Esc in search no longer clears the query; underlined card text (CSS layer order).
6. Applied the **Novartis design benchmark** (patterns only) at low fidelity.
7. Switched homepage SEO to the **live getmeds.ph keywords** (title, meta, H1, H2s, card titles, FAQ questions).
8. Added the **UNGC/SDG showcase** (homepage Section 08A + rebuilt `/ungc`) from verified Getmeds sources.
9. **Navigation & ordering restructure:** the main nav is now Getmeds' own (Home · Product Range · Services · Patient Assistance Program · Blog · Order Medicines · About Us · Contact Us), using split-button submenus. `/order-medicines` is the central ordering hub, and its dropdown exposes the four customer types. Patients get two distinct choices. Doctors' availability and product-information questions need no credentials. Distributors start with a quotation before registering. Hospitals default to document upload, and PO submission creates a GM-PO. One ordering data source, breadcrumbs under Order Medicines, the unused CustomerTypes component removed, and the footer quick links aligned. No URL changes.
10. **Live alignment:** the header follows the live getmeds.ph order (with logo-style Patient Assistance Program and Global Network) plus a utility strip for Track Order and Cart. Added the live homepage sections (Who we are / Caring, What we do with 10 capabilities, Why Getmeds + Partner with us!, Customer Reviews). Removed the detailed UNGC/SDG band from the homepage (kept on `/ungc`). Removed the incorrect `/global-network` redirect and added the live `/global-network` page. Footer quick links mirror the live navigation.

---

## 11. LIVE URLs PRESERVED
`/`, `/product-range`, `/prescription-medicines`, `/conditions` + 44 condition pages, 17 category URLs (e.g. `/cancer-medicines`, `/blood-disorder-medicines`, `/antibiotics`, `/heart-medicines`, `/kidney-medicines`…), 61 live product URLs (`/<category>/<product-slug>`), `/order-medicines` + `/patients` `/doctors` `/distributors` `/hospitals`, `/about-us`, `/services`, `/patient-assistance-program`, `/global-presence`, `/ungc`, `/csr`, `/careers`, `/blog` (+ article slugs), `/contact-us`, `/sitemap`, and all six policy URLs. New URL needing confirmation: `/kidney-medicines/erpoget-epoetin-alfa-4000iu-ml-prefilled-syringe`.

---

## 12. OPEN ITEMS — MUST BE VERIFIED BEFORE PRODUCTION
- **SEO sign-off:** live title/H1 replaced the spec's approved title/H1. The live title "Getmeds | Global Pharmaceutical Company" has no ordering phrase; test any change before making it.
- **Live navigation dropdown contents** (Product Range, About Us, Global Network) could not be read (they load with JavaScript); the prototype uses existing pages. Confirm the real items.
- Capability text "EU MHRA" (live) — confirm whether "EU GMP" was intended; claims such as "50+ manufacturers" and "160+ pharmacy accounts" are Getmeds' published statements.
- Customer reviews: confirm permission/source link (Google Business Profile URL).
- **Director name/title conflict:** "CEO Naresh Bishnoi" (/ungc) vs "Mr. Naresh Kumar Bishnoi: Director, SDG Champion" (blog).
- UNGC: confirm "Member" wording and "2nd pharmaceutical company in the Philippines to join" against the UNGC participant listing; live SDG action numbering starts at 02.
- Verified SDG impact metrics (kWh, plastic avoided, EV deliveries, trees planted) — none published yet.
- FDA/PDEA license numbers and validity; DSWD/PCSO accreditation details; FDA verification link.
- PCSO/DSWD official requirements (pages cite Getmeds' own guides and link to pcso.gov.ph / dswd.gov.ph).
- Delivery coverage and fees; Messenger and other official channels; business hours.
- Product classifications (Rx/OTC/controlled/institutional), pack sizes, FDA registration numbers, real prices and availability.
- Condition-to-product mapping (pharmacist review).
- Article bodies, authors, and pharmacist reviewers; real photos for all placeholders.
- Policy texts (Legal); upload limits and security configuration; Bishnoi One integration and approval workflows.
- Doctor/distributor/hospital customer pages are option hubs that route to the existing specialized forms (professional inquiry, quotation, partner registration/portal), rather than one combined form per route — confirm this is acceptable versus the spec's single dedicated forms.

---

## 13. SUGGESTED NEXT STEPS
1. Owner/SEO sign-off on the live-keyword homepage SEO.
2. Collect the verification items in §12 (start with licenses, UNGC metrics, photos).
3. Simplify the early journey steps (see §14).
4. Usability test with 2–3 real users per customer type.
5. Hand to Linus for high-fidelity design using Getmeds' own brand (logo, colors, type).
6. Connect Bishnoi One; implement secure tracking links, notifications, server-side upload validation and scanning.

## 14. UX IMPROVEMENTS — STATUS
- ✅ Patients: one clear choice — "Shop Medicines" vs "Upload Prescription or Medicine List" (`/order-medicines/patients`). Checkout still asks for a prescription upload when the cart has Rx items.
- ✅ Doctors: availability and product-information inquiries need no PRC credentials.
- ✅ Distributors: "Request wholesale quotation" is the first, recommended option; no registration needed.
- ✅ Hospitals: document (RFQ/PO/tender) upload is the default; PO submission is its own option.
- Open: the request form's mode does not switch if the user changes `?mode=` without reloading the page (minor); usability testing with real users.
