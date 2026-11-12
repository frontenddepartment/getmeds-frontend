/*
 * Copy and structure for the catalogue hub pages from the website prototype: /product-range,
 * /prescription-medicines and /cancer-medicines. Plain data, so FaqSchema (a client component)
 * can import it; product counts and links are worked out from the live catalogue in
 * components/CatalogueHub.tsx. `a` in the FAQ lists is HTML, as in lib/data.ts.
 */

import { SITE_URL } from "./site";

export type HubFaq = { q: string; a: string };

export interface CategoryCardDef {
  name: string;
  text: string;
  /** Category Folders counted for this card; the first is where it links. Empty = hospitals only. */
  folders: string[];
  /** The area of the /product-range list this card opens; without one the card links to its first folder. */
  listCategory?: string;
}

/* Prototype order. Respiratory / Allergy isn't in the prototype but has live products in the sheet. */
export const prescriptionCategories: CategoryCardDef[] = [
  { name: "Oncology", text: "Cancer medicines and chemotherapy drugs", folders: ["cancer-medicines"] },
  { name: "Oncology / Hematology", text: "Medicines for leukemia, lymphoma and multiple myeloma", folders: ["blood-disorder-medicines"], listCategory: "hematology" },
  { name: "Hematology / Obstetrics and Gynecology", text: "Folic acid, iron and epoetin for anemia", folders: ["anemia-medicines"], listCategory: "hematology-ob-gyn" },
  { name: "Anesthesiology", text: "Anesthetic and perioperative medicines, supplied to hospitals only.", folders: [] },
  { name: "Anti-Infectives", text: "Injectable antibiotics for serious bacterial infections", folders: ["antibiotics"], listCategory: "anti-infectives" },
  { name: "Endocrinology: Diabetes", text: "Medicines for type 2 diabetes", folders: ["diabetes-medicines"], listCategory: "endocrinology" },
  { name: "Endocrinology: Hormonal Therapy", text: "Medicines for hormone conditions", folders: ["hormonal-therapy"], listCategory: "endocrinology" },
  { name: "Cardiology", text: "Medicines for hypertension, angina and arrhythmia", folders: ["heart-medicines"], listCategory: "cardiology" },
  { name: "Bone Health", text: "Medicines for bone metastases", folders: ["bone-health-medicines"], listCategory: "orthopedic" },
  { name: "Neuro-Oncology", text: "Medicines for brain cancer", folders: ["brain-cancer-medicines"], listCategory: "neuro-oncology" },
  { name: "Nephrology / Renal", text: "Medicines for chronic kidney disease", folders: ["kidney-medicines"], listCategory: "nephrology" },
  { name: "Pain Management", text: "Medicines for moderate to severe pain", folders: ["pain-management"], listCategory: "pain-management" },
  { name: "Rheumatology", text: "Medicines for inflammation and arthritis", folders: ["anti-inflammatory-medicines"], listCategory: "rheumatology" },
  { name: "Radiology", text: "Contrast agents for CT and X-ray imaging", folders: ["contrast-media"], listCategory: "radiology" },
  { name: "Respiratory / Allergy", text: "Medicines for seasonal allergies and allergic rhinitis", folders: ["allergy-medicines"], listCategory: "respiratory-allergy" },
];

/*
 * The non-prescription ranges. The sheet has no products for these yet, so each URL is a
 * noindexed inquiry page (see [category]/page.tsx) rather than a listing.
 */
export const otherRanges = [
  {
    slug: "over-the-counter-medicines",
    title: "Over-the-Counter Medicines",
    text: "Allergy medicines, iron supplements and everyday medicines.",
    note: "No prescription needed.",
  },
  {
    slug: "food-supplements",
    title: "Food Supplements",
    text: "Vitamins, probiotics, herbal teas and food supplements for daily wellness.",
    note: "No Approved Therapeutic Claims.",
  },
  {
    slug: "medical-devices",
    title: "Medical Devices",
    text: "Medical devices and supplies for hospitals, clinics and healthcare professionals.",
  },
];

