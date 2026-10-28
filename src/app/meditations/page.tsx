import type { Metadata } from "next";
import {
  Activity, ArrowRight, CalendarCheck, Flower2, Moon, Target, Users, Wind,
} from "lucide-react";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  alternates: { canonical: "/meditations" },
  title: "Meditations",
  description:
    "The Getmeds Meditation App — clinical mindfulness, guided breathing exercises, and soothing ambient soundscapes for your holistic wellness journey.",
};

const features = [
  { Icon: Flower2, title: "Mindfulness", text: "Explore guided meditations designed to reduce stress and cultivate presence." },
  { Icon: Wind, title: "Breathing", text: "Master simple breathing techniques to instantly calm your nervous system." },
  { Icon: Moon, title: "Sleep Sounds", text: "Drift into deep rest with our curated, tranquil audio library." },
  { Icon: Target, title: "Daily Goals", text: "Build lasting wellness habits with easily achievable daily mindful milestones." },
  { Icon: Activity, title: "Progress Tracking", text: "Visualize your mental health growth with detailed, personal data insights." },
  { Icon: Users, title: "Wellness Events", text: "Join live community sessions and expert-led mindfulness workshops globally." },
];

export default function MeditationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Getmeds Meditation App"
        title={<>Nurture your <span className="text-gradient">mind, body, and soul.</span></>}
        text="Discover clinical mindfulness, guided breathing exercises, and soothing ambient soundscapes designed to support your holistic wellness journey."
      >
        <span className="btn-primary cursor-default">
          Coming to App Stores <ArrowRight className="h-4 w-4" />
        </span>
      </PageHero>

      {/* Mindfulness measured */}
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-10 lg:grid-cols-2">
          <Reveal>
            <div className="glass rounded-2xl p-8 md:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Mindfulness, measured
              </span>
              <h2 className="font-display mt-3 text-2xl font-bold text-primary-deep md:text-3xl">
                Clarity for your chaos.
              </h2>
              <p className="mt-5 leading-relaxed text-ink-soft">
                Meet the meditation app designed to bring clarity to your chaos. By blending
                intuitive guided meditations with comprehensive wellness tracking, it seamlessly
                adapts to your unique daily routine — helping you visualize your progress as you
                cultivate inner peace.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                    <CalendarCheck className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-primary-deep">Smart Scheduling</p>
                    <p className="text-sm text-ink-soft">
                      Set due dates, recurring sessions, and get automated calm reminders to stay grounded.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                    <Flower2 className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-primary-deep">Custom Benefits</p>
                    <p className="text-sm text-ink-soft">
                      Gain mental clarity, reduce stress, and achieve total inner peace.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Phone mockup */}
          <Reveal delay={0.15}>
            <div className="relative mx-auto w-full max-w-[300px]">
              <div className="animate-float-slow rounded-2xl border-[10px] border-primary-deep bg-gradient-to-b from-[#0d4a6e] to-[#041f31] p-6 shadow-xl shadow-primary/15">
                <div className="mx-auto h-1.5 w-16 rounded-full bg-white/20" />
                <div className="mt-8 text-center text-white">
                  <div className="pulse-ring relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/25">
                    <Flower2 className="h-10 w-10 text-[#1D9FDA]" />
                  </div>
                  <p className="font-display mt-6 text-lg font-bold">Evening Calm</p>
                  <p className="mt-1 text-xs text-white/55">Guided breathing · 10 min</p>
                  <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-[#1D9FDA]" />
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-2 text-[10px] text-white/60">
                    {["Mindful", "Breathe", "Sleep"].map((t) => (
                      <span key={t} className="rounded-xl bg-white/8 py-2.5 ring-1 ring-white/10">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Features"
            title={<>A comprehensive suite for <span className="text-gradient whitespace-nowrap">mental well-being.</span></>}
            text="From guided sessions to advanced analytics — features that work together to help you build a calmer, more mindful daily routine."
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="glass group h-full rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-dark transition group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-bold text-primary-deep">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
