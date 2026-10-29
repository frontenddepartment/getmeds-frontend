/* Content extracted from getmeds.ph — single source of truth for the revamp. */

export const stats = [
  { value: 2000, suffix: "+", label: "Medicines in portfolio" },
  { value: 10000, suffix: "+", label: "Pharmacies nationwide" },
  { value: 500, suffix: "+", label: "Hospitals served" },
  { value: 2, suffix: "M+", label: "Filipino lives touched" },
];

export const therapeuticAreas = [
  {
    slug: "oncology",
    name: "Oncology (Solid Tumors)",
    icon: "Ribbon",
    conditions: [
      "Breast Cancer", "Ovarian Cancer", "Non-Small Cell Lung Cancer", "Prostate Cancer",
      "Colorectal Cancer", "Pancreatic Cancer", "Gastric Cancer", "Head and Neck Cancer",
      "Malignant Pleural Mesothelioma", "Malignant Pleural Effusion", "Gastrointestinal Stromal Tumors",
    ],
  },
  {
    slug: "hematology",
    name: "Oncology / Hematology",
    icon: "Droplets",
    conditions: [
      "Acute Myeloid Leukemia", "Chronic Myeloid Leukemia", "Acute Lymphocytic Leukemia",
      "Chronic Lymphocytic Leukemia", "Hodgkin / Non-Hodgkin's Lymphoma", "Mantle Cell Lymphoma",
      "Meningeal Leukemia", "Acute Promyelocytic Leukemia", "Sickle Cell Anemia",
    ],
  },
  {
    slug: "anti-infectives",
    name: "Anti-Infectives",
    icon: "ShieldPlus",
    conditions: ["Respiratory Infections", "Urinary Tract Infections", "Skin & Soft Tissue Infections", "Bone & Joint Infections"],
  },
  {
    slug: "endocrinology",
    name: "Endocrinology",
    icon: "Activity",
    conditions: ["Endometriosis", "Fibrocystic Breast Disease", "Diabetes"],
  },
  {
    slug: "orthopedic",
    name: "Orthopedic",
    icon: "Bone",
    conditions: ["Multiple Myeloma", "Osteoporosis"],
  },
  {
    slug: "cardiology",
    name: "Cardiology",
    icon: "HeartPulse",
    conditions: ["Arrhythmia Management", "Hypertension / Angina"],
  },
  {
    slug: "neuro-oncology",
    name: "Neuro-Oncology",
    icon: "Brain",
    conditions: ["Glioblastoma Multiforme"],
  },
  {
    slug: "respiratory",
    name: "Respiratory / Allergy",
    icon: "Wind",
    conditions: ["Seasonal Allergic Rhinitis"],
  },
  {
    slug: "nephrology",
    name: "Nephrology / Renal",
    icon: "FlaskConical",
    conditions: ["Chronic Kidney Disease"],
  },
  {
    slug: "pain",
    name: "Pain Management",
    icon: "Zap",
    conditions: ["Chronic Pain"],
  },
  {
    slug: "rheumatology",
    name: "Rheumatology",
    icon: "Dna",
    conditions: ["Inflammatory Disorders"],
  },
];

export type Product = {
  brand: string;
  generic: string;
  strength: string;
  form: string;
  category: string;
};

