
# GETMEDS.PH — WEBSITE REDESIGN MASTER SPECIFICATION

**Company:** Getmeds Philippines Inc.  
**Website:** https://getmeds.ph  
**Brand Tagline:** Your Compassionate Health Ally  
**Project:** Website UX Redesign, SEO/AEO Optimization, and Customer Journey Improvement  
**Design Direction:** Clean, minimal, accessible, healthcare-focused, mobile-first, low-fidelity implementation initially  
**Primary Audiences:** Patients & Families, Healthcare Professionals, Distributors & Pharmacies, Hospitals & Institutions

---

# PROJECT OBJECTIVE

Redesign Getmeds.ph into a trustworthy, intuitive, conversion-focused pharmaceutical website that helps users:

- Find and request medicines.
- Order medicines without mandatory account creation.
- Upload prescriptions, medicine lists, and procurement documents.
- Submit healthcare professional and business inquiries.
- Request quotations.
- Access PCSO and DSWD medicine assistance support.
- Track orders and requests securely.
- Learn about Getmeds' pharmaceutical capabilities, credentials, and corporate commitments.

The website must be simple enough for patients and caregivers while supporting professional and institutional customers.

Prioritize real user needs over promotional content, unnecessary visual complexity, or excessive form fields.

---

# GLOBAL DESIGN AND UX PRINCIPLES

Apply the following five UX laws throughout the website.

## Jakob's Law

Use familiar website and e-commerce patterns:

- Standard navigation and dropdowns.
- Recognizable search interface.
- Familiar product cards.
- Simple shopping cart.
- Clear order submission and tracking.
- Predictable forms with Back and Continue actions.

Do not introduce unusual interactions without a strong usability reason.

## Hick's Law

Reduce unnecessary choices.

- Keep navigation organized.
- Use one clear primary action per interface.
- Display only relevant fields.
- Separate customer-specific workflows.
- Avoid overcrowding pages with competing CTAs.

## Fitts's Law

Make important actions accessible.

- Large enough mobile touch targets.
- Prominent primary buttons.
- Comfortable spacing between controls.
- Accessible form inputs.
- Easily discoverable search and order tracking.

## Miller's Law

Organize information into manageable groups.

- Short content sections.
- Clearly labeled cards.
- Three-step forms.
- Concise navigation categories.
- Simple progress indicators.
- Review screens before submission.

## Tesler's Law

Let the system handle complexity instead of making the user do everything manually.

- Allow document uploads instead of lengthy manual entry.
- Extract useful information from uploaded documents when supported.
- Provide editable extracted information for confirmation.
- Automatically route submissions to the appropriate team.
- Request additional details only when necessary.
- Preserve user-entered information between steps.

Never sacrifice pharmacist verification, regulatory compliance, document accuracy, or patient privacy to simplify the experience.

---

# GLOBAL WEBSITE REQUIREMENTS

## Guest-First Experience

Users must be able to:

- Browse medicines.
- Search the product catalog.
- Submit medicine requests.
- Upload prescriptions.
- Submit professional inquiries.
- Request quotations.
- Submit PCSO/DSWD assistance-related requests.
- Track requests.

No mandatory account creation or login.

Optional customer accounts may be considered in a future release.

## Document-First Experience

Whenever a visitor already has a prescription, medicine list, purchase order, RFQ, medical documentation, or company request letter, let them upload it.

Do not require users to manually recreate documents they already possess.

Suggested supported formats:

- PDF
- JPG
- PNG
- DOCX
- XLSX

Accept formats appropriate to each workflow, subject to secure validation and configured file-size limits.

Document processing rules:

1. Upload original file securely.
2. Scan and validate the uploaded file.
3. Extract relevant details where technically supported.
4. Display extracted values for customer confirmation when applicable.
5. Preserve originals for authorized staff review.
6. Allow manual entry and corrections.
7. Allow staff verification when extraction is unsuccessful.

Never automatically treat extracted medical or procurement data as verified.

## Secure Order and Request Tracking

After successful submission:

- Generate a unique request reference.
- Generate a secure, unguessable tracking link.
- Display a confirmation page.
- Provide current request status.
- Maintain a customer-visible activity timeline.
- Allow customers to complete missing requirements.
- Allow secure uploads of additional documents.
- Allow applicable quotation confirmation or follow-up actions.

Do not expose private tracking pages through public search indexing.

A reference number alone must not provide unrestricted access to private records.

Use secure tokens, access controls, expiry/revocation, and additional identity verification for sensitive actions.

## Notifications

Support appropriate notifications for:

- Request received.
- Additional information required.
- Quotation ready.
- Customer action required.
- Order status updated.
- Delivery updates, when applicable.

Browser push notifications are optional and require customer permission and browser support.

Provide other supported communication methods as necessary.

Do not include sensitive health information in notification previews.

## Accessibility

Require:

- Mobile-first responsive layouts.
- Keyboard navigation.
- Semantic HTML.
- Visible focus indicators.
- Screen-reader support.
- Accessible labels and form errors.
- Readable typography.
- Sufficient contrast.
- Appropriate touch-target sizes.
- Clear feedback on success, error, and pending states.

---

# GLOBAL NAVIGATION

## Shared Header

Main navigation:

### Home

Destination: `/`

### Shop Medicines

Dropdown:

- All Medicines
- Prescription Medicines
- Over-the-Counter Medicines
- Therapeutic Categories

### Healthcare Professionals

Dropdown:

- For Doctors
- Product Information & Inquiries

### Wholesale & Institutional Supply

Dropdown:

- Distributors & Pharmacies
- Hospitals & Institutions
- Request a Quotation
- Become a Partner

### Patient Assistance Programs

Dropdown:

- PCSO Medical Assistance
- DSWD Medical Assistance
- Eligibility & Requirements
- How to Apply

### About Getmeds

Dropdown:

- Our Company
- Our Services / Capabilities
- Blog & Health Articles

### Contact Us

Open the dedicated contact page.

## Header Utilities

- Search Medicines
- Track Order
- Shopping Cart

Do not make My Account or Login part of the required guest ordering journey.

On mobile, search, tracking, and cart must remain easy to find.

Navigation URLs must be mapped to real implemented routes before deployment. Do not publish dead links.

---

# HOMEPAGE SEO FOUNDATION

**SEO Title:**

Getmeds Philippines | Buy Medicines Online & Healthcare Supply

**Primary H1:**

Buy Medicines Online in the Philippines

**Brand Headline:**

Life-Saving Medicines. Compassionate Care.

The SEO title belongs in page metadata, not as an additional visible heading.

Use exactly one primary H1 on the homepage.

Homepage SEO should communicate:

