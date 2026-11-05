/* Flat, friendly illustration set — arch-framed scenes in the brand palette.
   Pure inline SVG, no dependencies. */

const C = {
  arch: "#E7F3FB",
  archDeep: "#D6EBF8",
  blue: "#1D9FDA",
  blueDark: "#1D9FDA",
  navy: "#0B2C44",
  accent: "#FF9E5E",
  accentDeep: "#F0812F",
  skin: "#F6C9A0",
  skinDeep: "#E2A878",
  white: "#FFFFFF",
  line: "#BFDDF0",
};

function Arch({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} role="img" aria-hidden="true">
      <path d="M30 170 V96 a70 70 0 0 1 140 0 V170 Z" fill={C.arch} />
      {children}
    </svg>
  );
}

function Head({ x, y, r = 13, skin = C.skin, hair = "#2B2B3C", hairStyle = "cap" }:
  { x: number; y: number; r?: number; skin?: string; hair?: string; hairStyle?: "cap" | "bun" | "side" }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={skin} />
      {hairStyle === "cap" && (
        <path d={`M${x - r} ${y} a${r} ${r} 0 0 1 ${2 * r} 0 l0 -3 a${r} ${r} 0 0 0 -${2 * r} 0 Z`} fill={hair} />
      )}
      {hairStyle === "cap" && <path d={`M${x - r} ${y - 2} a${r} ${r} 0 0 1 ${2 * r} 0 v-2 a${r} ${r} 0 0 0 -${2 * r} 0 Z`} fill={hair} />}
      {hairStyle === "bun" && (
        <>
          <circle cx={x} cy={y - r - 2} r={5} fill={hair} />
          <path d={`M${x - r} ${y} a${r} ${r} 0 0 1 ${2 * r} 0 v-4 a${r} ${r} 0 0 0 -${2 * r} 0 Z`} fill={hair} />
        </>
      )}
      {hairStyle === "side" && (
        <path d={`M${x - r} ${y + 2} a${r} ${r} 0 0 1 ${2 * r} 0 v-6 a${r} ${r} 0 0 0 -${2 * r} 0 Z`} fill={hair} />
      )}
      {/* smile */}
      <path d={`M${x - 4} ${y + 5} q4 3.5 8 0`} stroke={C.navy} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx={x - 4.5} cy={y + 1} r={1.3} fill={C.navy} />
      <circle cx={x + 4.5} cy={y + 1} r={1.3} fill={C.navy} />
    </g>
  );
}

function Plus({ x, y, s = 7, color = C.accent }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      d={`M${x - s / 3} ${y - s} h${(2 * s) / 3} v${s - s / 3} h${s - s / 3} v${(2 * s) / 3} h-${s - s / 3} v${s - s / 3} h-${(2 * s) / 3} v-${s - s / 3} h-${s - s / 3} v-${(2 * s) / 3} h${s - s / 3} Z`}
      fill={color}
    />
  );
}

function Heart({ x, y, s = 9, color = C.accentDeep }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      d={`M${x} ${y + s * 0.8} C ${x - s} ${y}, ${x - s * 0.6} ${y - s * 0.8}, ${x} ${y - s * 0.15} C ${x + s * 0.6} ${y - s * 0.8}, ${x + s} ${y}, ${x} ${y + s * 0.8} Z`}
      fill={color}
    />
  );
}

/* ---- Patients & families: two people, heart ---- */
export function IlloPatients({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      <Heart x={100} y={52} s={11} />
      <Plus x={52} y={66} />
      <Plus x={150} y={78} s={5} color={C.blue} />
      {/* person 1 */}
      <path d="M50 170 v-32 a28 28 0 0 1 56 0 v32 Z" fill={C.blue} />
      <Head x={78} y={96} hairStyle="side" hair="#4A2F1D" />
      {/* person 2 */}
      <path d="M96 170 v-26 a26 26 0 0 1 52 0 v26 Z" fill={C.blueDark} />
      <Head x={122} y={110} skin={C.skinDeep} hairStyle="bun" />
      {/* waving arm of person 2 */}
      <path d="M146 134 q10 -8 8 -20" stroke={C.blueDark} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx={154} cy={112} r={5.5} fill={C.skinDeep} />
    </Arch>
  );
}

