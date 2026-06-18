import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useNewsById } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function ArticleDetail() {
  const [articleId, setArticleId] = useState<string>('');
  const [activeSection, setActiveSection] = useState(0);

  // Read the Sanity doc ID from the URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    setArticleId(id);
  }, []);

  const { data: article, loading } = useNewsById(articleId);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — Getmeds`;
    }
  }, [article]);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html')
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html')
        .then(r => r.text())
        .then(html => { injectHTML(footerContainer, html); });
    }

    // Scroll spy
    const handleScroll = () => {
      const headings = document.querySelectorAll('[data-section]');
      let current = 0;
      headings.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = i;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (idx: number) => {
    const el = document.querySelector(`[data-section="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = article?.content || [];
  const imgUrl = article?.image ? urlFor(article.image).width(1200).url() : '';

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(160deg, #edf8ea 0%, #f0f8fd 40%, #ffffff 100%)' }} className="min-h-screen relative">

      {/* Glassy sphere background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-18%', right: '-8%',
          width: '52vw', height: '52vw', maxWidth: '680px', maxHeight: '680px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.35) 0%, rgba(29,159,218,0.12) 38%, rgba(97,166,68,0.06) 65%, transparent 100%)',
          boxShadow: 'inset -22px -22px 60px rgba(29,159,218,0.05), 0 0 90px rgba(29,159,218,0.03)',
        }} />
        <div style={{
          position: 'absolute', top: '18%', right: '7%',
          width: '18vw', height: '18vw', maxWidth: '240px', maxHeight: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(97,166,68,0.22) 0%, rgba(29,159,218,0.12) 48%, rgba(29,159,218,0.05) 75%, transparent 100%)',
          boxShadow: 'inset -10px -10px 28px rgba(29,159,218,0.06), 0 0 45px rgba(97,166,68,0.04)',
        }} />
        <div style={{
          position: 'absolute', top: '42%', left: '-3%',
          width: '9vw', height: '9vw', maxWidth: '120px', maxHeight: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(29,159,218,0.20) 0%, rgba(97,166,68,0.12) 52%, rgba(97,166,68,0.04) 78%, transparent 100%)',
          boxShadow: 'inset -5px -5px 14px rgba(97,166,68,0.05), 0 0 28px rgba(29,159,218,0.03)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12%', left: '8%',
          width: '32vw', height: '32vw', maxWidth: '420px', maxHeight: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.22) 0%, rgba(97,166,68,0.10) 42%, rgba(29,159,218,0.05) 70%, transparent 100%)',
          boxShadow: 'inset -14px -14px 40px rgba(97,166,68,0.04), 0 0 65px rgba(29,159,218,0.03)',
        }} />
      </div>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Loading state */}
      {loading && (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-64 bg-gray-200 rounded-2xl mt-8" />
          </div>
        </div>
      )}

      {/* Article not found */}
      {!loading && !article && articleId && (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center relative z-10">
          <p className="text-gray-500 text-lg">Article not found.</p>
          <a href="/articles" className="mt-4 inline-block text-primary underline">Back to Articles</a>
        </div>
      )}

      {article && (
        <>
          {/* Back button */}
          <div className="max-w-3xl mx-auto px-4 pt-6 pb-2 relative z-10">
            <a
              href="/articles"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
              Back
            </a>
          </div>

          {/* Article header */}
          <div className="max-w-3xl mx-auto px-4 text-center py-4 relative z-10">
            {/* Category / tag badge */}
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 text-white"
              style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}
            >
              {article.tag}
            </span>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug mb-4">
              {article.title}
            </h1>

            {/* Date + read time */}
            <p className="text-xs text-gray-400">
              {formatDate(article.date)}
              {article.readTime && <>&nbsp;•&nbsp;{article.readTime}</>}
            </p>
          </div>

          {/* Hero image */}
          {imgUrl && (
            <div className="max-w-5xl mx-auto px-4 mt-6 mb-10 relative z-10">
              <img
                src={imgUrl}
                alt={article.title}
                className="w-full rounded-2xl object-cover"
                style={{ height: '340px' }}
              />
            </div>
          )}

          {/* Two-column content */}
          <div className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
            <div className="flex gap-10">

              {/* Left sidebar: TOC + Share */}
              {sections.length > 0 && (
                <aside className="hidden md:flex flex-col gap-6 w-48 flex-shrink-0 sticky top-8 self-start">

                  {/* Table of contents */}
                  <div>
                    <nav className="flex flex-col gap-2">
                      {sections.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => scrollTo(i)}
                          className="text-left text-xs leading-snug transition-colors"
                          style={{
                            color: activeSection === i ? '#1D9FDA' : '#9ca3af',
                            borderLeft: activeSection === i ? '2px solid #1D9FDA' : '2px solid transparent',
                            paddingLeft: '8px',
                          }}
                        >
                          {s.header}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Share Article */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-3">Share Article</p>
                    <div className="flex gap-2">
                      {/* Instagram */}
                      <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      {/* LinkedIn */}
                      <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ background: '#0077b5' }}>
                        <i className="fa-brands fa-linkedin-in"></i>
                      </a>
                      {/* TikTok */}
                      <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ background: '#010101' }}>
                        <i className="fa-brands fa-tiktok"></i>
                      </a>
                    </div>
                  </div>
                </aside>
              )}

              {/* Right: Article content */}
              <article className="flex-1 min-w-0">

                {/* Description — always shown at top */}
                {article.description && (
                  <p className="text-gray-600 text-[15px] leading-relaxed mb-6 font-medium">
                    {article.description}
                  </p>
                )}

                {/* Intro paragraph */}
                {article.intro && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-8">
                    {article.intro}
                  </p>
                )}

                {/* Sections */}
                {sections.map((s, i) => (
                  <div key={i} data-section={i} className="mb-8 scroll-mt-8">
                    {s.header && (
                      <h2 className="text-base font-semibold mb-3 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">{s.header}</h2>
                    )}
                    {s.text && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{s.text}</p>
                    )}
                    {s.bullets && s.bullets.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-500 mt-2">
                        {s.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1D9FDA' }}></span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* If no content blocks, show description as fallback */}
                {sections.length === 0 && article.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">{article.description}</p>
                )}

              </article>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