export const products: Product[] = [
  // Oncology
  { brand: "PacliGet", generic: "Paclitaxel", strength: "6 mg/mL (100 mg / 16.7 mL)", form: "Solution for IV Infusion", category: "Oncology" },
  { brand: "DoseGet-20", generic: "Docetaxel (as Trihydrate)", strength: "20 mg / 0.5 mL", form: "Concentrate for IV Infusion", category: "Oncology" },
  { brand: "DoseGet-80", generic: "Docetaxel (as Trihydrate)", strength: "40 mg/mL (80 mg / 2 mL)", form: "Concentrate for IV Infusion", category: "Oncology" },
  { brand: "DoseGet-120", generic: "Docetaxel (as Trihydrate)", strength: "120 mg / 3 mL", form: "Concentrate for IV Infusion", category: "Oncology" },
  { brand: "DoseGet RTU 20", generic: "Docetaxel RTU", strength: "20 mg", form: "Solution for Injection", category: "Oncology" },
  { brand: "DoseGet RTU 80", generic: "Docetaxel RTU", strength: "80 mg", form: "Solution for Injection", category: "Oncology" },
  { brand: "GemGet 200", generic: "Gemcitabine (as HCl)", strength: "200 mg", form: "Lyophilized Powder for Injection (IV)", category: "Oncology" },
  { brand: "GemGet", generic: "Gemcitabine (as HCl)", strength: "1 g", form: "Lyophilized Powder for Injection (IV)", category: "Oncology" },
  { brand: "CapeGet", generic: "Capecitabine", strength: "500 mg", form: "Film-Coated Tablet", category: "Oncology" },
  { brand: "LetroGet", generic: "Letrozole", strength: "2.5 mg", form: "Film-Coated Tablet", category: "Oncology" },
  { brand: "AnaGaling", generic: "Anastrozole", strength: "1 mg", form: "Film-Coated Tablet", category: "Oncology" },
  { brand: "SykloGet 500", generic: "Cyclophosphamide", strength: "500 mg", form: "Lyophilized Powder for Injection (IV)", category: "Oncology" },
  { brand: "SykloGet 1000", generic: "Cyclophosphamide", strength: "1 g", form: "Lyophilized Powder for Injection (IV)", category: "Oncology" },
  { brand: "MethoGet-500", generic: "Methotrexate", strength: "100 mg/mL (500 mg / 5 mL)", form: "Solution for Injection (IM/IV)", category: "Oncology" },
  { brand: "Lapanib", generic: "Lapatinib", strength: "250 mg", form: "Film-Coated Tablet", category: "Oncology" },
  { brand: "CarboGet", generic: "Carboplatin", strength: "150 mg", form: "Solution for IV Injection", category: "Oncology" },
  { brand: "PemiGet", generic: "Pemetrexed", strength: "500 mg", form: "Lyophilized Powder for IV Infusion", category: "Oncology" },
  { brand: "AbiraGet", generic: "Abiraterone Acetate", strength: "250 mg", form: "Tablet", category: "Oncology" },
  { brand: "OxaliGet-50", generic: "Oxaliplatin", strength: "2 mg/mL (50 mg / 25 mL)", form: "Solution for IV Infusion", category: "Oncology" },
  { brand: "OxaliGet", generic: "Oxaliplatin", strength: "2 mg/mL (100 mg / 50 mL)", form: "Solution for IV Infusion", category: "Oncology" },
  { brand: "FluoroGet-500", generic: "Fluorouracil", strength: "50 mg/mL (500 mg / 10 mL)", form: "Solution for IV Infusion", category: "Oncology" },
  { brand: "HydroxyGet", generic: "Hydroxyurea", strength: "500 mg", form: "Capsule", category: "Oncology" },
  { brand: "BleoGet", generic: "Bleomycin (as Sulfate)", strength: "15 units", form: "Lyophilized Powder (IM/IV/SC)", category: "Oncology" },
  { brand: "CisplaGet", generic: "Cisplatin", strength: "1 mg/mL (50 mg / 50 mL)", form: "Concentrate for IV Infusion", category: "Oncology" },
  { brand: "TopoGet", generic: "Topotecan (as HCl)", strength: "2.5 mg", form: "Injection", category: "Oncology" },
  { brand: "PazoGet-200", generic: "Pazopanib", strength: "200 mg", form: "Tablet", category: "Oncology" },
  { brand: "PazoGet-400", generic: "Pazopanib", strength: "400 mg", form: "Tablet", category: "Oncology" },
  { brand: "SoraGet", generic: "Sorafenib", strength: "200 mg", form: "Film-Coated Tablet", category: "Oncology" },
  { brand: "TemoGet", generic: "Temozolomide", strength: "100 mg", form: "Capsule", category: "Neuro-Oncology" },
  // Hematology
  { brand: "CytaGet", generic: "Cytarabine", strength: "100 mg/mL", form: "Solution for Injection (IV/SC)", category: "Hematology" },
  { brand: "IdaGet-5", generic: "Idarubicin HCl", strength: "5 mg", form: "Lyophilized Powder for Injection (IV)", category: "Hematology" },
  { brand: "Imonib-100", generic: "Imatinib (as Mesilate)", strength: "100 mg", form: "Film-Coated Tablet", category: "Hematology" },
  { brand: "VincriGet", generic: "Vincristine", strength: "1 mg/mL", form: "Solution for Injection (IV)", category: "Hematology" },
  { brand: "BendaGet", generic: "Bendamustine (as HCl)", strength: "100 mg", form: "Lyophilized Powder for IV Infusion", category: "Hematology" },
  { brand: "Bortemed", generic: "Bortezomib", strength: "3.5 mg", form: "Powder for Injection (IV)", category: "Hematology" },
  { brand: "FoliGet", generic: "Folic Acid", strength: "5 mg", form: "Tablet", category: "Hematology / OB-GYN" },
  { brand: "Irose", generic: "Ferrous Sulfate", strength: "200 mg", form: "Film-Coated Tablet", category: "Hematology / OB-GYN" },
  // Anti-Infectives
  { brand: "AmiGet", generic: "Amikacin (as Sulfate)", strength: "250 mg/mL (500 mg / 2 mL)", form: "Solution for Injection (IM/IV)", category: "Anti-Infectives" },
  { brand: "CefoxiGet", generic: "Cefoxitin (as Sodium)", strength: "1 g", form: "Powder for Injection (IM/IV)", category: "Anti-Infectives" },
  { brand: "CefazoGet", generic: "Cefazolin (as Sodium)", strength: "1 g", form: "Powder for Injection (IM/IV)", category: "Anti-Infectives" },
  { brand: "VancoGet 500", generic: "Vancomycin (as HCl)", strength: "500 mg", form: "Powder for Injection (IV)", category: "Anti-Infectives" },
  { brand: "VancoGet 1000", generic: "Vancomycin (as HCl)", strength: "1 g", form: "Powder for Injection (IV)", category: "Anti-Infectives" },
  { brand: "MyxiGet", generic: "Polymyxin B", strength: "500,000 units", form: "Lyophilized Powder for Injection", category: "Anti-Infectives" },
  // Endocrinology
  { brand: "DanaGet", generic: "Danazol", strength: "200 mg", form: "Capsule", category: "Endocrinology" },
  { brand: "Finaget-5", generic: "Finasteride", strength: "5 mg", form: "Film-Coated Tablet", category: "Endocrinology" },
  { brand: "Akuglip50", generic: "Sitagliptin", strength: "50 mg", form: "Film-Coated Tablet", category: "Endocrinology" },
  { brand: "Akuvilda M-1000", generic: "Vildagliptin + Metformin", strength: "50 mg / 1000 mg", form: "Tablet", category: "Endocrinology" },
  // Orthopedic
  { brand: "ZoloGet", generic: "Zoledronic Acid", strength: "4 mg", form: "Lyophilized Powder for IV Infusion", category: "Orthopedic" },
  // Cardiology
  { brand: "AmioGet", generic: "Amiodarone HCl", strength: "50 mg/mL", form: "Concentrate for IV Infusion", category: "Cardiology" },
  { brand: "AmloGet 5", generic: "Amlodipine (as Besilate)", strength: "5 mg", form: "Tablet", category: "Cardiology" },
  { brand: "AmloGet 10", generic: "Amlodipine (as Besilate)", strength: "10 mg", form: "Tablet", category: "Cardiology" },
  { brand: "LosaGet", generic: "Losartan Potassium", strength: "50 mg", form: "Tablet", category: "Cardiology" },
  // Radiology
  { brand: "IohexiGet", generic: "Iodine (as Iohexol)", strength: "350 mg/mL (100 mL)", form: "Solution for Injection", category: "Radiology" },
  { brand: "DexGet", generic: "Dexamethasone", strength: "4 mg/mL (8 mg / 2 mL)", form: "Solution for Injection", category: "Radiology" },
  // Pain / Renal / Allergy
  { brand: "Tradmin", generic: "Tramadol", strength: "50 mg", form: "Solution for Injection (IV/IM)", category: "Pain Management" },
  { brand: "SevelaMed", generic: "Sevelamer Carbonate", strength: "800 mg", form: "Tablet", category: "Nephrology" },
  { brand: "AlisLergy", generic: "Loratadine", strength: "10 mg", form: "Tablet", category: "Respiratory / Allergy" },
  { brand: "CetriGet", generic: "Cetirizine HCl", strength: "10 mg", form: "Tablet", category: "Respiratory / Allergy" },
];

