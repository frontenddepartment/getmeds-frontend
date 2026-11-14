/**
 * PCSO / DSWD guidance page content.
 * Program facts are taken from Getmeds' own published guides (see `guideSlug`) and MUST be
 * re-checked against current official agency instructions before production
 * (spec: "Official government requirements must be checked and maintained separately").
 * Official agency requirement lists are intentionally NOT reproduced here.
 */
export type ProgramPage = {
  key: "pcso" | "dswd";
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  agency: string;
  programName: string;
  officialUrl: string;
  howAgencyWorks: string[];
  getmedsHelps: string[];
  guideSlug: string;
};

export const PROGRAM_PAGES: ProgramPage[] = [
  {
    key: "pcso",
    path: "/patient-assistance-program/pcso",
    title: "PCSO Medical Assistance & Medicine Quotations",
    description:
      "PCSO medical assistance support from Getmeds: medicine quotations, document checks, and coordination of an existing PCSO Guarantee Letter where applicable.",
    h1: "PCSO Medical Assistance Support",
    intro:
      "Get help with medicine quotations, document requirements, and coordination involving an existing PCSO Guarantee Letter, when applicable. PCSO decides on assistance under its own program.",
    agency: "PCSO (Philippine Charity Sweepstakes Office)",
    programName: "PCSO Medical Assistance Program (MAP)",
    officialUrl: "https://www.pcso.gov.ph/",
    howAgencyWorks: [
      "PCSO runs the Medical Assistance Program (MAP), which issues guarantee letters for medicines and other medical expenses.",
      "According to our guide, applications can be made through PCSO's e-Services portal, by email, or by walk-in at some branch offices. Confirm the current process on the official PCSO website.",
    ],
    getmedsHelps: [
      "Preparing a medicine quotation for your PCSO application.",
      "Checking which documents you already have for the quotation.",
      "Coordinating an existing PCSO Guarantee Letter with Getmeds, where Getmeds is able to support it.",
    ],
    guideSlug: "how-to-apply-for-pcso-medical-assistance-program",
  },
  {
    key: "dswd",
    path: "/patient-assistance-program/dswd",
    title: "DSWD Medical Assistance (AICS) Medicine Quotations",
    description:
      "DSWD medical assistance (AICS) support from Getmeds: medicine quotations and guidance on applicable requirements, with a reference number to track your request.",
    h1: "DSWD Medical Assistance Support",
    intro:
      "Request medicine quotations and guidance on applicable DSWD medical assistance requirements. DSWD decides on assistance under its own program.",
    agency: "DSWD (Department of Social Welfare and Development)",
    programName: "Assistance to Individuals in Crisis Situations (AICS)",
    officialUrl: "https://www.dswd.gov.ph/",
    howAgencyWorks: [
      "DSWD provides medical assistance under Assistance to Individuals in Crisis Situations (AICS).",
      "According to our guide, applications are made in person at a DSWD office with the required documents. Confirm the current process on the official DSWD website.",
    ],
    getmedsHelps: [
      "Preparing a medicine quotation for your DSWD application.",
      "Checking which documents you already have for the quotation.",
      "Coordinating an applicable existing Guarantee Letter, subject to verification.",
    ],
    guideSlug: "how-to-get-medical-assistance-from-dswd-your-2025-ultimate-guide",
  },
];

export const getProgramPage = (key: "pcso" | "dswd") => PROGRAM_PAGES.find((p) => p.key === key)!;