- Medicine access in the Philippines.
- Online medicine ordering.
- Pharmaceutical supply.
- Prescription assistance.
- Healthcare professional support.
- Wholesale and hospital procurement.

The homepage must not attempt to rank for every specialized healthcare query. Detailed topics belong on appropriate dedicated pages.

---

# HOMEPAGE SECTION 01 — HERO

## Purpose

Immediately explain what Getmeds does and provide direct entry points for customers seeking medicines.

## Content

**H1:** Buy Medicines Online in the Philippines

**Brand Headline:** Life-Saving Medicines. Compassionate Care.

**Description:**

Getmeds Philippines helps patients, families, healthcare professionals, pharmacies, and hospitals access medicines, pharmaceutical information, ordering support, and healthcare supply solutions.

## Primary CTA

**Shop Medicines**

Destination: Medicine catalog.

## Secondary CTA

**Upload Prescription**

Destination: Patient medicine ordering workflow with upload mode selected.

## Layout

Desktop:

- Left: H1, headline, supporting description, CTAs.
- Right: Appropriate healthcare image or illustration.

Mobile:

- Text first.
- Primary CTA clearly visible.
- Secondary CTA directly below or beside it according to available width.
- Image placed after primary content.

## UX Requirements

- Prioritize medicine access.
- Avoid unnecessary animations.
- Maintain readable contrast.
- Do not overwhelm the hero with additional links.
- A prescription is not required for every product; requirements depend on medicine classification.
- Do not claim guaranteed availability or delivery.

---

# HOMEPAGE SECTION 02 — FIND YOUR MEDICINE

## Purpose

Help customers find a specific medicine using its brand or generic name.

## H2

Find the Medicine You Need

## Supporting Description

Search by brand or generic name to find medicine information and availability.

## Layout

1. Section heading.
2. Supporting description.
3. Prominent medicine search input.
4. Search button.
5. Can't find your medicine? Request assistance.
6. View All Medicines.

## Search Placeholder

Search medicine name...

## Search Behavior

- Search by brand and generic names.
- Show relevant instant suggestions while typing.
- Display suggestions in a temporary dropdown.
- Selecting a suggestion opens the product detail page.
- Submitting the search opens a dedicated search results page.
- Handle empty and no-result states gracefully.
- Provide assistance when the requested medicine is not found.

## Constraints

- No permanently displayed example medicine.
- No therapeutic category filters here.
- Do not duplicate the category section.
- Do not claim products are in stock without verified availability.
- Search interaction must support keyboard navigation.

## SEO

Provide crawlable links to catalog, category, and product pages.

Avoid indexing uncontrolled low-value search-result variations.

---

# HOMEPAGE SECTION 03 — EXPLORE MEDICINE CATEGORIES

## Purpose

Help customers browse medicines by therapeutic category.

## H2

Explore Medicines by Category

## Description

Browse medicines by therapeutic area and find products relevant to your needs.

## Category Cards

Feature five categories plus one additional category-navigation card.

Proposed categories, subject to actual catalog coverage:

- Oncology — Cancer care
- Hematology — Blood-related conditions
- Cardiology — Heart and cardiovascular care
- Diabetes — Diabetes-related medicines
- Nephrology — Kidney-related care
- More Categories

## Layout

Desktop:

- Six simple category cards in a responsive grid.

Mobile:

- Two columns where accessible.
- Otherwise a single-column layout.

## Card Content

- Outline icon or relevant visual.
- Category title.
- Short descriptive label.
- Direct category destination.

## CTA

View All Categories

## UX Requirements

- Use actual catalog categories.
- Do not create empty category landing pages.
- Avoid unsupported treatment claims.
- Do not turn categories into medical advice or recommendations.

## SEO

Each valid category should have a descriptive, crawlable destination.

Use category-specific content on destination pages rather than repeating full descriptions on the homepage.

---

# HOMEPAGE SECTION 04 — POPULAR MEDICINES

## Purpose

Show products with demonstrated customer demand using verified Getmeds transaction data.

## H2

Popular Medicines

## Supporting Description

Explore medicines frequently purchased by Getmeds customers. View product information, prescription requirements, and available ordering options.

Use popularity wording only when supported by verified purchase records and applicable promotion rules.

## Layout

Three product cards in a single desktop row.

Responsive mobile presentation:

- Stacked cards or an accessible horizontal carousel.
- Exact behavior determined during implementation testing.

## Product Card Information

- Product image.
- Brand or product name.
- Generic name.
- Strength.
- Dosage form.
- Rx or OTC classification.
- Verified price or availability where appropriate.
- View Medicine CTA.

## Product Selection Logic

Use actual completed B2C purchase data.

Suggested process:

1. Consider a recent verified transaction window.
2. Exclude cancelled orders.
3. Exclude test transactions.
4. Exclude refunded/returned transactions when relevant.
5. Exclude wholesale purchases.
6. Rank using verified customer purchasing activity.
7. Apply regulatory and public-listing restrictions.

Suggested initial ranking:

- Unique purchasing customers.
- Completed order frequency.

Exact ranking window requires business validation.

If sufficient verified popularity data is unavailable, use:

**Explore Our Medicines**

Do not invent best-selling products or imply that popularity means clinical superiority.

## CTA

View All Medicines

---

# HOMEPAGE SECTION 05 — WHO WE SERVE

## Purpose

Help the four main customer groups identify the correct route to Getmeds services.

## H2

Healthcare Solutions for Every Need

## Description

Supporting patients, healthcare professionals, pharmacies, and institutions with medicine access and pharmaceutical services.

## Four Audience Cards

### Patients & Families

**Image:** Patient or caregiver receiving medicine support.

**Description:**

Find medicines, order online, and get prescription support.

**CTA:** Shop Medicines

**Destination:** Medicine catalog or patient-specific landing page.

### Doctors & Healthcare Professionals

**Image:** Doctor or healthcare professional in a clinical setting.

**Description:**

Access medicine information, product inquiries, and professional assistance.

**CTA:** For Doctors

**Destination:** Healthcare professionals landing page.

### Distributors & Pharmacies

**Image:** Pharmacy shelves or pharmaceutical distribution.

**Description:**

Explore wholesale medicine sourcing and partnership opportunities.

**CTA:** Wholesale Supply

**Destination:** Distributor/pharmacy landing page.

### Hospitals & Institutions

**Image:** Hospital or procurement team.

**Description:**

Request quotations and coordinate institutional medicine procurement.

**CTA:** Hospital Supply

**Destination:** Hospital/institutional landing page.

## Layout

Desktop:

2 × 2 image-based card grid.

Mobile:

One card per row.

## Requirements

