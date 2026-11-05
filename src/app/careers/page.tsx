import type { Metadata } from "next";
import Image from "next/image";
import {
  Award, Briefcase, Car, Globe2, GraduationCap, HeartPulse,
  Plane, Quote, Rocket, Sparkles, TrendingUp, Trophy, Users,
} from "lucide-react";
import { contact } from "@/lib/data";
import { Reveal, Stagger, StaggerItem } from "@/components/ui";
import CareersJobs from "./CareersJobs";
import ConventionsTabs from "./ConventionsTabs";

export const metadata: Metadata = {
  alternates: { canonical: "/careers" },
  title: "Careers",
  description:
    "Join the minds behind the medicine. Build a career with global impact in the healthcare industry.",
};

const perks = [
  { Icon: Briefcase, iconBg: "bg-[#1D9FDA]", title: "Major Portfolio", text: "One of the largest Hematology & Oncology portfolios in the Philippines." },
  { Icon: Sparkles, iconBg: "bg-[#8B6CD9]", title: "Exclusive Products", text: "Exclusive CSP products available to Filipino patients." },
  { Icon: GraduationCap, iconBg: "bg-[#61A644]", title: "Structured Path", text: "Structured Career Development Path within the first 6 months of joining." },
  { Icon: TrendingUp, iconBg: "bg-[#F2B705]", title: "Fast Promotion", text: "Fast-track Promotions & Annual Salary Increments for high performers." },
  { Icon: Trophy, iconBg: "bg-[#E5484D]", title: "Top Compensation", text: "Competitive Compensation Package with Attractive Monthly Incentives." },
  { Icon: Car, iconBg: "bg-[#0E6F9E]", title: "Company Car", text: "Free Company Car Program — vehicle ownership under the employee's name." },
  { Icon: Plane, iconBg: "bg-[#26BDE2]", title: "Travel Incentives", text: "All-Expense-Paid International Travel Incentives after 2 years of service." },
  { Icon: HeartPulse, iconBg: "bg-[#C75562]", title: "Wellness Focus", text: "Employee Wellness & Meditation Programs to support mental health." },
  { Icon: Award, iconBg: "bg-[#FD9D24]", title: "Recognition", text: "Recognition, Awards, and Employee Engagement Initiatives year-round." },
  { Icon: Rocket, iconBg: "bg-[#339B70]", title: "Growth Environment", text: "Dynamic, high-performing, and growth-oriented work environment." },
];

const culture = [
  { Icon: Globe2, title: "Innovate Healthcare", text: "Your career has no boundaries at Getmeds. Leverage our global footprint to build a fulfilling legacy in an environment that rewards merit and thrives on lifelong learning. We provide the experiences you need to become a leader of tomorrow." },
  { Icon: Rocket, title: "Empower Yourself", text: "Break boundaries, not just ground. At Getmeds, we encourage you to look beyond your role and lead with thoughtful, decisive action. Your fresh perspectives are exactly what fuel our next breakthrough." },
  { Icon: Users, title: "Grow With Us", text: "Success is a team sport at Getmeds. We've built a culture of radical transparency and professional support, ensuring you have a team that stands behind you — no matter the challenge." },
];

const conventions = {
  local: [
    { src: "/assets/conventionfirst.jpg", title: "Philippine Society of Medical Oncology", text: "Engaged with the country's leading oncology professionals to support better access to cancer care and treatment solutions." },
    { src: "/assets/conventionsecond.JPG", title: "Philippine Society of Hematology and Blood Transfusion Annual Convention", text: "Connected with hematology experts to advance patient access to therapies for blood disorders and related conditions." },
    { src: "/assets/conventionthird.jpg", title: "ASEAN Congress of Anesthesiologists", text: "Strengthened regional partnerships with anesthesiology professionals while showcasing Getmeds' healthcare solutions." },
    { src: "/assets/conventionfourth.JPG", title: "Philippine Society of Anesthesiologist Annual Convention", text: "Collaborated with anesthesiologists nationwide to promote accessible and reliable healthcare solutions for patients." },
    { src: "/assets/conventionfifth.jpg", title: "Society of Gynecologic Oncologists of the Philippines (SGOP) Annual Convention", text: "Demonstrated Getmeds' dedication to advancing care for women through collaboration with gynecologic oncology specialists." },
    { src: "/assets/conventioneight.jpg", title: "Philippine College of Radiology Annual Convention", text: "Collaborated with radiology professionals to advance diagnostic imaging and support improved patient care through high-quality contrast media solutions." },
  ],
  international: [
    { src: "/assets/conventionsixth.jpg", title: "CPHI", sub: "Southeast Asia · Korea · Japan · America · India · Europe · China", text: "Strengthened global pharmaceutical partnerships and explored innovative healthcare solutions through one of the world's leading pharma exhibitions." },
    { src: "/assets/conventionsevent.jpg", title: "IPHEX", text: "Connected with international pharmaceutical manufacturers to expand collaboration and improve access to quality medicines in the Philippines." },
  ],
};

