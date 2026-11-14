/**
 * NEW SETUP — ordering hierarchy, matching the low-fidelity prototype click-for-click.
 * Every option routes to ONE workflow; `prototype: true` = saved on this device with a tracking
 * reference, not sent to Getmeds yet. Site policy: no online price / cart for prescription medicines,
 * so "Shop Medicines" = browse → product page → inquiry.
 */
export type OrderOption = { label: string; text: string; href: string; primary?: boolean; prototype?: boolean };
export type CustomerType = {
  key: "patients" | "doctors" | "distributors" | "hospitals";
  path: string;
  title: string;
  summary: string;
  options: OrderOption[];
};

export const CUSTOMER_TYPES: CustomerType[] = [
  {
    key: "patients",
    path: "/order-medicines/patients",
    title: "Patients & Families",
    summary: "Shop our medicines, or send us your prescription or medicine list. No account needed.",
    options: [
      { label: "Shop Medicines", text: "Search or browse products → product details → send an inquiry for that medicine.", href: "/product-range", primary: true },
      {
        label: "Upload Prescription or Medicine List",
        text: "Upload your prescription or medicine list → contact & delivery → review → submit request → tracking.",
        href: "/order-medicines/patients?mode=upload#request-form",
        prototype: true,
      },
    ],
  },
  {
    key: "doctors",
    path: "/order-medicines/doctors",
    title: "Doctors & Healthcare Professionals",
    summary: "Availability, product information, documentation, supply, and patient access / CSP coordination.",
    options: [
      { label: "Medicine availability", text: "Quick check — no credentials needed.", href: "/order-medicines/doctors?type=availability#request-form", primary: true, prototype: true },
      { label: "Product information", text: "Product details for your patients — no credentials needed.", href: "/order-medicines/doctors?type=product_information#request-form", prototype: true },
      { label: "Documentation", text: "Package insert, certificate of analysis, registration documents.", href: "/order-medicines/doctors?type=professional_documentation#request-form", prototype: true },
      { label: "Medicine supply", text: "Request supply for your clinic or a patient's treatment.", href: "/order-medicines/doctors?type=medicine_supply#request-form", prototype: true },
      { label: "Patient access / CSP coordination", text: "Patient access support or a Compassionate Special Permit request (subject to FDA approval).", href: "/csp-inquiry", prototype: true },
    ],
  },
  {
    key: "distributors",
    path: "/order-medicines/distributors",
    title: "Distributors & Pharmacies",
    summary: "Start with a quotation — no registration needed. Register when you are ready to order on account.",
    options: [
      { label: "Request wholesale quotation", text: "No account needed. Upload your product list or RFQ.", href: "/order-medicines/distributors#request-form", primary: true, prototype: true },
      { label: "Check medicine availability", text: "Just the product and your contact details.", href: "/contact-us" },
      { label: "Register as a partner", text: "FDA LTO and business verification to unlock partner pricing and ordering.", href: "/partner-registration", prototype: true },
      { label: "Existing partner ordering", text: "Sign in with your partner account to order at applicable pricing.", href: "/partner-portal", prototype: true },
      { label: "Repeat purchase orders", text: "Reorder from your order history.", href: "/partner-portal", prototype: true },
    ],
  },
  {
    key: "hospitals",
    path: "/order-medicines/hospitals",
    title: "Hospitals & Institutions",
    summary: "Upload your RFQ or procurement documents — no need to retype them.",
    options: [
      { label: "Formal RFQ", text: "Upload your RFQ and receive a formal quotation.", href: "/order-medicines/hospitals?procurement=formal_rfq#request-form", primary: true, prototype: true },
      { label: "Regular procurement", text: "Planned replenishment of formulary medicines.", href: "/order-medicines/hospitals?procurement=regular#request-form", prototype: true },
      { label: "Urgent medicine requirement", text: "Time-critical needs, prioritized for review.", href: "/order-medicines/hospitals?procurement=urgent#request-form", prototype: true },
      { label: "Government bidding inquiry", text: "Public bidding / tender documents and references.", href: "/order-medicines/hospitals?procurement=government_bidding#request-form", prototype: true },
      { label: "Purchase order submission", text: "Submit an approved PO with its documents.", href: "/order-medicines/hospitals?procurement=purchase_order#request-form", prototype: true },
    ],
  },
];

export const getCustomerType = (key: string) => CUSTOMER_TYPES.find((c) => c.key === key);