- Consistent card size.
- Short descriptions.
- One clear CTA per card.
- Appropriate imagery.
- Accessible click targets.
- No fictional medical endorsements or outcomes.

## Distinction

Section 05 routes users to their audience-specific experience.

Section 06 allows visitors to begin a request directly.

Do not merge these purposes.

---

# HOMEPAGE SECTION 06 — SMART MEDICINE REQUESTS & ORDERING

## Purpose

Provide a simple entry point for customers who want to submit medicine requirements rather than browse the catalog.

## H2

Need Help Ordering Your Medicines?

## Description

Have a prescription, medicine list, or supply requirement? Upload your document or enter your request manually. Our team will guide you through the next steps.

## Homepage Layout

Default customer type:

**Patients & Families**

Provide a compact customer-type switcher:

- Patient
- Doctor
- Distributor
- Hospital

Switching customer type changes the relevant text, actions, and destination.

Do not display all four complete forms on the homepage.

## Default Patient Actions

**Upload Prescription**

**Enter Medicine List**

Secondary link:

Browse Medicines

## Routing

- Patients: `/order-medicines/patients`
- Doctors: `/order-medicines/doctors`
- Distributors: `/order-medicines/distributors`
- Hospitals: `/order-medicines/hospitals`

These are planned dedicated routes and must be implemented before use.

## Form Architecture

Each dedicated workflow uses three steps:

1. Requirements or document upload.
2. Customer/professional/business details.
3. Review and submit.

All flows:

- Support guest access.
- Save entered information while navigating.
- Use conditional validation.
- Offer document upload or manual input.
- Generate appropriate request references.
- Provide secure tracking links.
- Avoid unnecessary information collection.

---

# DEDICATED FORM — PATIENTS & FAMILIES

**Route:** `/order-medicines/patients`

**Page H1:** Order Medicines Online in the Philippines

**Purpose:** Help patients and caregivers request medicines with minimal effort.

## Step 1 — Medicine Requirements

Offer two entry methods:

### Upload Documents

Allow uploads such as:

- Prescription.
- Medicine list.
- Relevant doctor-provided medicine instructions.

For prescriptions, proposed formats include PDF, JPG and PNG, subject to the site's verified upload policy and configured limits.

Where supported:

- Extract medicine names.
- Extract strength.
- Extract quantity.
- Identify other relevant information.
- Display values for customer verification.

Do not require duplicate manual entry when an uploaded document already contains the needed details.

### Enter Medicines Manually

Fields:

- Medicine name.
- Strength, if known.
- Dosage form, if known.
- Quantity.
- Add another medicine.

Support multiple medicines.

A prescription may still be required later for prescription-only medicines.

## Step 2 — Patient & Contact Information

Ask:

- Are you ordering for yourself or someone else?
- Customer/contact name.
- Mobile number.
- Email (optional).
- Patient name when needed.
- Caregiver relationship or authorization when relevant.
- Delivery recipient.
- Delivery address for physical delivery.
- Delivery contact number.
- Optional instructions.

Collect delivery details only for actual deliveries.

If pickup becomes available, use a separate conditional path.

## Step 3 — Review & Submit

Display:

- Requested medicines.
- Uploaded document names.
- Contact details.
- Delivery information.
- Prescription review notice.
- Privacy acknowledgement.

Allow edits without losing previously entered data.

CTA:

**Submit Medicine Request**

## Confirmation

Show:

- Unique request reference.
- Secure tracking link.
- Submission confirmation.
- Next-step instructions.

Do not represent a submitted request as a confirmed paid order, guaranteed stock reservation, or dispensing authorization.

## Tracking Status Examples

- Request Received
- Under Review
- Action Required
- Availability / Quotation Ready
- Customer Confirmation
- Payment Confirmed, if applicable
- Preparing
- Dispatched
- Delivered
- Cancelled / Unavailable

A pharmacist must verify prescriptions where legally applicable.

---

# DEDICATED FORM — DOCTORS & HEALTHCARE PROFESSIONALS

**Route:** `/order-medicines/doctors`

**SEO Title:** Medicine Inquiries for Doctors & Healthcare Professionals | Getmeds

**H1:** Medicine Supply & Product Support for Healthcare Professionals

## Step 1 — Professional Request

Request purpose:

- Check Medicine Availability.
- Product Information & Documentation.
- Request Medicine Supply.
- Patient Assistance / CSP Inquiry.

Allow existing documents such as:

- Professional request letter.
- Product list.
- Supporting documents.

Or permit manual entry:

- Medicine or molecule.
- Strength.
- Dosage form.
- Quantity where relevant.
- Request description.

Do not ask for identifiable patient information unless genuinely necessary and authorized.

Additional CSP or patient access documentation should be conditional.

## Step 2 — Professional Information

Collect:

- Full name.
- Profession.
- Specialty when applicable.
- PRC license number when verification requires it.
- Clinic or hospital affiliation when applicable.
- Professional email.
- Mobile number.
- Practice location.

Do not demand full credentials or institutional documents for a simple product availability question unless necessary.

## Step 3 — Review & Submit

Display request information and attachments.

Collect:

- Accuracy confirmation.
- Authority to submit.
- Privacy acknowledgement.

CTA:

**Submit Professional Request**

Generate a professional inquiry reference and secure tracking link.

## Conditional Routing

- Availability inquiries → Product/availability team.
- Documentation requests → Authorized product information review.
- Supply requests → Quotation and supply workflow.
- Patient access / CSP → Relevant program and regulatory review.

---

# DEDICATED FORM — DISTRIBUTORS & PHARMACIES

**Route:** `/order-medicines/distributors`

**H1:** Wholesale Medicine Requests & Pharmaceutical Supply

## Step 1 — Requirements

Request type:

- Request Wholesale Quotation.
- Apply as Business Partner.
- Place or Repeat an Order.
- Check Product Availability.

Allow uploads:

- Cover letter.
- Product list.
- RFQ.
- Purchase order.
- Company profile.
- Other relevant business documents.

Or manual entry:

- Medicine/product name.
- Strength.
- Dosage form.
- Pack size.
- Quantity.
- Additional requirements.

Payment preference, only when relevant:

- Advance.
- Partial.
- Credit terms review.
- PDC arrangement review.

Requested terms are not automatically approved.

### Minimal Inquiry Rule

For product availability checks, request only:

- Product information.
- Contact details.

Do not require full business registration or licensing documentation for simple preliminary questions.

## Step 2 — Business & Contact

Request conditionally:

- Registered business name.
- Business type.
- Authorized contact person.
- Designation.
- Business email.
- Mobile number.
- Business address.
- Delivery address for actual orders.
- FDA LTO when required.
- TIN when needed.
- Relevant company registration documents for onboarding.
- Credit documents only when applying for credit terms.
- Existing customer reference, optional.