export const productCategories = [
  "All",
  ...Array.from(new Set(products.map((p) => p.category))),
];

/* ---- Global Network ---- */
export type NetworkNode = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  role: string;
  tag: string;
  description: string;
  hub?: boolean;
};

export const networkNodes: NetworkNode[] = [
  {
    id: "ph", name: "Getmeds Philippines", country: "Philippines", lat: 14.45, lon: 120.98,
    role: "Headquarters", tag: "HQ · Pharma Launch", hub: true,
    description: "Redefining the Philippine healthcare landscape with high-quality, affordable medicines — and the first fully digital oncology care platform in the country.",
  },
  {
    id: "in", name: "Getmeds Healthcare (India)", country: "India", lat: 19.07, lon: 72.87,
    role: "Export Hub", tag: "Export Hub",
    description: "Expanding the international footprint as a trusted pharmaceutical exporter and supplier in India.",
  },
  {
    id: "sg", name: "Getmeds HealthTech Pte. Ltd.", country: "Singapore", lat: 1.35, lon: 103.82,
    role: "Global Hub", tag: "Global Hub",
    description: "Extending global reach and creating new opportunities for international expansion across Asia and beyond.",
  },
  {
    id: "pk", name: "Strategic Office — Pakistan", country: "Pakistan", lat: 24.86, lon: 67.0,
    role: "Strategic Office", tag: "Trusted Partnership",
    description: "An office with a trusted healthcare provider — supplying essential medicines and expanding healthcare access and industry networks.",
  },
  {
    id: "vn", name: "Vietnam", country: "Vietnam", lat: 21.03, lon: 105.85,
    role: "SE Asia", tag: "Market Presence",
    description: "Building market presence and expanding access to quality medicines across the country.",
  },
  {
    id: "kh", name: "Cambodia", country: "Cambodia", lat: 11.56, lon: 104.92,
    role: "SE Asia", tag: "Strategic Initiatives",
    description: "Driving strategic initiatives to advance healthcare services and strengthen regional collaboration.",
  },
  {
    id: "la", name: "Laos", country: "Laos", lat: 17.97, lon: 102.6,
    role: "SE Asia", tag: "Healthcare Programs",
    description: "Spearheading programs to enhance healthcare delivery and foster long-term partnerships.",
  },
  {
    id: "mm", name: "Myanmar", country: "Myanmar", lat: 16.87, lon: 96.2,
    role: "SE Asia", tag: "Pioneering Operations",
    description: "Pioneering operations to accelerate healthcare development and operational excellence.",
  },
  {
    id: "kn", name: "Saint Kitts and Nevis", country: "Saint Kitts & Nevis", lat: 17.36, lon: -62.78,
    role: "Caribbean Entry", tag: "Officially Registered",
    description: "Strengthening global presence and paving the way for further international growth in the Caribbean and beyond.",
  },
  {
    id: "vu", name: "Vanuatu", country: "Vanuatu", lat: -17.73, lon: 168.32,
    role: "Pacific Partnership", tag: "Government Collaboration",
    description: "The Pacific's first specialty cancer pharmacy — localized access to life-saving treatments for patients in Vanuatu, Fiji, and across the Pacific.",
  },
];

