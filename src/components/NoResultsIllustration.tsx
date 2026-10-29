/* No-results scene for the catalog's empty state: a magnifier drifts back and forth over three
   faded, empty result cards, with a "?" pulsing in the lens. Same palette as SearchIllustration;
   the motion lives in globals.css (.noresult-illo). */

const C = {
  card: "#FFFFFF",
  border: "#E3EDF5",
  tile: "#EEF4F8",
  bar: "#E4EEF5",
  blue: "#1D9FDA",
  navy: "#0B2C44",
};

const CARDS = [24, 104, 184];

export default function NoResultsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 290" className={`noresult-illo ${className ?? ""}`} role="img" aria-hidden="true">
      <ellipse cx="180" cy="272" rx="140" ry="8" fill="#EEF4F8" />

      {/* empty, dashed result cards */}
      {CARDS.map((y, i) => (
        <g key={y} opacity={1 - i * 0.22}>
          <rect x="30" y={y} width="300" height="62" rx="14" fill={C.card} stroke={C.border} strokeWidth="2.5" strokeDasharray="8 7" />
          <rect x="50" y={y + 17} width="28" height="28" rx="8" fill={C.tile} />
          <rect x="94" y={y + 20} width="130" height="9" rx="4.5" fill={C.bar} />
          <rect x="94" y={y + 37} width="170" height="7" rx="3.5" fill={C.bar} opacity="0.7" />
        </g>
      ))}

      {/* magnifier sweeping across, finding nothing */}
      <g className="noresult-illo-lens">
        <circle cx="200" cy="120" r="44" fill="#FFFFFF" fillOpacity="0.9" stroke={C.blue} strokeWidth="9" />
        <path d="M232 152 L268 188" stroke={C.navy} strokeWidth="13" strokeLinecap="round" />
        <g className="noresult-illo-q">
          <path
            d="M188 108c0-8 6-13 13-13s13 5 13 12c0 9-11 10-11 19"
            fill="none"
            stroke={C.blue}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="203" cy="138" r="3.8" fill={C.blue} />
        </g>
      </g>
    </svg>
  );
}