## Step 3 — Review & Submit

Display:

- Purpose.
- Uploaded documents/products.
- Quantities.
- Contact information.
- Payment preferences where applicable.
- Delivery information when relevant.

Require appropriate authority and privacy acknowledgements.

CTA:

**Submit Wholesale Request**

Issue a wholesale inquiry/RFQ reference and secure tracking link.

## Tracking

- Received
- Under Review
- Action Required / Verification
- Quotation or Response
- Purchase Order
- Fulfillment, where applicable

---

# DEDICATED FORM — HOSPITALS & INSTITUTIONS

**Route:** `/order-medicines/hospitals`

**H1:** Hospital Medicine Supply & Procurement in the Philippines

## Step 1 — Procurement Requirements

Request type:

- Request Formal Quotation (RFQ).
- Regular Medicine Procurement.
- Urgent Medicine Requirement.
- Government Bidding / Tender.
- Submit Purchase Order.

Allow upload of:

- RFQ.
- Cover letter.
- Medicine requirements.
- Product list.
- Purchase order.
- Bidding/tender documents.

Or manual entry:

- Product/medicine name.
- Strength.
- Dosage form.
- Pack size.
- Quantity.
- Procurement specifications.

Conditional information:

- Required-by date.
- RFQ reference.
- Tender reference.
- Bid deadline.
- PO number.
- Delivery instructions.

Do not require manual re-entry of complete attached procurement documents.

Urgent requests may be prioritized internally, but urgency does not guarantee immediate fulfillment.

## Step 2 — Institution Information

Collect:

- Institution name.
- Institution type.
- Department or unit.
- Authorized contact.
- Designation.
- Official email.
- Mobile or office number.
- Institution address.
- Delivery location, where applicable.

Institution type options:

- Private Hospital.
- Government Hospital.
- Clinic / Healthcare Institution.
- Other Institution.

Conditional bidding documentation should appear only for applicable requests.

## Step 3 — Review & Submit

Review:

- Procurement request type.
- Documents or product requirements.
- Requested dates.
- Institution and contact details.
- Delivery information.

Allow editing.

Require authority, accuracy, and privacy acknowledgements.

CTA:

**Submit Procurement Request**

Generate a secure RFQ/procurement request reference.

## Request Routing

- RFQ → Quotation processing.
- Regular procurement → Institutional sales.
- Urgent supply → Priority review.
- Bidding → Government bidding team.
- Purchase order → PO verification and fulfillment coordination.

---

# HOMEPAGE SECTION 07 — PATIENT ASSISTANCE PROGRAMS

## Purpose

Help patients and caregivers obtain medicine quotations, understand document requirements, and access appropriate support related to PCSO and DSWD medical assistance programs.

This section is separate from medicine ordering.

## H2

Helping You Access the Medicines You Need

## Description

Get assistance with medicine quotations, document requirements, and guidance for applicable PCSO and DSWD medical assistance programs.

## Homepage Layout

Two program cards.

### PCSO Medical Assistance

**Description:**

Get help with medicine quotations, document requirements, and coordination involving an existing PCSO Guarantee Letter, when applicable.

**CTA:** PCSO Assistance

Destination: Dedicated PCSO assistance page.

### DSWD Medical Assistance

**Description:**

Request medicine quotations and guidance on applicable DSWD medical assistance requirements.

**CTA:** DSWD Assistance

Destination: Dedicated DSWD assistance page.

## Shared Design Direction

Both programs should have independent guidance pages but reuse common upload, review, and tracking components.

Do not combine PCSO and DSWD rules into one generic eligibility checklist.

---

# PCSO & DSWD — UPLOAD-FIRST ASSISTANCE WORKFLOW

## Core UX Principle

**Upload what you already have. We will help identify what is missing.**

Do not force patients to fill out lengthy forms if their documents already contain the information.

## Step 1 — Purpose & Upload

Allow the user to select:

- I need a medicine quotation.
- I need help checking my documents.
- I already have a Guarantee Letter, where applicable.

Let users upload documents relevant to their selected request, such as:

- Prescription.
- Medicine list.
- Medical abstract or other relevant medical documentation.
- Existing quotation.
- Existing applicable Guarantee Letter.
- Other documents required for the selected assistance path.

The site must not demand every possible program document at initial submission.

Accept a preliminary quotation request when sufficient minimum information is available.

## Step 2 — Minimal Contact Details

Ask:

- Request for myself or someone else.
- Contact person's full name.
- Mobile number.
- Email, optional.
- Patient identity details only when required.
- Location where needed to route or process the request.

Do not automatically require full personal documents for a preliminary medicine quotation.

## Step 3 — Review & Submit

Show:

- Assistance program.
- Purpose.
- Uploaded filenames.
- Contact information.
- Relevant acknowledgements.

Provide edit controls.

CTA:

**Submit Assistance Request**

## Confirmation

Provide:

- Getmeds assistance reference.
- Secure tracking link.
- Clear explanation of what happens next.

## Tracking

Possible statuses:

- Request Received.
- Reviewing Documents.
- Additional Documents Required.
- Medicine Quotation Ready.
- Awaiting Customer Action.
- Assistance Coordination.
- Completed / Closed.

Allow users to upload missing documents directly from their tracking page.

## Program-Specific Requirements

### PCSO

Provide:

- PCSO-specific medicine quotation guidance.
- Relevant official requirements.
- Links to current official PCSO instructions.
- Existing Guarantee Letter coordination, only where Getmeds is authorized or able to support it.

### DSWD

Provide:

- DSWD-specific medicine quotation guidance.
- Relevant AICS medical assistance requirements.
- Links to current official DSWD instructions.
- Applicable existing Guarantee Letter coordination, subject to verification.

## Critical Compliance Rule

Getmeds' assistance request is not automatically an official PCSO or DSWD application.

Getmeds must not claim it can approve government financial assistance or guarantee eligibility.

Official government requirements must be checked and maintained separately.

---

# HOMEPAGE SECTION 08 — WHY CHOOSE GETMEDS

## Purpose

Build credibility through actual company credentials, commitments, capabilities, and identity.

Replace generic promotional trust claims with evidence-backed content.

## H2

Trusted Pharmaceutical Care. Responsible Healthcare.

## Layout

Four concise trust cards.

Desktop:

2 × 2 grid.

Mobile:

Single-column cards.

Use simple outline icons.

## Card 1 — FDA-Licensed Pharmaceutical Provider

**Description:**

Learn about Getmeds' licensed pharmaceutical operations and commitment to responsible medicine supply.

