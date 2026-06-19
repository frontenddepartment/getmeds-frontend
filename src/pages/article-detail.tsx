import React, { useEffect, useMemo, useState } from 'react';
import { PortableText } from '@portabletext/react';
import { injectHTML } from '../lib/injectHTML';
import { useNewsById } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';
import type { SanityImage } from '../types/sanity';

const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const datePart = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  } catch {
    return dateStr;
  }
};

export default function ArticleDetail() {
  const [articleId, setArticleId] = useState<string>('');
  const [activeSection, setActiveSection] = useState(0);

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

    const handleScroll = () => {
      const els = document.querySelectorAll('[data-section]');
      let current = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= 120) current = i;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract h2/h3 blocks from Portable Text for the TOC
  const headings = useMemo(() => {
    if (!article?.content) return [];
    return (article.content as any[])
      .filter(b => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
      .map((b, i) => ({
        key: b._key as string,
        text: ((b.children as any[]) || []).map((c: any) => c.text).join(''),
        index: i,
        level: b.style as string,
      }));
  }, [article?.content]);

  const headingKeyToIndex = useMemo(
    () => Object.fromEntries(headings.map(h => [h.key, h.index])),
    [headings]
  );

  const scrollTo = (idx: number) => {
    const el = document.getElementById(`heading-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const portableTextComponents = useMemo(() => ({
    block: {
      normal: ({ children }: any) => (
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{children}</p>
      ),
      h2: ({ children, value }: any) => {
        const idx = headingKeyToIndex[value._key];
        return (
          <h2
            id={`heading-${idx}`}
            data-section={idx}
            className="text-base font-semibold mt-8 mb-3 scroll-mt-8 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent"
          >
            {children}
          </h2>
        );
      },
      h3: ({ children, value }: any) => {
        const idx = headingKeyToIndex[value._key];
        return (
          <h3
            id={`heading-${idx}`}
            data-section={idx}
            className="text-sm font-semibold mt-6 mb-2 text-gray-800 scroll-mt-8"
          >
            {children}
          </h3>
        );
      },
      large: ({ children }: any) => (
        <p className="text-lg text-gray-700 leading-relaxed mb-4">{children}</p>
      ),
      small: ({ children }: any) => (
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{children}</p>
      ),
      center: ({ children }: any) => (
        <p className="text-sm text-gray-700 leading-relaxed mb-4 text-center">{children}</p>
      ),
      right: ({ children }: any) => (
        <p className="text-sm text-gray-700 leading-relaxed mb-4 text-right">{children}</p>
      ),
      blockquote: ({ children }: any) => (
        <blockquote
          className="border-l-4 pl-4 my-5 italic text-gray-600 text-sm leading-relaxed"
          style={{ borderColor: '#1D9FDA' }}
        >
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className="space-y-1 mb-4 text-sm text-gray-600">{children}</ul>
      ),
      number: ({ children }: any) => (
        <ol className="list-decimal list-inside space-y-1 mb-4 text-sm text-gray-600 pl-1">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }: any) => (
        <li className="flex items-start gap-2">
          <span
            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#1D9FDA' }}
          />
          <span>{children}</span>
        </li>
      ),
      number: ({ children }: any) => (
        <li className="pl-0.5">{children}</li>
      ),
    },
    marks: {
      strong: ({ children }: any) => (
        <strong className="font-semibold">{children}</strong>
      ),
      em: ({ children }: any) => (
        <em className="italic">{children}</em>
      ),
      underline: ({ children }: any) => (
        <span className="underline">{children}</span>
      ),
      'strike-through': ({ children }: any) => (
        <span className="line-through">{children}</span>
      ),
      code: ({ children }: any) => (
        <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      ),
      link: ({ value, children }: any) => (
        <a
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1D9FDA] underline hover:text-[#61A644] transition-colors"
        >
          {children}
        </a>
      ),
    },
    types: {
      image: ({ value }: any) => {
        if (!value?.asset) return null;
        const imgSrc = urlFor(value as SanityImage).width(800).url();
        return (
          <figure className="my-6">
            <img
              src={imgSrc}
              alt=""
              className="w-full rounded-xl object-cover"
            />
          </figure>
        );
      },
    },
  }), [headingKeyToIndex]);

  const imgUrl = article?.image ? urlFor(article.image).width(1200).url() : '';

  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(160deg, #edf8ea 0%, #f0f8fd 40%, #ffffff 100%)' }}
      className="min-h-screen relative"
    >

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
            {/* Tag badge */}
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

          {/* Two-column layout */}
          <div className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
            <div className="flex gap-10">

              {/* Left sidebar: TOC + Share */}
              <aside className="hidden md:flex flex-col gap-6 w-48 flex-shrink-0 sticky top-8 self-start">

                {/* Table of contents — only when there are headings */}
                {headings.length > 0 && (
                  <div>
                    <nav className="flex flex-col gap-2">
                      {headings.map(h => (
                        <button
                          key={h.key}
                          onClick={() => scrollTo(h.index)}
                          className="text-left text-xs leading-snug transition-colors"
                          style={{
                            color: activeSection === h.index ? '#1D9FDA' : '#9ca3af',
                            borderLeft: activeSection === h.index ? '2px solid #1D9FDA' : '2px solid transparent',
                            paddingLeft: h.level === 'h3' ? '16px' : '8px',
                          }}
                        >
                          {h.text}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Share Article */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3">Share Article</p>
                  <div className="flex gap-2">
                    <a
                      href="#"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a
                      href="#"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: '#0077b5' }}
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a
                      href="#"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: '#010101' }}
                    >
                      <i className="fa-brands fa-tiktok"></i>
                    </a>
                  </div>
                </div>
              </aside>

              {/* Article body */}
              <article className="flex-1 min-w-0">

                {/* Description */}
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

                {/* Portable Text rich content */}
                {article.content && article.content.length > 0 && (
                  <PortableText
                    value={article.content as any}
                    components={portableTextComponents}
                  />
                )}

                {/* Source link */}
                {article.source_link && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Source:{' '}
                      <a
                        href={article.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1D9FDA] underline hover:text-[#61A644] transition-colors"
                      >
                        {article.source_link}
                      </a>
                    </p>
                  </div>
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
