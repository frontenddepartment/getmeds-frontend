
/* The 17 SDGs as a centred cloud of colour-filled pills under the section heading. */
/* Official UN colour for each of the 17 goals, in order. */
const SDG_COLORS = [
  "#E5243B", "#DDA63A", "#4C9F38", "#C5192D", "#FF3A21", "#26BDE2", "#FCC30B", "#A21942", "#FD6925",
  "#DD1367", "#FD9D24", "#BF8B2E", "#3F7E44", "#0A97D9", "#56C02B", "#00689D", "#19486A",
];

export default function SdgCarousel({ heading, text, goals }: { heading: React.ReactNode; text: string; goals: string[] }) {
  return (
    <>
      {/* heading + intro on the left, the 17 goals as a wrapping cloud of colour-filled pills on the right */}
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div>
          {heading}
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{text}</p>
        </div>
        <ul className="flex flex-wrap gap-2.5 lg:justify-start">
        {goals.map((g, i) => (
          <li
            key={g}
            style={{ backgroundColor: SDG_COLORS[i % SDG_COLORS.length] }}
            className="rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-sm md:px-5 md:py-2.5 md:text-[14px]"
          >
            {g}
          </li>
        ))}
        </ul>
      </div>
    </>
  );
}