**CTA:** View Licenses & Compliance

**Destination:** Dedicated regulatory credentials page.

This page should contain verified:

- Legal company name.
- Applicable FDA license details.
- Licensed activities and scope.
- License number.
- Current validity information.
- Official verification references.

Do not substitute a prescription policy page for actual licensing information.

Verify all license details before publication.

## Card 2 — UN Global Compact

**Description:**

Discover Getmeds' participation and commitments to responsible business practices and sustainability.

**CTA:** Our UNGC Commitment

**Destination:** `/ungc`

Verify the current status and exact terminology used to describe Getmeds' participation.

Do not claim certification or endorsement that the UN Global Compact does not provide.

## Card 3 — What We Do

**Description:**

Explore pharmaceutical sourcing, importation, regulatory capabilities, distribution, and medicine access services.

**CTA:** Explore Our Capabilities

**Destination:** Dedicated company capabilities page.

Reuse and expand existing verified What We Do content.

Do not link the card back to the same homepage section.

## Card 4 — Our People & Purpose

**Description:**

Learn about Getmeds' mission, values, people, and approach to healthcare access.

**CTA:** Discover Getmeds

**Destination:** `/about-us`

Reuse relevant verified company identity content.

## Additional Rule

Careers can remain under About Getmeds.

It does not need to become a fifth trust card.

## SEO/AEO

Link each trust statement to a real supporting page.

Use verifiable credentials, factual company information, and descriptive internal links.

Do not use unsupported claims such as guaranteed pharmaceutical quality or universal delivery coverage.

---

# HOMEPAGE SECTION 09 — HEALTH RESOURCES & ARTICLES

## Purpose

Provide useful educational information about medicines, prescriptions, safety, and healthcare access.

## H2

Health Insights & Medicine Guides

## Description

Explore practical information about medicines, prescription requirements, and healthcare access in the Philippines.

## Layout

Three image-based article cards on desktop.

Stack cards appropriately on mobile.

## Article Card Fields

- Relevant image.
- Category.
- Article title.
- Short summary.
- Read Article link.

## Suggested Editorial Topics

These are content ideas, not verified existing published articles.

### Understanding Prescription Medicines

Explain why some medicines require prescriptions and professional verification.

### How to Store Medicines Safely

Provide general medicine storage information based on appropriate labeling and safety guidance.

### Understanding Medicine Access in the Philippines

Explain medicine ordering, availability, and support channels.

## Article Selection Rules

- Feature actual published articles only.
- Prefer useful, accurate, relevant content.
- Include credible author or reviewer information where appropriate.
- Maintain publication and update dates.
- Require suitable medical or pharmaceutical review.
- Do not invent articles or URLs.
- Display fewer than three cards if insufficient appropriate content exists.

## CTA

View All Health Articles

Destination: Existing verified blog or articles page.

## SEO/AEO

- Descriptive article titles.
- Relevant internal links.
- Accurate publication metadata.
- Appropriate structured data where eligible.
- Helpful answers to real customer questions.
- No keyword stuffing.
- No unsupported treatment claims.

This section is for education, not direct medicine promotion.

---

# HOMEPAGE SECTION 10 — FREQUENTLY ASKED QUESTIONS

## Purpose

Answer common ordering and website questions before customers need to contact support.

## H2

Frequently Asked Questions

## Description

Find answers about medicine ordering, prescriptions, delivery, and tracking.

## Layout

Five expandable FAQ items.

Single-column accordion.

The first question may be expanded by default.

## FAQ 1

**Question:** How can I order medicines online?

**Answer:**

Search for medicines or use our guided order form. Provide your medicine requirements, contact details, and delivery information. Getmeds will review your request and confirm the next steps.

## FAQ 2

**Question:** Do I need a prescription to order?

**Answer:**

Prescription-only medicines require a valid prescription and pharmacist verification. Other medicines may have different requirements.

## FAQ 3

**Question:** Can I order medicines for a family member?

**Answer:**

Yes. You may submit a request for someone else. Additional patient information or authorization may be required depending on the medicine.

## FAQ 4

**Question:** How can I track my medicine order?

**Answer:**

After submitting a request successfully, you will receive a secure tracking link where you can view updates and respond to requests for additional information without creating an account.

## FAQ 5

**Question:** Does Getmeds deliver medicines nationwide?

**Answer:**

Getmeds coordinates medicine deliveries to supported locations in the Philippines, subject to confirmed service coverage, product requirements, and delivery arrangements.

Confirm actual delivery coverage and terms before publication.

## CTA

View All FAQs

Destination: Dedicated FAQ page.

## UX Requirements

- Accessible accordion.
- Clear question text.
- Concise answers.
- Keyboard support.
- Correct expanded/collapsed states.
- Content available in rendered HTML.
- Avoid unnecessary animations.

## SEO/AEO

Use natural questions and direct answers.

Specialized FAQs for PCSO, DSWD, healthcare professionals, wholesale buyers, and hospitals belong on their dedicated pages.

Do not assume FAQ structured data will generate enhanced Google search results.

---

# HOMEPAGE SECTION 11 — CONTACT & CUSTOMER SUPPORT

## Purpose

Help visitors contact Getmeds for assistance or follow up on an existing request.

This is the final numbered homepage content section.

## H2

Need Help? We're Here for You.

## Supporting Description

Have questions about your order, medicine availability, or pharmaceutical services? Our team is ready to assist.

## Layout

Two compact cards.

Desktop:

Two columns.

Mobile:

Stacked cards.

## Card 1 — Contact Our Team

**Description:**

For general concerns, product questions, and assistance with existing requests.

**CTA:** Contact Us

**Destination:** Dedicated contact page.

## Card 2 — Already Have a Request?

**Description:**

Check your order status, review updates, or respond to requests for more information.

**CTA:** Track Request

**Destination:** Shared secure tracking entry point.

## Contact Page Form

Collect only essential information:

- Inquiry type.
- Full name.
- Preferred contact method.
- Phone number or email.
- Message.
- Existing reference number, optional.

Do not require account creation or business-registration information for general questions.

For requests involving sensitive patient records or order changes, use secure verification rather than collecting private details in a general contact box.

## Additional Contact Options

Display only verified and officially supported channels:

- Company phone.
- Email.
- Messenger.
- Viber.
- Other official support channels.

Do not invent contact details.

## SEO/AEO

Use accurate company contact information, descriptive links, and a public contact page.

Do not index private customer inquiries or tracking records.

---

# SHARED WEBSITE COMPONENT — FOOTER

## Placement

Immediately after Section 11 — Contact & Customer Support.

The footer is not Section 12.

