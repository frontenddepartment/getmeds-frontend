import React, { useEffect } from 'react';


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
      fetch('public/components/navbar.html')
        .then(r => r.text())
        .then(html => { navContainer.innerHTML = html; });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('public/components/footer.html')
        .then(r => r.text())
        .then(html => { footerContainer.innerHTML = html; });
    }
  }, []);

  const featured = articles[0];

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-900">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

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
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 block">GetMEDS</span>
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
