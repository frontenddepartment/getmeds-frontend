import React, { useEffect, useState, useRef, useCallback } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useNewsPaginated } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';
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

const mapArticleToCategory = (article: any): string => {
  const rawTag = (article.tag || '').trim();
  const rawTagLower = rawTag.toLowerCase();

  const categories = [
    'Disease Awareness',
    'Patient Resources',
    'Product Updates',
    'Industry Insights',
    'Company News',
    'CSR & Sustainability'
  ];

  // Exact match
  const exactMatch = categories.find(c => c.toLowerCase() === rawTagLower);
  if (exactMatch) return exactMatch;

  const title = (article.title || '').toLowerCase();
  const desc = (article.description || '').toLowerCase();

  // 1. CSR & Sustainability
  if (
    rawTagLower.includes('csr') || rawTagLower.includes('sustain') || rawTagLower.includes('sustainability') ||
    title.includes('csr') || title.includes('sustain') || title.includes('community') || title.includes('donation') || title.includes('environment') ||
    desc.includes('csr') || desc.includes('sustain') || desc.includes('community') || desc.includes('donation') || desc.includes('environment')
  ) {
    return 'CSR & Sustainability';
  }

  // 2. Company News
  if (
    rawTagLower === 'press release' || rawTagLower === 'award' || rawTagLower === 'news' || rawTagLower === 'sponsorship' || rawTagLower === 'partnership' ||
    title.includes('getmeds') || title.includes('award') || title.includes('announces') || title.includes('press release') ||
    desc.includes('getmeds') || desc.includes('award') || desc.includes('announces') || desc.includes('press release')
  ) {
    return 'Company News';
  }

  // 3. Product Updates
  if (
    rawTagLower === 'product launch' || rawTagLower.includes('product') ||
    title.includes('launch') || title.includes('new product') || title.includes('introducing') || title.includes('available at') ||
    desc.includes('launch') || desc.includes('new product') || desc.includes('introducing') || desc.includes('available at')
  ) {
    return 'Product Updates';
  }

  // 4. Industry Insights
  if (
    rawTagLower === 'online pharmacy' || rawTagLower.includes('industry') ||
    title.includes('industry') || title.includes('market') || title.includes('trends') || title.includes('future of') ||
    desc.includes('industry') || desc.includes('market') || desc.includes('trends') || desc.includes('future of')
  ) {
    return 'Industry Insights';
  }

  // 5. Disease Awareness
  if (
    rawTagLower === 'cancer' || rawTagLower === 'multiple sclerosis' || rawTagLower === 'covid-19' || rawTagLower === 'diabetes' ||
    rawTagLower === 'blood pressure' || rawTagLower === 'hypertension' || rawTagLower === 'kids health' || rawTagLower === 'mental health' ||
    rawTagLower === 'pregnancy' || rawTagLower === 'health care' || rawTagLower === 'health' || rawTagLower === 'immune system' ||
    title.includes('disease') || title.includes('symptom') || title.includes('treatment') || title.includes('awareness') || title.includes('prevent') || title.includes('understand') ||
    desc.includes('disease') || desc.includes('symptom') || desc.includes('treatment') || desc.includes('awareness') || desc.includes('prevent') || desc.includes('understand')
  ) {
    return 'Disease Awareness';
  }

  // 6. Patient Resources
  if (
    rawTagLower === 'fitness' || rawTagLower === 'skin care' || rawTagLower === 'muscle gain' || rawTagLower === 'weight loss' ||
    rawTagLower === 'workout' || rawTagLower === 'blood' || rawTagLower === 'vitamin' ||
    title.includes('guide') || title.includes('tips') || title.includes('how to') || title.includes('diet') || title.includes('healthy') ||
    desc.includes('guide') || desc.includes('tips') || desc.includes('how to') || desc.includes('diet') || desc.includes('healthy')
  ) {
    return 'Patient Resources';
  }

  // Fallbacks:
  if (rawTagLower === 'fitness' || rawTagLower === 'skin care' || rawTagLower === 'vitamin' || rawTagLower === 'workout') {
    return 'Patient Resources';
  }

  return 'Disease Awareness';
};