/* Awareness ribbons in public/images/ribbons; each image carries its own name. */
export const cancerRibbons = [
  { file: "breast", label: "Breast" },
  { file: "lung", label: "Lung" },
  { file: "colorectal", label: "Colorectal" },
  { file: "prostate", label: "Prostate" },
  { file: "leukemia", label: "Leukemia" },
  { file: "cervical", label: "Cervical" },
  { file: "liver", label: "Liver" },
  { file: "ovarian", label: "Ovarian" },
  { file: "pancreatic", label: "Pancreatic" },
  { file: "lymphoma", label: "Lymphoma" },
  { file: "stomach", label: "Stomach" },
  { file: "thyroid", label: "Thyroid" },
  { file: "brain", label: "Brain" },
  { file: "head-neck", label: "Head and neck" },
  { file: "multiple-myeloma", label: "Multiple myeloma" },
  { file: "skin", label: "Skin" },
  { file: "melanoma", label: "Melanoma" },
  { file: "testicular", label: "Testicular" },
  { file: "uterine", label: "Uterine" },
  { file: "childhood", label: "Childhood" },
];

/* Conditions are linked only while their page exists; `slug` is checked against the catalogue. */
export interface ConditionChip {
  label: string;
  slug?: string;
  href?: string;
}

export const productRangeConditions: ConditionChip[] = [
  { label: "Breast cancer", slug: "breast-cancer" },
  { label: "Lung cancer", slug: "non-small-cell-lung-cancer" },
  { label: "Leukemia", href: "/product-range?category=hematology" },
  { label: "Type 2 diabetes", slug: "type-2-diabetes-mellitus" },
];

export const prescriptionConditions: ConditionChip[] = [
  { label: "Breast cancer", slug: "breast-cancer" },
  { label: "Leukemia", href: "/product-range?category=hematology" },
  { label: "Type 2 diabetes", slug: "type-2-diabetes-mellitus" },
  { label: "Hypertension", slug: "hypertension-angina" },
];

export const cancerTypes: ConditionChip[] = [
  { label: "Breast cancer", slug: "breast-cancer" },
  { label: "Lung cancer", slug: "non-small-cell-lung-cancer" },
  { label: "Ovarian cancer", slug: "ovarian-cancer" },
  { label: "Colorectal cancer", slug: "colorectal-cancer" },
  { label: "Prostate cancer", slug: "prostate-cancer" },
  { label: "Gastric cancer", slug: "gastric-cancer-gastric-adenocarcinoma" },
  { label: "Head and neck cancer", slug: "head-and-neck-cancer" },
];

/*
 * The prototype's "What is…, Signs and symptoms, How it is diagnosed, How it is treated" card,
 * keyed by condition slug. Pharmacist-reviewed text only: a condition with no entry shows no card.
 */
export const conditionContent: Record<string, Array<{ title: string; text: string }>> = {};

/* Only generics with a live product are shown, so a group with none drops off the page. */
export const cancerMedicineTypes = [
  {
    title: "Chemotherapy injections and infusions",
    text: "Injection and infusion vials used in hospital and clinic chemotherapy.",
    generics: ["Paclitaxel", "Docetaxel", "Gemcitabine", "Carboplatin", "Cisplatin", "Oxaliplatin", "Fluorouracil", "Cyclophosphamide", "Methotrexate", "Pemetrexed", "Irinotecan", "Topotecan", "Bleomycin", "Doxorubicin", "Epirubicin"],
  },
  { title: "Oral chemotherapy", text: "Chemotherapy tablets taken by mouth.", generics: ["Capecitabine"] },
  { title: "Hormone therapy", text: "Medicines for hormone-sensitive breast and prostate cancers.", generics: ["Letrozole", "Anastrozole", "Abiraterone", "Enzalutamide"] },
  { title: "Targeted therapy", text: "Tablets that act on specific cancer cell pathways.", generics: ["Lapatinib", "Pazopanib", "Sorafenib"] },
  { title: "Supportive care", text: "Medicines used alongside chemotherapy.", generics: ["Ondansetron", "Mesna"] },
];

