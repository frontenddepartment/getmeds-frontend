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

const slugify = (text: string | undefined | null) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
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

      const params = new URLSearchParams(window.location.search);
      const currentTitle = params.get('title');
      const expectedTitle = slugify(article.title);
      if (currentTitle !== expectedTitle) {
        params.set('title', expectedTitle);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
      }
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

  // Extract headings (h2/h3) and prepare HTML with scroll IDs and layout styles
  const parsedHeadingsAndHtml = useMemo(() => {
    if (!article) return { headings: [], processedHtml: '' };

    if (article.content && article.content.length > 0) {
      const hList = (article.content as any[])
        .filter(b => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
        .map((b, i) => ({
          key: b._key as string,
          text: ((b.children as any[]) || []).map((c: any) => c.text).join(''),
          index: i,
          level: b.style as string,
        }));
      return { headings: hList, processedHtml: '' };
    }

    if (article.contentHtml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(article.contentHtml, 'text/html');
      
      // Parse headings (h1 to h6)
      const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hList: any[] = [];
      let headingIndex = 0;

      headingElements.forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'h1') {
          el.className = "text-lg md:text-xl font-bold mt-8 mb-4 text-gray-900 scroll-mt-8";
        } else if (tagName === 'h2') {
          el.className = "text-base font-semibold mt-8 mb-3 scroll-mt-8 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent";
        } else if (tagName === 'h3') {
          el.className = "text-sm font-semibold mt-6 mb-2 text-gray-800 scroll-mt-8";
        } else {
          el.className = "text-xs font-semibold mt-5 mb-2 text-gray-700 uppercase tracking-wider scroll-mt-8";
        }

        // Track only h2 and h3 in the sidebar table of contents
        if (tagName === 'h2' || tagName === 'h3') {
          const text = el.textContent || '';
          const key = `wp-heading-${headingIndex}`;
          
          el.setAttribute('id', `heading-${headingIndex}`);
          el.setAttribute('data-section', String(headingIndex));
          
          hList.push({
            key,
            text,
            index: headingIndex,
            level: tagName,
          });
          headingIndex++;
        }
      });

      // Paragraphs
      const pElements = doc.querySelectorAll('p');
      pElements.forEach(el => {
        el.className = "text-gray-700 text-sm leading-relaxed mb-4";
      });

      // Links
      const aElements = doc.querySelectorAll('a');
      aElements.forEach(el => {
        el.className = "text-[#1D9FDA] underline hover:text-[#61A644] transition-colors";
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      });

      // Lists
      const ulElements = doc.querySelectorAll('ul');
      ulElements.forEach(el => {
        el.className = "space-y-2 mb-4 text-sm text-gray-600 list-disc pl-5";
      });

      const olElements = doc.querySelectorAll('ol');
      olElements.forEach(el => {
        el.className = "space-y-2 mb-4 text-sm text-gray-600 list-decimal pl-5";
      });

      const liElements = doc.querySelectorAll('li');
      liElements.forEach(el => {
        el.className = "leading-relaxed text-gray-700 text-sm mb-1";
      });

      // Blockquotes
      const quoteElements = doc.querySelectorAll('blockquote');
      quoteElements.forEach(el => {
        el.className = "border-l-4 pl-4 my-5 italic text-gray-600 text-sm leading-relaxed";
        el.style.borderColor = "#1D9FDA";
      });

      // Horizontal Rules
      const hrElements = doc.querySelectorAll('hr');
      hrElements.forEach(el => {
        el.className = "my-8 border-t border-gray-100";
      });

      // Pre & Code
      const preElements = doc.querySelectorAll('pre');
      preElements.forEach(el => {
        el.className = "bg-gray-50 rounded-xl p-4 my-4 overflow-x-auto text-xs font-mono text-gray-800 border border-gray-100";
      });

      const codeElements = doc.querySelectorAll('code');
      codeElements.forEach(el => {
        if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
          el.className = "bg-gray-50 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-100/50";
        }
      });

      // Images
      const imgElements = doc.querySelectorAll('img');
      imgElements.forEach(el => {
        el.className = "max-w-full h-auto rounded-xl my-6 mx-auto block";
        el.style.height = "auto";
      });

      // Bold text
      const strongElements = doc.querySelectorAll('strong, b');
      strongElements.forEach(el => {
        el.className = "font-semibold text-gray-900";
      });

      // Align classes
      const alignedElements = doc.querySelectorAll('.aligncenter, .alignleft, .alignright');
      alignedElements.forEach(el => {
        if (el.classList.contains('aligncenter')) {
          el.classList.add('mx-auto', 'block', 'text-center');
        } else if (el.classList.contains('alignleft')) {
          el.classList.add('float-left', 'mr-4', 'mb-4');
        } else if (el.classList.contains('alignright')) {
          el.classList.add('float-right', 'ml-4', 'mb-4');
        }
      });

      return {
        headings: hList,
        processedHtml: doc.body.innerHTML
      };
    }

    return { headings: [], processedHtml: '' };
  }, [article]);

  const headings = parsedHeadingsAndHtml.headings;
  const processedContentHtml = parsedHeadingsAndHtml.processedHtml;

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
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{children}</p>
      ),
      small: ({ children }: any) => (
        <p className="text-gray-700 text-sm leading-relaxed mb-3">{children}</p>
      ),
      center: ({ children }: any) => (
        <p className="text-gray-700 text-sm leading-relaxed mb-4 text-center">{children}</p>
      ),
      right: ({ children }: any) => (
        <p className="text-gray-700 text-sm leading-relaxed mb-4 text-right">{children}</p>
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
      style={{ fontFamily: "'Poppins', sans-serif", background: '#ffffff' }}
      className="min-h-screen relative"
    >

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
            <div className="max-w-2xl mx-auto px-4 mt-6 mb-10 relative z-10">
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
                    {/* Instagram */}
                    <a
                      href={`https://www.instagram.com/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => navigator.clipboard.writeText(article.source_link)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                      title="Copy link and open Instagram"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.source_link)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: '#0077b5' }}
                      title="Share on LinkedIn"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>

                    {/* TikTok */}
                    <a
                      href={`https://www.tiktok.com/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => navigator.clipboard.writeText(article.source_link)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: '#010101' }}
                      title="Copy link and open TikTok"
                    >
                      <i className="fa-brands fa-tiktok"></i>
                    </a>
                  </div>
                </div>
              </aside>

              {/* Article body */}
              <article className="flex-1 min-w-0">

                {/* Intro paragraph */}
                {article.intro && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-8">
                    {article.intro}
                  </p>
                )}

                {/* Center image — between intro and body content */}
                {article.centerImage && (() => {
                  const centerImgUrl = urlFor(article.centerImage).width(800).url();
                  return (
                    <div className="my-8 flex justify-center">
                      <div style={{ borderRadius: '15px', overflow: 'hidden', transform: 'translateZ(0)', maxWidth: '100%' }}>
                        <img
                          src={centerImgUrl}
                          alt=""
                          style={{ width: '100%', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Body content rendering */}
                {article.content && article.content.length > 0 ? (
                  <PortableText
                    value={article.content as any}
                    components={portableTextComponents}
                  />
                ) : processedContentHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: processedContentHtml }}
                    className="prose prose-blue max-w-none text-gray-700 text-sm leading-relaxed"
                  />
                ) : null}

                {/* Source link */}
                {/* {article.source_link && (
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
                )} */}

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
