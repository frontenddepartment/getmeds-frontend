import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useNews } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';


export default function Articles() {
  const { data: articles, loading } = useNews();

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
  const rest = articles && articles.length > 1 ? articles.slice(1) : [];

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(160deg, #eef4ff 0%, #f8faff 40%, #ffffff 100%)' }} className="text-gray-900 relative">

      {/* Glassy sphere background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-18%', right: '-8%',
          width: '52vw', height: '52vw', maxWidth: '680px', maxHeight: '680px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.35) 0%, rgba(210,228,255,0.18) 38%, rgba(130,175,255,0.08) 65%, transparent 100%)',
          boxShadow: 'inset -22px -22px 60px rgba(100,145,255,0.06), 0 0 90px rgba(100,145,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', top: '18%', right: '7%',
          width: '18vw', height: '18vw', maxWidth: '240px', maxHeight: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(185,215,255,0.28) 0%, rgba(80,145,255,0.15) 48%, rgba(50,105,255,0.06) 75%, transparent 100%)',
          boxShadow: 'inset -10px -10px 28px rgba(30,85,255,0.08), 0 0 45px rgba(60,125,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', top: '42%', left: '-3%',
          width: '9vw', height: '9vw', maxWidth: '120px', maxHeight: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(140,175,255,0.25) 0%, rgba(70,125,255,0.14) 52%, rgba(40,95,255,0.05) 78%, transparent 100%)',
          boxShadow: 'inset -5px -5px 14px rgba(30,80,255,0.06), 0 0 28px rgba(60,120,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12%', left: '8%',
          width: '32vw', height: '32vw', maxWidth: '420px', maxHeight: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.22) 0%, rgba(205,222,255,0.14) 42%, rgba(120,162,255,0.06) 70%, transparent 100%)',
          boxShadow: 'inset -14px -14px 40px rgba(80,120,255,0.05), 0 0 65px rgba(80,120,255,0.03)',
        }} />
      </div>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* ===== FEATURED HERO ===== */}
        {loading ? (
          <div className="relative rounded-[1.5rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex items-center justify-center mb-10 bg-gray-100 animate-pulse">
            <span className="text-gray-400 text-sm">Loading articles...</span>
          </div>
        ) : featured ? (
          <a
            href={`/article-detail?id=${featured._id}`}
            className="relative rounded-[1.5rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end group mb-10 block no-underline"
          >
            {/* Background image */}
            <img
              src={featured.image ? urlFor(featured.image).width(1200).url() : ''}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.90) 0%, rgba(10,15,30,0.45) 50%, rgba(10,15,30,0.10) 100%)' }}
            />

            {/* Bottom content card */}
            <div className="relative z-10 w-full p-6 md:p-8">
              <div
                className="max-w-2xl rounded-2xl p-6"
                style={{
                  background: 'rgba(10,15,30,0.55)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {/* Featured + tag badge */}
                <div className="flex gap-2 mb-4">
                  <span className="inline-block text-white text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                    Featured
                  </span>
                  <span className="inline-block text-white text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>
                    {featured.tag}
                  </span>
                  {featured.readTime && (
                    <span className="inline-block text-white text-[11px] font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                      {featured.readTime}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-white font-bold text-2xl md:text-3xl leading-snug mb-3">
                  {featured.title}
                </h2>

                {/* Description */}
                <p className="text-white/75 text-sm leading-relaxed">
                  {featured.description}
                </p>
              </div>
            </div>
          </a>
        ) : null}

        {/* ===== RECENT ARTICLES ===== */}
        <div className="rounded-2xl p-7">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 block">Getmeds</span>
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{
                background: 'linear-gradient(135deg,#1D9FDA,#61A644)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>News and Insights</span>
              <h2 className="text-2xl font-bold text-gray-900">Recent blog posts</h2>
            </div>
          </div>

          {/* Article Cards — all articles (or from index 1 onwards if featured is shown) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse" style={{ height: '360px' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(rest.length > 0 ? rest : articles || []).map((article) => {
                const imgUrl = article.image
                  ? urlFor(article.image).width(800).url()
                  : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800';
                return (
                  <a
                    key={article._id}
                    href={`/article-detail?id=${article._id}`}
                    className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group block no-underline"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  >
                    {/* Image */}
                    <div className="overflow-hidden rounded-t-2xl" style={{ height: '220px' }}>
                      <img
                        src={imgUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={article.title}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                          style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>
                          {article.tag}
                        </span>
                        {article.readTime && (
                          <span className="text-gray-400 text-xs">{article.readTime}</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{article.date}</p>
                      <h3 className="text-gray-900 font-semibold text-base leading-snug mb-3">{article.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{article.description}</p>

                      {/* Social Share */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400">Share:</span>
                        {[
                          { icon: 'fa-brands fa-facebook-f', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/article-detail?id=' + article._id)}` },
                          { icon: 'fa-brands fa-x-twitter', color: '#111111', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/article-detail?id=' + article._id)}&text=${encodeURIComponent(article.title)}` },
                          { icon: 'fa-brands fa-linkedin-in', color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/article-detail?id=' + article._id)}` },
                        ].map((s) => (
                          <button
                            key={s.icon}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(s.url, '_blank', 'noopener,noreferrer,width=620,height=450'); }}
                            className="transition-opacity hover:opacity-70"
                            style={{ color: s.color, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          >
                            <i className={`${s.icon} text-[16px]`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div id="footer-container" className="mt-10" />
    </div>
  );
}