export default function Blog() {
  useEffect(() => {
    setPageMeta({
      title: 'Blog',
      description: 'Stay informed with the latest pharmaceutical news, healthcare insights, and industry updates from Getmeds.',
      path: '/blog.html',
    });
  }, []);

  const { articles, loading, loadingMore, hasMore, loadMore, loadMoreError } = useNewsPaginated(9);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Infinite scroll: observe a sentinel element at the bottom of the list
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && !loading && !loadMoreError) {
      loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore, loadMoreError]);

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bl-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.bl-anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [articles]);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(footerContainer, html); });
    }
  }, []);

  const featured = articles && articles.length > 0 ? articles[0] : null;
  const latestPosts = articles && articles.length > 1 ? articles.slice(1, 5) : [];
  const cardArticles = articles && articles.length > 1 ? articles.slice(1) : [];

  const filteredCardArticles = cardArticles.filter(article => {
    // 1. Category Filter
    if (selectedCategory !== 'All') {
      const categoryOfArticle = mapArticleToCategory(article);
      if (categoryOfArticle !== selectedCategory) return false;
    }
    // 2. Search Filter
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      const titleMatches = (article.title || '').toLowerCase().includes(query);
      const descMatches = (article.description || '').toLowerCase().includes(query);
      const tagMatches = (article.tag || '').toLowerCase().includes(query);
      if (!titleMatches && !descMatches && !tagMatches) return false;
    }
    return true;
  });

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-900 min-h-screen">
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes blFadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blFadeLeft { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes blFadeRight{ from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes blFadeIn   { from { opacity:0; }                              to { opacity:1; }                         }

        .bl-anim { opacity:0; }
        .bl-anim.bl-in.bl-up    { animation: blFadeUp    0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bl-anim.bl-in.bl-left  { animation: blFadeLeft  0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bl-anim.bl-in.bl-right { animation: blFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bl-anim.bl-in.bl-fade  { animation: blFadeIn    0.6s ease forwards; }

        .bl-d1 { animation-delay: 0.08s !important; }
        .bl-d2 { animation-delay: 0.16s !important; }
        .bl-d3 { animation-delay: 0.24s !important; }
        .bl-d4 { animation-delay: 0.32s !important; }
        .bl-d5 { animation-delay: 0.40s !important; }
        .bl-d6 { animation-delay: 0.48s !important; }
      `}</style>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2">
        <div className="mb-10">
          <span className="bl-anim bl-up inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-sm mb-3">Our Blog</span>
          <h1 className="bl-anim bl-up bl-d1 text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-3">
            Insights from{' '}
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Getmeds</span>
          </h1>
          <p className="bl-anim bl-up bl-d2 text-gray-500 text-[15px] max-w-full leading-relaxed">
            Stay informed with the latest news, health guides, and updates from Getmeds — your trusted source for pharmaceutical insights and patient care resources in the Philippines.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

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
                  className="bl-anim bl-left relative rounded-2xl overflow-hidden block group no-underline"
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
              <div className="bl-anim bl-right bl-d1">
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

            {/* ===== BOTTOM: CATEGORY FILTER + SEARCH + CARD GRID ===== */}
            <div>
              {/* Header row: title + categories + search */}
              <div className="bl-anim bl-up flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="font-semibold text-[22px] text-gray-900 shrink-0">Recent blog posts</h2>

                  {/* Search Bar — Product Range style */}
                  <div className="relative w-full sm:max-w-[300px]">
                    <div className="bg-white rounded-full py-1 px-1.5 border border-gray-200 flex items-center shadow-sm">
                      <div className="relative flex-grow flex items-center ml-3">
                        <i className="fa-solid fa-magnifying-glass text-gray-400 text-[13px]" />
                        <input
                          id="blog-search-input"
                          type="text"
                          placeholder="Search articles..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full bg-transparent border-none pl-2.5 pr-2 py-1.5 text-[13px] text-gray-700 outline-none placeholder-gray-400"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mr-2 text-gray-300 hover:text-gray-500 transition flex-shrink-0"
                            aria-label="Clear search"
                          >
                            <i className="fa-solid fa-xmark text-[11px]" />
                          </button>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                        <i className="fa-solid fa-magnifying-glass text-white text-[11px]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Pills — horizontal scroll */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {['All', 'Disease Awareness', 'Patient Resources', 'Product Updates', 'Industry Insights', 'Company News', 'CSR & Sustainability'].map(cat => (
                    <button
                      key={cat}
                      id={`blog-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      onClick={() => setSelectedCategory(cat)}
                      className="whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 shrink-0"
                      style={selectedCategory === cat
                        ? { background: 'linear-gradient(135deg, #61A644, #1D9FDA)', color: '#fff', borderColor: 'transparent' }
                        : { background: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCardArticles.length === 0 && !loading ? (
                  <div className="col-span-3 flex flex-col items-center justify-center py-20 px-6 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'linear-gradient(135deg, rgba(97,166,68,0.10), rgba(29,159,218,0.10))' }}>
                      <i className="fa-regular fa-newspaper text-2xl" style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-800 mb-1">No articles found</h3>
                    <p className="text-gray-400 text-[12px] max-w-xs leading-relaxed">
                      Try a different search term or select another category.
                    </p>
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                      className="mt-4 px-5 py-2 rounded-full text-[12px] font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filteredCardArticles.map(article => {
                    const imgUrl = article.image
                      ? urlFor(article.image).width(600).url()
                      : '';
                    return (
                      <a
                        key={article._id}
                        href={`/blog/${article.slug || slugify(article.title)}`}
                        className={`bl-anim bl-up bl-d${(filteredCardArticles.indexOf(article) % 6) + 1} block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow no-underline group`}
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
                  })
                )}
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

              {/* Load more error + retry */}
              {loadMoreError && !loadingMore && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <i className="fa-solid fa-circle-exclamation text-red-400" />
                    <span>Failed to load more posts.</span>
                  </div>
                  <button
                    onClick={loadMore}
                    className="px-5 py-2 rounded-full text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* All posts loaded message */}
              {!hasMore && !loadMoreError && filteredCardArticles.length > 0 && (
                <div className="flex justify-center py-10">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-8 h-px bg-gray-200" />
                    <span>{filteredCardArticles.length === cardArticles.length ? `${articles.length} posts total` : `${filteredCardArticles.length} matching posts`}</span>
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