export const networkEras = [
  {
    period: "The Foundation",
    headline: "Innovation meets pharmaceutical care",
    items: [
      { tag: "Industry First", place: "Philippines", title: "Launch of the Getmeds Digital Platform", text: "Pioneered the Philippines' first fully digital oncology care platform — an innovative e-commerce platform and mobile app that brought specialty care closer to patients." },
      { tag: "Pharma Launch", place: "Philippines", title: "Getmeds Philippines Incorporated", text: "Redefining the Philippine healthcare landscape with high-quality, affordable generic medicines accessible to every Filipino." },
      { tag: "Export Hub", place: "India", title: "Getmeds Healthcare (India)", text: "Expanding the international footprint as a trusted pharmaceutical exporter and supplier in India." },
    ],
  },
  {
    period: "Regional Expansion",
    headline: "Strengthening reach across Asia-Pacific",
    items: [
      { tag: "Global Hub", place: "Singapore", title: "Getmeds HealthTech Pte. Ltd.", text: "Extending global reach and creating new opportunities for international expansion across Asia and beyond." },
      { tag: "Strategic Office", place: "Pakistan", title: "Trusted Partnership", text: "Opened an office with a trusted healthcare provider — supplying essential medicines and expanding healthcare access and industry networks." },
      { tag: "SE Asia", place: "Vietnam · Cambodia · Laos · Myanmar", title: "Southeast Asian Growth", text: "Building market presence, driving strategic initiatives, and pioneering operations to expand access to quality medicines across the region." },
    ],
  },
  {
    period: "A Global Vision",
    headline: "Reaching the Caribbean and the Pacific",
    items: [
      { tag: "Caribbean Entry", place: "Saint Kitts and Nevis", title: "Officially Registered", text: "Strengthening global presence and paving the way for further international growth in the Caribbean and beyond." },
      { tag: "Pacific Partnership", place: "Vanuatu", title: "Government Collaboration", text: "Collaborated with the government to enhance medical support, introduce cancer awareness initiatives, and bring life-saving healthcare solutions to the Pacific community." },
      { tag: "A Healthcare First", place: "Pacific Region", title: "First Specialty Cancer Pharmacy in the Pacific", text: "Opened the Pacific's first specialty pharmacy dedicated to cancer medicines — localized access to life-saving treatments for patients in Vanuatu, Fiji, and across the Pacific." },
    ],
  },
];

