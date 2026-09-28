import React from 'react';

/**
 * ProfileCard.tsx
 * ─────────────────────────────────────────────
 * The top of the app's account screen: a sky cover, the customer's picture
 * inside a progress ring, their name, three numbers, and three shortcuts.
 *
 * The ring shows how complete the saved details are. Those details fill in
 * every inquiry form, so a full ring means a request is a few taps; that is
 * the one "progress" on this screen that is real and in the customer's hands.
 *
 * App only; account.tsx keeps the plain identity row for the website.
 */

const BRAND = '#1D9FDA';

export interface ProfileStat {
  label: string;
  value: string;
  onClick?: () => void;
}

export interface ProfileAction {
  icon: string;
  label: string;
  onClick: () => void;
  tone?: 'danger';
}

interface Props {
  name: string;
  subtitle: string;
  avatar?: string;
  /** 0 to 100: share of the saved details that are filled in. */
  completeness: number;
  onEdit: () => void;
  stats: ProfileStat[];
  actions: ProfileAction[];
}

const RING = 108;
const STROKE = 4;

function Ring({ pct }: { pct: number }) {
  const r = (RING - STROKE) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} className="absolute inset-0 -rotate-90" aria-hidden="true">
      <defs>
        <linearGradient id="profile-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1D9FDA" />
          <stop offset="100%" stopColor="#61A644" />
        </linearGradient>
      </defs>
      <circle cx={RING / 2} cy={RING / 2} r={r} fill="none" stroke="#E7ECF2" strokeWidth={STROKE} />
      {/* Round caps would leave a dot at 0%, so draw nothing until there is progress. */}
      {pct > 0 && <circle
        cx={RING / 2}
        cy={RING / 2}
        r={r}
        fill="none"
        stroke="url(#profile-ring)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        style={{ transition: 'stroke-dasharray .6s ease' }}
      />}
    </svg>
  );
}

export default function ProfileCard({ name, subtitle, avatar, completeness, onEdit, stats, actions }: Props) {
  const initial = (name || 'G').charAt(0).toUpperCase();
  const pct = Math.max(0, Math.min(100, Math.round(completeness)));

  return (
    <section
      className="mb-5 rounded-[28px] border border-[#EEF1F5] bg-white p-2 pb-3"
      style={{ boxShadow: '0 10px 30px rgba(23,43,77,.07)' }}
      aria-label="Your profile"
    >
      {/* Cover: a soft sky, drawn in CSS so it costs no download. */}
      <div
        className="relative h-[112px] overflow-hidden rounded-[22px]"
        style={{
          background:
            'radial-gradient(60% 55% at 30% 70%, rgba(255,255,255,.85), transparent 70%),' +
            'radial-gradient(45% 45% at 62% 45%, rgba(255,255,255,.7), transparent 70%),' +
            'radial-gradient(40% 40% at 88% 80%, rgba(255,255,255,.55), transparent 70%),' +
            'linear-gradient(180deg,#BFD9EE 0%,#D8E8F4 60%,#E6EFF6 100%)',
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit profile"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 backdrop-blur"
          style={{ boxShadow: '0 2px 8px rgba(23,43,77,.12)' }}
        >
          <i className="fa-solid fa-pen text-[13px]" />
        </button>
      </div>

      {/* Picture inside the completeness ring, overlapping the cover. */}
      <div className="-mt-[62px] flex flex-col items-center">
        <div className="relative rounded-full bg-white p-[3px]" style={{ width: RING + 6, height: RING + 6 }}>
          <div className="relative" style={{ width: RING, height: RING }}>
            <Ring pct={pct} />
            <span
              className="absolute inset-[8px] flex items-center justify-center overflow-hidden rounded-full text-[32px] font-bold text-white"
              style={{ background: BRAND }}
            >
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initial}
            </span>
          </div>
        </div>
        <button type="button" onClick={onEdit} className="mt-1.5 text-[11.5px] font-medium text-gray-400">
          {pct >= 100 ? 'Profile complete' : `Profile ${pct}% complete · Finish it`}
        </button>
      </div>

      <div className="mt-2 px-4 text-center">
        <h1 className="truncate text-[21px] font-semibold text-gray-900">{name || 'Guest'}</h1>
        <p className="mx-auto mt-1 max-w-[280px] text-[13px] leading-relaxed text-gray-500">{subtitle}</p>
      </div>

      {/* Numbers, in an inset panel. */}
      <div
        className="mx-2 mt-4 grid grid-cols-3 rounded-[20px] border border-[#EEF1F5] bg-[#F7F9FC] py-3.5"
        style={{ boxShadow: 'inset 0 1px 2px rgba(23,43,77,.04)' }}
      >
        {stats.map((s) => {
          const body = (
            <>
              <span className="block text-[18px] font-semibold tabular-nums text-gray-900">{s.value}</span>
              <span className="mt-0.5 block text-[12px] text-gray-500">{s.label}</span>
            </>
          );
          return s.onClick ? (
            <button key={s.label} type="button" onClick={s.onClick} className="text-center">
              {body}
            </button>
          ) : (
            <div key={s.label} className="text-center">
              {body}
            </div>
          );
        })}
      </div>

      {/* Shortcuts. */}
      <div className="mt-3 flex justify-center gap-6">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 ${a.tone === 'danger' ? 'text-red-400' : 'text-gray-600'}`}
          >
            <i className={`fa-solid ${a.icon} text-[16px]`} aria-hidden="true" />
            <span className="text-[11px] font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
