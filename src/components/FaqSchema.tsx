"use client";

import { homeFaqSchema, orderFaqSchema, papFaqSchema } from "@/lib/data";
import { oncologyFaqSchema, prescriptionFaqSchema, productRangeFaqSchema } from "@/lib/catalogueHub";

const schemas = {
  home: homeFaqSchema,
  order: orderFaqSchema,
  pap: papFaqSchema,
  productRange: productRangeFaqSchema,
  prescription: prescriptionFaqSchema,
  oncology: oncologyFaqSchema,
};

/*
 * Page-specific FAQPage JSON-LD: "home" = homepage Q1–6, "order" = /order-medicines Q1–13,
 * "pap" = /patient-assistance-program Q1–12, plus the catalogue hub pages.
 * A client component on purpose: the JSON is server-rendered once in the HTML and not
 * repeated in the RSC payload (only the "home"/"order" key is), so "FAQPage" appears
 * exactly once in View Source.
 */
export default function FaqSchema({ page }: { page: keyof typeof schemas }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas[page]).replace(/</g, "\\u003c"),
      }}
    />
  );
}
