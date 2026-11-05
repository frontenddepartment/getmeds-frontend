/* Search results scene: a magnifier scans three result cards and ticks each one off.
   Pure inline SVG; the motion lives in globals.css (.search-illo). */

const C = {
  card: "#FFFFFF",
  border: "#D6EBF8",
  tile: "#E7F3FB",
  bar: "#BFDDF0",
  barSoft: "#E4EEF5",
  blue: "#1D9FDA",
  navy: "#0B2C44",
  green: "#6BB33F",
};

const CARDS = [20, 110, 200];

export default function SearchIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 320" className={`search-illo ${className ?? ""}`} role="img" aria-hidden="true">
      <ellipse cx="180" cy="300" rx="150" ry="9" fill="#EEF4F8" />

      {CARDS.map((y, i) => (
        <g key={y} style={{ ["--d" as string]: `${i * 2}s` }}>
          <rect x="12" y={y} width="336" height="70" rx="16" fill={C.card} stroke={C.border} strokeWidth="2.5" />
          <rect x="34" y={y + 19} width="32" height="32" rx="9" fill={C.tile} />
          <rect x="84" y={y + 22} width="150" height="10" rx="5" fill={C.bar} />
          <rect className="search-illo-fill" x="84" y={y + 22} width="150" height="10" rx="5" fill={C.blue} />
          <rect x="84" y={y + 41} width="190" height="7" rx="3.5" fill={C.barSoft} />
          <g className="search-illo-pop">
            <circle cx="314" cy={y + 35} r="15" fill={C.green} />
            <path
              d={`M306 ${y + 35} l5.5 5.5 l10 -11`}
              stroke="#fff"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      ))}

      <g className="search-illo-lens">
        <circle cx="158" cy="57" r="34" fill={C.blue} fillOpacity="0.12" />
        <path d="M134 44 a26 26 0 0 1 20 -13" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="158" cy="57" r="34" fill="none" stroke={C.navy} strokeWidth="7" />
        <path d="M182 81 l24 24" stroke={C.navy} strokeWidth="10" strokeLinecap="round" />
      </g>
    </svg>
  );
}