It is a shared website component that appears across relevant public pages.

## Purpose

Provide useful navigation, company identification, customer service information, and regulatory/legal references.

## Proposed Footer Structure

### Company Information

- Getmeds Philippines Inc.
- Your Compassionate Health Ally
- Short company introduction.
- Verified office address.

### Quick Links

- Shop Medicines.
- Healthcare Professionals.
- Wholesale & Institutional Supply.
- Patient Assistance Programs.
- About Getmeds.

### Customer Services

- Contact Us.
- Track Order / Request.
- Ordering Help.
- Prescription Policy.
- Relevant delivery and customer service policies.

### Licenses & Regulatory Information

- FDA Licenses & Compliance.
- UN Global Compact.
- Other verified regulatory references, when appropriate.

### Contact Details

- Verified telephone number.
- Verified email address.
- Official messaging links.
- Office information, where appropriate.

### Privacy & Legal

- Privacy Policy.
- Terms & Conditions.
- Prescription Policy.
- Delivery Policy.
- Returns / Refund Policy, if applicable.

### Bottom Footer

Copyright © Getmeds Philippines Inc.

Use a dynamic current year in the implementation.

## Footer UX Rules

- Use concise navigation groups.
- Keep links readable and accessible.
- Stack or appropriately collapse groups on mobile.
- Avoid large promotional content.
- Do not repeat the entire homepage.
- Do not add another lengthy contact form.
- Do not require account login.
- Ensure all links resolve to valid destinations.

## SEO/AEO

Use a semantic footer element.

Maintain consistent company information.

Link to public, relevant, indexable pages where appropriate.

Do not keyword-stuff the footer.

## Approval Status

Footer placement and its status as a shared component are approved.

Exact links, final grouping, contact details, and regulatory text still require verification and final review.

---

# DEDICATED PAGE ARCHITECTURE

The homepage links to dedicated pages to keep its content concise.

## Public Commerce Pages

- Home
- Medicine Catalog
- Medicine Categories
- Product Details
- Search Results
- Shopping Cart
- Order / Checkout Flow

## Customer-Specific Pages

- Patients & Families
- Doctors & Healthcare Professionals
- Distributors & Pharmacies
- Hospitals & Institutions

## Dedicated Request Forms

- `/order-medicines/patients`
- `/order-medicines/doctors`
- `/order-medicines/distributors`
- `/order-medicines/hospitals`

## Patient Assistance Pages

- PCSO Medical Assistance
- DSWD Medical Assistance
- Program Requirements
- Assistance Request Forms
- Assistance FAQs

## Company Pages

- About Getmeds
- What We Do / Capabilities
- Licenses & Regulatory Compliance
- UN Global Compact
- Careers

## Support Pages

- Contact Us
- FAQs
- Order / Request Tracking
- Ordering Help
- Prescription Policy
- Privacy and Legal Pages

Only explicitly approved or existing paths above should be treated as established. Remaining paths require route planning and verification.

---

# SHARED REQUEST MANAGEMENT RULES

## Request Categories

The backend must distinguish:

- Patient medicine request.
- Healthcare professional inquiry.
- Wholesale inquiry.
- Partnership application.
- Hospital RFQ.
- Hospital purchase order.
- Government tender submission.
- PCSO assistance request.
- DSWD assistance request.
- General customer support inquiry.

Each category must use the correct internal workflow and customer-facing reference.

## Required Shared Data

Store where appropriate:

- Request ID.
- Request category.
- Customer/contact information.
- Request details.
- Uploaded document references.
- Current status.
- Assigned department or handler.
- Customer-visible status history.
- Internal notes, separated from customer-visible updates.
- Creation and update timestamps.
- Relevant verification events.
- Consent and privacy acknowledgements as needed.

Use data minimization and appropriate security controls.

## Status Handling

Use a shared status engine with category-specific branches.

Suggested common statuses:

- Received.
- Under Review.
- Action Required.
- Awaiting Customer Response.
- Responded / Quotation Ready.
- Approved for Relevant Next Step, where applicable.
- Processing.
- Completed.
- Closed / Cancelled.

Not all statuses apply to every request type.

## Security

- Enforce role-based access and additional contextual controls where needed.
- Restrict sensitive files.
- Audit relevant staff actions.
- Validate uploads server-side.
- Apply malware scanning and secure storage.
- Prevent unauthorized downloads.
- Protect patient and business information.
- Never expose private files via publicly indexable URLs.
- Verify authorization before sensitive changes.

---

# SEO MASTER REQUIREMENTS

## Metadata

Every public page must have:

- Unique descriptive title.
- Relevant meta description.
- Appropriate canonical URL.
- Correct robots directives.
- Open Graph metadata where useful.
- Accurate page language and other relevant metadata.

## Headings

- One primary H1 per page.
- Logical H2/H3 hierarchy.
- Descriptive headings.
- No keyword stuffing.
- No duplicate sections created solely for SEO.

## Internal Linking

Connect related content through useful, descriptive links.

Examples:

- Homepage → Catalog.
- Category → Product.
- Homepage → Healthcare Professional Services.
- Homepage → Wholesale Supply.
- Homepage → Hospital Procurement.
- Homepage → PCSO and DSWD Guidance.
- Trust Cards → Verified Company Evidence.
- Articles → Relevant Educational/Service Pages.

Avoid broken links and generic repeated anchors such as "Click Here."

## Medical Content

- Use accurate medical terminology.
- Distinguish general information from medical advice.
- Verify prescription requirements.
- Do not imply treatments are suitable for every patient.
- Avoid unverified product claims.
- Apply appropriate clinical/pharmaceutical review.

## Technical SEO

- Semantic HTML.
- Server-rendered or crawlable important content.
- Appropriate sitemaps.
- Crawlable navigation.
- Correct canonicalization.
- Avoid indexing private or low-value pages.
- Optimize images and Core Web Vitals.
- Ensure mobile usability.
- Check structured data eligibility before implementing.

Do not publicly index:

- Patient records.
- Uploaded prescriptions.
- Uploaded procurement documents.
- Order-specific tracking pages.
- Private inquiry records.
- Sensitive customer information.

---

# AEO — ANSWER ENGINE OPTIMIZATION

Make public pages useful to both traditional search and AI-assisted discovery.

## Content Principles

- Answer common questions directly.
- Use accurate, concise explanations.
- Maintain structured content.
- Provide trustworthy company details.
- Make page purpose clear.
- Use descriptive headings.
- Include relevant supporting evidence.
- Maintain current official requirements and policies.

## Trust Signals

Provide verifiable information about:

- Company identity.
- Applicable FDA licenses.
- UNGC participation.
- Pharmaceutical capabilities.
- Contact information.
- Prescription procedures.
- Customer ordering processes.