/* ---- Hospital: building + cross + doctor ---- */
export function IlloHospital({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      <rect x="56" y="62" width="88" height="108" rx="4" fill={C.white} />
      <rect x="56" y="62" width="88" height="14" rx="4" fill={C.blueDark} />
      <rect x="88" y="34" width="24" height="24" rx="5" fill={C.blue} />
      <Plus x={100} y={46} s={7} color={C.white} />
      {[0, 1].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}${c}`} x={66 + c * 25} y={86 + r * 24} width="15" height="15" rx="3" fill={C.archDeep} />
        ))
      )}
      <rect x="88" y="140" width="24" height="30" rx="3" fill={C.blue} />
      {/* doctor */}
      <path d="M140 170 v-20 a19 19 0 0 1 38 0 v20 Z" fill={C.white} />
      <path d="M140 170 v-20 a19 19 0 0 1 38 0 v20 Z" fill="none" stroke={C.line} />
      <Head x={159} y={134} r={11} hairStyle="cap" />
      <rect x="154" y="152" width="10" height="12" rx="2" fill={C.blue} />
      <Plus x={172} y={60} s={5} color={C.accent} />
    </Arch>
  );
}

/* ---- Pharmacy storefront ---- */
export function IlloPharmacy({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      <rect x="48" y="70" width="104" height="100" rx="4" fill={C.white} />
      {/* awning */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${48 + i * 20.8} 70 h20.8 v10 a10.4 10.4 0 0 1 -20.8 0 Z`}
            fill={i % 2 ? C.white : C.blue}
            stroke={C.line}
            strokeWidth="0.5"
          />
        ))}
      </g>
      <rect x="48" y="58" width="104" height="14" rx="3" fill={C.blueDark} />
      <Plus x={100} y={65} s={5} color={C.white} />
      {/* counter + pharmacist */}
      <Head x={100} y={112} r={11} skin={C.skinDeep} hairStyle="bun" hair="#1F1F2E" />
      <path d="M82 140 a18 18 0 0 1 36 0 Z" fill={C.accent} />
      <rect x="60" y="138" width="80" height="10" rx="3" fill={C.blue} />
      {/* shelves */}
      <rect x="58" y="92" width="22" height="5" rx="2" fill={C.archDeep} />
      <rect x="120" y="92" width="22" height="5" rx="2" fill={C.archDeep} />
      <rect x="61" y="82" width="5" height="10" rx="1.5" fill={C.accent} />
      <rect x="69" y="80" width="5" height="12" rx="1.5" fill={C.blue} />
      <rect x="124" y="80" width="5" height="12" rx="1.5" fill={C.blue} />
      <rect x="132" y="82" width="5" height="10" rx="1.5" fill={C.accentDeep} />
      <rect x="48" y="150" width="104" height="20" fill={C.white} />
      <rect x="92" y="150" width="16" height="20" rx="2" fill={C.archDeep} />
    </Arch>
  );
}

