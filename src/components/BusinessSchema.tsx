"use client";

import { businessSchema } from "@/lib/schema";

/*
 * Homepage-only business JSON-LD (Pharmacy + WebSite). A client component for the same
 * reason as FaqSchema: the JSON is server-rendered once in the HTML and not repeated in
 * the RSC payload.
 */
export default function BusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(businessSchema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
