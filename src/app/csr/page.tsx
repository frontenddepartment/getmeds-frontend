import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui";
import GatherGrid from "./GatherGrid";
import { FacebookIcon, YouTubeIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  alternates: { canonical: "/csr" },
  title: "Corporate Social Responsibility",
  description:
    "We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital health advocacy, no patient navigates their journey alone.",
};

/* Photo galleries for the event and foundation sections (public/assets). */
const pinkRunPhotos = ["/assets/pinkrunone-web.jpg", "/assets/pinkruntwo-web.jpg", "/assets/pinkrunthree-web.jpg", "/assets/pinkrunfour-web.jpg"];
const epcalmPhotos = ["/assets/epcalmone.jpg", "/assets/epcalmtwo.jpg", "/assets/epcalmthree.jpg"];
const imeldaPhotos = ["/assets/imeldapapin.jpg", "/assets/imeldapapintwo.png", "/assets/imeldapapinthree.png", "/assets/imeldapapinfour.png"];

export default function CsrPage() {
  return (
    <>
      {/* Hero image, same treatment and text placement as Contact Us. xl+: copy sits white on the blue at the left.
          Below xl the image is too short, so the copy stacks below it in navy/black. */}
      <section className="relative bg-white pb-14 xl:pb-0">
        <Image
          src="/images/csrherosection.jpg"
          alt="Getmeds team member guiding a patient through his medicines"
          width={5456}
          height={2816}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              {/* exactly two lines from md up; free wrapping on phones where line one doesn't fit */}
              <span className="md:block md:whitespace-nowrap">Corporate Social</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">Responsibility</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              We don&apos;t just distribute medicine; we facilitate healing. Through NGO partnerships and digital
              health advocacy, we ensure no patient navigates their journey alone.
            </p>
          </Reveal>
        </div>
        {/* same button placement as Contact Us; xl+: anchored to the section bottom so it sits on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href="#csr-content"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Read More
              </a>
              <Link
                href="/patient-assistance-program"
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                Patient Assistance Program
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Compassionate access: image left, copy right; the patient testimonial sits beneath as a full-width row */}
      <section id="csr-content" className="scroll-mt-28 pb-14 pt-4 md:pb-20 md:pt-6">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <Reveal>
              <Image
                src="/assets/csrimage1.png"
                alt="Doctor hugging a young patient, framed by the Getmeds blue and green"
                width={706}
                height={686}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="mx-auto h-auto w-full max-w-md lg:max-w-none"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-sm font-semibold text-primary">What We Do</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
                Compassionate Access
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
                Thousands of Filipino cancer patients have received free cancer treatments through Getmeds —
                directly and through multi-sector collaboration with oncology doctors, institutions, and
                organizations, notably Bahay Aruga, Imelda Papin Foundation, EPCALM Adult Leukemia Foundation,
                and The Beautiful One DHE — Breast Cancer Warriors.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Patient access to our wide range of product portfolio has expanded further through our official
                accreditation with government agencies, including the Department of Social Welfare and
                Development (AICS), the Philippine Charity Sweepstakes Office Medical Assistance Programs, the
                Office of the Vice President (OVP), and the Office of the President (OP) — ensuring continued
                care for financially challenged patients.
              </p>
            </Reveal>
          </div>

        </div>
      </section>

      {/* Faces of Hope: full-width brand-blue band; quote left, circular photo right */}
      <section className="bg-[#1D9FDA] text-white">
        <Reveal className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-[1fr_auto] md:gap-16 md:px-10 md:py-20">
          <div>
            <p className="font-display text-2xl font-semibold md:text-[2rem]">Faces of Hope</p>
            <p className="font-display mt-5 max-w-3xl text-lg font-medium leading-relaxed md:text-xl">
              &ldquo;Since 2019, my son has been fighting his cancer. This is more than just a blessing. It&apos;s
              a big help to us, because if we had to buy it ourselves, we simply couldn&apos;t afford it.
              Because of Getmeds, he has a chance to live longer and continue his life.&rdquo;
            </p>
            <p className="mt-6 text-sm font-semibold">Mother of a Chronic Myeloid Leukemia Patient</p>
            <p className="mt-1 text-sm text-white/75">EPCALM Beneficiary · Faces of Hope</p>
          </div>
          <Image
            src="/assets/fohimage.png"
            alt="Mother of an EPCALM beneficiary with a Getmeds team member"
            width={250}
            height={250}
            sizes="(min-width: 768px) 260px, 200px"
            className="mx-auto h-48 w-48 shrink-0 rounded-full object-cover ring-[6px] ring-white shadow-xl md:h-64 md:w-64"
          />
        </Reveal>
      </section>

      {/* Our commitment: copy left, Dorie's story video right, both patient-journey links as buttons */}
      <section className="pb-14 pt-14 md:pb-16 md:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-black md:text-[2rem]">Our Commitment</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
              We remain committed to extending our reach beyond boundaries — bringing accessible cancer care to
              every Filipino patient in need and inspiring a future where hope and healing know no limits.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              Dorie, a breast cancer warrior diagnosed twice, made the difficult decision to treat both breasts to
              prevent her condition from worsening. She shares her story of struggles and triumphs in her battle
              against cancer.
            </p>
            <p className="mt-6 text-sm font-semibold text-black">Watch some of our patients&apos; journeys here:</p>
            {/* same pills as before, each ending in an inner circle with the platform's real icon
                (the Order Medicines "label + circle" pill) */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href="https://youtu.be/aIKzCDi2NGA"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border-2 border-primary bg-primary py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Watch on YouTube
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#FF0000] transition-transform duration-300 group-hover:translate-x-0.5">
                  <YouTubeIcon className="h-4 w-4" />
                </span>
              </a>
              <a
                href="https://www.facebook.com/reel/971664227768897"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border-2 border-black py-1.5 pl-6 pr-1.5 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                Watch on Facebook
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1877F2] ring-1 ring-black/10 transition-transform duration-300 group-hover:translate-x-0.5">
                  <FacebookIcon className="h-4 w-4" />
                </span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-lg ring-1 ring-slate-200/70">
              <iframe
                src="https://www.youtube-nocookie.com/embed/aIKzCDi2NGA"
                title="Dorie's story: a breast cancer warrior's journey with Getmeds"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pink Run: brand-blue band; header (title left, line right) + fan-out photo grid */}
      <section className="bg-[#1D9FDA] py-14 text-white md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <div>
              <p className="text-sm font-semibold text-white/85">Health Promotion Events</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-white md:text-[2rem]">
                Pink Run
                <br />
                Breast Cancer Awareness
              </h2>
            </div>
            <p className="max-w-lg text-[15px] leading-relaxed text-white/90">
              The Pink Run is dedicated to promoting breast cancer awareness. Getmeds is the official health
              partner championing early detection and survivor support.
            </p>
          </Reveal>
          <div className="mt-8">
            <GatherGrid images={pinkRunPhotos} alt="Pink Run breast cancer awareness event" />
          </div>
        </div>
      </section>

      {/* EPCALM: header + grid with a lead card then three photos */}
      <section className="pb-6 pt-14 md:pb-8 md:pt-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <div>
              <p className="text-sm font-semibold text-primary">Foundation Partnership</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
                EPCALM
                <br />
                Adult Leukemia Foundation
              </h2>
            </div>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Getmeds partners with EPCALM Adult Leukemia Foundation to provide free treatment access and
              continuous support for adult leukemia patients and their families.
            </p>
          </Reveal>
          <div className="mt-8">
            <GatherGrid
              images={epcalmPhotos}
              alt="EPCALM Adult Leukemia Foundation partnership"
              lead={
                <div className="flex h-full flex-col justify-center bg-[#1D9FDA] p-4 text-white md:p-6">
                  <p className="text-[11px] font-semibold text-white/80 md:text-xs">EPCALM</p>
                  <h3 className="font-display mt-1 text-base font-semibold leading-snug md:text-xl">Adult Leukemia Foundation</h3>
                  <p className="mt-2 line-clamp-4 text-[12px] leading-relaxed text-white/90 md:line-clamp-none md:text-sm">
                    Getmeds partners with EPCALM to provide free treatment access and support for adult leukemia
                    patients and their families.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Imelda Papin Foundation: header + two-column photo grid */}
      <section className="pb-20 pt-10 md:pb-24 md:pt-12">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <div>
              <p className="text-sm font-semibold text-primary">Foundation Partnership</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
                Imelda Papin
                <br />
                Foundation
              </h2>
            </div>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Getmeds partners with the Imelda Papin Foundation to provide cancer patients with access to
              essential medicines and continued support throughout their treatment journey.
            </p>
          </Reveal>
          <div className="mt-8">
            <GatherGrid images={imeldaPhotos} alt="Imelda Papin Foundation partnership" cols={2} aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>
    </>
  );
}