export const capabilities = [
  { icon: "Globe2", title: "Global Network of Pharma Manufacturers", text: "Strategic sourcing partnerships with 50+ manufacturers across India, China, Europe, and the US — all WHO, PIC/S, US FDA, EU MHRA, and UK MHRA recognized. Every partner facility meets international quality standards, ensuring the medicines Filipino doctors prescribe and patients receive are backed by globally verified manufacturing." },
  { icon: "BadgeCheck", title: "Regulatory & Compliance", text: "FDA Philippines, DOH, PDEA (S-4 and S-5), BOC, and EDPMS expertise across product registration, post-market compliance, and pharmacovigilance. Our regulatory team manages the full lifecycle — from Certificate of Product Registration application to license renewals — so partners can operate with confidence and speed." },
  { icon: "Snowflake", title: "Precision Supply Chain & Nationwide Distribution", text: "WHO GSDP-compliant cold-chain logistics with batch-level traceability and urgent-response delivery across Luzon, Visayas, and Mindanao. Built for the urgency of Filipino healthcare, with specialized handling for biologics, oncology therapies, and specialty molecules." },
  { icon: "Store", title: "Sales and Distribution", text: "10,000+ pharmacy accounts served through dedicated nationwide sales teams across Luzon, Visayas, and Mindanao. Long-term partnership approach with account-managed service, product training, and market development support." },
  { icon: "Landmark", title: "Government Bidding & Public Sector Access", text: "Proven tender experience supplying oncology, hematology, and anesthesia medicines to public hospitals nationwide. Dedicated bidding specialists handle full documentation, compliance protocols, and competitive quotation preparation." },
  { icon: "HandHeart", title: "Government Medical Assistance & Program Accreditation", text: "Accredited provider of chemotherapy and cancer medicines for DSWD, PCSO, and other national government medical assistance programs." },
  { icon: "FileCheck2", title: "Certificate of Listing of Identical Drug Product (CLIDP) Services", text: "End-to-end CLIDP application, certification, and ongoing compliance management for our portfolio." },
  { icon: "Plane", title: "International Operations & Pharmacy Footprint", text: "Cross-border operations and partner pharmacy networks across multiple regions, extending beyond Asia into global markets." },
  { icon: "MonitorSmartphone", title: "Digital & Smart Healthcare Solutions", text: "Patient adherence platforms, smart inventory systems, and healthcare data integrations supporting informed and connected healthcare experiences." },
  { icon: "Stethoscope", title: "Physician-Direct Product Access", text: "Product availability and inquiries, medical documentation, and Compassionate Special Permit (CSP) coordination." },
];

/*
 * Homepage FAQ — final Marketing copy, word-for-word.
 * `a` is HTML: the accordion renders it AND the FAQPage JSON-LD reuses it, so UI and
 * schema always match 1-to-1. Links must be absolute https://getmeds.ph/ URLs.
 * `schema: true` (Q1–6) → included in FAQPage JSON-LD. Q7–8 are accordion-only
 * (delivery/payment schema lives on /order-medicines).
 */
export type FaqItem = { q: string; a: string; schema: boolean };

export const faqs: FaqItem[] = [
  {
    q: "Is Getmeds registered with FDA Philippines?",
    a: "<p>Yes. Getmeds holds valid Licenses to Operate (LTO) from the Food and Drug Administration (FDA) of the Philippines as a drug wholesaler, importer, distributor, and retail pharmacy.</p>",
    schema: true,
  },
  {
    q: "Is Getmeds legit?",
    a: "<p>Yes. Getmeds Philippines, Inc. is an FDA-licensed pharmaceutical importer, wholesaler, and distributor, and is PDEA-licensed across categories S1 to S5 for controlled substances. Getmeds supplies cancer, hospital, and essential medicines to doctors, pharmacies, and hospitals nationwide, and runs its own retail and online pharmacy, where every prescription order is reviewed by PRC-licensed pharmacists.</p>",
    schema: true,
  },
  {
    q: "Where is Getmeds located in the Philippines?",
    a: "<p>Getmeds' head office is at Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Talon Dos, Las Piñas, Metro Manila. This is our principal office and business address in the Philippines.</p>",
    schema: true,
  },
  {
    q: "Who is the owner of Getmeds?",
    a: "<p>Getmeds was founded and is owned by Naresh Bishnoi, who serves as Director and is a United Nations Global Compact SDG Champion.</p>",
    schema: true,
  },
  {
    q: "What products does Getmeds offer?",
    a: '<p>Getmeds supplies prescription medicines, hospital medicines and medical supplies across the Philippines, covering oncology, hematology, anti-infectives, cardiology, anesthesia and pain management, critical care, endocrinology, orthopedics, rheumatology, nephrology, respiratory care, rare diseases and essential medicines. Explore our full <a href="https://getmeds.ph/product-range">Product Range</a>.</p>',
    schema: true,
  },
  {
    q: "How do I order medicines from Getmeds?",
    a: '<p>Patients can order prescription medicines by submitting a valid doctor\'s prescription. A PRC-licensed pharmacist reviews each order before dispatch.</p><p>Choose the option that fits your needs:</p><ul><li>Patients &amp; Families: <a href="https://getmeds.ph/order-medicines/patients">Order with a valid prescription</a></li><li>Doctors: <a href="https://getmeds.ph/order-medicines/doctors">Request medicines</a></li><li>Distributors &amp; Pharmacies: <a href="https://getmeds.ph/order-medicines/distributors">Open a wholesale account</a></li><li>Hospitals &amp; Institutions: <a href="https://getmeds.ph/order-medicines/hospitals">Request a quotation</a></li></ul>',
    schema: true,
  },
  {
    q: "How long does delivery take?",
    a: "<p>Getmeds delivers across Luzon, Visayas, and Mindanao. In Metro Manila, orders confirmed before 3:00 PM may be delivered the same day, subject to product availability. Provincial orders typically arrive within 3 to 5 business days, depending on the destination.</p>",
    schema: false,
  },
  {
    q: "What are Getmeds' accepted modes of payment?",
    a: "<p>Getmeds accepts Cash on Delivery (COD), GCash, Bank Transfer, Credit Card, and Debit Card. Qualified hospital and institutional accounts may apply for credit terms, subject to approval.</p>",
    schema: false,
  },
];

