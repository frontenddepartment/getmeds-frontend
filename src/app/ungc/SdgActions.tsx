/* Getmeds' own SDG actions (from the 2026 company profile), one section each, each with its own layout but
   the site's shared pieces: blue eyebrow, black 2rem title, 15px slate body, rounded-3xl photos, SDG pills
   in the official goal colours. Sits under "How UNGC Supports the 17 SDGs". */

import Image from "next/image";
import { ShieldCheck, Sun } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui";

const SDG_COLOR: Record<number, string> = { 7: "#FCC30B", 11: "#FD9D24", 12: "#BF8B2E", 13: "#3F7E44", 15: "#56C02B" };
const SDG_NAME: Record<number, string> = {
  7: "Affordable and Clean Energy",
  11: "Sustainable Cities",
  12: "Responsible Consumption and Production",
  13: "Climate Action",
  15: "Life on Land",
};

function SdgPills({ goals, light = false }: { goals: number[]; light?: boolean }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {goals.map((g) => (
        <span
          key={g}
          className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[13px] font-semibold ${
            light ? "bg-white/15 text-white ring-1 ring-white/30" : "bg-white text-slate-700 ring-1 ring-slate-300"
          }`}
        >
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white" style={{ backgroundColor: SDG_COLOR[g] }}>
            {g}
          </span>
          SDG {g} · {SDG_NAME[g]}
        </span>
      ))}
    </div>
  );
}

function Heading({ action, title, light = false }: { action: string; title: string; light?: boolean }) {
  return (
    <>
      <p className={`text-sm font-semibold ${light ? "text-white/85" : "text-primary"}`}>SDG Action {action}</p>
      <h2 className={`font-display mt-2 text-2xl font-semibold md:text-[2rem] ${light ? "text-white" : "text-black"}`}>{title}</h2>
    </>
  );
}

const img = (name: string) => `/images/ungc-sdg/${name}.jpg`;

export default function SdgActions() {
  return (
    <>
      {/* ── 02 Solar-powered cold-chain: photo mosaic left, copy + two feature cards right ── */}
      <section className="pb-12 pt-4 md:pb-16">
        {/* mosaic bleeds to the left edge with no gaps (like the "What is UNGC?" collage); copy keeps the site column's right edge */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-0">
          <Reveal>
            <div className="grid grid-cols-[1fr_1.3fr] gap-0 overflow-hidden lg:rounded-r-2xl">
              <div className="relative row-span-2 overflow-hidden">
                <Image src={img("solar-panels")} alt="Solar panels on the Getmeds warehouse roof" fill sizes="(min-width: 1024px) 23vw, 44vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={img("solar-rooftop")} alt="The Getmeds rooftop and building" fill sizes="(min-width: 1024px) 30vw, 56vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={img("solar-coldroom")} alt="Temperature-controlled storage room at Getmeds" fill sizes="(min-width: 1024px) 30vw, 56vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="px-5 md:px-10 lg:pl-16 lg:pr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
            <Heading action="02" title="Solar-Powered Cold-Chain Storage" />
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              Clean energy that keeps medicines safe, even during power outages.
            </p>
            <SdgPills goals={[7, 13]} />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { Icon: Sun, title: "Lower emissions", text: "Powered by the sun, not the grid." },
                { Icon: ShieldCheck, title: "Uninterrupted protection", text: "Medicines stay safe during outages." },
              ].map(({ Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-gray-200 bg-white p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-semibold text-black">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 03 Honeycomb packaging: white; header (title left, story right), three-photo strip below ── */}
      <section className="pb-12 pt-4 md:pb-16 md:pt-6">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {/* portrait photo left; title, tagline, goal, compact story and two photos right */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-stretch lg:gap-0">
            <Reveal className="relative aspect-[4/5] overflow-hidden rounded-lg lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <Image src={img("honeycomb-staff")} alt="Getmeds team member packing an order with honeycomb paper" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={0.1} className="lg:pl-3">
              <div className="lg:pl-7">
              <Heading action="03" title="Honeycomb Paper Packaging" />
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">Same protection, less plastic in every shipment.</p>
              <p className="font-display mt-2 text-lg font-semibold text-black">We changed how we pack medicines.</p>
              <SdgPills goals={[12]} />
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
                <p>
                  Getmeds Philippines has replaced plastic bubble wrap and foam with kraft paper wrap for selected medicines
                  in our packing operations. It is recyclable, biodegradable, and cushions fragile medicine packaging just
                  as well as plastic in transit — so we transition safely, without compromising medicine integrity.
                </p>
                <p>
                  This is what the United Nations Global Compact means when it calls on businesses to turn sustainability
                  commitments into measurable action. As the second pharmaceutical company in the Philippines to join,
                  Getmeds treats the Sustainable Development Goals not as principles we endorse, but as standards we are
                  held to.
                </p>
              </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { n: "honeycomb-wrap", alt: "Rolling a medicine box in honeycomb paper" },
                  { n: "honeycomb-closeup", alt: "Close-up of the honeycomb paper texture around a pack" },
                ].map((p) => (
                  <div key={p.n} className="relative aspect-[3/2] overflow-hidden rounded-lg">
                    <Image src={img(p.n)} alt={p.alt} fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 04 Electric dispatch fleet: blue band; header (title left, stat + line right), then four photos edge to edge ── */}
      <section className="bg-[#1D9FDA] pt-12 text-white md:pt-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <div>
              <Heading action="04" title="Electric Vehicles for Dispatch" light />
              <SdgPills goals={[11, 13]} light />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-white md:text-4xl">Zero tailpipe emissions</p>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/90">
                From our warehouse to your door, our dispatch fleet runs on electric power: cleaner deliveries for the
                communities we serve.
              </p>
            </div>
          </Reveal>
        </div>
        {/* full width, no gaps */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4">
          {[
            { n: "ev-van-side", alt: "Electric Getmeds dispatch van" },
            { n: "ev-car-front", alt: "Electric car in the Getmeds fleet" },
            { n: "ev-van-rear", alt: "Rear of an electric dispatch van" },
            { n: "ev-van-street", alt: "Electric van parked on a residential street" },
          ].map((p) => (
            <div key={p.n} className="group relative aspect-[9/14] overflow-hidden bg-slate-100">
              <Image src={img(p.n)} alt={p.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 Tree planting: white; large photo left, copy + partner + two photos right (same spacing as 03) ── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:items-stretch lg:gap-0">
          <Reveal className="relative aspect-[1200/849] overflow-hidden rounded-lg lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <Image src={img("trees-group")} alt="Getmeds team at a tree planting activity" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="lg:pl-3">
            <div className="lg:pl-7">
              <Heading action="05" title="Tree Planting Activity" />
              <p className="mt-2 font-display text-lg font-medium text-black">Growing a greener future</p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                Our team in action: Getmeds team members planting trees to restore green spaces and support climate
                action.
              </p>
              <SdgPills goals={[13, 15]} />
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500">With</span>
                <Image src="/images/ungc-sdg/haribon-logo.png" alt="Haribon Foundation" width={180} height={219} className="h-20 w-auto" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { n: "trees-planting", alt: "Team member planting a seedling" },
                { n: "trees-team", alt: "Getmeds team after planting" },
              ].map((p) => (
                <div key={p.n} className="relative aspect-[600/425] overflow-hidden rounded-lg">
                  <Image src={img(p.n)} alt={p.alt} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
