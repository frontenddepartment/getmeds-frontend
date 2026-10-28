import type { ReactNode } from "react";
import { Reveal } from "@/components/ui";

export default function PageHero({
  eyebrow,
  title,
  text,
  children,
  plain = false,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  children?: ReactNode;
  /** White background (no aurora/texture) and the homepage hero's type: semibold navy h1, black subheadline. */
  plain?: boolean;
  align?: "center" | "left";
}) {
  const isLeft = align === "left";
  const weight = plain ? "font-semibold" : "font-bold";
  const h1Type = plain
    ? "text-[clamp(1.6rem,7.2vw,1.85rem)] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] leading-[1.12] tracking-tight text-[#0B2E5E]"
    : "text-4xl leading-[1.1] text-primary-deep md:text-[3.4rem]";
  const textType = plain
    ? "text-[15.5px] text-black md:text-[15px]"
    : "text-base text-ink-soft md:text-lg";
  return (
    <section className={`relative overflow-hidden pb-14 pt-32 md:pt-40 ${plain ? "bg-white" : ""}`}>
      {!plain && <div className="aurora" />}
      {!plain && <div className="grid-texture absolute inset-0" />}
      <div
        className={`relative mx-auto ${
          isLeft
            ? "max-w-7xl px-5 text-left md:px-10"
            : "max-w-4xl px-4 text-center md:px-6"
        }`}
      >
        <Reveal immediate>
          <span className={`text-[11px] ${weight} uppercase tracking-[0.24em] text-primary block`}>
            {eyebrow}
          </span>
          <h1 className={`font-display mt-6 ${weight} ${h1Type} ${isLeft ? "max-w-3xl" : ""}`}>
            {title}
          </h1>
          {text && (
            <p className={`mt-6 max-w-2xl leading-relaxed ${textType} ${isLeft ? "" : "mx-auto"}`}>
              {text}
            </p>
          )}
          {children && (
            <div
              className={`${plain ? "mt-9" : "mt-8"} flex flex-wrap items-center ${
                isLeft ? "justify-start" : "justify-center"
              } gap-4`}
            >
              {children}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
