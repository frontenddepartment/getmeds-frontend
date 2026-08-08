import React, { useEffect, useRef } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';
import { LinkableImage } from '../lib/LinkableImage';
import { ProgressiveHeroImage } from '../lib/ProgressiveHeroImage';

const Csr: React.FC = () => {
  useEffect(() => {
    setPageMeta({
      title: 'Corporate Social Responsibility',
      description: "We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital health advocacy, we ensure no patient navigates their journey alone.",
      path: '/csr.html',
    });
  }, []);

  const { getImage, getLowResImage, getImageLink } = useImageMapper('csr');

  const pinkSliderImages = [
    'assets/pinkrunone-web.jpg',
    'assets/pinkruntwo-web.jpg',
    'assets/pinkrunthree-web.jpg',
    'assets/pinkrunfour-web.jpg',
  ];
  const epcalmSliderImages = [
    'assets/epcalmone.jpg',
    'assets/epcalmtwo.jpg',
    'assets/epcalmthree.jpg',
  ];
  const imeldaSliderImages = [
    'assets/imeldapapin.jpg',
    'assets/imeldapapintwo.png',
    'assets/imeldapapinthree.png',
    'assets/imeldapapinfour.png',
  ];
  const galleryRef = useRef<HTMLDivElement>(null);
  const assistViewportRef = useRef<HTMLDivElement>(null);
  const pinkGridRef = useRef<HTMLDivElement>(null);
  const epcalmGridRef = useRef<HTMLDivElement>(null);
  const imeldaGridRef = useRef<HTMLDivElement>(null);

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

  // Gallery slider
  useEffect(() => {
    if (!galleryRef.current) return;
    const items = Array.from(galleryRef.current.querySelectorAll<HTMLElement>('.gallery-item'));
    let classes = ['pos-0', 'pos-1', 'pos-2', 'pos-3', 'pos-4'];

    function rotateGallery() {
      classes.unshift(classes.pop()!);
      items.forEach((item, index) => {
        item.className = 'gallery-item ' + classes[index];
      });
    }

    const interval = setInterval(rotateGallery, 5000);
    return () => clearInterval(interval);
  }, []);

  // Assist 3D slider
  useEffect(() => {
    if (!assistViewportRef.current) return;
    const cards = assistViewportRef.current.querySelectorAll<HTMLElement>('.assist-card');
    const nextBtn = document.getElementById('assist-next');
    const prevBtn = document.getElementById('assist-prev');
    let positions = [0, 1, -1];

    function update3D() {
      cards.forEach((card, i) => {
        card.setAttribute('data-pos', String(positions[i]));
      });
    }

    function next() {
      positions.push(positions.shift()!);
      update3D();
    }

    function prev() {
      positions.unshift(positions.pop()!);
      update3D();
    }

    nextBtn?.addEventListener('click', next);
    prevBtn?.addEventListener('click', prev);
    const interval = setInterval(next, 6000);

    return () => {
      nextBtn?.removeEventListener('click', next);
      prevBtn?.removeEventListener('click', prev);
      clearInterval(interval);
    };
  }, []);

  // Scroll reveal (only adds 'active', never removes)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Pink Run image grid — cards compile at center from below, then scatter into their grid positions
  useEffect(() => {
    const el = pinkGridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // EPCALM image grid — same compile/scatter animation as the Pink Run grid
  useEffect(() => {
    const el = epcalmGridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Imelda Papin Foundation image grid — same compile/scatter animation as the Pink Run grid
  useEffect(() => {
    const el = imeldaGridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Navbar — outside overflow wrapper so sticky works */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="overflow-x-hidden">
        {/* HERO SECTION */}
        {/* Desktop HERO SECTION */}
        <section className="hidden sm:block w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
          <div className="relative rounded-[10px] md:rounded-[1.5rem] overflow-hidden min-h-[360px] md:min-h-[500px] flex items-end group">
            {(() => {
              const heroFullSrc = getImage('CSR Hero Background', 'assets/patienthand.jpg');
              return (
                <ProgressiveHeroImage
                  link={getImageLink('CSR Hero Background')}
                  fullSrc={heroFullSrc}
                  lowSrc={getLowResImage('CSR Hero Background', heroFullSrc)}
                  alt="Corporate Social Responsibility"
                  className="absolute inset-0 w-full h-full object-cover object-center brightness-90 transform group-hover:scale-105"
                  transitionClassName="transition-[opacity_0.7s,transform_4s]"
                />
              );
            })()}
            <div className="relative z-10 w-full px-8 md:px-14 pb-5 md:pb-16 pt-20 max-w-4xl reveal z-[3]">
              <h1 className="text-[28px] md:text-[38px] leading-[1.2] font-bold mb-3 tracking-tight">
                <span className="inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Corporate Social</span><br />
                <span className="inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">
                  Responsibility
                </span>
              </h1>
              <p className="text-[#000b5d] text-[13px] md:text-[14px] max-w-[650px] mb-5 leading-normal font-normal">
                We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital
                health advocacy, we ensure no patient navigates their journey alone.
              </p>
              <button
                onClick={() => document.getElementById('csr-content-start')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-2 px-6 rounded-full text-[13px] inline-block transition shadow-md">
                Read More
              </button>
            </div>
          </div>
        </section>

        {/* Mobile HERO SECTION */}
        <section className="block sm:hidden w-full px-3 mt-3 mb-4">
          <div className="relative aspect-[16/10] w-full rounded-[10px] overflow-hidden mb-3 bg-gray-900 shadow-sm">
            {(() => {
              const heroFullSrc = getImage('CSR Hero Background', 'assets/patienthand.jpg');
              return (
                <ProgressiveHeroImage
                  link={getImageLink('CSR Hero Background')}
                  fullSrc={heroFullSrc}
                  lowSrc={getLowResImage('CSR Hero Background', heroFullSrc)}
                  alt="Corporate Social Responsibility"
                  className="absolute inset-0 w-full h-full object-cover object-center brightness-90"
                  transitionClassName="transition-[opacity_0.7s,transform_4s]"
                />
              );
            })()}
          </div>
          <div className="px-1 reveal">
            <h1 className="text-xl font-bold leading-tight mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Corporate Social </span>
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                Responsibility
              </span>
            </h1>
            <p className="text-gray-600 text-xs mb-3 leading-relaxed font-normal text-left">
              We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital
              health advocacy, we ensure no patient navigates their journey alone.
            </p>
          </div>
        </section>

        {/* WHAT WE DO / COMPASSIONATE ACCESS */}
        <section id="csr-content-start" className="pt-16 pb-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto mb-12 reveal">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-4 block">
                What We Do
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight uppercase mb-6">
                Compassionate Access
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-3">
                Thousands of Filipino cancer patients have received free cancer treatments through Getmeds — directly and through
                multi-sector collaboration with oncology doctors, institutions, and organizations, notably Bahay Aruga, Imelda Papin
                Foundation, EPCALM Adult Leukemia Foundation, and The Beautiful One DHE — Breast Cancer Warriors.
              </p>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Patient access to our wide range of product portfolio has expanded further through our official accreditation with
                government agencies, including the Department of Social Welfare and Development (AICS), the Philippine Charity
                Sweepstakes Office Medical Assistance Programs, the Office of the Vice President (OVP), and the Office of the
                President (OP) — ensuring continued care for financially challenged patients.
              </p>
            </div>
          </div>
        </section>

        {/* FACES OF HOPE BANNER */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <div className="bg-[#26A8E1] rounded-[1rem] px-8 md:px-16 py-10 flex flex-col md:flex-row items-center gap-10 relative">
            <div className="flex flex-col items-center -mt-28 md:-mt-32 shrink-0 z-20">
              <div className="w-[210px] h-[210px] rounded-full border-[8px] border-white overflow-hidden mb-6 shadow-2xl bg-white">
                <LinkableImage
                  link={getImageLink('Faces of Hope Section Image')}
                  src={getImage('Faces of Hope Section Image', 'assets/fohimage.png')}
                  alt="Faces of Hope"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    touchAction: 'manipulation',
                  } as React.CSSProperties}
                />
              </div>
              <p className="text-white text-[14px] md:text-[15px] font-[700] text-center max-w-[300px] leading-relaxed tracking-wide">
                Mother of a Chronic Myeloid Leukemia Patient<br />(EPCALM Beneficiary)
              </p>
            </div>
            <div className="flex-1 text-center md:text-left text-white reveal">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Faces of Hope</h3>
              <p className="text-[14px] md:text-[16px] leading-[1.8] opacity-95">
                &ldquo;Since 2019, my son has been fighting his cancer. This is more than just a blessing. It&rsquo;s a big
                help to us, because if we had to buy it ourselves, we simply couldn&rsquo;t afford it. Because of
                Getmeds, he has a chance to live longer and continue his life.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* OUR COMMITMENT */}
        <section className="pb-4 md:pb-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto mb-12 reveal">
              <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight uppercase mb-6">
                Our Commitment
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                We remain committed to extending our reach beyond boundaries — bringing accessible cancer care to every Filipino
                patient in need and inspiring a future where hope and healing know no limits.
              </p>
            </div>

            {/* Beating Cancer Twice Section */}
            <div className="max-w-5xl mx-auto mb-0 reveal">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                {/* Left: description + links */}
                <div className="md:w-1/2">
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                    Dorie, a breast cancer warrior diagnosed twice, made the difficult decision to treat both breasts to prevent her condition from worsening. She shares her story of struggles and triumphs in her battle against cancer.
                  </p>
                  <h4 className="text-dark font-semibold text-[16px] mb-4 tracking-tight">Watch some of our patients' journeys here:</h4>
                  <div className="space-y-3">
                    <a href="https://youtu.be/aIKzCDi2NGA" target="_blank" rel="noreferrer"
                      className="text-[#0D99FF] text-[13px] font-medium flex items-center gap-3 hover:underline">
                      <i className="fa-brands fa-youtube text-red-500 text-lg"></i>
                      https://youtu.be/aIKzCDi2NGA
                    </a>
                    <a href="https://www.facebook.com/reel/971664227768897" target="_blank" rel="noreferrer"
                      className="text-[#0D99FF] text-[13px] font-medium flex items-center gap-3 hover:underline">
                      <i className="fa-brands fa-facebook text-blue-600 text-lg"></i>
                      https://www.facebook.com/reel/971664227768897
                    </a>
                  </div>
                </div>
                {/* Right: smaller video */}
                <div className="md:w-1/2 overflow-hidden rounded-2xl shadow-lg aspect-video">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/aIKzCDi2NGA"
                    title="DORIE SHARES HER BREAST CANCER JOURNEY AND ADVICE | CARE AT GETMEDS"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PINK RUN HERO SLIDER */}
        <section className="pt-4 md:pt-12 pb-0 px-0 md:px-6">
          <div className="max-w-7xl mx-auto overflow-hidden">

            {/* Header row — title left, description right */}
            <div className="flex flex-col md:flex-row md:items-start justify-between px-8 pt-2 md:pt-8 pb-6 gap-6">
              <div>
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-2 block">
                  Health Promotion Events
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight whitespace-nowrap">
                  Pink Run <br /> Breast Cancer Awareness
                </h2>
              </div>
              <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm md:pt-1">
                The Pink Run is dedicated to promoting breast cancer awareness. Getmeds is the official health partner championing early detection and survivor support.
              </p>
            </div>

            {/* 4-image grid — cards fan out like a card deck at center from below, then unfan/scatter into position on scroll */}
            <style>{`
              .pink-gather-grid .pink-card {
                opacity: 0;
                translate: 0 110px;
                transform-origin: 50% 100%;
                transition: opacity 0.7s ease, translate 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1) 0.7s;
              }
              .pink-gather-grid .pink-card:nth-child(1) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0s, 0s, 0.7s; }
              .pink-gather-grid .pink-card:nth-child(2) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.09s, 0.09s, 0.79s; }
              .pink-gather-grid .pink-card:nth-child(3) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0.18s, 0.18s, 0.88s; }
              .pink-gather-grid .pink-card:nth-child(4) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.27s, 0.27s, 0.97s; }
              @media (min-width: 1024px) {
                .pink-gather-grid .pink-card:nth-child(1) { transform: translateX(160%) translateY(16px) rotate(-14deg); }
                .pink-gather-grid .pink-card:nth-child(2) { transform: translateX(55%) translateY(4px) rotate(-5deg); }
                .pink-gather-grid .pink-card:nth-child(3) { transform: translateX(-55%) translateY(4px) rotate(5deg); }
                .pink-gather-grid .pink-card:nth-child(4) { transform: translateX(-160%) translateY(16px) rotate(14deg); }
              }
              .pink-gather-grid.in-view .pink-card {
                opacity: 1;
                translate: 0 0;
                transform: translateX(0) translateY(0) rotate(0deg);
              }
            `}</style>
            <div ref={pinkGridRef} className="pink-gather-grid grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8 pb-0">
              {pinkSliderImages.map((src, idx) => (
                <div key={idx} className="pink-card relative rounded-[15px] overflow-hidden aspect-square">
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* EPCALM ADULT LEUKEMIA FOUNDATION */}
        <section className="pt-0 pb-12 px-0 md:px-6">
          <div className="max-w-7xl mx-auto overflow-hidden">

            {/* Header row — title left, description right */}
            <div className="flex flex-col md:flex-row md:items-start justify-between px-8 pt-4 pb-6 gap-6">
              <div>
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-2 block">
                  Foundation Partnership
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight whitespace-nowrap">
                  EPCALM <br /> Adult Leukemia Foundation
                </h2>
              </div>
              <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm md:pt-1">
                Getmeds partners with EPCALM Adult Leukemia Foundation to provide free treatment access and continuous support for adult leukemia patients and their families.
              </p>
            </div>

            {/* Card grid — same compile/scatter animation as the Pink Run grid above */}
            <style>{`
              .epcalm-gather-grid .epcalm-card {
                opacity: 0;
                translate: 0 110px;
                transform-origin: 50% 100%;
                transition: opacity 0.7s ease, translate 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1) 0.7s;
              }
              .epcalm-gather-grid .epcalm-card:nth-child(1) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0s, 0s, 0.7s; }
              .epcalm-gather-grid .epcalm-card:nth-child(2) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.09s, 0.09s, 0.79s; }
              .epcalm-gather-grid .epcalm-card:nth-child(3) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0.18s, 0.18s, 0.88s; }
              .epcalm-gather-grid .epcalm-card:nth-child(4) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.27s, 0.27s, 0.97s; }
              @media (min-width: 1024px) {
                .epcalm-gather-grid .epcalm-card:nth-child(1) { transform: translateX(160%) translateY(16px) rotate(-14deg); }
                .epcalm-gather-grid .epcalm-card:nth-child(2) { transform: translateX(55%) translateY(4px) rotate(-5deg); }
                .epcalm-gather-grid .epcalm-card:nth-child(3) { transform: translateX(-55%) translateY(4px) rotate(5deg); }
                .epcalm-gather-grid .epcalm-card:nth-child(4) { transform: translateX(-160%) translateY(16px) rotate(14deg); }
              }
              .epcalm-gather-grid.in-view .epcalm-card {
                opacity: 1;
                translate: 0 0;
                transform: translateX(0) translateY(0) rotate(0deg);
              }
            `}</style>
            <div ref={epcalmGridRef} className="epcalm-gather-grid grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8 pb-8">
              <div className="epcalm-card relative rounded-[15px] overflow-hidden aspect-square bg-gradient-to-br from-[#61A644] to-[#1D9FDA] p-2.5 md:p-5 flex flex-col justify-center text-white">
                <p className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5 md:mb-1">EPCALM</p>
                <h3 className="text-[10px] md:text-lg font-bold uppercase leading-tight md:leading-snug mb-1 md:mb-2">Adult Leukemia Foundation</h3>
                <p className="text-[8px] md:text-[11px] leading-snug md:leading-relaxed opacity-90 line-clamp-3 md:line-clamp-none">Getmeds partners with EPCALM to provide free treatment access and support for adult leukemia patients.</p>
              </div>
              {epcalmSliderImages.map((src, idx) => (
                <div key={idx} className="epcalm-card relative rounded-[15px] overflow-hidden aspect-square">
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* IMELDA PAPIN FOUNDATION */}
        <section className="pt-0 pb-12 px-0 md:px-6">
          <div className="max-w-7xl mx-auto overflow-hidden">

            {/* Header row — title left, description right */}
            <div className="flex flex-col md:flex-row md:items-start justify-between px-8 pt-4 pb-6 gap-6">
              <div>
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-2 block">
                  Foundation Partnership
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight whitespace-nowrap">
                  Imelda Papin <br /> Foundation
                </h2>
              </div>
              <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm md:pt-1">
                Getmeds partners with the Imelda Papin Foundation to provide cancer patients with access to essential medicines and continued support throughout their treatment journey.
              </p>
            </div>

            {/* 4-image grid — same compile/scatter animation as the Pink Run and EPCALM grids above */}
            <style>{`
              .imelda-gather-grid .imelda-card {
                opacity: 0;
                translate: 0 110px;
                transform-origin: 50% 100%;
                transition: opacity 0.7s ease, translate 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1) 0.7s;
              }
              .imelda-gather-grid .imelda-card:nth-child(1) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0s, 0s, 0.7s; }
              .imelda-gather-grid .imelda-card:nth-child(2) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.09s, 0.09s, 0.79s; }
              .imelda-gather-grid .imelda-card:nth-child(3) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0.18s, 0.18s, 0.88s; }
              .imelda-gather-grid .imelda-card:nth-child(4) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.27s, 0.27s, 0.97s; }
              @media (min-width: 1024px) {
                .imelda-gather-grid .imelda-card:nth-child(1) { transform: translateX(160%) translateY(16px) rotate(-14deg); }
                .imelda-gather-grid .imelda-card:nth-child(2) { transform: translateX(55%) translateY(4px) rotate(-5deg); }
                .imelda-gather-grid .imelda-card:nth-child(3) { transform: translateX(-55%) translateY(4px) rotate(5deg); }
                .imelda-gather-grid .imelda-card:nth-child(4) { transform: translateX(-160%) translateY(16px) rotate(14deg); }
              }
              .imelda-gather-grid.in-view .imelda-card {
                opacity: 1;
                translate: 0 0;
                transform: translateX(0) translateY(0) rotate(0deg);
              }
            `}</style>
            <div ref={imeldaGridRef} className="imelda-gather-grid grid grid-cols-2 gap-4 px-4 md:px-8 pb-0">
              {imeldaSliderImages.map((src, idx) => (
                <div key={idx} className="imelda-card relative rounded-[15px] overflow-hidden aspect-[4/3]">
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Footer */}
        <div id="footer-container" />
      </div>{/* end overflow-x-hidden */}
    </div>
  );
};

export default Csr;