/* ---- Delivery truck + pin ---- */
export function IlloTruck({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      {/* pin */}
      <path d="M100 30 a14 14 0 0 1 14 14 c0 10 -14 24 -14 24 s-14 -14 -14 -24 a14 14 0 0 1 14 -14 Z" fill={C.accentDeep} />
      <circle cx="100" cy="44" r="6" fill={C.white} />
      {/* dashes */}
      <path d="M100 72 q0 14 0 26" stroke={C.line} strokeWidth="2.5" strokeDasharray="4 6" fill="none" strokeLinecap="round" />
      {/* truck */}
      <rect x="40" y="104" width="78" height="44" rx="5" fill={C.blue} />
      <rect x="48" y="112" width="26" height="18" rx="3" fill={C.white} />
      <Plus x={61} y={121} s={6} color={C.blue} />
      <rect x="82" y="112" width="26" height="18" rx="3" fill={C.white} />
      <Plus x={95} y={121} s={6} color={C.accentDeep} />
      <path d="M118 116 h26 l14 16 v16 h-40 Z" fill={C.blueDark} />
      <rect x="124" y="120" width="16" height="12" rx="2" fill={C.arch} />
      <circle cx="66" cy="150" r="10" fill={C.navy} />
      <circle cx="66" cy="150" r="4.5" fill={C.archDeep} />
      <circle cx="136" cy="150" r="10" fill={C.navy} />
      <circle cx="136" cy="150" r="4.5" fill={C.archDeep} />
      <path d="M26 128 h8 M20 138 h10" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
    </Arch>
  );
}

/* ---- Globe sourcing ---- */
export function IlloGlobe({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      <circle cx="100" cy="106" r="44" fill={C.white} />
      <circle cx="100" cy="106" r="44" fill="none" stroke={C.blue} strokeWidth="2.5" />
      <ellipse cx="100" cy="106" rx="20" ry="44" fill="none" stroke={C.line} strokeWidth="2" />
      <path d="M56 106 h88 M62 86 h76 M62 126 h76" stroke={C.line} strokeWidth="2" />
      <path d="M78 92 q8 -8 16 -2 q4 4 12 2 q6 -2 8 4 q-10 8 -20 6 q-12 -2 -16 -10 Z" fill={C.archDeep} />
      <path d="M92 122 q10 -4 16 2 q-4 8 -14 6 q-6 -2 -2 -8 Z" fill={C.archDeep} />
      {/* pins */}
      <circle cx="128" cy="86" r="6" fill={C.accentDeep} />
      <circle cx="128" cy="86" r="2.5" fill={C.white} />
      <circle cx="76" cy="122" r="6" fill={C.blueDark} />
      <circle cx="76" cy="122" r="2.5" fill={C.white} />
      <path d="M128 86 Q 110 70 76 122" stroke={C.accent} strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <Plus x={52} y={64} s={6} />
      <Plus x={152} y={130} s={5} color={C.blue} />
    </Arch>
  );
}

/* ---- Pharmacist verifying ---- */
export function IlloPharmacist({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      <Plus x={54} y={60} s={6} />
      {/* bottle */}
      <rect x="120" y="84" width="34" height="48" rx="6" fill={C.blue} />
      <rect x="126" y="74" width="22" height="12" rx="3" fill={C.blueDark} />
      <rect x="126" y="96" width="22" height="22" rx="3" fill={C.white} />
      <Plus x={137} y={107} s={7} color={C.blue} />
      {/* pharmacist */}
      <path d="M44 170 v-28 a26 26 0 0 1 52 0 v28 Z" fill={C.white} />
      <path d="M44 170 v-28 a26 26 0 0 1 52 0 v28 Z" fill="none" stroke={C.line} />
      <path d="M62 148 h16 v22 h-16 Z" fill={C.blue} />
      <Head x={70} y={104} hairStyle="cap" hair="#1F1F2E" />
      {/* arm to bottle */}
      <path d="M92 136 q18 -6 28 -16" stroke={C.white} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx={122} cy={118} r={6} fill={C.skin} />
      {/* check badge */}
      <circle cx="152" cy="58" r="12" fill={C.blue} />
      <path d="M146 58 l4 4 l8 -8" stroke={C.white} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Arch>
  );
}