## Patient Assistance Content

PCSO and DSWD pages should clearly distinguish:

- What Getmeds can help with.
- What the government agency handles.
- What documents may be needed.
- How customers request quotations.
- How customers track Getmeds requests.
- Where to access official program information.

Do not imply that Getmeds independently awards financial assistance.

---

# RESPONSIVE DESIGN RULES

## Desktop

- Clear navigation.
- Generous content spacing.
- Readable section widths.
- Organized card grids.
- Prominent primary CTAs.

## Tablet

- Adapt card columns.
- Avoid crowded navigation.
- Maintain accessible form widths.

## Mobile

- Clear collapsed navigation.
- Visible search and tracking access.
- Single-column forms.
- Comfortable touch targets.
- Predictable fixed or sticky controls only where they improve usability.
- Minimal typing.
- Easy document upload.
- Clear progress indicators.

Avoid horizontal overflow and hidden critical actions.

---

# LOW-FIDELITY DESIGN REQUIREMENTS

Start with a functional, simple low-fidelity website.

Use:

- Neutral containers.
- Clear borders.
- Consistent spacing.
- Simple outline icons.
- Basic image placeholders.
- Accessible typography.
- Clear forms.
- Minimal effects.

Prioritize:

1. Information architecture.
2. Customer journeys.
3. Functional navigation.
4. Form validation.
5. Document upload.
6. Tracking and request handling.
7. Accessibility.
8. SEO/AEO foundations.
9. Performance.

High-fidelity visual changes should be handled by the designated frontend/UI/UX owner.

Do not introduce elaborate gradients, excessive animations, decorative effects, or complex interactions by default.

---

# HOMEPAGE FINAL CONTENT ORDER

1. Hero
2. Find Your Medicine
3. Explore Medicine Categories
4. Popular Medicines
5. Who We Serve
6. Smart Medicine Requests & Ordering
7. Patient Assistance Programs
8. Why Choose Getmeds
9. Health Resources & Articles
10. Frequently Asked Questions
11. Contact & Customer Support

**Outside the numbered sections:**

- Shared Header / Navigation — above Section 01.
- Shared Footer — below Section 11.

Do not introduce additional homepage sections without a clear new user purpose.

---

# FINAL IMPLEMENTATION REQUIREMENTS

The website must:

- Prioritize customer needs.
- Support all four main customer groups.
- Allow guest ordering and requests.
- Minimize manual form entry.
- Support document-first submissions.
- Use relevant conditional fields.
- Preserve submission progress.
- Provide secure request tracking.
- Route requests to appropriate departments.
- Support PCSO and DSWD assistance inquiries.
- Display verifiable company credentials.
- Maintain accurate pharmaceutical information.
- Use accessible responsive components.
- Apply the five UX laws.
- Follow technical SEO and AEO best practices.
- Protect sensitive health and business information.

## Items Requiring Verification Before Production

- Actual FDA licensing details.
- Current UNGC participation description.
- Final internal URLs.
- Product classifications and catalog data.
- Product availability and pricing.
- Medicine promotion eligibility.
- Delivery coverage and conditions.
- Supported customer communication channels.
- PCSO and DSWD official requirements.
- Guarantee Letter coordination arrangements.
- Actual published health articles.
- Contact and company information.
- Upload file limits and security configuration.
- Backend integrations and approval workflows.

## Acceptance Criteria

A visitor should be able to understand Getmeds' offering immediately, find the correct customer journey, provide medicine or procurement requirements with minimal effort, receive a meaningful request reference, and securely track progress.

A patient should not have to complete lengthy manual forms when an existing prescription or document can provide the required information.

A doctor, distributor, or hospital should not be forced through an irrelevant consumer checkout.

The website should remain straightforward, trustworthy, medically responsible, SEO-friendly, and maintainable.

---

# PROJECT STATUS

**Homepage structure:** Approved — 11 sections.

**Shared header/navigation direction:** Approved.

**Audience-specific ordering workflows:** Approved design direction.

**PCSO and DSWD upload-first assistance:** Approved design direction.

**Evidence-based trust cards:** Approved.

**Health articles and FAQs:** Approved layout/content direction.

**Contact and support section:** Approved.

**Footer:** Placement approved; detailed content pending final verification/review.

**Production implementation:** Subject to integration, content verification, compliance checks, functional testing, and final visual design approval.

This specification defines the approved website direction. It does not imply that all routes, forms, document extraction, notifications, tracking, or integrations are already implemented.

---

# IMPLEMENTATION STATUS — LOW-FIDELITY PROTOTYPE (2026-11-13)

Homepage implemented in `src/app/page.tsx`. Header in `src/components/layout/Header.tsx`, footer in `src/components/layout/Footer.tsx`.

| Section | Implemented as | Route(s) linked | Notes |
|---|---|---|---|
| Header / navigation | 7 items, 5 accessible dropdowns; utilities: Search, Track Order, Cart | All mapped to real routes | Esc closes the open dropdown only; links stay crawlable in HTML. Account removed from header. |
| SEO foundation | Title "Getmeds Philippines \| Buy Medicines Online & Healthcare Supply"; one H1; brand headline as text | `/` canonical | Organization + Pharmacy + FAQPage JSON-LD. |
| 01 Hero | H1, brand headline, description, Shop Medicines / Upload Prescription | `/product-range`, `/order-medicines/patients?mode=upload` | Image placeholder after text on mobile. No availability or delivery guarantees. |
| 02 Find Your Medicine | Combobox with instant suggestions (↑/↓/Enter/Esc) | Suggestion → product page; submit → `/search?q=` (noindex) | No example medicine shown; empty and no-result states; "Request assistance" → manual request form. |
| 03 Categories | Oncology, Hematology, Cardiology, Diabetes, Nephrology + More Categories | Live category URLs; `/therapeutic-categories` | Only real catalog categories. |
| 04 Popular Medicines | **Fallback "Explore Our Medicines"** | Product pages | No verified purchase data yet. Flip `POPULARITY_VERIFIED` once Sales data exists. Products are the live homepage's featured items. No mock prices on the homepage. |
| 05 Who We Serve | 2×2 cards, image placeholders | `/product-range`, `/order-medicines/doctors`, `/distributors`, `/hospitals` | |
| 06 Smart Requests | ARIA tab switcher (Patient default) | Patient → `/order-medicines/patients?mode=upload\|manual`; others → their routes | Patient route is now the 3-step upload-or-manual request form, with draft persistence. |
| 07 Patient Assistance | PCSO + DSWD cards | `/patient-assistance-program/pcso`, `/dswd`; shared form `/patient-assistance-program/request` | Upload-first 3-step form. "Not an official application" acknowledgement. Missing documents can be uploaded from tracking. |
| 08 Why Choose Getmeds | 4 evidence-linked trust cards | `/regulatory-information` (Licenses & Regulatory Compliance), `/ungc`, `/services`, `/about-us` | Unverified stats removed from the homepage. |
| 09 Health Articles | 3 real published articles (titles and dates from the live site) | `/blog/<live slug>`, `/blog` | Article bodies to be migrated. Author / pharmacist reviewer missing on the live pages. |
| 10 FAQs | 5 approved Q&As, first open | `/faqs` | Same five appear first on `/faqs`. |
| 11 Contact & Support | 2 cards | `/contact-us`, `/track-order` | |
| Footer | Spec groups + dynamic year | All real routes | Messenger link not supplied. |