/** FAQPage JSON-LD for the homepage only — Q1–6, answers identical to the accordion. */
export const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs
    .filter((f) => f.schema)
    .map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
};

/*
 * Order Medicines hub FAQ — final Marketing copy, word-for-word (all 13 in the accordion
 * AND the schema). Same `a`-is-HTML contract as the homepage FAQ; links absolute.
 */
export const orderFaqs: FaqItem[] = [
  {
    q: "Can I buy medicine online in the Philippines with a prescription?",
    a: '<p>Yes. Patients can buy prescription medicines online from Getmeds by uploading a valid prescription when they send their order or inquiry. A Getmeds pharmacist reviews every order before dispatch. See how it works on the <a href="https://getmeds.ph/order-medicines/patients">Patients &amp; Families page</a>.</p>',
    schema: true,
  },
  {
    q: "Does Getmeds have an online pharmacy in the Philippines?",
    a: '<p>Yes. Getmeds, an FDA-licensed pharmaceutical importer, wholesaler and distributor in the Philippines, runs its own retail and online pharmacy, delivering prescription medicines directly to patients, who can order on our <a href="https://getmeds.ph/order-medicines/patients">Patients &amp; Families page</a>. Getmeds also supplies cancer, hospital and essential medicines to doctors, pharmacies and hospitals nationwide.</p>',
    schema: true,
  },
  {
    q: "Where do you deliver and how long does it take?",
    a: "<p>Getmeds delivers across Luzon, Visayas, and Mindanao. In Metro Manila, patient orders confirmed before 3:00 PM may be delivered the same day, subject to product availability. Provincial retail orders typically arrive within 3 to 5 business days, depending on the destination. For wholesale pharmacy and hospital procurement delivery schedules, please contact your dedicated account manager.</p>",
    schema: true,
  },
  {
    q: "What are Getmeds' accepted modes of payment?",
    a: "<p>Getmeds accepts Cash on Delivery (COD), GCash, Bank Transfer, Credit Card, and Debit Card. For orders covered by an approved Guarantee Letter, payment is coordinated based on the agency's coverage. Qualified hospital and institutional accounts may apply for credit terms, subject to approval.</p>",
    schema: true,
  },
  {
    q: "Can I use my Senior Citizen or PWD discount?",
    a: '<p>Yes. Under the Expanded Senior Citizens Act (RA 9994) and the Magna Carta for Persons with Disability (RA 7277, as amended by RA 9442 and RA 10754), qualified Senior Citizens and Persons with Disability receive a 20% discount and VAT exemption on eligible prescription medicines for their personal use. Upload your valid Senior Citizen or PWD ID and doctor\'s prescription on the <a href="https://getmeds.ph/order-medicines/patients">Patients &amp; Families page</a>.</p>',
    schema: true,
  },
  {
    q: "Can I use my guarantee letter?",
    a: '<p>Yes. Getmeds accepts guarantee letters from DSWD, PCSO, the Office of the President, and the Office of the Vice President. Send your guarantee letter and prescription, and our team will confirm availability. Learn more on the <a href="https://getmeds.ph/patient-assistance-program">Getmeds Patient Assistance Program page</a>.</p>',
    schema: true,
  },
  {
    q: "How can I get a price quotation for chemotherapy drugs?",
    a: '<p>Send your contact details and prescription to Getmeds, and our team will prepare an official price quotation for your oral or injectable chemotherapy drugs. Getmeds quotation letters may be submitted with medical assistance applications to PCSO, DSWD, the Office of the President, and the Office of the Vice President, subject to each program\'s requirements. Request your quotation on the <a href="https://getmeds.ph/order-medicines/patients">Patients &amp; Families page</a>.</p>',
    schema: true,
  },
  {
    q: "What are the PCSO requirements for medicine assistance?",
    a: '<p>PCSO usually asks for a prescription, a medical abstract or clinical summary, the IMAP form, a valid government ID, and official price quotations. Requirements may change, so please check with PCSO before applying. For cancer medicines, Getmeds can provide a price quotation for your application. See the full list on the <a href="https://getmeds.ph/patient-assistance-program">Getmeds Patient Assistance Program page</a>.</p>',
    schema: true,
  },
  {
    q: "Does Getmeds supply doctors, pharmacies and hospitals wholesale?",
    a: '<p>Yes. Getmeds is a pharmaceutical distributor and wholesale supplier for pharmacies, hospitals, and clinics across the Philippines. Doctors can order on our <a href="https://getmeds.ph/order-medicines/doctors">Doctors page</a>, pharmacies can open an account on our <a href="https://getmeds.ph/order-medicines/distributors">Distributors &amp; Pharmacies page</a>, and hospitals and clinics can request quotations on our <a href="https://getmeds.ph/order-medicines/hospitals">Hospitals &amp; Institutions page</a>.</p>',
    schema: true,
  },
  {
    q: "Can Getmeds help with a Compassionate Special Permit?",
    a: '<p>Yes. For medicines not registered in the Philippines, Getmeds coordinates Compassionate Special Permit (CSP) and Named Patient Program requests through our partner 2MG Inc., subject to FDA approval. Doctors can start a request on the <a href="https://getmeds.ph/order-medicines/doctors">Doctors page</a>.</p>',
    schema: true,
  },
  {
    q: "Is customer support available anytime?",
    a: "<p>Yes. Getmeds customer support is available 24/7 through phone, Viber, WhatsApp, and Messenger.</p>",
    schema: true,
  },
  {
    q: "Can I get a prescription online without seeing a doctor?",
    a: "<p>No. Getmeds does not issue prescriptions. You need a valid prescription from a licensed doctor, which a Getmeds pharmacist reviews before your order is dispatched.</p>",
    schema: true,
  },
  {
    q: "What should I look for in an online pharmacy?",
    a: "<p>Choose an online pharmacy with an FDA License to Operate, one that asks for a valid prescription for prescription medicines, and one where a licensed pharmacist reviews every order. Getmeds meets all three.</p>",
    schema: true,
  },
];

