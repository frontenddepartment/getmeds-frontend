import React, { useEffect, useState, useRef, useCallback } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useNewsPaginated } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

export default function Blog() {
  const { articles, loading, loadingMore, hasMore, loadMore } = useNewsPaginated(20);

  // Infinite scroll: observe a sentinel element at the bottom of the list
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && !loading) {
      loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '400px', // Start loading 400px before the user reaches the bottom
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

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
  }, []);

  const featured = articles && articles.length > 0 ? articles[0] : null;
  const latestPosts = articles && articles.length > 1 ? articles.slice(1, 5) : [];
  const cardArticles = articles && articles.length > 1 ? articles.slice(1) : [];

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-900 min-h-screen">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ===== TOP: FEATURED + LATEST ===== */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-12">
            <div className="bg-gray-100 rounded-2xl animate-pulse" style={{ minHeight: '420px' }} />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(n => <div key={n} className="flex gap-3"><div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" /><div className="flex-1 bg-gray-100 rounded-xl animate-pulse h-16" /></div>)}
            </div>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gray-50/40 rounded-3xl border border-gray-100 max-w-2xl mx-auto my-12" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.01)' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(97, 166, 68, 0.08), rgba(29, 159, 218, 0.08))' }}>
              <i className="fa-regular fa-newspaper text-3xl" style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts published yet</h3>
            <p className="text-gray-500 text-xs max-w-sm leading-relaxed">
              We are working on bringing you the latest stories, news, and updates. Please check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-12">

              {/* Left: Featured card */}
              {featured && (
                <a
                  href={`/blog/${featured.slug || slugify(featured.title)}`}
                  className="relative rounded-2xl overflow-hidden block group no-underline"
                  style={{ minHeight: '420px' }}
                >
                  <img
                    src={featured.image ? urlFor(featured.image).width(900).url() : ''}
                    alt={featured.title}
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }} />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                        {featured.tag || 'Blog'}
                      </span>
                    </div>
                    <h2 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">{featured.title}</h2>
                    <p className="text-white/60 text-xs">
                      {formatDate(featured.date)}{featured.readTime && ` • ${featured.readTime}`}
                    </p>
                  </div>
                </a>
              )}

              {/* Right: Latest post list */}
              <div>
                <h2 className="font-semibold text-[22px] mb-5 text-gray-900">Latest post</h2>
                <div className="space-y-5">
                  {latestPosts.map(article => (
                    <a
                      key={article._id}
                      href={`/blog/${article.slug || slugify(article.title)}`}
                      className="flex gap-3 group no-underline"
                    >
                      <img
                        src={article.image ? urlFor(article.image).width(200).url() : ''}
                        alt={article.title}
                        loading="lazy"
                        className="w-[70px] h-[70px] rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-semibold text-[13px] leading-snug mb-1 group-hover:text-[#1D9FDA] transition-colors line-clamp-3">
                          {article.title}
                        </h3>
                        <p className="text-gray-400 text-[11px]">
                          {formatDate(article.date)}{article.readTime && ` • ${article.readTime}`}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== BOTTOM: INFINITE SCROLL CARD GRID ===== */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-[22px] text-gray-900">Recent blog posts</h2>
                {/* <span className="text-xs text-gray-400 font-medium">
                  {cardArticles.length} posts loaded{hasMore ? ' • Scroll for more' : ' • All posts loaded'}
                </span> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cardArticles.map(article => {
                  const imgUrl = article.image
                    ? urlFor(article.image).width(600).url()
                    : '';
                  return (
                    <a
                      key={article._id}
                      href={`/blog/${article.slug || slugify(article.title)}`}
                      className="block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow no-underline group"
                      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                    >
                      <div className="overflow-hidden" style={{ height: '200px' }}>
                        <img
                          src={imgUrl}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}></span>
                          <span className="text-[11px] font-semibold bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">{article.tag || 'Blog'}</span>
                        </div>
                        <h3 className="text-gray-900 font-semibold text-[14px] leading-snug mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-gray-500 text-[12px] leading-relaxed line-clamp-2 mb-3">{article.description}</p>
                        <p className="text-gray-400 text-[11px]">
                          {formatDate(article.date)}{article.readTime && ` • ${article.readTime}`}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex justify-center py-10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1D9FDA] rounded-full animate-spin" />
                    <span className="text-sm text-gray-400 font-medium">Loading more posts…</span>
                  </div>
                </div>
              )}

              {/* All posts loaded message */}
              {!hasMore && cardArticles.length > 0 && (
                <div className="flex justify-center py-10">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-8 h-px bg-gray-200" />
                    <span>You've reached the end • {articles.length} posts total</span>
                    <div className="w-8 h-px bg-gray-200" />
                  </div>
                </div>
              )}

              {/* Invisible sentinel for IntersectionObserver */}
              <div ref={sentinelRef} className="h-1" />
            </div>
          </>
        )}

      </div>

      {/* Footer */}
      <div id="footer-container" className="mt-10" />
    </div>
  );
}
