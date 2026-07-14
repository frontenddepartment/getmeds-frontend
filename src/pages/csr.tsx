import React, { useEffect, useRef, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';
import { LinkableImage } from '../lib/LinkableImage';

const Csr: React.FC = () => {
  useEffect(() => {
    setPageMeta({
      title: 'Corporate Social Responsibility',
      description: "We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital health advocacy, we ensure no patient navigates their journey alone.",
      path: '/csr.html',
    });
  }, []);

  const { getImage, getImageLink, getSliderImages, getSliderImageLinks } = useImageMapper('csr');

  const csrSliderImages = getSliderImages('CSR Slider Gallery', [
    'assets/csrslider3.png',
    'assets/csrslider2.png',
    'assets/csrslider1.png',
    'assets/csrslider4.png',
    'assets/csrslider5.png'
  ]);
  const csrSliderLinks = getSliderImageLinks('CSR Slider Gallery');

  const papSliderImages = getSliderImages('PAP Slider Gallery', [
    'assets/papsliderone.png',
    'assets/papslidertwo.png',
    'assets/papsliderthree.png'
  ]);
  const papSliderLinks = getSliderImageLinks('PAP Slider Gallery');

  const pinkSliderImages = [
    'assets/pinkrun1.jpg',
    'assets/pinkrun3.jpg',
    'assets/pinkrun4.jpg',
    'assets/pinkrun5.jpg',
    'assets/pinkrun6.jpg',
    'assets/pinkrun7.jpg',
    'assets/pinkrun8.jpg',
    'assets/pinkrun9.jpg',
    'assets/pinkrun10.jpg',
  ];
  const galleryRef = useRef<HTMLDivElement>(null);
  const assistViewportRef = useRef<HTMLDivElement>(null);
  const [pinkActive, setPinkActive] = useState(0);
  const [papGalleryActive, setPapGalleryActive] = useState(0);

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

  // Pink Run hero slider — auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setPinkActive(prev => (prev + 1) % pinkSliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [pinkSliderImages.length]);

  // PAP/CSR gallery mobile slider — auto-advance every 5s
  const papGalleryImages = [
    { src: papSliderImages[0], link: papSliderLinks[0] },
    { src: csrSliderImages[0], link: csrSliderLinks[0] },
    { src: csrSliderImages[1], link: csrSliderLinks[1] },
    { src: csrSliderImages[2], link: csrSliderLinks[2] },
    { src: csrSliderImages[3], link: csrSliderLinks[3] },
    { src: papSliderImages[1], link: papSliderLinks[1] },
  ].filter((item) => Boolean(item.src));

  useEffect(() => {
    const timer = setInterval(() => {
      setPapGalleryActive(prev => (prev + 1) % papGalleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [papGalleryImages.length]);

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

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      <style>{`
        @media (max-width: 767px) {
          html { scroll-behavior: smooth; }
        }
      `}</style>

      {/* Navbar — outside overflow wrapper so sticky works */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
      <div className="relative rounded-[10px] md:rounded-[1.5rem] overflow-hidden min-h-[190px] md:min-h-[500px] flex items-end group">
        <LinkableImage
          link={getImageLink('CSR Hero Background')}
          src={getImage('CSR Hero Background', 'assets/patienthand.jpg')}
          alt="Corporate Social Responsibility"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-90 transform group-hover:scale-105 transition-transform duration-[4s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

        {/* Decorative dot grid + arc overlay */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="csrDotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" rx="1" fill="white" />
              </pattern>
              <radialGradient id="csrDotFade" cx="0%" cy="0%" r="75%">
                <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                <stop offset="60%" stopColor="white" stopOpacity="0.12" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="csrDotMask">
                <rect width="700" height="360" fill="url(#csrDotFade)" />
              </mask>
            </defs>
            {/* Dot grid — upper left, masked to fade out */}
            <rect width="700" height="360" fill="url(#csrDotGrid)" mask="url(#csrDotMask)" />
            {/* Concentric arcs — lower right */}
            <circle cx="1180" cy="380" r="180" fill="none" stroke="white" strokeWidth="1.2" opacity="0.18" />
            <circle cx="1180" cy="380" r="250" fill="none" stroke="white" strokeWidth="1.2" opacity="0.14" />
            <circle cx="1180" cy="380" r="320" fill="none" stroke="white" strokeWidth="1.2" opacity="0.11" />
            <circle cx="1180" cy="380" r="395" fill="none" stroke="white" strokeWidth="1.2" opacity="0.08" />
            <circle cx="1180" cy="380" r="470" fill="none" stroke="white" strokeWidth="1" opacity="0.06" />
            <circle cx="1180" cy="380" r="550" fill="none" stroke="white" strokeWidth="1" opacity="0.05" />
          </svg>
        </div>

        <div className="relative z-10 w-full px-3 md:px-14 pb-3 md:pb-16 pt-10 md:pt-20 max-w-4xl reveal z-[3]">
          <h1 className="text-[11px] md:text-[38px] leading-[1.2] font-bold mb-1 md:mb-3 tracking-tight">
            <span className="text-white">Corporate Social</span><br />
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">
              Responsibility
            </span>
          </h1>
          <p className="text-white/90 text-[9px] md:text-[14px] max-w-[650px] mb-2 md:mb-5 leading-normal font-normal">
            We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital
            health advocacy, we ensure no patient navigates their journey alone.
          </p>
          <button
            onClick={() => document.getElementById('csr-content-start')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-1 px-3.5 md:py-2 md:px-6 rounded-full text-[9px] md:text-[13px] inline-block transition shadow-md">
            Read More
          </button>
        </div>
      </div>
      </section>

      {/* FREE CANCER MEDICINES PROGRAM */}
      <section id="csr-content-start" className="pt-16 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 items-center mb-12 reveal">
            {/* Left: Image */}
            <div className="lg:w-1/2 flex justify-center">
              <LinkableImage
                link={getImageLink('CSR Section Image 1')}
                src={getImage('CSR Section Image 1', 'assets/csrimage1.png')}
                alt="Free Cancer Medicines Program"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
            {/* Right: Text */}
            <div className="lg:w-1/2 self-start">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-4 block">
                Patient Support Initiatives
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight mb-6">
                Free Cancer Medicines{' '}
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Program</span>
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-3">
                Getmeds runs an ongoing online campaign dedicated to providing free cancer medicines to
                financially challenged patients who struggle to afford essential treatments. Through this initiative, patients in need can
                access vital oncology medications without the burden of cost, helping ensure continuity of care and improving health outcomes.
              </p>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Since 2020, we have wholeheartedly and continuously served financially-disadvantaged patients through supporting them with
                free cancer medicines, regardless of cost, in close collaboration with their oncologists and hematologists nationwide.
              </p>
            </div>
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

      {/* COMBINED BENTO GALLERY */}
      <section className="py-12 px-0 md:px-6">
        <style>{`
          @keyframes papProgress { from { width: 0% } to { width: 100% } }
          .pap-progress-anim { animation: papProgress 5s linear forwards; }
        `}</style>
        <div className="max-w-7xl mx-auto bg-gray-100 rounded-none md:rounded-3xl overflow-hidden">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between px-8 pt-8 pb-6 gap-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight max-w-md">
              Free Cancer Medicines &<br />Patient Assistance <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Programs</span>
            </h2>
            <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm md:pt-1">
              Since 2020, Getmeds provides free cancer medicines to financially challenged Filipinos — ensuring no one is denied life-saving care.
            </p>
          </div>

          {/* Mobile slider — landscape main image + thumbnail strip below */}
          <div className="md:hidden">
            <div
              className="relative overflow-hidden aspect-video"
              onClick={() => {
                const link = papGalleryImages[papGalleryActive]?.link;
                if (link) window.open(link, '_blank', 'noopener,noreferrer');
              }}
              style={{ cursor: papGalleryImages[papGalleryActive]?.link ? 'pointer' : 'default' }}
            >
              {papGalleryImages.map((item, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                  style={{
                    backgroundImage: `url(${item.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: idx === papGalleryActive ? 1 : 0,
                  }}
                />
              ))}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.15) 100%)' }} />
              <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setPapGalleryActive(prev => (prev - 1 + papGalleryImages.length) % papGalleryImages.length); }}
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPapGalleryActive(prev => (prev + 1) % papGalleryImages.length); }}
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                >
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
              <div className="absolute bottom-6 right-6 z-10 text-white/60 text-xs font-bold tracking-widest">
                {String(papGalleryActive + 1).padStart(2, '0')} / {String(papGalleryImages.length).padStart(2, '0')}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-10">
                <div key={papGalleryActive} className="h-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] pap-progress-anim" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
              {papGalleryImages.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setPapGalleryActive(idx)}
                  className="flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300"
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '10px',
                    opacity: idx === papGalleryActive ? 1 : 0.5,
                    outline: idx === papGalleryActive ? '2px solid #61A644' : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  <LinkableImage link={item.link} src={item.src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop bento grid — hidden on mobile */}
          <div
            className="hidden md:grid gap-3 px-8 pb-8"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              gridTemplateRows: '320px 320px',
            }}
          >
            <div className="relative rounded-2xl overflow-hidden group" style={{ gridColumn: '1 / 4', gridRow: '1' }}>
              <LinkableImage link={papSliderLinks[0]} src={papSliderImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group" style={{ gridColumn: '4', gridRow: '1' }}>
              <LinkableImage link={csrSliderLinks[0]} src={csrSliderImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group" style={{ gridColumn: '5', gridRow: '1' }}>
              <LinkableImage link={csrSliderLinks[1]} src={csrSliderImages[1]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group" style={{ gridColumn: '1', gridRow: '2' }}>
              <LinkableImage link={csrSliderLinks[2]} src={csrSliderImages[2]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group" style={{ gridColumn: '2', gridRow: '2' }}>
              <LinkableImage link={csrSliderLinks[3]} src={csrSliderImages[3]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group" style={{ gridColumn: '3 / 6', gridRow: '2' }}>
              <LinkableImage link={papSliderLinks[1]} src={papSliderImages[1]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>

        </div>
      </section>

      {/* CANCER WARRIORS */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breast Cancer Warriors */}
          <div className="flex flex-col lg:flex-row gap-10 items-center mb-8">
            <div className="lg:w-1/2 reveal">
              <div className="flex gap-4 mb-5">
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs">NGO Partnerships</span>
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs">Collaboration</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-dark leading-tight mb-6">
                The Beautiful One Dhe<br />
                Breast Cancer{' '}<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Warriors</span>
              </h2>
              <p className="text-gray-500 text-[15px] leading-[1.8] mb-8">
                The Beautiful One Dhe is dedicated to supporting breast cancer warriors in their fight against
                the disease.
                In collaboration with this organization, Getmeds provides free medicines to patients, ensuring
                they have
                access to essential treatments and support throughout their journey to recovery.
              </p>
            </div>
            <div className="lg:w-1/2">
              <LinkableImage link={getImageLink('Warriors Event Section Image 1')} src={getImage('Warriors Event Section Image 1', 'assets/one.png')} alt="Warriors Event"
                className="w-full md:h-[350px] object-cover rounded-tl-[150px] rounded-tr-[1rem] rounded-br-[1rem] rounded-bl-[1rem] shadow-xl" />
            </div>
          </div>

          {/* Event Mini Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LinkableImage link={getImageLink('Warriors Event Section Image 2')} src={getImage('Warriors Event Section Image 2', 'assets/two.png')} alt=""
              className="w-full h-60 object-cover rounded-2xl shadow-sm transition-transform hover:scale-[1.02]" />
            <LinkableImage link={getImageLink('Warriors Event Section Image 3')} src={getImage('Warriors Event Section Image 3', 'assets/three.png')} alt=""
              className="w-full h-60 object-cover rounded-2xl shadow-sm transition-transform hover:scale-[1.02]" />
            <LinkableImage link={getImageLink('Warriors Event Section Image 4')} src={getImage('Warriors Event Section Image 4', 'assets/four.png')} alt=""
              className="w-full h-60 object-cover rounded-tl-2xl rounded-tr-2xl rounded-br-[100px] rounded-bl-2xl shadow-sm transition-transform hover:scale-[1.02]" />
          </div>
        </div>
      </section>

      {/* EPCALM FOUNDATION */}
      <section className="pt-0 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 items-center mb-8">
            <div className="md:w-1/2">
              <LinkableImage link={getImageLink('EPCALM Partnership Image')} src={getImage('EPCALM Partnership Image', 'assets/five.png')} alt="EPCALM Partnership"
                className="w-full h-[350px] object-cover rounded-[1rem] shadow-lg" />
            </div>
            <div className="md:w-1/2 reveal">
              <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-6 tracking-tight">
                Epcalm Adult Leukimia<br /><span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Foundation</span>
              </h2>
              <p className="text-gray-500 text-[15px] leading-[1.8] mb-6">
                In partnership with EPCALM, Getmeds provides free cancer medications to adult patients with
                chronic myeloid leukemia, helping remove financial barriers and ensure access to life-saving
                treatment.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center p-2">
                  <LinkableImage link={getImageLink('EPCALM Logo')} src={getImage('EPCALM Logo', 'assets/epcalmlogo.png')} alt="" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="overflow-hidden h-60 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[100px]">
              <LinkableImage link={getImageLink('Warriors Event Section Image 5')} src={getImage('Warriors Event Section Image 5', 'assets/six.png')} alt=""
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]" />
            </div>
            <div className="overflow-hidden h-60 rounded-2xl">
              <LinkableImage link={getImageLink('Warriors Event Section Image 6')} src={getImage('Warriors Event Section Image 6', 'assets/seven.png')} alt=""
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]" />
            </div>
            <div className="relative overflow-hidden h-60 rounded-tl-2xl rounded-tr-2xl rounded-br-[100px] rounded-bl-2xl">
              <LinkableImage link={getImageLink('Warriors Event Section Image 7')} src={getImage('Warriors Event Section Image 7', 'assets/eight.png')} alt=""
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]" />
            </div>
          </div>
        </div>
      </section>

      {/* FACES OF HOPE BANNER */}
      <section className="max-w-7xl mx-auto px-4 mb-32 mt-40">
        <div className="bg-[#26A8E1] rounded-[1rem] px-8 md:px-16 py-10 flex flex-col md:flex-row items-center gap-10 relative">
          <div className="flex flex-col items-center -mt-28 md:-mt-32 shrink-0 z-20">
            <div className="w-[210px] h-[210px] rounded-full border-[8px] border-white overflow-hidden mb-6 shadow-2xl bg-white">
              <LinkableImage link={getImageLink('Faces of Hope Section Image')} src={getImage('Faces of Hope Section Image', 'assets/fohimage.png')} alt="Faces of Hope" className="w-full h-full object-cover" />
            </div>
            <p className="text-white text-[14px] md:text-[15px] font-[700] text-center max-w-[300px] leading-relaxed tracking-wide">
              Mother of a Chronic Myeloid Leukemia Patient<br />(EPCALM Beneficiary)
            </p>
          </div>
          <div className="flex-1 text-center md:text-left text-white reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Faces of Hope</h3>
            <p className="text-[14px] md:text-[16px] leading-[1.8] opacity-95">
              "Since 2019, my son has been fighting his cancer. This is more than just a blessing. It's a big
              help to us, because if we had to buy it ourselves, we simply couldn't afford it. Because of
              Getmeds, he has a chance to live longer and continue his life."
            </p>
          </div>
        </div>
      </section>

      {/* PINK RUN HERO SLIDER */}
      <section className="py-12 px-0 md:px-6">
        <style>{`
          @keyframes pinkProgress { from { width: 0% } to { width: 100% } }
          .pink-progress-anim { animation: pinkProgress 5s linear forwards; }
        `}</style>
        <div className="max-w-7xl mx-auto bg-gray-100 rounded-none md:rounded-3xl overflow-hidden">

          {/* Header row — title left, description right */}
          <div className="flex flex-col md:flex-row md:items-start justify-between px-8 pt-8 pb-6 gap-6">
            <div>
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-2 block">
                Health Promotion Events
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight max-w-xs">
                Pink Run Breast<br />Cancer <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Awareness</span>
              </h2>
            </div>
            <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm md:pt-1">
              The Pink Run is dedicated to promoting breast cancer awareness. Getmeds is the official health partner championing early detection and survivor support.
            </p>
          </div>

          {/* MOBILE — landscape slider + thumbnails below */}
          <div className="md:hidden">
            <div className="relative overflow-hidden aspect-video">
              {pinkSliderImages.map((src, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: idx === pinkActive ? 1 : 0,
                  }}
                />
              ))}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)' }} />
              <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2">
                <button onClick={() => setPinkActive(prev => (prev - 1 + pinkSliderImages.length) % pinkSliderImages.length)}
                  className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors">
                  <i className="fa-solid fa-chevron-left text-[9px]"></i>
                </button>
                <button onClick={() => setPinkActive(prev => (prev + 1) % pinkSliderImages.length)}
                  className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors">
                  <i className="fa-solid fa-chevron-right text-[9px]"></i>
                </button>
              </div>
              <div className="absolute bottom-3 right-4 z-10 text-white/60 text-xs font-bold tracking-widest">
                {String(pinkActive + 1).padStart(2, '0')} / {String(pinkSliderImages.length).padStart(2, '0')}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-10">
                <div key={pinkActive} className="h-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] pink-progress-anim" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
              {pinkSliderImages.map((src, idx) => (
                <div key={idx} onClick={() => setPinkActive(idx)}
                  className="flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300"
                  style={{ width: '80px', height: '60px', borderRadius: '10px', opacity: idx === pinkActive ? 1 : 0.5, outline: idx === pinkActive ? '2px solid #e91e8c' : 'none', outlineOffset: '2px' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP — padded slider with rounded corners, thumbnails overlaid inside */}
          <div className="hidden md:block px-8 pb-8">
            <div className="relative overflow-hidden rounded-2xl" style={{ height: '480px' }}>
              {pinkSliderImages.map((src, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: idx === pinkActive ? 1 : 0,
                  }}
                />
              ))}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)' }} />
              {/* Thumbnail strip overlaid inside — bottom right */}
              <div className="absolute bottom-14 right-6 z-10 flex gap-2 items-end">
                {pinkSliderImages.map((src, idx) => (
                  <div key={idx} onClick={() => setPinkActive(idx)}
                    className="relative cursor-pointer rounded-lg overflow-hidden flex-shrink-0 transition-all duration-500"
                    style={{
                      width: idx === pinkActive ? '72px' : '52px',
                      height: idx === pinkActive ? '96px' : '70px',
                      opacity: idx === pinkActive ? 1 : 0.5,
                      boxShadow: idx === pinkActive ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
                      outline: idx === pinkActive ? '2px solid rgba(255,255,255,0.8)' : 'none',
                      outlineOffset: '2px',
                    }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
                <button onClick={() => setPinkActive(prev => (prev - 1 + pinkSliderImages.length) % pinkSliderImages.length)}
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors">
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                </button>
                <button onClick={() => setPinkActive(prev => (prev + 1) % pinkSliderImages.length)}
                  className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors">
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
              <div className="absolute bottom-6 right-6 z-10 text-white/60 text-xs font-bold tracking-widest">
                {String(pinkActive + 1).padStart(2, '0')} / {String(pinkSliderImages.length).padStart(2, '0')}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-10">
                <div key={pinkActive} className="h-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] pink-progress-anim" />
              </div>
            </div>
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
