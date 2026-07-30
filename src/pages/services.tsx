import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { ProgressiveHeroImage } from '../lib/ProgressiveHeroImage';
import { useImageMapper } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';

export default function Services() {
  useEffect(() => {
    setPageMeta({
      title: 'Our Services',
      description: 'Getmeds delivers precision pharmaceutical solutions and nationwide distribution — from regulatory compliance and government bidding to pioneering digital oncology care.',
      path: '/services.html',
    });
  }, []);

  const { getImage, getLowResImage, getImageLink } = useImageMapper('services');
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
    const animateCounters = () => {
      document.querySelectorAll<HTMLElement>('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target || '0');
        const suffix = el.dataset.suffix ?? '+';
        let current = 0;
        const step = target / (1800 / 16);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          const value = target >= 1000 ? Math.floor(current).toLocaleString() : Math.floor(current);
          el.textContent = value + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);
      });
    };

    const statsEl = document.querySelector<HTMLElement>('[data-target]');
    if (statsEl) {
      const section = statsEl.closest('section');
      if (section) {
        const obs = new IntersectionObserver(e => {
          if (e[0].isIntersecting) { animateCounters(); obs.disconnect(); }
        }, { threshold: 0.3 });
        obs.observe(section);
        return () => obs.disconnect();
      }
    }
  }, []);

  useEffect(() => {
    const revealOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          entry.target.classList.remove('active');
        }
      });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      {/* Plain CSS (not a Tailwind before: utility) — Tailwind's before:/after: utilities always
          set content: var(--tw-content) on the pseudo-element, which resets Font Awesome's own
          icon glyph (also set via ::before) back to empty, making the icon disappear. */}
      <style>{`
        .icon-gradient::before {
          background: linear-gradient(90deg, #61A644, #1D9FDA);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Desktop Hero Section */}
      <section className="hidden sm:block w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-6 max-w-[1600px]">
        <div className="relative rounded-[10px] md:rounded-[1.5rem] border border-gray-100/20 overflow-hidden min-h-[360px] md:min-h-[450px] lg:min-h-[500px] flex items-center group shadow-sm bg-gray-100">
          <div className="absolute inset-0 z-0">
            {(() => {
              const heroFullSrc = getImage('Services Hero Background', 'assets/services_hero_new.png');
              return (
                <ProgressiveHeroImage
                  link={getImageLink('Services Hero Background')}
                  fullSrc={heroFullSrc}
                  lowSrc={getLowResImage('Services Hero Background', heroFullSrc)}
                  dataJsonSrc="hero.image"
                  dataJsonAlt="hero.imageAlt"
                  className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105"
                  transitionClassName="transition-[opacity_0.7s,transform_4s]"
                  alt="Healthcare Services"
                />
              );
            })()}
          </div>

          <div className="relative z-10 w-full px-8 md:px-14 py-8 md:py-10 max-w-4xl reveal">
            <h1 className="text-[34px] md:text-[46px] leading-tight font-bold mb-3 tracking-tight">
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">Our Services</span>
            </h1>
            <p data-json="hero.description" className="text-[#000b5d] text-[13px] md:text-[15px] max-w-[420px] md:max-w-[480px] mb-5 leading-normal font-normal">
              Getmeds connects globally certified pharmaceutical manufacturers with Filipino patients, doctors, and
              hospitals — bridging the gap between world-class treatment and local access.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#services-grid"
                className="btn-gradient text-white font-semibold py-2 px-6 rounded-full text-[13px] inline-flex items-center gap-2 shadow-md">
                Explore Services <i className="fa-solid fa-arrow-down text-xs"></i>
              </a>
              <a href="contact-us.html"
                className="bg-white/10 backdrop-blur-md border border-white/25 text-white font-semibold py-2 px-6 rounded-full text-[13px] hover:bg-white/20 transition inline-flex items-center gap-2">
                Contact Us <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Hero Section */}
      <section className="block sm:hidden w-full px-3 mt-3 mb-6">
        <div className="relative aspect-[16/10] w-full rounded-[10px] border border-gray-100/20 overflow-hidden mb-3 bg-gray-100 shadow-sm">
          {(() => {
            const heroFullSrc = getImage('Services Hero Background', 'assets/services_hero_new.png');
            return (
              <ProgressiveHeroImage
                link={getImageLink('Services Hero Background')}
                fullSrc={heroFullSrc}
                lowSrc={getLowResImage('Services Hero Background', heroFullSrc)}
                dataJsonSrc="hero.image"
                dataJsonAlt="hero.imageAlt"
                className="absolute inset-0 w-full h-full object-cover object-right"
                transitionClassName="transition-[opacity_0.7s,transform_4s]"
                alt="Healthcare Services"
              />
            );
          })()}
        </div>
        <div className="px-1 reveal">
          <h1 className="text-xl font-bold leading-tight mb-2 tracking-tight">
            <span data-json="hero.headingAccent"
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">Our Services</span>
          </h1>
          <p data-json="hero.description" className="text-gray-600 text-xs mb-3 leading-relaxed font-normal text-justify">
            Getmeds connects globally certified pharmaceutical manufacturers with Filipino patients, doctors, and
            hospitals — bridging the gap between world-class treatment and local access.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 mb-10">
        <div className="rounded-b-[2rem] px-8 py-7 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          <div className="stat-item flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-0 reveal">
            <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2" data-target="2000">0</span>
            <span className="text-gray-600 font-bold text-sm md:text-base leading-tight">Molecules
              in portfolio</span>
          </div>
          <div className="stat-item flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-0 reveal">
            <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2" data-target="10000">0</span>
            <span className="text-gray-600 font-bold text-sm md:text-base leading-tight">Pharmacies
              nationwide</span>
          </div>
          <div className="stat-item flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-0 reveal">
            <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2" data-target="500">0</span>
            <span className="text-gray-600 font-bold text-sm md:text-base leading-tight">Hospitals
              served</span>
          </div>
          <div className="stat-item flex flex-col items-center px-6 py-2 last:border-0 reveal">
            <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2" data-target="2" data-suffix="M+">0</span>
            <span className="text-gray-600 font-bold text-sm md:text-base leading-tight">Filipino
              lives touched</span>
          </div>
        </div>
      </section>

      {/* Services — Direct Layout */}
      <section id="services-grid" className="pt-10 pb-8 scroll-mt-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-sm uppercase tracking-widest mb-4 block">Corporate Services</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">Our Core Competencies</h2>
            <p data-json="sectionDescription" className="text-gray-500 text-[15px]">Ten capabilities.
              Four focus areas. One complete pharmaceutical partner for Filipino patients, doctors, hospitals,
              pharmacies, and manufacturers.</p>
          </div>

          {/* Focus Area 01: Foundation */}
          <div className="mb-16 reveal">
            <div className="mb-8 pb-6 border-b border-gray-100">
              <span className="text-[13px] font-black uppercase tracking-widest text-gradient block mb-3">01 &middot; Foundation</span>
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <h3 className="text-[19px] sm:text-[26px] md:text-[36px] font-semibold text-dark leading-tight tracking-tight max-w-2xl">The
                  global backbone behind every Getmeds medicine.</h3>
                <div className="flex flex-wrap gap-2 xl:justify-end xl:max-w-[520px] xl:flex-shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">50+ manufacturers</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">5 international standards</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">Full lifecycle regulatory management</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-earth-asia text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Global Network of
                  Pharma Manufacturers</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Strategic sourcing partnerships with 50+
                  manufacturers across India, China, Europe, and the US — all WHO, PIC/S, US FDA, EU MHRA, and UK
                  MHRA recognized. Every partner facility meets international quality standards, ensuring the
                  medicines Filipino doctors prescribe and patients receive are backed by globally verified
                  manufacturing.</p>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-file-shield text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Regulatory &amp;
                  Compliance</h4>
                <p className="text-sm text-gray-500 leading-relaxed">FDA Philippines, DOH, PDEA (S-4 and S-5),
                  BOC, and EDPMS expertise across product registration, post-market compliance, and
                  pharmacovigilance. Our regulatory team manages the full lifecycle — from Certificate of Product
                  Registration application to license renewals — so partners can operate with confidence and
                  speed.</p>
              </div>
            </div>
          </div>

          {/* Focus Area 02: Reach */}
          <div className="mb-16 reveal">
            <div className="mb-8 pb-6 border-b border-gray-100">
              <span className="text-[13px] font-black uppercase tracking-widest text-gradient block mb-3">02 &middot; Reach</span>
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <h3 className="text-[19px] sm:text-[26px] md:text-[36px] font-semibold text-dark leading-tight tracking-tight max-w-2xl">How
                  our medicines get to every corner of Filipino healthcare.</h3>
                <div className="flex flex-wrap gap-2 xl:justify-end xl:max-w-[520px] xl:flex-shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">10,000+ pharmacies</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">500+ hospitals</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">Nationwide reach</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">Government bidding expertise</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-truck-ramp-box text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Precision Supply
                  Chain &amp; Nationwide Distribution</h4>
                <p className="text-sm text-gray-500 leading-relaxed">WHO GSDP-compliant cold-chain logistics
                  with batch-level traceability and urgent-response delivery across Luzon, Visayas, and Mindanao.
                  Built for the urgency of Filipino healthcare, with specialized handling for biologics, oncology
                  therapies, and specialty molecules.</p>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-handshake text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Sales and
                  Distribution</h4>
                <p className="text-sm text-gray-500 leading-relaxed">10,000+ pharmacy accounts served through
                  dedicated nationwide sales teams across Luzon, Visayas, and Mindanao. Long-term partnership
                  approach with account-managed service, product training, and market development support.</p>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-building-columns text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Government
                  Bidding &amp; Public Sector Access</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Proven tender experience supplying
                  oncology, hematology, and anesthesia medicines to public hospitals nationwide. Dedicated
                  bidding specialists handle full documentation, compliance protocols, and competitive quotation
                  preparation.</p>
              </div>
            </div>
          </div>

          {/* Focus Area 03: Who We Serve */}
          <div className="mb-16 reveal">
            <div className="mb-8 pb-6 border-b border-gray-100">
              <span className="text-[13px] font-black uppercase tracking-widest text-gradient block mb-3">03 &middot; Who We
                Serve</span>
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <h3 className="text-[19px] sm:text-[26px] md:text-[36px] font-semibold text-dark leading-tight tracking-tight max-w-2xl">The
                  patients, doctors, and hospitals we&apos;re built for.</h3>
                <div className="flex flex-wrap gap-2 xl:justify-end xl:max-w-[520px] xl:flex-shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">500+ hospitals</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">Filipino oncologists, hematologists, anesthesiologists</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">Compassionate access for rare disease patients</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-hospital text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Hospital
                  Partnerships &amp; Institutional Supply</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Trusted by 500+ Filipino hospitals across
                  public and private healthcare — with dedicated account managers, cold-chain oncology handling,
                  and urgent-response supply for ICU and critical care units. Formulary-ready documentation for
                  hospital pharmacy committees and specialty procurement for hard-to-source therapies.</p>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-user-doctor text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Doctor &amp;
                  Healthcare Professional Support</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Partnership with Filipino oncologists,
                  hematologists, anesthesiologists, and specialists across the country. Product education,
                  clinical information, and Named-Patient Access Program coordination — because doctors succeed
                  when their prescribed medicines actually reach their patients.</p>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-hand-holding-medical text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Direct-to-Patient
                  Care &amp; Access Programs</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Prescription order fulfillment, refill
                  support, affordable pricing, and nationwide delivery for Filipino patients. Patient Assistance
                  Programs (PAP), Named-Patient Access Programs (NPAP), and Compassionate Special Permit (CSP)
                  imports ensure continuous access to life-saving medicines — especially for oncology and rare
                  disease treatments.</p>
              </div>
            </div>
          </div>

          {/* Focus Area 04: Programs & Access */}
          <div className="mb-4 reveal">
            <div className="mb-8 pb-6 border-b border-gray-100">
              <span className="text-[13px] font-black uppercase tracking-widest text-gradient block mb-3">04 &middot;
                Programs &amp; Access</span>
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <h3 className="text-[19px] sm:text-[26px] md:text-[36px] font-semibold text-dark leading-tight tracking-tight max-w-2xl">Specialized
                  services for government and pharmaceutical partners.</h3>
                <div className="flex flex-wrap gap-2 xl:justify-end xl:max-w-[520px] xl:flex-shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">DSWD</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">PCSO</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">OVP</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">OP accredited</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default">
                    <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[10px]"></i>
                    <span className="text-[11px] font-medium text-gray-600">CLIDP for pharmaceutical partners</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-landmark text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Government
                  Medical Assistance &amp; Program Accreditation</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Accredited chemotherapy and cancer
                  medicine provider for DSWD, PCSO, Office of the Vice President (OVP), and Office of the
                  President (OP) medical assistance programs. Fast quotations and streamlined guarantee letter
                  processing ensure Filipino patients receive their medicines quickly and without administrative
                  barriers.</p>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <i className="fa-solid fa-box-open text-2xl mb-5 block icon-gradient"></i>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Certificate of
                  Listing of Identical Drug Product (CLIDP) Services</h4>
                <p className="text-sm text-gray-500 leading-relaxed">End-to-end CLIDP application,
                  certification, and ongoing compliance management across our Certificate of Product Registration
                  portfolio. Fast-track processing, low-risk market entry, and flexible minimum order quantities
                  for pharmaceutical partners.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="pt-8 pb-24 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-12">
            {/* Left Content */}
            <div className="lg:w-[48%] reveal">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-pill text-[11px] font-bold uppercase tracking-widest mb-6">
                <i className="fa-solid fa-medal"></i> The Getmeds Difference</div>
              <h2 className="text-[28px] md:text-[38px] font-bold text-dark leading-tight mb-6 tracking-tight">Why patients, doctors, and partners trust Getmeds.</h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-lg">Pharmaceutical care built on
                global standards, patient-first values, and Filipino heart. Every medicine is sourced, verified,
                and delivered with the care your health deserves.</p>
              <a href="about-us.html"
                className="btn-gradient text-white font-bold py-4 px-10 rounded-xl text-[14px] inline-flex items-center gap-3 shadow-lg">Learn
                More <i className="fa-solid fa-arrow-right text-xs"></i></a>
            </div>

            {/* Right Content (Staggered Cards) */}
            <div className="lg:w-[52%] relative reveal">
              {/* Background blobs for depth */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60"></div>

              <div className="space-y-4 relative z-10">
                {/* Card 1 */}
                <div
                  className="bg-white p-5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-4 relative max-w-[460px] group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-lg text-[#61A644]">
                    <i className="fa-solid fa-rocket"></i>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-dark mb-1">First-to-Market Sourcing</h4>
                    <p className="text-gray-400 text-[12px] leading-relaxed">We move the moment a patent cliffs
                      globally.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-4 right-5 text-gray-100 text-lg opacity-50"></i>
                </div>

                {/* Card 2 (Staggered) */}
                <div
                  className="bg-white p-5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-4 relative max-w-[460px] lg:ml-8 group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-lg text-[#1D9FDA]">
                    <i className="fa-solid fa-snowflake"></i>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-dark mb-1">Cold-Chain Excellence</h4>
                    <p className="text-gray-400 text-[12px] leading-relaxed">Biologics-ready logistics
                      nationwide.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-4 right-5 text-gray-100 text-lg opacity-50"></i>
                </div>

                {/* Card 3 */}
                <div
                  className="bg-white p-5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-4 relative max-w-[460px] group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-lg text-[#61A644]">
                    <i className="fa-solid fa-flag"></i>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-dark mb-1">Filipino-First Formulations</h4>
                    <p className="text-gray-400 text-[12px] leading-relaxed">Engineered for local disease
                      patterns.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-4 right-5 text-gray-100 text-lg opacity-50"></i>
                </div>

                {/* Card 4 (Staggered) */}
                <div
                  className="bg-white p-5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-4 relative max-w-[460px] lg:ml-8 group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-lg text-[#1D9FDA]">
                    <i className="fa-solid fa-hand-holding-heart"></i>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-dark mb-1">Patient Assistance Programs</h4>
                    <p className="text-gray-400 text-[12px] leading-relaxed">Adherence, access, affordability.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-4 right-5 text-gray-100 text-lg opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-[#1a2744] to-[#0f3460]">
        <div className="max-w-7xl mx-auto px-4 text-center reveal">
          <h2 className="text-[28px] md:text-[38px] font-bold text-white mb-4 tracking-tight">Ready to Experience<br className="sm:hidden" /> <span
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Better
            Healthcare?</span></h2>
          <p className="text-white/60 text-[13px] sm:text-[15px] mb-10 max-w-[270px] sm:max-w-xl mx-auto">Join thousands of patients who trust Getmeds for
            fast, reliable, and expert medical services every day.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="order-medicines.html"
              className="btn-gradient text-white font-bold py-4 px-10 rounded-full text-[14px] inline-flex items-center gap-3 shadow-lg">Order
              Medicines <i className="fa-solid fa-arrow-right text-xs"></i></a>
            <a href="contact-us.html"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-full text-[14px] hover:bg-white/20 transition inline-flex items-center gap-3">Contact
              Us <i className="fa-solid fa-phone text-xs"></i></a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
