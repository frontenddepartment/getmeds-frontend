import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';


const articles = [
  {
    category: 'Launch',
    readTime: '3 mins read',
    date: 'Thursday, May 22, 2025',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    title: 'Getmeds Expands Oncology Portfolio with Next-Gen Targeted Therapies',
    desc: 'Getmeds announces the addition of cutting-edge targeted therapy options for Filipino cancer patients, strengthening access to innovative first-line and second-line oncology treatments nationwide.',
  },
  {
    category: 'Event',
    readTime: '5 mins read',
    date: 'Thursday, May 22, 2025',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    title: 'Getmeds at the Philippine Oncology & Pharmacy Summit',
    desc: 'Our team joined oncologists, hospital pharmacists, and healthcare professionals across the Philippines to discuss expanding access to innovative and essential medicines for Filipino patients.',
  },
  {
    category: 'CSR',
    readTime: '4 mins read',
    date: 'Thursday, May 22, 2025',
    img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    title: 'Getmeds Donates Essential Medicines to Indigent Communities',
    desc: 'As part of our UN Global Compact commitment, Getmeds partnered with local government units in Metro Manila to provide free essential medicines to underserved patients.',
  },
];

export default function Articles() {
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

  const featured = articles[0];

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
        {/* Same dimensions as about-us hero: rounded-[1.5rem], min-h-[450px] md:min-h-[500px] */}
        <div className="relative rounded-[1.5rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end group mb-10">

          {/* Background image */}
          <img
            src={featured.img}
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
              {/* Featured badge */}
              <span className="inline-block text-white text-[11px] font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                Featured
              </span>

              {/* Title */}
              <h2 className="text-white font-bold text-2xl md:text-3xl leading-snug mb-3">
                {featured.title}
              </h2>

              {/* Description */}
              <p className="text-white/75 text-sm leading-relaxed">
                {featured.desc}
              </p>
            </div>
          </div>
        </div>

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

          {/* 3 Article Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <a
                key={i}
                href={`/article-detail?id=${i}`}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group block no-underline"
                style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                {/* Image */}
                <div className="overflow-hidden rounded-t-2xl" style={{ height: '220px' }}>
                  <img
                    src={article.img}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={article.title}
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-gray-400 text-xs mb-2">{article.date}</p>
                  <h3 className="text-gray-900 font-semibold text-base leading-snug mb-3">{article.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{article.desc}</p>
                </div>
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div id="footer-container" className="mt-10" />
    </div>
  );
}