/** FAQPage JSON-LD for /order-medicines only — all 13, answers identical to the accordion. */
export const orderFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: orderFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/*
 * Patient Assistance Program FAQ — final copy, word-for-word (all 12 in the accordion AND the
 * schema; Q10–11 are in Filipino). Same `a`-is-HTML contract as the other FAQ lists.
 */
export const papFaqs: FaqItem[] = [
  {
    q: "What is PCSO MAP (Medical Assistance Program)?",
    a: "<p>The PCSO Medical Assistance Program (MAP), also called IMAP, is a government assistance program that helps cover medicine and treatment costs for financially incapacitated patients — including those needing cancer and chemotherapy medicines.</p>",
    schema: true,
  },
  {
    q: "What does AICS mean?",
    a: "<p>AICS stands for Assistance to Individuals in Crisis Situations, a DSWD program that provides medical, burial, transportation, or food assistance to Filipinos facing a crisis — including cancer patients needing chemotherapy medicines.</p>",
    schema: true,
  },
  {
    q: "Who can qualify for PCSO or DSWD medical assistance?",
    a: "<p>Patients who need financial help for prescribed treatment, including chemotherapy or other cancer treatments, and who can provide the required medical and supporting documents, may qualify. Final approval is at the discretion of DSWD or PCSO.</p>",
    schema: true,
  },
  {
    q: "How do I apply for PCSO MAP online?",
    a: "<p>Download and complete the PCSO IMAP Application Form from the PCSO website, prepare your medical documents and valid ID, secure three price quotations for your medicine (the first from Getmeds), then submit everything through PCSO’s online application process.</p>",
    schema: true,
  },
  {
    q: "Where can I get the PCSO MAP application form?",
    a: "<p>The PCSO IMAP Application Form can be downloaded directly from the official PCSO website.</p>",
    schema: true,
  },
  {
    q: "Do I need to book an online appointment for DSWD Medical Assistance (AICS)?",
    a: "<p>Submission for DSWD AICS is currently done in person at your nearest DSWD Satellite Office. Some offices may require an online appointment first — please confirm with your local DSWD office or our Patient Assistance Officer.</p>",
    schema: true,
  },
  {
    q: "What are the requirements for PCSO and DSWD cancer medicine assistance?",
    a: "<p>Requirements include a medical prescription, treatment protocol, and medical abstract from your doctor, a valid government ID, and additional documents specific to each agency — such as a Social Case Study Report and Certificate of Indigency for DSWD, or a completed IMAP Application Form and three price quotations for PCSO.</p>",
    schema: true,
  },
  {
    q: "How many price quotations do I need for PCSO, and can Getmeds provide one?",
    a: "<p>PCSO requires three (3) official price quotations for your cancer medicine from different distributors or suppliers. Getmeds can provide the first quotation — the other two need to be requested from different suppliers.</p>",
    schema: true,
  },
  {
    q: "How long does the PCSO/DSWD application process take?",
    a: "<p>Processing time varies depending on the agency and how complete your submitted documents are. Our Patient Assistance Officer can guide you through each step to help avoid delays.</p>",
    schema: true,
  },
  {
    q: "Ano ang Guarantee Letter o GL?",
    a: "<p>Kapag naaprubahan ang iyong aplikasyon at mga kinakailangang dokumento, maglalabas ang ahensiya ng Guarantee Letter (GL) para sa pasyente o sa kaniyang kinatawan. Ang GL ay isang mahalagang dokumento na nagpapatunay na ang ahensiya ang sasagot sa lahat ng gastusin para sa gamot ng pasyente. Sa pamamagitan ng GL, magkakaroon ka ng katiyakan na ang iyong gamot ay maibibigay nang walang abala sa bayad.</p><p>Ang pasyente o ang kinatawan nito ang kailangang magdala ng GL sa nakasaad na medicine distributor o supplier. Sila ang responsable sa pagbibigay ng gamot ayon sa nakasaad sa dokumento.</p><p>Para sa mas malinaw na gabay sa pag-claim ng iyong mga gamot, makipag-ugnayan sa aming Patient Assistance Officer, na handang tumulong sa bawat hakbang ng proseso.</p>",
    schema: true,
  },
  {
    q: "Ano ang Compassionate Special Permit?",
    a: "<p>Nag-aalok din ang Getmeds ng tulong para sa mga gamot sa cancer na nangangailangan ng espesyal na permit, upang mas mapabilis at maayos ang proseso ng pagkuha.</p><p>Halimbawa nito ang Compassionate Special Permit, na ginagamit para sa:</p><ul><li><strong>Restricted Use of Covered Pharmaceutical Products and Medical Devices for Human Use</strong> — para makagamit ng mga gamot at medical devices na limitado ang paggamit.</li><li><strong>Access to unregistered drugs and medical devices for seriously ill patients</strong> — tulad ng mga pasyenteng may advanced stage cancer, lalo na kung walang mas mabisa o alternatibong therapy na magagamit.</li></ul>",
    schema: true,
  },
  {
    q: "Does Getmeds also help with the Office of the President or Office of the Vice President medical assistance?",
    a: "<p>Yes — aside from DSWD and PCSO, Getmeds is also accredited to assist patients coordinating with the Office of the President and Office of the Vice President for medical assistance covering cancer and chemotherapy medicines.</p>",
    schema: true,
  },
];

