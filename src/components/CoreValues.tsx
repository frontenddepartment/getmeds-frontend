/* Core values on About Us: blue-to-green band (blue dominant). Title with white-outlined pills
   under it on the left; the family cutout stands on the band's bottom edge on the right. "Photo"
   pills keep a team photo (public/images/aboutusiso) behind the label, under a dark tint. */

import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/ui";

type Look = "outline" | "blue" | "green" | { photo: string };

const VALUES: { label: string; look: Look }[] = [
  { label: "Compassion", look: { photo: "iso3.jpg" } },
  { label: "Integrity", look: "outline" },
  { label: "Precision", look: "blue" },
  { label: "Innovation", look: "outline" },
  { label: "Security", look: "green" },
  { label: "Speed", look: "outline" },
  { label: "Expertise", look: { photo: "iso4.jpg" } },
  { label: "Global", look: "blue" },
  { label: "Safety", look: "outline" },
  { label: "Care", look: { photo: "iso8.jpg" } },
  { label: "Affordable", look: "green" },
  { label: "Reliable", look: "outline" },
  { label: "Community", look: { photo: "iso1.jpg" } },
  { label: "Excellence", look: "blue" },
];


export default function CoreValues() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(115deg,#1D9FDA_0%,#1D9FDA_55%,#61A644_100%)] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 pt-10 md:px-10 md:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
        <div className="pb-4 lg:pb-12">
          <Reveal>
            <p className="text-sm font-semibold text-white/85">Core Values</p>
            <h2 className="font-display mt-2 text-2xl font-semibold md:text-[2rem]">
              The Heart of Our Purpose
            </h2>
          </Reveal>

          <Stagger className="mt-6 flex flex-wrap gap-2 md:gap-2.5">
            {VALUES.map(({ label, look }) => {
              const photo = typeof look === "object" ? look.photo : null;
              return (
                <StaggerItem key={label}>
                  {photo ? (
                    <span className="relative flex items-center overflow-hidden rounded-full border border-white px-7 py-4 text-base font-semibold md:text-lg">
                      <Image src={`/images/aboutusiso/${photo}`} alt="" fill sizes="240px" className="object-cover" />
                      <span aria-hidden className="absolute inset-0 bg-[#0B2E5E]/55" />
                      <span className="relative">{label}</span>
                    </span>
                  ) : (
                    <span className="flex items-center rounded-full border border-white px-6 py-3.5 text-base font-semibold md:text-lg">
                      {label}
                    </span>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* family cutout standing on the bottom edge */}
        <div className="relative min-h-[260px] self-end sm:min-h-[320px] lg:min-h-[400px]">
          <Image
            src="/images/hero-family-cutout.png"
            alt="Smiling Filipino family"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
