import React from 'react';

// Healthcare blue — the same #1D9FDA as the logo and theme-color — plus tints of it.
const BLUE = '#1D9FDA';
const BLUE_DARK = '#0F6E9C';
const BLUE_LIGHT = '#BFE5F6';
const BLUE_TINT = '#E8F5FC';

function Gear({ cx, cy, r, teeth, className }: { cx: number; cy: number; r: number; teeth: number; className: string }) {
  const angles = Array.from({ length: teeth }, (_, i) => (360 / teeth) * i);
  return (
    // Rotates about its own centre; the spin itself lives in coming-soon.html's CSS.
    <g className={className} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {angles.map((a) => (
        <rect
          key={a}
          x={cx - r * 0.22}
          y={cy - r * 1.28}
          width={r * 0.44}
          height={r * 0.5}
          rx={r * 0.08}
          fill={BLUE}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={BLUE} />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="#fff" />
    </g>
  );
}

/** A healthcare site "under construction": browser window, gears, barrier and cone. */
export function UnderConstructionArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 480 400" role="img" aria-label="Illustration of a website under construction">
      <defs>
        <pattern id="uc-stripes" width="28" height="34" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
          <rect width="14" height="34" fill="#fff" />
        </pattern>
      </defs>

      {/* Backdrop */}
      <circle cx="250" cy="205" r="172" fill={BLUE_TINT} />
      <path d="M62 112v16M54 120h16" stroke={BLUE_LIGHT} strokeWidth="4" strokeLinecap="round" />
      <path d="M438 258v12M432 264h12" stroke={BLUE_LIGHT} strokeWidth="4" strokeLinecap="round" />
      <circle cx="96" cy="330" r="5" fill={BLUE_LIGHT} />

      {/* Gears, tucked behind the window's top-right corner */}
      <Gear cx={372} cy={100} r={34} teeth={8} className="uc-gear" />
      <Gear cx={418} cy={152} r={18} teeth={6} className="uc-gear uc-gear--reverse" />

      {/* Browser window */}
      <rect x="90" y="95" width="280" height="200" rx="16" fill="#fff" stroke={BLUE_LIGHT} strokeWidth="2" />
      <path d="M106 96h248a15 15 0 0 1 15 15v18H91v-18a15 15 0 0 1 15-15z" fill={BLUE_TINT} />
      <circle cx="112" cy="112" r="5" fill={BLUE} />
      <circle cx="128" cy="112" r="5" fill={BLUE_LIGHT} />
      <circle cx="144" cy="112" r="5" fill={BLUE_LIGHT} />
      <rect x="165" y="104" width="180" height="16" rx="8" fill="#fff" />

      {/* Page content: a medical-cross hero and placeholder text */}
      <rect x="110" y="148" width="110" height="74" rx="10" fill={BLUE_LIGHT} />
      <rect x="157" y="167" width="16" height="36" rx="3" fill="#fff" />
      <rect x="147" y="177" width="36" height="16" rx="3" fill="#fff" />
      <rect x="236" y="152" width="112" height="10" rx="5" fill={BLUE} />
      <rect x="236" y="172" width="90" height="8" rx="4" fill={BLUE_LIGHT} />
      <rect x="236" y="188" width="100" height="8" rx="4" fill={BLUE_LIGHT} />
      <rect x="236" y="206" width="56" height="16" rx="8" fill={BLUE} />
      <rect x="110" y="240" width="76" height="36" rx="8" fill={BLUE_TINT} />
      <rect x="192" y="240" width="76" height="36" rx="8" fill={BLUE_TINT} />
      <rect x="274" y="240" width="76" height="36" rx="8" fill={BLUE_TINT} />

      {/* Ground */}
      <rect x="60" y="368" width="380" height="3" rx="1.5" fill={BLUE_LIGHT} />

      {/* Barrier */}
      <rect x="120" y="300" width="10" height="62" fill={BLUE_DARK} />
      <rect x="330" y="300" width="10" height="62" fill={BLUE_DARK} />
      <rect x="108" y="360" width="34" height="8" rx="3" fill={BLUE_DARK} />
      <rect x="318" y="360" width="34" height="8" rx="3" fill={BLUE_DARK} />
      <rect x="100" y="290" width="260" height="34" rx="6" fill={BLUE} />
      <rect x="100" y="290" width="260" height="34" rx="6" fill="url(#uc-stripes)" />

      {/* Cone */}
      <polygon points="380,364 410,364 400,300 390,300" fill={BLUE} />
      <polygon points="383.75,340 406.25,340 403.9,325 386.1,325" fill="#fff" />
      <rect x="372" y="362" width="46" height="8" rx="3" fill={BLUE_DARK} />
    </svg>
  );
}
