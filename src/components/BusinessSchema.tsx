"use client";

import { aboutPageSchema, businessSchema } from "@/lib/schema";

/*
 * Business JSON-LD (Pharmacy + WebSite) for the homepage and, with an AboutPage node, for
 * About Us. Client components for the same reason as FaqSchema: the JSON is server-rendered
 * once in the HTML and not repeated in the RSC payload.
 */
function SchemaScript({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function BusinessSchema() {
  return <SchemaScript schema={businessSchema} />;
}

export function AboutPageSchema() {
  return <SchemaScript schema={aboutPageSchema} />;
}
