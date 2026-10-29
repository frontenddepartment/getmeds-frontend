/* Small round country flags (simplified SVG) for the Global Presence cards. */

export type FlagCode = "ph" | "in" | "sg" | "pk" | "vn" | "kh" | "la" | "mm" | "kn" | "vu";

// five-point star centred on (cx, cy)
function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.4 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function Shapes({ code }: { code: FlagCode }) {
  switch (code) {
    case "ph":
      return (
        <>
          <rect width="60" height="30" fill="#0038A8" />
          <rect y="30" width="60" height="30" fill="#CE1126" />
          <path d="M0 0 L32 30 L0 60 Z" fill="#FFFFFF" />
          <circle cx="11" cy="30" r="5" fill="#FCD116" />
        </>
      );
    case "in":
      return (
        <>
          <rect width="60" height="20" fill="#FF9933" />
          <rect y="20" width="60" height="20" fill="#FFFFFF" />
          <rect y="40" width="60" height="20" fill="#138808" />
          <circle cx="30" cy="30" r="6.5" fill="none" stroke="#000080" strokeWidth="1.6" />
          <circle cx="30" cy="30" r="1.4" fill="#000080" />
        </>
      );
    case "sg":
      return (
        <>
          <rect width="60" height="30" fill="#EF3340" />
          <rect y="30" width="60" height="30" fill="#FFFFFF" />
          <circle cx="20" cy="15" r="8" fill="#FFFFFF" />
          <circle cx="23" cy="15" r="7" fill="#EF3340" />
          <polygon points={star(32, 15, 2.2)} fill="#FFFFFF" />
        </>
      );
    case "pk":
      return (
        <>
          <rect width="60" height="60" fill="#01411C" />
          <rect width="15" height="60" fill="#FFFFFF" />
          <circle cx="38" cy="30" r="11" fill="#FFFFFF" />
          <circle cx="41.5" cy="27" r="9.5" fill="#01411C" />
          <polygon points={star(44, 24, 4)} fill="#FFFFFF" />
        </>
      );
    case "vn":
      return (
        <>
          <rect width="60" height="60" fill="#DA251D" />
          <polygon points={star(30, 31, 13)} fill="#FFFF00" />
        </>
      );
    case "kh":
      return (
        <>
          <rect width="60" height="60" fill="#032EA1" />
          <rect y="15" width="60" height="30" fill="#E00025" />
          <path d="M20 39 H40 V36 H37 V31 L33 28 V25 L30 22 L27 25 V28 L23 31 V36 H20 Z" fill="#FFFFFF" />
        </>
      );
    case "la":
      return (
        <>
          <rect width="60" height="60" fill="#CE1126" />
          <rect y="15" width="60" height="30" fill="#002868" />
          <circle cx="30" cy="30" r="9" fill="#FFFFFF" />
        </>
      );
    case "kn":
      return (
        <>
          <path d="M0 0 H60 L0 60 Z" fill="#009E49" />
          <path d="M60 0 V60 H0 Z" fill="#CE1126" />
          <path d="M0 50 L50 0 H60 V10 L10 60 H0 Z" fill="#FCD116" />
          <path d="M-2 54 L54 -2 L62 6 L6 62 Z" fill="#000000" />
          <polygon points={star(22, 38, 4.5)} fill="#FFFFFF" />
          <polygon points={star(38, 22, 4.5)} fill="#FFFFFF" />
        </>
      );
    case "vu":
      return (
        <>
          <rect width="60" height="30" fill="#D21034" />
          <rect y="30" width="60" height="30" fill="#009543" />
          <path d="M0 0 L30 30 L0 60 Z" fill="#000000" />
          <path d="M0 3 L27 30 L0 57 M27 30 H60" fill="none" stroke="#FDCE12" strokeWidth="3" />
          <circle cx="10" cy="30" r="5" fill="none" stroke="#FDCE12" strokeWidth="2" />
        </>
      );
    case "mm":
      return (
        <>
          <rect width="60" height="20" fill="#FECB00" />
          <rect y="20" width="60" height="20" fill="#34B233" />
          <rect y="40" width="60" height="20" fill="#EA2839" />
          <polygon points={star(30, 32, 16)} fill="#FFFFFF" />
        </>
      );
  }
}

export default function CountryFlag({ code, className = "" }: { code: FlagCode; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden rounded-full ring-1 ring-gray-200 ${className}`} aria-hidden>
      <svg viewBox="0 0 60 60" className="h-full w-full">
        <Shapes code={code} />
      </svg>
    </span>
  );
}
