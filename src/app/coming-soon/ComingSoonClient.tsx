'use client';

import React, { useEffect, useState } from 'react';
import { comingSoonCopy as copy, findComingSoonSite } from '@/lib/comingSoonData';
import { UnderConstructionArt } from '@/lib/UnderConstructionArt';

/**
 * Placeholder for Global Network sites that are not live yet, reached from the
 * navbar as /coming-soon?site=<slug>. Standalone — coming-soon.html loads no
 * navbar or footer — so the only way onward is the Return Home button.
 */
const ComingSoon: React.FC = () => {
  // Read after mount (the original read it during render, in a client-only app).
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('site') ?? '');
  }, []);
  const site = slug === null ? undefined : findComingSoonSite(slug);

  useEffect(() => {
    if (slug === null) return;
    if (!site) {
      window.location.replace('/404');
      return;
    }
    // One HTML file serves every site, so the served <title> is generic.
    document.title = `${site.name} — Coming Soon | Getmeds`;
  }, [site, slug]);

  if (!site) return null;

  return (
    <main className="uc-section">
      <div className="wrap uc-grid">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="uc-title">
            {site.name} {copy.headingSuffix}
          </h1>
          <p className="uc-line">{copy.line}</p>

          <a href="/" className="btn btn-primary">
            {copy.ctaHome}
          </a>
        </div>

        <UnderConstructionArt className="uc-art" />
      </div>
    </main>
  );
};

export default ComingSoon;