/** FAQPage JSON-LD for /patient-assistance-program only — all 12, answers identical to the accordion. */
export const papFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: papFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const leaders = [
  { name: "Naresh Bishnoi", role: "Founder & CEO" },
  { name: "Subir Dey", role: "Sales & Marketing Coach" },
  { name: "Mira Verango", role: "Executive & Admin Coach" },
  { name: "Vanessa Escalderon", role: "Hospital Division Coach" },
  { name: "Beatrice Ampaso", role: "Sales & Business Development" },
  { name: "Esther Chiong", role: "In-Licensing Mentor" },
  { name: "Ivy Varias", role: "Regulatory Affairs Mentor" },
  { name: "Malou Jagonoy", role: "Finance Mentor" },
  { name: "Sarla Devi", role: "Finance Coach" },
  { name: "Mike Angelo Hizon", role: "Talent Growth & Development Mentor" },
];

export const contact = {
  phone: "+63 919 076 9105",
  email: "info@getmeds.ph",
  hrPhone: "+63 917 154 5029",
  hrEmails: ["hr@getmeds.ph", "hr2@getmeds.ph"],
  partnershipsPhone: "+63 919 076 9103",
  partnershipsEmail: "care@getmeds.ph",
  address: "Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747",
  facebook: "https://www.facebook.com/getmedsphilippines/",
  messenger: "https://m.me/getmedsphilippines",
  whatsapp: "https://wa.me/639190769105",
  viber: "viber://chat?number=%2B639190769105",
  twitter: "https://x.com/getmeds_ph",
  linkedin: "https://www.linkedin.com/company/getmeds",
  tiktok: "https://www.tiktok.com/@getmedsph",
  instagram: "https://www.instagram.com/getmeds_ph/",
  youtube: "https://www.youtube.com/@getmedsph",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About" },
  { href: "/product-range", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/global-network", label: "Global Network" },
  { href: "/patient-assistance-program", label: "Patient Assistance" },
  { href: "/order-medicines", label: "Order" },
  { href: "/contact-us", label: "Contact" },
];

export const moreLinks = [
  { href: "/careers", label: "Careers" },
  { href: "/csr", label: "CSR" },
  { href: "/ungc", label: "UN Global Compact" },
  { href: "/meditations", label: "Meditations" },
  { href: "/blog", label: "Blog" },
];