**Prototype limits (not production):** records live in browser localStorage. Tracking uses the reference number only — the spec's secure unguessable tracking link, identity verification, notifications, server-side upload scanning, and document extraction are **not implemented**. Doctor, distributor, and hospital routes still use the earlier landing page + form flows, not yet the spec's single 3-step dedicated forms.

**Still requires verification before production:** FDA/PDEA license numbers and validity, UNGC wording, PCSO/DSWD official requirements (the guidance pages cite Getmeds' own guides and link to pcso.gov.ph / dswd.gov.ph), delivery coverage (FAQ 5), Messenger/Viber channels, article reviewers, and Rx/OTC classifications in the mock catalog.

---

# UPDATE — NOVARTIS BENCHMARK & LIVE SEO KEYWORDS (2026-11-13)

**Benchmark (patterns only, nothing copied):** Novartis (`novartis.com`, `novartis.com/ph-en/`) for visual hierarchy and credibility. Applied at low fidelity: full-width alternating bands with generous whitespace; a consistent section header (eyebrow → H2 → one-line intro → "View all" text link); whole-card links with descriptive CTA text; a dated metadata line on article cards; trust signals directly under the hero; a stronger type scale. No Novartis branding, imagery, copy, or layouts are reproduced. Getmeds' logo, colors, and typography remain placeholders for the UI/UX owner.

**SEO — live getmeds.ph keywords now take precedence over the earlier approved homepage SEO text:**

| Element | Earlier approved | Now (live getmeds.ph) |
|---|---|---|
| `<title>` | Getmeds Philippines \| Buy Medicines Online & Healthcare Supply | Getmeds \| Global Pharmaceutical Company |
| Meta description | (new copy) | Getmeds is an FDA-licensed pharmaceutical importer, wholesale distributor, supplier, and retail pharmacy in the Philippines. Order medicines online. |
| H1 | Buy Medicines Online in the Philippines | Life-Saving Medicines for Patients, Doctors, Pharmacies & Hospitals in the Philippines |
| Brand line | Life-Saving Medicines. Compassionate Care. | Your Compassionate Health Ally (avoids repeating the H1) |
| Section 03 H2 | Explore Medicines by Category | Therapeutic Areas We Serve Across the Philippines |
| Section 04 H2 | Explore Our Medicines | Featured Products (still no popularity claim) |
| Section 08 H2 | Trusted Pharmaceutical Care. Responsible Healthcare. | Why Doctors, Hospitals and Pharmacies Choose Getmeds (old H2 kept as eyebrow) |
| Trust card titles | FDA-Licensed Pharmaceutical Provider / UN Global Compact | FDA Philippines Licensed / UN Global Compact Member |
| Homepage FAQs | 5 ordering FAQs | How do I order medicines from Getmeds? · Do I need a prescription to order? · Is Getmeds registered with FDA Philippines? · Is Getmeds legit? · How long does delivery take? |

The approved "family member" and "tracking" FAQs moved to `/faqs` (no duplicates in FAQPage data). Hero copy carries the live keywords "FDA-licensed pharmaceutical importer, wholesale distributor, supplier, and retail pharmacy" and "Luzon, Visayas, and Mindanao". The 11-section structure, CTAs, and all customer journeys are unchanged. JSON-LD now mirrors the live site: WebSite + Pharmacy + Organization + FAQPage.

**For SEO-owner review:** the live title "Global Pharmaceutical Company" contains no transactional phrase such as "order medicines online". It is kept verbatim to protect current rankings; consider a tested change later. "UN Global Compact Member" is the live site's wording — verify it against the UNGC participant listing.

---

# UPDATE — UN GLOBAL COMPACT & SDG SHOWCASE (2026-11-13)

Added at the business owner's request to show Getmeds' active UNGC participation and SDG accomplishments.

**Homepage — Section 08A "Caring for Our Patients, People, and Planet"** (the live getmeds.ph H2), directly after Section 08:
- 4 highlight tiles: 2nd pharmaceutical company in the Philippines to join the UNGC · SDG Ambition Accelerator Cohort 1 completed (16 June 2026) · SDG Champion (Director) · 4 SDG actions.
- SDG action cards with SDG tags: Solar-Powered Cold-Chain Storage (SDG 7, 13) · Honeycomb Paper Packaging (SDG 12) · Electric Vehicles for Dispatch (SDG 11, 13) · Tree Planting with Haribon Foundation (SDG 13, 15).
- Dated activity timeline: 16 Jun 2026 SDG Ambition graduation · 10 Feb 2026 ethical business pledge · 24 Sep 2025 UNGC Network Philippines event.
- Links: `/ungc` and the announcement article `/blog/getmeds-un-global-compact-sdg-ambition`.

**`/ungc` page rebuilt:** live title and H1 kept. Sections: highlights, What is UNGC, SDG actions, SDG Ambition milestone with team and commitments, recent activity, the Ten Principles. Organization schema now includes `memberOf` United Nations Global Compact.

**Sources (only):** getmeds.ph/ungc, the getmeds.ph homepage, and the blog post "Getmeds Completes UN Global Compact SDG Ambition Programme" (8 July 2026). Content lives in `src/data/ungc.ts`.

**To verify before production:**
- Director's name and title differ between sources: "CEO Naresh Bishnoi" (/ungc captions) vs "Mr. Naresh Kumar Bishnoi: Director, SDG Champion" (blog).
- The live /ungc numbering starts at "SDG Action 02" (there is no Action 01).
- "UN Global Compact Member" and "2nd pharmaceutical company in the Philippines to join" should be checked against the UNGC participant listing.
- No quantified impact figures (e.g. kWh, plastic avoided, trees planted) are published. Add them only when Getmeds provides verified numbers — they would make "we are active" much stronger.
- Real event and SDG photos are needed (placeholders now).
