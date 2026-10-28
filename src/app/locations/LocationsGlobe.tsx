'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from 'react';

/**
 * LocationsGlobe.tsx
 * ─────────────────────────────────────────────
 * The Getmeds branches globe on /locations: every branch city plotted on a
 * draggable 3D globe, each one tied by an animated route line back to the
 * Manila headquarters.
 *
 * d3 and topojson-client are loaded from a CDN at runtime rather than
 * bundled — this is the only page that needs them, and together they would
 * add ~300KB to a bundle every other page pays for. The world shapes
 * (Natural Earth via world-atlas) come from the same CDN.
 *
 * The drawing code runs outside React on purpose: d3 owns the SVG it draws
 * into, and letting React reconcile what d3 is mutating every animation
 * frame would fight it. React renders the static shell once; the effect
 * hands the three mount points to d3 and cleans up on unmount.
 */

// ─── Data: edit these. ───────────────────────────────────────────────────────
// `id` is the country's ISO 3166-1 numeric code as a 3-digit string (it
// matches the world-atlas map); `c` is [longitude, latitude] of the city.
// A branch that is a whole region rather than one country (Latin America)
// carries a made-up id — nothing on the map matches it, so clicking its row
// flies to the pin instead of zooming a single country.
// `flag` is the ISO alpha-2 code flagcdn.com serves the flag image by; empty
// for a region with no single flag, which falls back to the globe icon.
const BRANCHES = [
  { name: 'India',              country: 'Mumbai',         id: '356',   flag: 'in', c: [72.88, 19.08],   role: 'Branch office',    meta: 'South Asia' },
  { name: 'Pakistan',           country: 'Karachi',        id: '586',   flag: 'pk', c: [67.01, 24.86],   role: 'Branch office',    meta: 'South Asia' },
  { name: 'Thailand',           country: 'Bangkok',        id: '764',   flag: 'th', c: [100.5, 13.76],   role: 'Branch office',    meta: 'Southeast Asia' },
  { name: 'Vietnam',            country: 'Ho Chi Minh City', id: '704', flag: 'vn', c: [106.63, 10.82],  role: 'Branch office',    meta: 'Southeast Asia' },
  { name: 'Singapore',          country: '',               id: '702',   flag: 'sg', c: [103.82, 1.35],   role: 'Branch office',    meta: 'Southeast Asia' },
  { name: 'Vanuatu',            country: 'Port Vila',      id: '548',   flag: 'vu', c: [168.32, -17.73], role: 'Branch office',    meta: 'Oceania' },
  { name: 'Zambia',             country: 'Lusaka',         id: '894',   flag: 'zm', c: [28.28, -15.41],  role: 'Branch office',    meta: 'Africa' },
  { name: 'St. Kitts and Nevis', country: 'Basseterre',    id: '659',   flag: 'kn', c: [-62.72, 17.3],   role: 'Branch office',    meta: 'Caribbean' },
  { name: 'Latin America',      country: '',               id: 'latam', flag: 'us', c: [-74.07, 4.71],   role: 'Regional network', meta: 'Latin America' },
];
const HOME = {
  name: 'Manila',
  country: 'Philippines',
  id: '608',
  flag: 'ph',
  c: [120.98, 14.6],
  note: 'Headquarters · every branch connects here',
  tip: 'Getmeds Headquarters',
};

// Clicking the Manila row opens the office itself, not a zoom of the
// Philippines — the one branch a visitor can actually walk into.
const HOME_ADDRESS =
  'Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747';
