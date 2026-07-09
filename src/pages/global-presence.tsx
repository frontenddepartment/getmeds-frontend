import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';

export default function GlobalPresence() {
  useEffect(() => {
    setPageMeta({
      title: 'Global Presence',
      description: 'Discover seamless healthcare solutions. Access a world-class medical network worldwide, efficiently linking you with top care continuously.',
      path: '/global-presence.html',
    });
  }, []);

  const { getImage } = useImageMapper('global-presence');

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

  useEffect(() => {
    const caObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as Element).classList.add('ca-in');
          caObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.ca-anim').forEach(el => caObserver.observe(el));
    return () => caObserver.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      <style>{`
        .ca-anim{opacity:0}
        .ca-anim.ca-in{animation-fill-mode:both}
        .ca-up.ca-in{animation:caFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .ca-left.ca-in{animation:caFadeLeft 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .ca-right.ca-in{animation:caFadeRight 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .ca-zoom.ca-in{animation:caZoomIn 0.6s cubic-bezier(0.22,1,0.36,1) both}
        .ca-fade.ca-in{animation:caFadeIn 0.7s ease both}
        .ca-d1.ca-in{animation-delay:0.1s}.ca-d2.ca-in{animation-delay:0.2s}
        .ca-d3.ca-in{animation-delay:0.3s}.ca-d4.ca-in{animation-delay:0.4s}
        .ca-d5.ca-in{animation-delay:0.5s}.ca-d6.ca-in{animation-delay:0.6s}
        @keyframes caFadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes caFadeLeft{from{opacity:0;transform:translateX(-44px)}to{opacity:1;transform:translateX(0)}}
        @keyframes caFadeRight{from{opacity:0;transform:translateX(44px)}to{opacity:1;transform:translateX(0)}}
        @keyframes caZoomIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes caFadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Header / Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-16 max-w-[1600px]">
        <div
          className="relative rounded-[10px] md:rounded-[1.5rem] border border-gray-100/20 overflow-hidden min-h-[190px] md:min-h-[500px] flex items-end">
          <img src={getImage('Global Presence Hero Background', 'assets/globalpresencehero.jpg')} alt="Global Healthcare" data-json-src="hero.image" data-json-alt="hero.imageAlt"
            className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-[100%] md:w-[70%]"></div>

          <div className="relative z-10 w-full px-3 md:px-14 pb-3 md:pb-16 pt-10 md:pt-20 max-w-4xl">
            <h1 className="ca-anim ca-up text-[11px] md:text-[38px] leading-[1.2] font-bold mb-1 md:mb-3 tracking-tight">
              <span data-json="hero.headingLine1" className="text-white">Global Healthcare</span><br />
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">
                Without Borders
              </span>
            </h1>
            <p data-json="hero.description" className="ca-anim ca-up ca-d2 text-white/90 text-[9px] md:text-[14px] max-w-[650px] mb-2 md:mb-5 leading-normal font-normal">
              Discover seamless healthcare solutions. Access a world-class medical network worldwide, efficiently
              linking you with top care continuously.
            </p>
            <button
              onClick={() => document.getElementById('gp-content-start')?.scrollIntoView({ behavior: 'smooth' })}
              className="ca-anim ca-up ca-d3 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-1 px-3.5 md:py-2 md:px-6 rounded-full text-[9px] md:text-[13px] inline-block transition shadow-md">
              Explore Now
            </button>
          </div>
        </div>
      </section>

      {/* Where We Operate — 3 Categorised Sections */}
      <section id="gp-content-start" className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* ── SECTION 1: The Foundation ─────────────────────────── */}
          <div>
            {/* Section header */}
            <div className="ca-anim ca-up text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">The{' '}
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Foundation</span>
              </h3>
              <p className="text-gray-500 text-base leading-relaxed">Innovation meets pharmaceutical care</p>
            </div>

            {/* Featured card — INDUSTRY FIRST */}
            <div className="ca-anim ca-zoom ca-d2 bg-gradient-to-br from-white to-green-100/60 rounded-2xl p-6 pb-14 mb-4 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-green-100 text-green-700 border-green-200 z-10">Industry First</span>
              <div className="relative z-10 max-w-[65%]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-green-100 shadow-sm flex-shrink-0">
                    <img src="https://flagcdn.com/w80/ph.png" alt="Philippines" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base leading-tight">Launch of the Getmeds Digital Platform</h4>
                    <p className="text-[11px] text-gray-500">Philippines</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Pioneered the Philippines' first fully digital oncology care platform — featuring an innovative e-commerce platform and mobile app that brought specialty care closer to patients.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <line x1="88" y1="176" x2="0" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
                  <line x1="88" y1="176" x2="44" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
                  <line x1="88" y1="176" x2="88" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
                  <line x1="88" y1="176" x2="132" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
                  <line x1="88" y1="176" x2="176" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
                  <line x1="88" y1="176" x2="22" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.1" />
                  <line x1="88" y1="176" x2="154" y2="0" stroke="#22c55e" strokeWidth="1" opacity="0.1" />
                </svg>
                <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-mobile-screen text-white text-lg"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-column cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Philippines — Pharma Launch */}
              <div className="ca-anim ca-left ca-d1 relative bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Pharma Launch</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-3">
                  <img src="https://flagcdn.com/w80/ph.png" alt="Philippines" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-900 text-[16px] leading-tight mb-0.5 pr-24">Philippines</h4>
                <p className="text-[13px] text-gray-400 mb-2">Getmeds Philippines Incorporated</p>
                <p className="text-[15px] text-gray-500 leading-[1.8]">Redefining the Philippine healthcare landscape with high-quality, affordable generic medicines accessible to every Filipino.</p>
              </div>
              {/* India — Export Hub */}
              <div className="ca-anim ca-right ca-d2 relative bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Export Hub</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-3">
                  <img src="https://flagcdn.com/w80/in.png" alt="India" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-900 text-[16px] leading-tight mb-0.5 pr-24">India</h4>
                <p className="text-[13px] text-gray-400 mb-2">Getmeds Healthcare (India)</p>
                <p className="text-[15px] text-gray-500 leading-[1.8]">Expanding the international footprint as a trusted pharmaceutical exporter and supplier in India.</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Regional Expansion Across Asia-Pacific ─── */}
          <div>
            <div className="ca-anim ca-up text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Regional Expansion{' '}
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Across Asia-Pacific</span>
              </h3>
              <p className="text-gray-500 text-base leading-relaxed">Strengthening reach and partnerships</p>
            </div>

            {/* 2 larger primary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Singapore */}
              <div className="ca-anim ca-left ca-d1 relative bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">Global Hub</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-3">
                  <img src="https://flagcdn.com/w80/sg.png" alt="Singapore" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-900 text-[16px] leading-tight mb-0.5 pr-24">Singapore</h4>
                <p className="text-[13px] text-gray-400 mb-2">Getmeds HealthTech Pte. Ltd.</p>
                <p className="text-[15px] text-gray-500 leading-[1.8]">Extending global reach and creating new opportunities for international expansion across Asia and beyond.</p>
              </div>
              {/* Pakistan */}
              <div className="ca-anim ca-right ca-d2 relative bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-teal-50 text-teal-700 border-teal-200">Strategic Office</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-3">
                  <img src="https://flagcdn.com/w80/pk.png" alt="Pakistan" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-900 text-[16px] leading-tight mb-0.5 pr-28">Pakistan</h4>
                <p className="text-[13px] text-gray-400 mb-2">Trusted partnership</p>
                <p className="text-[15px] text-gray-500 leading-[1.8]">Opened an office with a trusted healthcare provider — supplying essential medicines and expanding healthcare access and industry networks.</p>
              </div>
            </div>

            {/* 4 smaller SE Asia cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { flag: 'https://flagcdn.com/w80/vn.png', name: 'Vietnam', desc: 'Building market presence and expanding access to quality medicines across the country.' },
                { flag: 'https://flagcdn.com/w80/kh.png', name: 'Cambodia', desc: 'Driving strategic initiatives to advance healthcare services and strengthen regional collaboration.' },
                { flag: 'https://flagcdn.com/w80/la.png', name: 'Laos', desc: 'Spearheading programs to enhance healthcare delivery and foster long-term partnerships.' },
                { flag: 'https://flagcdn.com/w80/mm.png', name: 'Myanmar', desc: 'Pioneering operations to accelerate healthcare development and operational excellence.' },
              ].map((c, idx) => (
                <div key={c.name} className={`ca-anim ca-up ${['ca-d1','ca-d2','ca-d3','ca-d4'][idx]} relative bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200`}>
                  <span className="absolute top-3 right-3 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">SE Asia</span>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-2.5">
                    <img src={c.flag} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-[15px] leading-tight mb-1.5 pr-12">{c.name}</h4>
                  <p className="text-[14px] text-gray-500 leading-[1.8]">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 3: A Global Vision Takes Shape ────────────── */}
          <div>
            <div className="ca-anim ca-up text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">A Global Vision{' '}
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Takes Shape</span>
              </h3>
              <p className="text-gray-500 text-base leading-relaxed">Reaching the Caribbean and the Pacific</p>
            </div>

            {/* 2 cards — Caribbean & Pacific */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Saint Kitts */}
              <div className="ca-anim ca-left ca-d1 relative bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-orange-50 text-orange-600 border-orange-200">Caribbean Entry</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-3">
                  <img src="https://flagcdn.com/w80/kn.png" alt="Saint Kitts and Nevis" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-900 text-[16px] leading-tight mb-0.5 pr-28">Saint Kitts and Nevis</h4>
                <p className="text-[13px] text-gray-400 mb-2">Officially registered</p>
                <p className="text-[15px] text-gray-500 leading-[1.8]">Strengthening global presence and paving the way for further international growth in the Caribbean and beyond.</p>
              </div>
              {/* Vanuatu */}
              <div className="ca-anim ca-right ca-d2 relative bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-cyan-50 text-cyan-700 border-cyan-200">Pacific Partnership</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-3">
                  <img src="https://flagcdn.com/w80/vu.png" alt="Vanuatu" className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-900 text-[16px] leading-tight mb-0.5 pr-28">Vanuatu</h4>
                <p className="text-[13px] text-gray-400 mb-2">Government collaboration</p>
                <p className="text-[15px] text-gray-500 leading-[1.8]">Collaborated with the government to enhance medical support, introduce cancer awareness initiatives, and bring life-saving healthcare solutions to the Pacific community.</p>
              </div>
            </div>

            {/* Featured bottom card — A HEALTHCARE FIRST */}
            <div className="ca-anim ca-zoom ca-d3 bg-gradient-to-br from-white to-red-100/60 rounded-2xl p-6 pb-14 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <span className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full border bg-red-100 text-red-700 border-red-200 z-10">A Healthcare First</span>
              <div className="relative z-10 max-w-[65%]">
                <h4 className="font-semibold text-gray-900 text-base leading-tight mb-2">First specialty cancer pharmacy in the Pacific</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Opened the Pacific's first specialty pharmacy dedicated to cancer medicines — providing localized access to life-saving treatments for patients in Vanuatu, Fiji, and across the Pacific region.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="176" cy="176" r="50" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.15" />
                  <circle cx="176" cy="176" r="85" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.15" />
                  <circle cx="176" cy="176" r="120" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.12" />
                  <circle cx="176" cy="176" r="155" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.1" />
                </svg>
                <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-stethoscope text-white text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Blue Banner */}
      <section className="max-w-[1150px] mx-auto px-4 sm:px-6 md:mt-44 mt-32 mb-20 relative">
        <div className="absolute left-1/2 -top-[105px] transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="w-[210px] h-[210px] rounded-full overflow-hidden mix-blend-multiply flex items-center justify-center transform transition-transform"
            style={{ boxShadow: '-47px 45px 18px rgba(0,0,0,0.1), -30px 29px 17px rgba(0,0,0,0.1), -17px 16px 14px rgba(0,0,0,0.25), -2px 2px 6px rgba(0,0,0,0.40)' }}>
            <img src={getImage('Earth Globe Image', 'assets/globe.jpg')} id="earth-image" alt="Earth" className="w-full h-full object-cover scale-[1.2]" />
          </div>
        </div>

        <div className="bg-[#1DA1F2] rounded-[15px] p-8 lg:p-14 pb-14 flex flex-col lg:flex-row items-center justify-between text-white relative z-10 pt-[170px] lg:pt-14"
          style={{ WebkitMaskImage: 'radial-gradient(circle at 50% 0px, transparent 145px, black 146px)', maskImage: 'radial-gradient(circle at 50% 0px, transparent 145px, black 146px)' }}>

          <div className="ca-anim ca-left lg:flex-1 w-full flex lg:justify-start justify-center">
            <div className="text-center lg:text-left w-full max-w-[340px] pl-0 lg:pl-4">
              <h2 className="text-[32px] lg:text-[38px] font-bold leading-[1.15] tracking-tight m-0"
                style={{ fontFamily: 'inherit' }}>
                <span className="text-white block">Grow beyond</span>
                <span className="text-white block">borders with</span>
                <span className="text-[#1a202c] block font-extrabold mt-1">Getmeds</span>
              </h2>
            </div>
          </div>

          <div className="hidden lg:block w-[300px] flex-shrink-0 pointer-events-none"></div>

          <div className="ca-anim ca-right ca-d3 lg:flex-1 w-full flex lg:justify-end justify-center mt-10 lg:mt-0">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[280px] pr-0">
              <p className="text-[13px] font-medium mb-5 leading-[1.45] text-white">
                Whether you're sourcing specialized medicines or expanding healthcare access overseas, Getmeds
                makes it simple, fast, secure, and reliable.
              </p>
              <a
                href="about-us.html"
                className="inline-block bg-[#1a202c] hover:bg-black text-white font-bold py-2.5 px-6 text-[11px] uppercase rounded-full shadow-md transition duration-300 tracking-[0.05em]">
                LEARN MORE
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