/* ---- Wide team celebration (About / CTA) ---- */
export function IlloTeam({ className }: { className?: string }) {
  const people = [
    { x: 56, shirt: C.blue, skin: C.skin, hair: "#4A2F1D", style: "side" as const },
    { x: 106, shirt: C.accent, skin: C.skinDeep, hair: "#1F1F2E", style: "bun" as const },
    { x: 156, shirt: C.white, skin: C.skin, hair: "#2B2B3C", style: "cap" as const },
    { x: 206, shirt: C.blueDark, skin: C.skinDeep, hair: "#1F1F2E", style: "side" as const },
    { x: 256, shirt: C.blue, skin: C.skin, hair: "#5A3A24", style: "bun" as const },
  ];
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-hidden="true">
      <path d="M12 180 V96 a60 60 0 0 1 60 -60 h176 a60 60 0 0 1 60 60 v84 Z" fill={C.arch} />
      <Heart x={34} y={54} s={8} />
      <Heart x={286} y={48} s={10} color={C.blue} />
      <Plus x={160} y={30} s={7} />
      {people.map((p, i) => (
        <g key={i}>
          {/* raised arm */}
          <path
            d={`M${p.x + 18} ${140} q12 -14 8 -30`}
            stroke={p.shirt === C.white ? C.archDeep : p.shirt}
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={p.x + 27} cy={106} r={5.5} fill={p.skin} />
          <path d={`M${p.x - 24} 180 v-22 a24 24 0 0 1 48 0 v22 Z`} fill={p.shirt} stroke={p.shirt === C.white ? C.line : "none"} />
          <Head x={p.x} y={118} r={12} skin={p.skin} hair={p.hair} hairStyle={p.style} />
        </g>
      ))}
    </svg>
  );
}

export function IlloDoctor({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      {/* clipboard */}
      <rect x="118" y="78" width="40" height="54" rx="5" fill={C.white} stroke={C.line} />
      <rect x="130" y="72" width="16" height="10" rx="3" fill={C.blueDark} />
      <path d="M126 94 h24 M126 104 h24 M126 114 h16" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
      <path d="M126 94 h10" stroke={C.blue} strokeWidth="3" strokeLinecap="round" />
      {/* doctor */}
      <path d="M40 170 v-28 a27 27 0 0 1 54 0 v28 Z" fill={C.white} stroke={C.line} />
      <path d="M58 146 h18 v24 h-18 Z" fill={C.blueDark} />
      <Head x={67} y={102} hairStyle="side" hair="#2B2B3C" />
      {/* stethoscope */}
      <path d="M58 136 q9 10 18 0" stroke={C.blueDark} strokeWidth="2.5" fill="none" />
      <circle cx="76" cy="138" r="3.5" fill={C.accentDeep} />
      <path d="M94 134 q16 -10 24 -24" stroke={C.white} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx={120} cy={108} r={6} fill={C.skin} />
      <Plus x={150} y={52} s={6} />
    </Arch>
  );
}

/* ---- Search came up empty: open box + magnifier + stray pills ---- */
export function IlloNoResults({ className }: { className?: string }) {
  return (
    <Arch className={className}>
      <Plus x={52} y={70} s={6} />
      <Plus x={156} y={58} s={5} color={C.blue} />
      {/* empty box */}
      <path d="M56 118 L100 104 L144 118 L100 132 Z" fill={C.archDeep} />
      <path d="M56 118 V156 L100 170 V132 Z" fill={C.white} stroke={C.line} />
      <path d="M144 118 V156 L100 170 V132 Z" fill={C.line} />
      <path d="M56 118 L40 100 L84 88 L100 104 Z" fill={C.white} stroke={C.line} />
      <path d="M144 118 L160 100 L116 88 L100 104 Z" fill={C.white} stroke={C.line} />
      {/* magnifier */}
      <circle cx={112} cy={64} r={22} fill={C.white} stroke={C.blue} strokeWidth="7" />
      <path d="M128 80 L146 98" stroke={C.navy} strokeWidth="9" strokeLinecap="round" />
      <path d="M104 58 q6 -6 14 -2" stroke={C.line} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* stray pills */}
      <rect x="150" y="142" width="22" height="10" rx="5" fill={C.accent} transform="rotate(-25 161 147)" />
      <circle cx={38} cy={150} r={6} fill={C.blue} />
    </Arch>
  );
}