/* Internship photo strip (public/assets/1-6.png, as on the previous page). */
const internshipPhotos = [1, 2, 3, 4, 5, 6].map((n) => `/assets/${n}.png`);

export default function CareersPage() {
  return (
    <>
      {/* Hero image, same treatment and text placement as Contact Us. xl+: copy sits white on the blue at the left.
          Below xl the image is too short, so the copy stacks below it in navy/black. */}
      <section className="relative bg-white pb-14 xl:pb-0">
        <Image
          src="/images/careerherosection.jpg"
          alt="Two Getmeds team members in blazers standing back to back"
          width={5456}
          height={2816}
          priority
          quality={100}
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Careers
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              {/* exactly two lines from md up; free wrapping on phones where line one doesn't fit */}
              <span className="md:block md:whitespace-nowrap">Join the Minds</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">Behind the Medicine</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              Join our mission to make healthcare accessible worldwide. We&apos;re looking for passionate
              individuals to innovate and grow with us.
            </p>
          </Reveal>
        </div>
        {/* same button pair as Contact Us; xl+: anchored to the section bottom so it sits on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href="#careers-content"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Read More
              </a>
              <a
                href={`mailto:${contact.hrEmails[0]}`}
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                Email Us
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Perks */}
      {/* Our benefits: photo left, decade-in-healthcare copy right (same layout as CSR's Compassionate Access) */}
      <section className="pb-6 pt-4 md:pb-8 md:pt-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <Image
              src="/images/ourbenefits.png"
              alt="Getmeds team at a job fair booth welcoming applicants"
              width={1343}
              height={1171}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-auto w-full rounded-3xl"
            />
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-sm font-semibold text-primary">Our Benefits</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
              Getmeds Has Been Present For Over A Decade In Healthcare
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
              Join a team of dedicated professionals working to make healthcare accessible and affordable for
              everyone. We believe in empowering our employees to innovate and make a real difference in
              people&apos;s lives. Our culture fosters growth, collaboration, and a relentless pursuit of
              excellence. Be part of a journey that matters, where your contributions directly impact global
              well-being.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Career advantages heading on white: title left, intro right (same layout as the blog/UNGC headers) */}
      <div id="careers-content" className="scroll-mt-28 bg-white pb-8 pt-4 md:pb-10 md:pt-6">
        <Reveal className="mx-auto grid max-w-7xl items-end gap-5 px-5 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10">
          <div>
            <p className="text-sm font-semibold text-primary">Career Advantages</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
              Why professionals choose Getmeds?
            </h2>
          </div>
          <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
            We provide more than just a job; we offer a path to excellence, innovation, and global impact in
            the healthcare industry.
          </p>
        </Reveal>
      </div>

      {/* blue-dominant blue→green band; flat white cards in the Order Medicines style, no buttons,
          each with its own icon colour */}
      <section className="bg-gradient-to-br from-[#1D9FDA] from-45% via-[#1D9FDA] via-65% to-[#61A644] py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {perks.map(({ Icon, iconBg, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-1">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-semibold text-black">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Employee recognition: header like Career Advantages (title left, line right), then three photo cards */}
      <section className="pb-6 pt-10 md:pb-8 md:pt-12">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <h2 className="font-display text-2xl font-semibold text-black md:text-[2rem]">Employee Recognition</h2>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Great work doesn&apos;t fade into the background here. It&apos;s recognized, championed, and
              celebrated.
            </p>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {culture.map(({ Icon, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 md:p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-semibold text-black">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Conventions: header (title left, line right); sticky Local / International switch with article-style events */}
      <section className="pb-10 pt-4 md:pb-14 md:pt-6">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <div>
              <p className="text-sm font-semibold text-primary">Industry Engagement</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
                Conventions We&apos;ve Been Part Of
              </h2>
            </div>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Our team regularly represents Getmeds at leading local and international medical conventions,
              building partnerships that expand access to care.
            </p>
          </Reveal>
          <ConventionsTabs groups={conventions} />
        </div>
      </section>

      {/* Internship: brand-blue band with frosted-glass circles; header in the column, photo strip runs off the right edge */}
      <section className="relative overflow-hidden bg-[#1D9FDA] py-14 text-white md:py-16">
        {/* glassy decorative circles */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -left-12 -top-16 h-56 w-56 rounded-full border border-white/30 bg-white/15 backdrop-blur-md" />
          <span className="absolute right-[12%] top-6 h-36 w-36 rounded-full border border-white/30 bg-white/10 backdrop-blur-md" />
          <span className="absolute bottom-[18%] left-[38%] h-16 w-16 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm" />
          <span className="absolute -bottom-14 -right-10 h-48 w-48 rounded-full border border-white/30 bg-white/15 backdrop-blur-md" />
          <span className="absolute right-[30%] top-[42%] h-24 w-24 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <div>
              <p className="text-sm font-semibold text-white/85">Internship Program</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-white md:text-[2rem]">Pharmaceutical Internship</h2>
            </div>
            <p className="max-w-lg text-[15px] leading-relaxed text-white/90">
              Step into a journey where your work touches real lives. Guided by experienced pharmacists across
              regulatory affairs, business development, and community pharmacy, you&apos;ll gain hands-on
              experience in healthcare that goes far beyond theory.
            </p>
          </Reveal>
        </div>

        {/* left edge aligned with the column; no right padding so the strip slides out to the screen edge */}
        <div className="relative mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-5 pr-0 [scrollbar-width:none] md:pl-10 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] [&::-webkit-scrollbar]:hidden">
          {internshipPhotos.map((src, i) => (
            <div key={src} className="group relative h-[220px] w-[320px] shrink-0 snap-center overflow-hidden rounded-3xl bg-white/20 shadow-lg">
              <Image src={src} alt={`Getmeds pharmaceutical interns, photo ${i + 1}`} fill sizes="320px" className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* Founder's word: quote left, portrait right */}
      <section className="pb-4 pt-10 md:pb-6 md:pt-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {/* inset from the column edges and kept compact */}
          <Reveal className="grid items-center gap-8 px-6 md:grid-cols-[1fr_auto] md:gap-12 md:px-12">
            <div>
              <Quote className="h-7 w-7 text-primary" aria-hidden />
              <blockquote className="font-display mt-4 max-w-2xl text-lg font-semibold leading-snug text-black md:text-xl">
                Join a culture where your growth is measured by the lives we touch.
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-black">Naresh Bishnoi</p>
              <p className="text-sm text-slate-500">Founder, Getmeds Philippines Inc - 2MG Inc.</p>
            </div>
            <Image
              src="/assets/CEO.jpg"
              alt="Naresh Bishnoi, Founder of Getmeds Philippines"
              width={400}
              height={400}
              sizes="(min-width: 768px) 176px, 144px"
              className="mx-auto h-36 w-36 shrink-0 rounded-full object-cover ring-[6px] ring-white shadow-xl md:h-44 md:w-44"
            />
          </Reveal>
        </div>
      </section>

      {/* CTA band: brand blue, white pill, scrolls to the open positions */}
      <section className="pb-6 pt-2 md:pb-8 md:pt-3">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#1D9FDA] px-8 py-9 text-white md:flex-row md:items-center md:px-12 md:py-10">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-[2rem]">Ready to lead the future of medicine?</h2>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/90">
                Join a global team where your expertise meets a higher purpose. Explore how our collaborative
                culture and rapid scale can accelerate your professional journey.
              </p>
            </div>
            <a
              href="#open-positions"
              className="inline-flex shrink-0 items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0E6F9E] transition hover:bg-white/90"
            >
              Explore Your Future Roles
            </a>
          </Reveal>
        </div>
      </section>

      {/* Open positions + application flow (client) */}
      <CareersJobs />
    </>
  );
}