/* Conditions A–Z, in the prototype's order and wording. `s` is the condition slug: the name links once a page exists for it. */
export const conditionsAZ: Array<{ name: string; items: Array<{ label: string; s?: string }> }> = [
  {
    name: "Oncology",
    items: [
      { label: "Bladder Cancer", s: "bladder-cancer" },
      { label: "Breast Cancer", s: "breast-cancer" },
      { label: "Cervical Cancer", s: "cervical-cancer" },
      { label: "Chemotherapy- & Radiation-Induced Nausea and Vomiting" },
      { label: "Chemotherapy-Induced Bladder Irritation (Hemorrhagic Cystitis)" },
      { label: "Colorectal Cancer", s: "colorectal-cancer" },
      { label: "Gastric Cancer", s: "gastric-cancer-gastric-adenocarcinoma" },
      { label: "Gastrointestinal Stromal Tumor (GIST)", s: "gastrointestinal-stromal-tumors" },
      { label: "Head and Neck Cancer", s: "head-and-neck-cancer" },
      { label: "Hepatocellular Carcinoma", s: "hepatocellular-carcinoma" },
      { label: "Malignant Pleural Effusion", s: "malignant-pleural-effusion" },
      { label: "Malignant Pleural Mesothelioma", s: "malignant-pleural-mesothelioma" },
      { label: "Non-Small Cell Lung Cancer", s: "non-small-cell-lung-cancer" },
      { label: "Ovarian Cancer", s: "ovarian-cancer" },
      { label: "Pancreatic Cancer", s: "pancreatic-cancer" },
      { label: "Prostate Cancer", s: "prostate-cancer" },
      { label: "Renal Cell Carcinoma", s: "renal-cell-carcinoma" },
      { label: "Small Cell Lung Cancer", s: "small-cell-lung-cancer" },
      { label: "Soft Tissue Sarcoma", s: "soft-tissue-sarcoma" },
      { label: "Testicular Cancer", s: "testicular-cancer" },
      { label: "Thyroid Cancer", s: "thyroid-cancer" },
    ],
  },
  {
    name: "Oncology / Hematology",
    items: [
      { label: "Acute Lymphoblastic Leukemia", s: "acute-lymphoblastic-leukemia" },
      { label: "Acute Myeloid Leukemia", s: "acute-myeloid-leukemia" },
      { label: "Acute Promyelocytic Leukemia", s: "acute-promyelocytic-leukemia" },
      { label: "Chronic Lymphocytic Leukemia", s: "chronic-lymphocytic-leukemia" },
      { label: "Chronic Myeloid Leukemia", s: "chronic-myeloid-leukemia" },
      { label: "Lymphoma (Hodgkin & Non-Hodgkin)", s: "hodgkin-non-hodgkins-lymphoma" },
      { label: "Mantle Cell Lymphoma", s: "mantle-cell-lymphoma" },
      { label: "Meningeal Leukemia", s: "meningeal-leukemia" },
      { label: "Multiple Myeloma", s: "multiple-myeloma" },
      { label: "Sickle Cell Anemia", s: "sickle-cell-anemia" },
    ],
  },
  { name: "Neuro-Oncology", items: [{ label: "Glioblastoma Multiforme", s: "glioblastoma-multiforme" }] },
  { name: "Bone Health", items: [{ label: "Bone Metastases & Hypercalcemia of Malignancy" }] },
  {
    name: "Hematology / Obstetrics and Gynecology",
    items: [
      { label: "Anemia of Chronic Kidney Disease" },
      { label: "Chemotherapy-Induced Anemia" },
      { label: "Folate Deficiency Anemia", s: "folate-deficiency-anemia" },
    ],
  },
  {
    name: "Anti-Infectives",
    items: [
      { label: "Anaerobic Infections" },
      { label: "Bloodstream infections", s: "bloodstream-infections" },
      { label: "Bone and Joint Infections", s: "bone-and-joint-infections" },
      { label: "Febrile Neutropenia" },
      { label: "Gynecological infections", s: "gynecological-infections" },
      { label: "Intra-abdominal infections", s: "intra-abdominal-infections" },
      { label: "Meningitis" },
      { label: "Ocular or topical infections", s: "ocular-or-topical-infections" },
      { label: "Respiratory Infections", s: "respiratory-infections" },
      { label: "Skin and Soft Tissue Infections", s: "skin-and-soft-tissue-infections" },
      { label: "Urinary Tract Infections", s: "urinary-tract-infections" },
    ],
  },
  {
    name: "Endocrinology",
    items: [
      { label: "Benign Prostatic Hyperplasia", s: "benign-prostatic-hyperplasia" },
      { label: "Endometriosis", s: "endometriosis" },
      { label: "Fibrocystic Breast Disease", s: "fibrocystic-breast-disease" },
      { label: "Type 2 Diabetes", s: "type-2-diabetes-mellitus" },
    ],
  },
  {
    name: "Cardiology",
    items: [
      { label: "Arrhythmia", s: "arrhythmia-management" },
      { label: "Hypertension & Angina", s: "hypertension-angina" },
    ],
  },
  { name: "Nephrology / Renal", items: [{ label: "Chronic Kidney Disease", s: "chronic-kidney-disease" }] },
  { name: "Pain Management", items: [{ label: "Chronic Pain", s: "chronic-pain-management" }] },
  {
    name: "Rheumatology",
    items: [
      { label: "Arthritis (Osteoarthritis, Rheumatoid, Gout)" },
      { label: "Inflammatory & Rheumatic Disorders", s: "inflammatory-and-rheumatic-disorders" },
    ],
  },
  { name: "Respiratory / Allergy", items: [{ label: "Seasonal Allergic Rhinitis", s: "seasonal-allergies-allergic-rhinitis" }] },
  { name: "Over-the-Counter", items: [{ label: "Iron Deficiency Anemia", s: "iron-deficiency-anemia" }] },
];

