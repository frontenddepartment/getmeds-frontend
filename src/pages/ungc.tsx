import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';

const Ungc: React.FC = () => {
  useEffect(() => {
    setPageMeta({
      title: 'UN Global Compact',
      description: 'Getmeds is a proud member of the United Nations Global Compact, committed to sustainable business practices and universal health access.',
      path: '/ungc.html',
    });
  }, []);

  const { getImage } = useImageMapper('ungc');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Navbar / Footer injection
  useEffect(() => {
    fetch('/components/navbar.html', { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('navbar-container');
        if (el) injectHTML(el, html);
      });
    fetch('/components/footer.html', { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('footer-container');
        if (el) injectHTML(el, html);
      });
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxSrc(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxSrc ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightboxSrc]);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      {/* Navbar */}
      <div id="navbar-container" className="fixed top-0 left-0 right-0 z-[50]" />
      <div className="h-20" />

      {/* UNGC Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-16 max-w-[1600px]">
        <div className="relative rounded-[1.5rem] border border-white/10 overflow-hidden min-h-[450px] flex items-center justify-center">
          <img src={getImage('UNGC Hero Background', 'assets/ungcimage.jpg')} alt="UN Global Compact" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0F2642]/75 backdrop-blur-[1px]"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-14 px-8 py-16 max-w-6xl">
            <div className="flex-shrink-0">
              <img src={getImage('UNGC Logo White', 'assets/ungclogowhite.png')} alt="UNGC Logo" className="w-48 md:w-60 h-auto opacity-100" />
            </div>
            <div className="hidden md:block w-[1.5px] h-56 bg-white/40"></div>
            <div className="text-white text-center md:text-left max-w-xl">
              <h1 className="text-2xl md:text-[52px] leading-[1.1] font-semibold mb-5 tracking-tight">
                <span>United Nations</span><br />
                <span>Global Compact</span>
              </h1>
              <p className="text-white/90 text-sm md:text-[15.5px] mb-8 leading-relaxed font-normal max-w-[480px]">
                At Getmeds Philippines, we do more than provide medicines—we drive meaningful impact through
                responsible healthcare, compassion, and sustainable action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is UNGC Section */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1920')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.38 }}>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.15) 18%, rgba(255,255,255,0.15) 82%, rgba(255,255,255,0.97) 100%), linear-gradient(to bottom, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.15) 18%, rgba(255,255,255,0.15) 82%, rgba(255,255,255,0.97) 100%)' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 md:gap-24">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-3xl md:text-3xl font-bold text-dark mb-6 tracking-tight">
                What is UNGC?
              </h2>
              <p className="text-gray-500 text-base md:text-[18px] leading-relaxed">
                The United Nations Global Compact (UNGC) is the world's largest corporate sustainability
                initiative. It encourages companies to adopt responsible, ethical, and sustainable business
                practices that create positive impact for people, communities, and the planet.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <span className="text-[#1A365D] font-serif font-bold text-xs md:text-sm tracking-tight mb-2 uppercase">We Support</span>
              <img src={getImage('UNGC Logo Partner', 'assets/UNGClogo.png')} alt="UNGC Logo"
                className="max-w-[160px] md:max-w-[180px] h-auto opacity-90 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Seamless Grid Image Section */}
      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row overflow-hidden rounded-xl shadow-sm border border-gray-100">

            {/* Left: CEO Addresses */}
            <div className="relative group w-full md:w-1/3 h-[500px] cursor-pointer overflow-hidden"
              onClick={() => setLightboxSrc(getImage('UNGC Event Left Image', 'assets/left.jpg'))}>
              <img src={getImage('UNGC Event Left Image', 'assets/left.jpg')}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
              <div className="absolute inset-0 bg-[#1D9FDA]/0 group-hover:bg-[#1D9FDA]/40 transition-all duration-500 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 p-8 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <span className="text-white/90 text-[15px] font-bold"><i className="fa-regular fa-calendar-days mr-2"></i> 24 Sept 2025</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
                <h4 className="text-white text-xl font-semibold leading-tight">Getmeds CEO Naresh Bishnoi at the UNGC
                  Network Philippines Event</h4>
              </div>
            </div>

            {/* Middle: Sustainable & Networking */}
            <div className="flex flex-col w-full md:w-1/3">
              <div className="relative group h-[250px] border-l border-b border-gray-100/10 cursor-pointer overflow-hidden"
                onClick={() => setLightboxSrc(getImage('UNGC Event Top Mid Image', 'assets/topmid.jpg'))}>
                <img src={getImage('UNGC Event Top Mid Image', 'assets/topmid.jpg')}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute inset-0 bg-[#1D9FDA]/0 group-hover:bg-[#1D9FDA]/40 transition-all duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 p-8 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <span className="text-white/90 text-[15px] font-bold"><i className="fa-regular fa-calendar-days mr-2"></i> 24 Sept 2025</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  <h4 className="text-white text-xl font-semibold leading-tight">Leading SDG conversations
                    in Healthcare Innovation</h4>
                </div>
              </div>
              <div className="relative group h-[250px] border-l border-gray-100/10 cursor-pointer overflow-hidden"
                onClick={() => setLightboxSrc(getImage('UNGC Event Bottom Mid Image', 'assets/bottommid.jpg'))}>
                <img src={getImage('UNGC Event Bottom Mid Image', 'assets/bottommid.jpg')}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute inset-0 bg-[#1D9FDA]/0 group-hover:bg-[#1D9FDA]/40 transition-all duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 p-8 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <span className="text-white/90 text-[15px] font-bold"><i className="fa-regular fa-calendar-days mr-2"></i> 24 Sept 2025</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  <h4 className="text-white text-xl font-semibold leading-tight">Connecting with Global
                    Stakeholders</h4>
                </div>
              </div>
            </div>

            {/* Right: Ethical & General Assembly */}
            <div className="flex flex-col w-full md:w-1/3">
              <div className="relative group h-[250px] border-l border-b border-gray-100/10 cursor-pointer overflow-hidden"
                onClick={() => setLightboxSrc(getImage('UNGC Event Top Right Image', 'assets/topright.jpeg'))}>
                <img src={getImage('UNGC Event Top Right Image', 'assets/topright.jpeg')}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute inset-0 bg-[#1D9FDA]/0 group-hover:bg-[#1D9FDA]/40 transition-all duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 p-8 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <span className="text-white/90 text-[15px] font-bold"><i className="fa-regular fa-calendar-days mr-2"></i> 10 Feb 2026</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  <h4 className="text-white text-xl font-semibold leading-tight">Commitment to Ethical
                    Business Practices</h4>
                </div>
              </div>
              <div className="relative group h-[250px] border-l border-gray-100/10 cursor-pointer overflow-hidden"
                onClick={() => setLightboxSrc(getImage('UNGC Event Bottom Right Image', 'assets/bottomright.jpeg'))}>
                <img src={getImage('UNGC Event Bottom Right Image', 'assets/bottomright.jpeg')}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute inset-0 bg-[#1D9FDA]/0 group-hover:bg-[#1D9FDA]/40 transition-all duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 p-8 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <span className="text-white/90 text-[15px] font-bold"><i className="fa-regular fa-calendar-days mr-2"></i> 10 Feb 2026</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  <h4 className="text-white text-xl font-semibold leading-tight">Pledging for a Healthier
                    Future for All</h4>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Ten Principles */}
      <section className="py-24 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl font-bold text-dark">The Ten Principles</h2>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            <div className="space-y-8">
              {/* Human Rights */}
              <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-md">
                <h4 className="text-xl font-semibold text-dark mb-2">Human Rights</h4>
                <div className="h-px bg-dark/80 mb-8"></div>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 1: Businesses should
                      support and respect the protection of internationally proclaimed human rights.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 2: Make sure that they
                      are not complicit in human rights abuses.</p>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-md">
                <h4 className="text-xl font-semibold text-dark mb-2">Environment</h4>
                <div className="h-px bg-dark/80 mb-8"></div>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 7: Businesses should
                      support a precautionary approach to environmental challenges.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 8: Undertake initiatives
                      to promote greater environmental responsibility.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 9: Encourage the
                      development and diffusion of environmentally friendly technologies.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Labor */}
              <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-md">
                <h4 className="text-xl font-semibold text-dark mb-2">Labor</h4>
                <div className="h-px bg-dark/80 mb-8"></div>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 3: Businesses should
                      uphold the freedom of association and the effective recognition of the right to collective
                      bargaining.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 4: The elimination of all
                      forms of forced and compulsory labor.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 5: The effective
                      abolition of child labor.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 6: The elimination of
                      discrimination in respect of employment and occupation.</p>
                  </div>
                </div>
              </div>

              {/* Anti-Corruption */}
              <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-md">
                <h4 className="text-xl font-semibold text-dark mb-2">Anti-Corruption</h4>
                <div className="h-px bg-dark/80 mb-8"></div>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] mt-1 text-lg"></i>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-medium">Principle 10:
                      Businesses should work against corruption in all its forms, including extortion and bribery.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400">
              The content of The Ten Principles listed above is based on and sourced from the official <a
                href="https://www.unglobalcompact.org/what-is-gc/mission/principles" target="_blank"
                rel="noopener noreferrer" className="text-[#1D9FDA] hover:underline font-medium">UN Global Compact
                website</a>.
            </p>
          </div>
        </div>
      </section>

      {/* How UNGC Supports the 17 SDG */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center mb-6">
          <h2 className="text-3xl font-bold text-dark mb-4">How UNGC Supports the 17 Sustainable Development Goals (SDGs)</h2>
          <p className="text-gray-500 text-[18px] max-w-3xl mx-auto leading-relaxed px-4">The UNGC principles also
            contribute to the United Nations Sustainable Development Goals (SDGs) — a global call to end poverty,
            protect the planet, and ensure prosperity for all.</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-wrap justify-center gap-3">
          <div className="sdg-pill"><i className="fa-solid fa-hand-holding-dollar mr-2 text-yellow-500"></i> No Poverty</div>
          <div className="sdg-pill"><i className="fa-solid fa-bowl-food mr-2 text-orange-500"></i> Zero Hunger</div>
          <div className="sdg-pill"><i className="fa-solid fa-heart-pulse mr-2 text-green-500"></i> Good Health and Well-Being</div>
          <div className="sdg-pill"><i className="fa-solid fa-book mr-2 text-red-500"></i> Quality Education</div>
          <div className="sdg-pill"><i className="fa-solid fa-venus-mars mr-2 text-primary"></i> Gender Equality</div>
          <div className="sdg-pill"><i className="fa-solid fa-faucet-drip mr-2 text-blue-300"></i> Clean Water and Sanitation</div>
          <div className="sdg-pill"><i className="fa-solid fa-solar-panel mr-2 text-yellow-500"></i> Affordable and Clean Energy</div>
          <div className="sdg-pill"><i className="fa-solid fa-briefcase mr-2 text-red-800"></i> Decent Work and Economic Growth</div>
          <div className="sdg-pill"><i className="fa-solid fa-industry mr-2 text-orange-600"></i> Industry, Innovation, and Infrastructure</div>
          <div className="sdg-pill"><i className="fa-solid fa-users mr-2 text-pink-500"></i> Reduced Inequality</div>
          <div className="sdg-pill"><i className="fa-solid fa-city mr-2 text-orange-400"></i> Sustainable Cities and Communities</div>
          <div className="sdg-pill"><i className="fa-solid fa-arrows-rotate mr-2 text-yellow-600"></i> Responsible Consumption and Production</div>
          <div className="sdg-pill"><i className="fa-solid fa-cloud-sun mr-2 text-green-700"></i> Climate Action</div>
          <div className="sdg-pill"><i className="fa-solid fa-fish mr-2 text-blue-600"></i> Life Below Water</div>
          <div className="sdg-pill"><i className="fa-solid fa-tree mr-2 text-green-600"></i> Life on Land</div>
          <div className="sdg-pill"><i className="fa-solid fa-dove mr-2 text-blue-800"></i> Peace, Justice, and Strong Institutions</div>
          <div className="sdg-pill"><i className="fa-solid fa-handshake-angle mr-2 text-blue-900"></i> Partnerships for the Goals</div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-[15px] leading-[1.8] italic">By aligning with UNGC, Getmeds Philippines, only the
            second pharmaceutical company of its kind in the Philippines to join, integrates these principles and
            goals into our operations. This milestone highlights our commitment to ethical business practices,
            sustainable growth, and social responsibility. Through this partnership, we aim to set new standards in
            the healthcare industry, improve access to quality medicines, and create a positive, lasting impact on
            communities nationwide. Joining UNGC also reflects our dedication to the United Nations Sustainable
            Development Goals (SDGs), ensuring that every step we take in business aligns with global efforts for a
            healthier, fairer, and more sustainable world.</p>
        </div>
      </section>

      {/* Large Banner Image */}
      <section className="max-w-7xl mx-auto px-4 mb-24 overflow-hidden">
        <div className="relative rounded-[1.5rem] overflow-hidden h-[200px] flex items-center justify-start px-12 md:px-28">
          <img src={getImage('UNGC Learn More Image', 'assets/learnmorecopy.png')} alt="UN Global Compact"
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-left">
            <h2 className="text-xl md:text-2xl font-medium text-white mb-4 leading-none">
              LEARN MORE ABOUT UNGC<br />AND ITS GLOBAL IMPACT</h2>
            <a href="https://www.unglobalcompact.org/" target="_blank" rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-2 px-6 rounded-full text-[13px] inline-block transition shadow-md text-center">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

      {/* Lightbox Modal */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setLightboxSrc(null)}></div>
          <button onClick={() => setLightboxSrc(null)}
            className="absolute top-8 right-8 text-white/70 hover:text-white transition text-3xl z-[1001]">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img src={lightboxSrc} alt="Gallery Preview"
            className="relative z-[1001] max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" />
          <p className="relative z-[1001] text-white/80 mt-6 font-medium text-sm"></p>
        </div>
      )}
    </div>
  );
};

export default Ungc;