const HOME_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOME_ADDRESS)}`;

/** Flag emojis render as bare letter codes on Windows, so images it is.
    w80 is double the 30px circle, for sharp rendering on retina screens. */
const flagImg = (flag: string) => `<img src="https://flagcdn.com/w80/${flag}.png" alt="" loading="lazy">`;

// Countries shaded on the globe as part of a regional network, beyond the
// branch pins themselves: all of Southeast Asia, and Latin America.
const REGIONS: Record<string, string[]> = {
  'Southeast Asia': [
    '096', // Brunei
    '116', // Cambodia
    '360', // Indonesia
    '418', // Laos
    '458', // Malaysia
    '104', // Myanmar
    '702', // Singapore
    '764', // Thailand
    '626', // Timor-Leste
    '704', // Vietnam
  ],
  'Latin America': [
    '484', // Mexico
    '320', // Guatemala
    '084', // Belize
    '340', // Honduras
    '222', // El Salvador
    '558', // Nicaragua
    '188', // Costa Rica
    '591', // Panama
    '170', // Colombia
    '862', // Venezuela
    '218', // Ecuador
    '604', // Peru
    '068', // Bolivia
    '076', // Brazil
    '600', // Paraguay
    '858', // Uruguay
    '032', // Argentina
    '152', // Chile
    '192', // Cuba
    '214', // Dominican Republic
    '332', // Haiti
  ],
};
const REGION = new Map<string, string>();
for (const [label, ids] of Object.entries(REGIONS)) ids.forEach((id) => REGION.set(id, label));

const D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
const TOPOJSON_URL = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js';
const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const START_ROTATION = [-112, -14]; // [-longitude, -latitude] the globe faces first
const SPIN_SPEED = 0.12;            // degrees per frame
const MAX_ZOOM = 10;

/** Loads a script once; a second call for the same src resolves on the first tag. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = '1';
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

/**
 * All the d3 drawing. Returns a cleanup that stops the spin timer and removes
 * the body-mounted tooltip — the two things that would outlive the component.
 */
function initGlobe(el: HTMLElement, listEl: HTMLElement, spinBtn: HTMLButtonElement): () => void {
  const d3 = (window as any).d3;
  const topojson = (window as any).topojson;
  const cleanups: Array<() => void> = [];
  let disposed = false;
  cleanups.push(() => {
    disposed = true;
  });

  if (!d3 || !topojson) {
    el.innerHTML =
      '<div class="sg-loading">The map library couldn\'t load. Check the internet connection, then reload.</div>';
    return () => {};
  }

  const SUP = new Map(BRANCHES.map((s) => [s.id, s]));
  const tip = document.body.appendChild(
    Object.assign(document.createElement('div'), { className: 'sg-tip' })
  );
  cleanups.push(() => tip.remove());
  const showTip = (e: PointerEvent, html: string) => {
    tip.innerHTML = html;
    tip.style.left = e.clientX + 'px';
    tip.style.top = e.clientY + 'px';
    tip.classList.add('show');
  };
  const hideTip = () => tip.classList.remove('show');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  d3.json(WORLD_URL)
    .then((world: any) => {
      if (!disposed) draw(world);
    })
    .catch(() => {
      if (disposed) return;
      el.innerHTML =
        '<div class="sg-loading">The map data couldn\'t load. Check the internet connection, then reload.</div>';
    });

  function draw(world: any) {
    el.innerHTML = '';
    const S = 500,
      R = S / 2 - 12;
    const proj = d3.geoOrthographic().scale(R).translate([S / 2, S / 2]).rotate(START_ROTATION).precision(0.4);
    const path = d3.geoPath(proj);
    const svg = d3
      .select(el)
      .append('svg')
      .attr('viewBox', [0, 0, S, S])
      .attr('role', 'img')
      .attr('aria-label', `Globe with Getmeds branches connected to ${HOME.name}. Click a country to zoom in.`);

    // Ocean with a soft light-to-blue shade
    const grad = svg.append('defs').append('radialGradient').attr('id', 'sg-ocean-g').attr('cx', '36%').attr('cy', '30%');
    grad.append('stop').attr('offset', '0%').style('stop-color', 'var(--sg-canvas)');
    grad.append('stop').attr('offset', '100%').style('stop-color', 'var(--sg-p-100)');
    const ocean = svg
      .append('circle')
      .attr('class', 'sg-ocean')
      .attr('cx', S / 2)
      .attr('cy', S / 2)
      .attr('r', R)
      .attr('fill', 'url(#sg-ocean-g)')
      .on('click', () => {
        if (active) reset();
      });
    const grat = svg.append('path').attr('class', 'sg-grat').datum(d3.geoGraticule10());

    // Countries
    let active: any = null;
    const land = svg
      .append('g')
      .selectAll('path')
      .data(topojson.feature(world, world.objects.countries).features)
      .join('path')
      .attr('class', (d: any) =>
        'sg-land' + (d.id === HOME.id ? ' home' : SUP.has(d.id) || REGION.has(d.id) ? ' sup' : '')
      )
      .on('pointermove', (e: PointerEvent, d: any) => {
        const s = SUP.get(d.id);
        const region = REGION.get(d.id);
        showTip(
          e,
          `<b>${d.properties.name}</b>${
            d.id === HOME.id
              ? 'Getmeds Headquarters · click for address'
              : s
                ? `Getmeds ${s.role.toLowerCase()}`
                : region
                  ? `Part of our ${region} network`
                  : 'No Getmeds branch'
          } · ${d.id === HOME.id ? 'click to open Google Maps' : active === d ? 'click to zoom out' : 'click to zoom in'}`
        );
      })
      .on('pointerleave', hideTip)
      .on('click', (e: PointerEvent, d: any) => {
        e.stopPropagation();
        hideTip();
        if (d.id === HOME.id) {
          window.open(HOME_MAPS_URL, '_blank', 'noopener');
          return;
        }
        if (active === d) reset();
        else zoomTo(d);
      });

    // Routes and cities — every branch arcs back to Manila
    const arcs = svg
      .append('g')
      .selectAll('path')
      .data(BRANCHES.map((s) => ({ type: 'LineString', coordinates: [s.c, HOME.c] })))
      .join('path')
      .attr('class', 'sg-arc');
    const places: any[] = [...BRANCHES, { ...HOME, home: true }];
    const pts = svg.append('g').selectAll('g').data(places).join('g').style('cursor', 'pointer');
    pts.filter((d: any) => d.home).append('circle').attr('class', 'sg-pulse').attr('r', 10);
    pts
      .append('circle')
      .attr('class', (d: any) => 'sg-dot' + (d.home ? ' home' : ''))
      .attr('r', (d: any) => (d.home ? 6 : 4.5));
    // The Getmeds mark sits above each country's name, the way the printed
    // market-presence map draws its pins. Small, but legible at globe scale.
    pts
      .append('image')
      .attr('class', 'sg-pinlogo')
      .attr('href', '/assets/getmeds-logo-sm.png')
      .attr('x', 9)
      .attr('y', -22)
      .attr('width', 32)
      .attr('height', 18);
    pts.append('text').attr('class', 'sg-label').attr('x', 9).attr('y', 4).text((d: any) => d.name);

    pts
      .on('pointermove', (e: PointerEvent, d: any) =>
        showTip(
          e,
          d.home
            ? `<b>${d.name}</b>${d.tip} · click to open Google Maps`
            : `<b>${d.name}</b>${[d.country, d.role, d.meta].filter(Boolean).join(' · ')}`
        )
      )
      .on('pointerleave', hideTip)
      .on('click', (e: PointerEvent, d: any) => {
        e.stopPropagation();
        hideTip();
        if (d.home) {
          window.open(HOME_MAPS_URL, '_blank', 'noopener');
        } else {
          const country = land.data().find((f: any) => f.id === d.id);
          if (country) zoomTo(country);
          else flyTo(d.c);
        }
      });

    // Line under the globe
    const info = document.createElement('div');
    info.className = 'sg-info';
    info.innerHTML =
      '<span>Click a country to zoom in.</span><button class="sg-btn quiet" type="button"><svg><use href="#sg-i-refresh"/></svg>Whole globe</button>';
    el.appendChild(info);
    const infoText = info.firstChild as HTMLElement;
    (info.lastChild as HTMLElement).addEventListener('click', () => reset());

    function render() {
      ocean.attr('r', proj.scale());
      grat.attr('d', path);
      land.attr('d', path);
      arcs.attr('d', path);
      const r = proj.rotate(),
        center = [-r[0], -r[1]];
      pts
        .attr('transform', (d: any) => `translate(${proj(d.c)})`)
        .attr('display', (d: any) => (d3.geoDistance(d.c, center) < 1.5 ? null : 'none')); // hide cities on the far side
      el.classList.toggle('zoomed', proj.scale() > R * 1.05);
    }
    render();

    // Spin. Zooming to a country pauses it; coming back to the whole globe
    // resumes it on its own. Only the Pause button remembers a deliberate
    // pause (userPaused), so reset() never overrides the person's choice.
    let spinning = !reduce,
      userPaused = false,
      dragging = false;
    const setSpin = () => {
      spinBtn.textContent = spinning ? 'Pause spin' : 'Spin';
      spinBtn.setAttribute('aria-pressed', String(spinning));
    };
    spinBtn.addEventListener('click', () => {
      spinning = !spinning;
      userPaused = !spinning;
      if (spinning && active) reset();
      setSpin();
    });
    setSpin();
    const timer = d3.timer(() => {
      if (!spinning || dragging || document.hidden) return;
      const r = proj.rotate();
      proj.rotate([r[0] + SPIN_SPEED, r[1], r[2]]);
      render();
    });
    cleanups.push(() => timer.stop());

    // Drag to turn (finer when zoomed in)
    svg.call(
      d3
        .drag()
        .on('start', () => {
          dragging = true;
          svg.interrupt();
          hideTip();
        })
        .on('drag', (e: any) => {
          const r = proj.rotate(),
            k = (0.3 * R) / proj.scale();
          proj.rotate([r[0] + e.dx * k, Math.max(-85, Math.min(85, r[1] - e.dy * k)), r[2]]);
          render();
        })
        .on('end', () => {
          dragging = false;
        })
    );

    // Turn and zoom together; a far jump pulls back a little mid-flight
    function animate(toRot: number[] | null, toScale: number, dur = 1200) {
      const r0 = proj.rotate(),
        s0 = proj.scale(),
        rot = toRot ? [...toRot] : [...r0];
      while (rot[0] - r0[0] > 180) rot[0] -= 360;
      while (rot[0] - r0[0] < -180) rot[0] += 360;
      const far = d3.geoDistance([-r0[0], -r0[1]], [-rot[0], -rot[1]]) > 0.6;
      const ir = d3.interpolate(r0, rot),
        is = d3.interpolate(s0, toScale);
      svg
        .interrupt()
        .transition()
        .duration(reduce ? 0 : dur)
        .ease(d3.easeCubicInOut)
        .tween('view', () => (t: number) => {
          proj.rotate(ir(t));
          proj.scale(Math.max(R * 0.85, is(t) * (far ? 1 - 0.45 * Math.sin(Math.PI * t) : 1)));
          render();
        });
    }

    function zoomTo(d: any) {
      spinning = false;
      setSpin();
      active = d;
      land.classed('active', (x: any) => x === d);
      const [[w, s], [e, n]] = d3.geoBounds(d),
        dLon = e >= w ? e - w : e - w + 360,
        dLat = n - s;
      const span = Math.max(dLon * Math.cos((((s + n) / 2) * Math.PI) / 180), dLat, 1);
      const k = Math.max(1, Math.min(MAX_ZOOM, 110 / span));
      const [cx, cy] = d3.geoCentroid(d);
      animate([-cx, -cy, 0], R * k);
      const sup = SUP.get(d.id);
      const region = REGION.get(d.id);
      infoText.innerHTML =
        `<b>${d.properties.name}</b> · ` +
        (d.id === HOME.id
          ? `Headquarters · every branch connects to ${HOME.name}`
          : sup
            ? `${sup.role}${sup.country ? ` in ${sup.country}` : ''} · ${sup.meta}`
            : region
              ? `Part of our ${region} network · connected to ${HOME.name}`
              : 'No Getmeds branch here yet');
      markList(d.id);
    }

    function reset() {
      active = null;
      land.classed('active', false);
      animate(null, R, 900);
      infoText.textContent = 'Click a country to zoom in.';
      markList(null);
      // Back at the whole globe: pick the spin back up, unless the person
      // paused it themselves or asked the OS for less motion.
      spinning = !reduce && !userPaused;
      setSpin();
    }

    const flyTo = (c: number[]) => {
      spinning = false;
      setSpin();
      active = null;
      land.classed('active', false);
      animate([-c[0], -c[1] * 0.75, 0], R * 1.6, 1300);
    };

    // + / − / reset
    const tools = document.createElement('div');
    tools.className = 'sg-tools';
    tools.innerHTML =
      '<button class="sg-icon-btn" type="button" aria-label="Zoom in">+</button><button class="sg-icon-btn" type="button" aria-label="Zoom out">−</button><button class="sg-icon-btn" type="button" aria-label="Whole globe"><svg><use href="#sg-i-refresh"/></svg></button>';
    const [zin, zout, zreset] = Array.from(tools.children) as HTMLButtonElement[];
    zin.onclick = () => {
      spinning = false;
      setSpin();
      animate(null, Math.min(R * MAX_ZOOM, proj.scale() * 1.6), 450);
    };
    zout.onclick = () => animate(null, Math.max(R, proj.scale() / 1.6), 450);
    zreset.onclick = () => reset();
    el.appendChild(tools);

    // Branch buttons
    // Manila leads: it is the headquarters every other row points back to.
    listEl.innerHTML = [
      `<li data-home data-id="${HOME.id}" tabindex="0" role="button" aria-label="Zoom to ${HOME.name}, ${HOME.country}">
          <span class="sg-ico home">${flagImg(HOME.flag)}</span>
          <div class="sg-grow"><b>${HOME.name}, ${HOME.country}</b><span class="sg-meta">${HOME.note}</span></div>
          <svg class="sg-chev"><use href="#sg-i-right"/></svg></li>`,
      ...BRANCHES.map(
        (s, i) => `<li data-i="${i}" data-id="${s.id}" tabindex="0" role="button" aria-label="Zoom to ${s.name}">
          <span class="sg-ico">${s.flag ? flagImg(s.flag) : '<svg><use href="#sg-i-globe"/></svg>'}</span>
          <div class="sg-grow"><b>${s.name}</b><span class="sg-meta">${[s.country, s.role, s.meta].filter(Boolean).join(' · ')}</span></div>
          <svg class="sg-chev"><use href="#sg-i-right"/></svg></li>`
      ),
    ].join('');
    function markList(id: string | null) {
      listEl.querySelectorAll('li').forEach((li) => li.classList.toggle('on', !!id && li.dataset.id === id));
    }
    listEl.querySelectorAll('li').forEach((li) => {
      const go = () => {
        if (li.hasAttribute('data-home')) {
          window.open(HOME_MAPS_URL, '_blank', 'noopener');
          return;
        }
        const s = BRANCHES[Number(li.dataset.i)];
        const country = land.data().find((f: any) => f.id === s.id);
        if (country) zoomTo(country);
        else {
          // too small for the map (e.g. Singapore): fly to the city instead
          flyTo(s.c);
          markList(s.id);
        }
      };
      li.addEventListener('click', go);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  }

  return () => cleanups.forEach((fn) => fn());
}

export default function LocationsGlobe() {
  const globeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const spinRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;
    (async () => {
      try {
        await loadScript(D3_URL);
        await loadScript(TOPOJSON_URL);
      } catch {
        if (!disposed && globeRef.current) {
          globeRef.current.innerHTML =
            '<div class="sg-loading">The map library couldn\'t load. Check the internet connection, then reload.</div>';
        }
        return;
      }
      if (disposed || !globeRef.current || !listRef.current || !spinRef.current) return;
      cleanup = initGlobe(globeRef.current, listRef.current, spinRef.current);
    })();
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <>
      {/* Icons used by the globe (keep once per page) */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="sg-i-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z" />
          </symbol>
          <symbol id="sg-i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
          </symbol>
          <symbol id="sg-i-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </symbol>
          <symbol id="sg-i-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />
          </symbol>
        </defs>
      </svg>

      <section className="sg" id="supplier-globe">
        <div className="sg-head">
          <h2>Our Locations</h2>
          <p>
            Getmeds branches across the world — drag to spin the globe, click a country to zoom in, or pick a
            branch to fly there. Every branch connects back to Manila, Philippines.
          </p>
        </div>
        <div className="sg-grid">
          <div className="sg-box">
            <div className="sg-map" ref={globeRef}>
              <div className="sg-loading">Loading the globe…</div>
            </div>
          </div>
          <div>
            <div className="sg-side-head">
              <div>
                <h3>Our branches</h3>
                <p>From South Asia to the Pacific and Latin America, all connected to Manila</p>
              </div>
              <button className="sg-btn" ref={spinRef} type="button" aria-pressed="true">
                Pause spin
              </button>
            </div>
            <ul className="sg-list" ref={listRef}></ul>
            <p className="sg-note">
              Highlighted countries are part of our Southeast Asia and Latin America networks.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