/* The navbar's Product range dropdown: category (bold) with its conditions underneath. */
export const productMenu = [
  {
    name: "Oncology",
    href: "/cancer-medicines",
    conditions: [
      { label: "Breast cancer", href: "/conditions/breast-cancer" },
      { label: "Ovarian cancer", href: "/conditions/ovarian-cancer" },
      { label: "Non-small cell lung cancer", href: "/conditions/non-small-cell-lung-cancer" },
      { label: "Colorectal cancer", href: "/conditions/colorectal-cancer" },
      { label: "Prostate cancer", href: "/conditions/prostate-cancer" },
    ],
  },
  {
    name: "Oncology / Hematology",
    href: "/product-range?category=hematology",
    conditions: [
      { label: "Acute myeloid leukemia", href: "/conditions/acute-myeloid-leukemia" },
      { label: "Chronic myeloid leukemia", href: "/conditions/chronic-myeloid-leukemia" },
      { label: "Lymphoma", href: "/conditions/hodgkin-non-hodgkins-lymphoma" },
      { label: "Multiple myeloma", href: "/conditions/multiple-myeloma" },
    ],
  },
  {
    name: "Anti-Infectives",
    href: "/product-range?category=anti-infectives",
    conditions: [
      { label: "Respiratory infections", href: "/conditions/respiratory-infections" },
      { label: "Skin and soft tissue infections", href: "/conditions/skin-and-soft-tissue-infections" },
      { label: "Intra-abdominal infections", href: "/conditions/intra-abdominal-infections" },
    ],
  },
  { name: "Endocrinology", href: "/product-range?category=endocrinology", conditions: [{ label: "Type 2 diabetes", href: "/conditions/type-2-diabetes-mellitus" }] },
  {
    name: "Cardiology",
    href: "/product-range?category=cardiology",
    conditions: [
      { label: "Hypertension and angina", href: "/conditions/hypertension-angina" },
      { label: "Arrhythmia", href: "/conditions/arrhythmia-management" },
    ],
  },
  { name: "Nephrology / Renal", href: "/product-range?category=nephrology", conditions: [{ label: "Chronic kidney disease", href: "/conditions/chronic-kidney-disease" }] },
];

export const productRangeFaqs: HubFaq[] = [
  { q: "Do I need a prescription to view your product range?", a: "<p>No. Anyone can browse the catalogue. A valid prescription is needed only when patients order prescription medicines.</p>" },
  { q: "What types of prescription medicines does Getmeds supply?", a: "<p>Getmeds supplies prescription medicines for conditions such as cancer, blood disorders, infections, diabetes, heart and kidney conditions, available to patients with a valid prescription and to doctors, pharmacies and hospitals across Luzon, Visayas and Mindanao. Browse by category or by condition to find a specific medicine.</p>" },
  { q: "Where can I find cancer and chemotherapy medicines in the Philippines?", a: '<p>Getmeds supplies cancer medicines and chemotherapy drugs for breast, lung, ovarian, colorectal and other cancers. See our <a href="/cancer-medicines">Cancer medicines</a> and send an inquiry for availability and an official price quote.</p>' },
  { q: "Where can I find hematology medicines in the Philippines?", a: '<p>Getmeds supplies medicines for blood disorders such as leukemia, lymphoma and multiple myeloma. See our <a href="/blood-disorder-medicines">Hematology medicines</a> and send an inquiry for availability and an official price quote.</p>' },
  { q: "How do I check the price and availability of a medicine?", a: "<p>Open the product page and send an inquiry. Our team will confirm availability and send you an official price quote.</p>" },
  { q: "What if I can’t find the medicine I need?", a: "<p>Send us an inquiry with the medicine name and strength, and our team will confirm whether it is available in the Getmeds portfolio.</p>" },
  { q: "Are Getmeds medicines genuine and registered with the FDA Philippines?", a: "<p>Yes. Getmeds medicines carry a Certificate of Product Registration from the FDA Philippines, and every prescription order is reviewed by a licensed Getmeds pharmacist before dispatch. Product documents are available on request.</p>" },
];

export const prescriptionFaqs: HubFaq[] = [
  { q: "Can I buy prescription medicines without a prescription?", a: '<p>No. Patients need a valid prescription to order prescription medicines from Getmeds. For medicines that do not need a prescription, see our <a href="/over-the-counter-medicines">Over-the-counter medicines</a>.</p>' },
  { q: "Who checks my prescription?", a: '<p>A licensed Getmeds pharmacist reviews every prescription before your order is dispatched. See how to order on our <a href="/order-medicines/patients">Patients &amp; Families</a> page.</p>' },
  { q: "Can doctors and hospitals order without uploading a prescription?", a: '<p>Yes. Doctors, hospitals, clinics and pharmacies order through a partner account verified with their PRC license or FDA License to Operate. See our <a href="/order-medicines/doctors">Doctors</a> and <a href="/order-medicines/hospitals">Hospitals &amp; Institutions</a> pages.</p>' },
];

export const oncologyFaqs: HubFaq[] = [
  { q: "How much do cancer medicines and chemotherapy drugs cost in the Philippines?", a: "<p>Prices vary by generic name, dosage, and quantity. Contact us for a price quote on a specific cancer medicine or chemotherapy drug.</p>" },
  { q: "How much does chemotherapy cost per session?", a: "<p>Chemotherapy costs depend on the specific drugs, dosage, and number of cycles prescribed by your doctor — not a fixed per-session rate. Send us your prescription for an official price quotation your doctor or hospital can use to estimate your treatment cost per session.</p>" },
  { q: "Who can order cancer medicines from Getmeds?", a: "<p>Patients, doctors, hospitals, pharmacies, and distributors can all order cancer medicines from Getmeds. Patients need a valid prescription, while doctors, hospitals, pharmacies and distributors can order through a verified partner account.</p>" },
  { q: "Do I need a prescription to order cancer medicines?", a: "<p>Patients need a valid prescription from a licensed doctor to order cancer medicines or chemotherapy drugs. Doctors, hospitals, pharmacies and distributors can order through a verified partner account instead.</p>" },
  { q: "How do I get a price quote for a specific cancer medicine?", a: "<p>Send your prescription and contact details to Getmeds, and our team will prepare an official price quotation for your specific cancer medicine or chemotherapy drug.</p>" },
  { q: "Can I get PCSO or DSWD assistance for chemotherapy medicines?", a: '<p>Yes. Getmeds’ Patient Assistance Program helps eligible patients access PCSO Medical Assistance and DSWD AICS medical assistance for chemotherapy and cancer treatment. <a href="/patient-assistance-program">Learn more →</a></p>' },
  { q: "Does Getmeds deliver cancer medicines nationwide?", a: "<p>Yes. Getmeds delivers cancer medicines and chemotherapy drugs nationwide across the Philippines.</p>" },
];

const faqPageSchema = (items: HubFaq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({
    "@type": "Question",
    name: f.q,
    // Same text as the visible answer; links made absolute (https://getmeds.ph/...) for search engines.
    acceptedAnswer: { "@type": "Answer", text: f.a.replace(/href="\//g, `href="${SITE_URL}/`) },
  })),
});

export const productRangeFaqSchema = faqPageSchema(productRangeFaqs);
export const prescriptionFaqSchema = faqPageSchema(prescriptionFaqs);
export const oncologyFaqSchema = faqPageSchema(oncologyFaqs);
