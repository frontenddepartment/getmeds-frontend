import React, { useEffect, useMemo, useRef, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper, useTeamMembers } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';
import { setPageMeta } from '../lib/seo';
import { LinkableImage } from '../lib/LinkableImage';
import { getApiUrl } from '../lib/api';

export default function AboutUs() {
  useEffect(() => {
    setPageMeta({
      title: 'About Us',
      description: 'A new standard of care for a new generation of patients. Advanced science. Trusted medicine. Closer access. Better outcomes. Greater hope.',
      path: '/about-us.html',
    });
  }, []);

  const { getImage, getImageLink, loading: imagesLoading } = useImageMapper('about-us');
  const valuesContainerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const warehouseVideoRef = useRef<HTMLVideoElement>(null);
  const ungcVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activePanel === 0) warehouseVideoRef.current?.play().catch(() => {});
    else warehouseVideoRef.current?.pause();

    if (activePanel === 1) ungcVideoRef.current?.play().catch(() => {});
    else ungcVideoRef.current?.pause();
  }, [activePanel]);

  const handlePanelFullscreen = (e: React.MouseEvent, ref: React.RefObject<HTMLVideoElement>) => {
    e.stopPropagation();
    const el = ref.current as any;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // Mobile-only slider version of the panels above (md:hidden) — desktop keeps the hover-expand layout untouched.
  const [aboutSlide, setAboutSlide] = useState(0);
  const mobileWarehouseRef = useRef<HTMLVideoElement>(null);
  const mobileUngcRef = useRef<HTMLVideoElement>(null);
  const [mobileWarehousePlaying, setMobileWarehousePlaying] = useState(false);
  const [mobileUngcPlaying, setMobileUngcPlaying] = useState(false);
  const [mobileWarehouseMuted, setMobileWarehouseMuted] = useState(true);
  const [mobileUngcMuted, setMobileUngcMuted] = useState(true);
  const ABOUT_SLIDE_COUNT = 3;

  useEffect(() => {
    if (aboutSlide !== 0) mobileWarehouseRef.current?.pause();
    if (aboutSlide !== 1) mobileUngcRef.current?.pause();
  }, [aboutSlide]);

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ca-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.ca-anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = valuesContainerRef.current;
      if (!container) return;
      const cards = container.querySelectorAll<HTMLElement>('.value-card');
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cards.forEach(card => {
        const speed = parseFloat(card.getAttribute('data-speed') || '1');
        const xOffset = (x * speed) / 50;
        const yOffset = (y * speed) / 50;
        card.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = decodeURIComponent(hash.substring(1));
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 600);
    }
  }, []);

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [partnershipData, setPartnershipData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnershipData.name || !partnershipData.company || !partnershipData.email || !partnershipData.phone || !partnershipData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!partnershipData.consent) {
      alert('Please consent to processing your information.');
      return;
    }
    setSubmitState('sending');
    try {
      const payload = {
        inquiryType: 'Partnership',
        fullName: partnershipData.name,
        email: partnershipData.email,
        phone: partnershipData.phone,
        subject: partnershipData.company,
        message: partnershipData.message,
        files: []
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Partnership submission failed.');
      }

      setSubmitState('sent');
      setPartnershipData({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        consent: false
      });
      setIsInquiryOpen(false);
      setSuccessModalOpen(true);
      setSubmitState('idle');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  const teamTrackRef = useRef<HTMLDivElement>(null);

  // Used only if the Sanity "teams" collection hasn't loaded yet or comes back empty.
  const FALLBACK_TEAM_MEMBERS: { img: string; name: string; role: string; isCeo?: boolean }[] = [
    { img: 'SIRSUBIR.png', name: 'Subir Dey', role: 'Sales & Marketing Coach' },
    { img: 'MAMMIRA.png', name: 'Mira Verango', role: 'Executive & Admin Coach' },
    { img: 'MAMVAN.png', name: 'Vanessa Escalderon', role: 'Hospital Division Coach' },
    { img: 'SIRJAVED.png', name: 'Javed Shaikh', role: 'Sales & Marketing Coach' },
    { img: 'NARESH.png', name: 'Naresh Bishnoi', role: 'Founder & CEO', isCeo: true },
    { img: 'MAMBEA.png', name: 'Beatrice Ampaso', role: "Sales & Business Dev't" },
    { img: 'MAMCHI.png', name: 'Esther Chiong', role: 'In-Licensing Mentor' },
    { img: 'MAMIVY.png', name: 'Ivy Varias', role: 'Regulatory Affairs Mentor' },
    { img: 'MAMMALOU.png', name: 'Malou Jagonoy', role: 'Finance Mentor' },
    { img: 'MAMSARLA.png', name: 'Sarla Devi', role: 'Finance Coach' },
    { img: 'HIZON.png', name: 'Mike Angelo Hizon', role: 'Talent Growth & Development Mentor' },
  ];

  const { data: teamMembersData } = useTeamMembers();

  const TEAM_MEMBERS = useMemo(() => {
    if (teamMembersData && teamMembersData.length > 0) {
      return teamMembersData.map(member => ({
        src: member.image ? urlFor(member.image).width(400).height(550).url() : '',
        name: member.name,
        role: member.designation,
        isCeo: /ceo|founder/i.test(member.designation || ''),
      }));
    }
    return FALLBACK_TEAM_MEMBERS.map(member => ({
      src: getImage(`assets/${member.img}`, `assets/${member.img}`),
      name: member.name,
      role: member.role,
      isCeo: !!member.isCeo,
    }));
  }, [teamMembersData]);

  useEffect(() => {
    const el = teamTrackRef.current;
    if (!el || TEAM_MEMBERS.length === 0) return;
    setTimeout(() => {
      const ceoIndex = TEAM_MEMBERS.findIndex(m => m.isCeo);
      const ceoCard = el.children[ceoIndex >= 0 ? ceoIndex : 0] as HTMLElement;
      if (ceoCard) el.scrollLeft = ceoCard.offsetLeft - (el.offsetWidth / 2) + (ceoCard.offsetWidth / 2);
    }, 80);
  }, [TEAM_MEMBERS]);

  const scrollTeam = (dir: 'left' | 'right') => {
    if (!teamTrackRef.current) return;
    teamTrackRef.current.scrollBy({ left: dir === 'left' ? -216 : 216, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      <style>{`
        @media (max-width: 767px) {
          html { scroll-behavior: smooth; }
        }

        @keyframes caFadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes caFadeLeft { from { opacity:0; transform:translateX(-36px); } to { opacity:1; transform:translateX(0); } }
        @keyframes caFadeRight{ from { opacity:0; transform:translateX(36px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes caZoomIn   { from { opacity:0; transform:scale(0.92);       } to { opacity:1; transform:scale(1);    } }
        @keyframes caFadeIn   { from { opacity:0; }                              to { opacity:1; }                        }

        .ca-anim { opacity: 0; }
        .ca-anim.ca-in.ca-up    { animation: caFadeUp    0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-left  { animation: caFadeLeft  0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-right { animation: caFadeRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-zoom  { animation: caZoomIn    0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-fade  { animation: caFadeIn    0.7s ease forwards; }

        .ca-d1 { animation-delay: 0.10s !important; }
        .ca-d2 { animation-delay: 0.20s !important; }
        .ca-d3 { animation-delay: 0.30s !important; }
        .ca-d4 { animation-delay: 0.40s !important; }
        .ca-d5 { animation-delay: 0.50s !important; }
        .ca-d6 { animation-delay: 0.60s !important; }
        .ca-d7 { animation-delay: 0.70s !important; }
        .ca-d8 { animation-delay: 0.80s !important; }
      `}</style>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Enhanced Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
        <div className={`relative rounded-[10px] md:rounded-[1.5rem] overflow-hidden min-h-[190px] md:min-h-[500px] flex items-end group transition-colors duration-500 ${!heroImgLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
          {/* Background Image (Sanity) — temporarily disabled in favor of a hardcoded hero video below
          {!imagesLoading && (
            <div className="absolute inset-0 z-0">
              <LinkableImage link={getImageLink('About Us Hero Background')} src={getImage('About Us Hero Background', 'assets/fallback.jpg')} data-json-src="hero.image" data-json-alt="hero.imageAlt"
                onLoad={() => setHeroImgLoaded(true)}
                className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-[opacity,transform] duration-700 ${heroImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                alt="About Getmeds" />
            </div>
          )}
          */}

          {/* Background Video — hardcoded, temporary (not Sanity-connected) */}
          <div className="absolute inset-0 z-0">
            <video
              src="/assets/aboutusvideo.mp4"
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setHeroImgLoaded(true)}
              className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-[opacity,transform] duration-700 ${heroImgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full px-3 md:px-14 pb-3 md:pb-16 pt-10 md:pt-20 max-w-4xl ca-anim ca-up">
            <h1 className="text-[11px] md:text-[38px] leading-[1.2] font-bold mb-1 md:mb-3 tracking-tight">
              <span data-json="hero.heading" className="text-white">Your Compassionate</span><br />
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">Health
                Ally</span>
            </h1>
            <p data-json="hero.description" className="text-white/90 text-[9px] md:text-[14px] max-w-[600px] mb-2 md:mb-5 leading-normal font-normal">
              A new standard of care for a new generation of patients.
              Advanced science. Trusted medicine. Closer access. Better outcomes. Greater hope.

            </p>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <a href="#our-story"
                onClick={e => { e.preventDefault(); document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn-gradient text-white font-semibold py-1 px-3.5 md:py-2 md:px-6 rounded-full text-[9px] md:text-[13px] inline-flex items-center gap-1.5 md:gap-2 shadow-md">
                Discover Our Story <i className="fa-solid fa-arrow-down text-xs"></i>
              </a>
              <a href="contact-us.html"
                className="bg-white/10 backdrop-blur-md border border-white/25 text-white font-semibold py-1 px-3.5 md:py-2 md:px-6 rounded-full text-[9px] md:text-[13px] hover:bg-white/20 transition inline-flex items-center gap-1.5 md:gap-2">
                Contact Us <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section id="our-story" className="pt-10 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 ca-anim ca-up">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight max-w-lg">
              Inside Getmeds: Our People &amp; Culture
            </h2>
            <div className="flex flex-col items-start gap-3 md:max-w-sm">
              <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-2">
                From training rooms to international conferences, our team is united by one shared mission — making life-saving medicine accessible to all.
              </p>
              <a href="/careers"
                className="inline-flex items-center gap-2 bg-primary text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
                Explore Careers
              </a>
            </div>
          </div>

          {/* Expanding Panels (desktop/tablet only — mobile uses the full-width slider below) */}
          <div className="hidden md:flex gap-3 h-[340px] md:h-[400px] mb-20 ca-anim ca-fade"
            onMouseLeave={() => setActivePanel(0)}>

            {/* Panel 1 — Left */}
            <div className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ flex: activePanel === 0 ? 3 : 0.8, minWidth: 0, transition: 'flex 0.5s ease' }}
              onMouseEnter={() => setActivePanel(0)}>
              <video
                ref={warehouseVideoRef}
                src="assets/WAREHOUSE.mp4"
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={e => handlePanelFullscreen(e, warehouseVideoRef)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 z-10"
                aria-label="View fullscreen"
              >
                <i className="fa-solid fa-expand text-sm"></i>
              </button>
            </div>

            {/* Panel 2 — Center */}
            <div className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ flex: activePanel === 1 ? 3 : 0.8, minWidth: 0, transition: 'flex 0.5s ease' }}
              onMouseEnter={() => setActivePanel(1)}>
              <video
                ref={ungcVideoRef}
                src="assets/UNGC.mp4"
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={e => handlePanelFullscreen(e, ungcVideoRef)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 z-10"
                aria-label="View fullscreen"
              >
                <i className="fa-solid fa-expand text-sm"></i>
              </button>
            </div>

            {/* Panel 3 — Right */}
            <div className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ flex: activePanel === 2 ? 3 : 0.8, minWidth: 0, transition: 'flex 0.5s ease' }}
              onMouseEnter={() => setActivePanel(2)}>
              <LinkableImage link={getImageLink('About Us Team Image 3')} src={getImage('About Us Team Image 3', 'assets/aboutuseight.jpg')}
                alt="Getmeds Strategy & Innovation"
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-lg md:text-xl font-bold leading-snug whitespace-nowrap">
                  Strategy &amp; Innovation
                </h3>
                <p className={`text-white/70 text-[13px] leading-relaxed mt-2 max-w-xs transition-opacity duration-300 delay-150 ${activePanel === 2 ? 'opacity-100' : 'opacity-0'}`}>
                  Data-driven decisions and strategic partnerships that advance pharmaceutical access across Asia-Pacific and beyond.
                </p>
              </div>
            </div>

          </div>

          {/* Mobile Slider (mobile only — desktop keeps the hover-expand panels above) */}
          <div className="md:hidden relative rounded-2xl overflow-hidden aspect-video mb-20 ca-anim ca-fade">

            {/* Slide 1 — Warehouse video */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${aboutSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <video
                ref={mobileWarehouseRef}
                src="assets/WAREHOUSE.mp4"
                muted={mobileWarehouseMuted}
                loop
                playsInline
                onPlay={() => setMobileWarehousePlaying(true)}
                onPause={() => setMobileWarehousePlaying(false)}
                className="w-full h-full object-contain bg-black"
              />
              {!mobileWarehousePlaying && (
                <button
                  onClick={() => mobileWarehouseRef.current?.play()}
                  className="absolute inset-0 flex items-center justify-center bg-black/20"
                  aria-label="Play video"
                >
                  <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-play text-gray-900 text-xl ml-1"></i>
                  </span>
                </button>
              )}
              <button
                onClick={e => handlePanelFullscreen(e, mobileWarehouseRef)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 z-10"
                aria-label="View fullscreen"
              >
                <i className="fa-solid fa-expand text-sm"></i>
              </button>
            </div>

            {/* Slide 2 — UNGC video */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${aboutSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <video
                ref={mobileUngcRef}
                src="assets/UNGC.mp4"
                muted={mobileUngcMuted}
                loop
                playsInline
                onPlay={() => setMobileUngcPlaying(true)}
                onPause={() => setMobileUngcPlaying(false)}
                className="w-full h-full object-contain bg-black"
              />
              {!mobileUngcPlaying && (
                <button
                  onClick={() => mobileUngcRef.current?.play()}
                  className="absolute inset-0 flex items-center justify-center bg-black/20"
                  aria-label="Play video"
                >
                  <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-play text-gray-900 text-xl ml-1"></i>
                  </span>
                </button>
              )}
              <button
                onClick={e => handlePanelFullscreen(e, mobileUngcRef)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 z-10"
                aria-label="View fullscreen"
              >
                <i className="fa-solid fa-expand text-sm"></i>
              </button>
            </div>

            {/* Slide 3 — Strategy & Innovation image */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${aboutSlide === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <LinkableImage link={getImageLink('About Us Team Image 3')} src={getImage('About Us Team Image 3', 'assets/aboutuseight.jpg')}
                alt="Getmeds Strategy & Innovation"
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-14 left-0 right-0 p-6">
                <h3 className="text-white text-lg font-bold leading-snug whitespace-nowrap">
                  Strategy &amp; Innovation
                </h3>
                <p className="text-white/70 text-[13px] leading-relaxed mt-2 max-w-xs">
                  Data-driven decisions and strategic partnerships that advance pharmaceutical access across Asia-Pacific and beyond.
                </p>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-between px-4">
              {/* Left: pause + volume (video slides only) */}
              <div className="flex items-center gap-2" style={{ minWidth: '76px' }}>
                {(aboutSlide === 0 || aboutSlide === 1) && (() => {
                  const videoRef = aboutSlide === 0 ? mobileWarehouseRef : mobileUngcRef;
                  const playing = aboutSlide === 0 ? mobileWarehousePlaying : mobileUngcPlaying;
                  const muted = aboutSlide === 0 ? mobileWarehouseMuted : mobileUngcMuted;
                  const setMuted = aboutSlide === 0 ? setMobileWarehouseMuted : setMobileUngcMuted;
                  return (
                    <>
                      <button
                        onClick={() => { playing ? videoRef.current?.pause() : videoRef.current?.play(); }}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition"
                        aria-label={playing ? 'Pause video' : 'Play video'}
                      >
                        <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                      </button>
                      <button
                        onClick={() => setMuted(m => !m)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition"
                        aria-label={muted ? 'Unmute video' : 'Mute video'}
                      >
                        <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xs`}></i>
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Center: prev / dots / next */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAboutSlide(s => (s - 1 + ABOUT_SLIDE_COUNT) % ABOUT_SLIDE_COUNT)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition"
                  aria-label="Previous slide"
                >
                  <i className="fa-solid fa-chevron-left text-white text-xs"></i>
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: ABOUT_SLIDE_COUNT }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setAboutSlide(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === aboutSlide ? '24px' : '8px',
                        height: '8px',
                        background: i === aboutSlide ? 'white' : 'rgba(255,255,255,0.45)',
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setAboutSlide(s => (s + 1) % ABOUT_SLIDE_COUNT)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition"
                  aria-label="Next slide"
                >
                  <i className="fa-solid fa-chevron-right text-white text-xs"></i>
                </button>
              </div>

              {/* Right spacer to balance the left group so the slide controls stay centered */}
              <div style={{ minWidth: '76px' }} />
            </div>
          </div>

          {/* Content Section (Bottom) */}
          <div className="flex flex-col gap-10">

            {/* Introduction about getmeds */}
            <div className="ca-anim ca-up">
              <h3
                className="inline-block text-3xl md:text-4xl lg:text-[35px] leading-tight font-semibold mb-8 tracking-tight text-gray-900">
                About Us</h3>
              <div className="space-y-6">
                <p className="text-gray-600 text-[15px] leading-[1.8]">
                  Getmeds, established in 2020, is a global pharmaceutical company based in the Philippines with a diverse portfolio spanning Oncology, Hematology, Anesthesiology, and Rare Diseases. It is driven by innovation, science, and a deep commitment to improving access and affordability of life-changing therapies for Filipino patients and healthcare partners.
                  At its core, Getmeds is guided by compassion — ensuring that every medicine delivered reflects care, dignity, and hope for patients and families in need. With a strong focus on accessibility and cost-effective healthcare solutions, the company works to make high-quality treatments more reachable, especially for underserved communities.
                  With its continuing expansion across the Asia-Pacific region and beyond, Getmeds is poised to create an even greater impact on global healthcare.
                </p>

                {/* Highlights */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <p className="text-dark font-semibold text-[16px] mb-5">Highlights</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                      {
                        title: 'FDA Philippines Licensed Distributor',
                        desc: 'Licensed by the Food and Drug Administration of the Philippines for pharmaceutical importation, wholesale, and distribution.',
                      },
                      {
                        title: 'UN Global Compact Member & SDG Driver',
                        desc: "Aligned with the United Nations' ten principles and actively contributing to the UN Sustainable Development Goals through ethical, responsible business practices.",
                      },
                      {
                        title: 'WHO Good Storage and Distribution Practices Compliant',
                        desc: 'Operating to World Health Organization standards for pharmaceutical storage, handling, and distribution.',
                      },
                      {
                        title: 'PDEA Licensed (S-4 and S-5)',
                        desc: 'Philippine Drug Enforcement Agency licensed for the handling and distribution of dangerous drugs (S-4) and controlled precursor chemicals (S-5).',
                      },
                      {
                        title: 'BOC Compliant',
                        desc: 'Fully compliant with Bureau of Customs requirements for pharmaceutical importation and clearance.',
                      },
                      {
                        title: 'EDPMS Compliant',
                        desc: 'Electronic Drug Price Monitoring System compliant — fulfilling DOH price reporting and transparency requirements.',
                      },
                      {
                        title: 'PCO Accredited',
                        desc: 'Pollution Control Officer accredited under DENR Environmental Management Bureau standards.',
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] mt-0.5" style={{ background: '#61A644' }}>
                          <i className="fa-solid fa-check"></i>
                        </div>
                        <div>
                          <p className="font-bold text-[15px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-snug mb-1">
                            {item.title}
                          </p>
                          <p className="text-[13px] text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dedicated To */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <p className="text-dark font-semibold text-[16px] mb-4">Dedicated to:</p>
                  <ul className="flex flex-wrap gap-2 md:grid md:grid-cols-3 md:gap-y-3 md:gap-x-8 md:text-[14px] text-gray-500 font-medium">
                    {[
                      'Precision Pharmaceutical Distribution',
                      'Patient Access Programs',
                      'Strategic Global Sourcing',
                      'Cold-Chain & Last-Mile Delivery',
                      'Regulatory Compliance & FDA Philippines Licensing',
                      'Hospital & Pharmacy Partnerships',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-1.5 md:gap-2 bg-gray-50 md:bg-transparent border border-gray-100 md:border-0 rounded-full md:rounded-none px-3 py-1.5 md:px-0 md:py-0 text-[12px] md:text-[14px]">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1D9FDA' }}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enhanced Mission, Vision & Values */}
      <section className="pt-0 pb-16 bg-white overflow-hidden">
        <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mission Card */}
          <div
            className="ca-anim ca-left relative bg-white p-8 md:p-12 flex flex-col md:flex-row items-center text-center md:text-left group rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden gap-8 md:gap-12">
            {/* Accent Line */}
            <div
              className="absolute top-0 left-0 w-full h-2 md:w-2 md:h-full bg-gradient-to-r md:bg-gradient-to-b from-[#61A644] to-[#1D9FDA] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
            {/* Watermark */}
            <i
              className="fa-solid fa-bullseye absolute -bottom-10 -right-10 text-[10rem] md:text-[14rem] text-gray-50 opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700"></i>

            {/* Icon Container */}
            <div
              className="flex-shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-white transform group-hover:scale-110 transition-transform duration-500 z-10">
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] blur-[15px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500">
              </div>
              <i className="fa-solid fa-bullseye text-gradient text-4xl md:text-6xl relative z-10"></i>
            </div>

            <div className="relative z-10">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-xs uppercase tracking-widest mb-1 block">Our Drive</span>
              <h3
                className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest mb-3 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">
                Mission</h3>
              <p data-json="mission.text" className="text-gray-500 text-[15px] md:text-base leading-relaxed font-medium">
                Our mission is to transform the landscape of oncological, hematological, critical care, rare medicine and healthcare e-commerce through relentless innovation, compassionate service, and international collaboration.
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className="ca-anim ca-right ca-d2 relative bg-white p-8 md:p-12 flex flex-col md:flex-row items-center text-center md:text-left group rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden gap-8 md:gap-12">
            {/* Accent Line */}
            <div
              className="absolute top-0 left-0 w-full h-2 md:w-2 md:h-full bg-gradient-to-r md:bg-gradient-to-b from-[#61A644] to-[#1D9FDA] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
            {/* Watermark */}
            <i
              className="fa-solid fa-eye absolute -bottom-10 -right-10 text-[10rem] md:text-[14rem] text-gray-50 opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700"></i>

            {/* Icon Container */}
            <div
              className="flex-shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-white transform group-hover:scale-110 transition-transform duration-500 z-10">
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] blur-[15px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500">
              </div>
              <i className="fa-solid fa-eye text-gradient text-4xl md:text-6xl relative z-10"></i>
            </div>

            <div className="relative z-10">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-xs uppercase tracking-widest mb-1 block">Our Goal</span>
              <h3
                className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest mb-3 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">
                Vision</h3>
              <p data-json="vision.text" className="text-gray-500 text-[15px] md:text-base leading-relaxed font-medium">
                To be the global beacon of hope and innovation, tirelessly dedicated to improving the lives of humankind. We envision a world where every patient has access from the first line treatments to the most advanced medicines, where borders do not limit healthcare, and where our unwavering commitment shines through every corner of the globe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitments Section */}
      <section className="pt-20 pb-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-14 ca-anim ca-up">
            {/* Left: title */}
            <div>
              <h2 className="text-[28px] md:text-[36px] font-semibold text-dark leading-tight tracking-tight">
                Enhancing patient connectivity and clinical reach.
              </h2>
            </div>
            {/* Right: eyebrow + description */}
            <div>
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-sm uppercase tracking-widest mb-4 block">OUR COMMITMENTS</span>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                With relentless dedication to innovation, empathy, and accessible global healthcare solutions.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Collaboration and Excellence */}
            <div className="ca-anim ca-up bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-handshake text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Collaboration and Excellence</h4>
              <p className="text-sm text-gray-500 leading-relaxed">By fostering collaborations with leading medical professionals, researchers, and partners, we strive for synergistic partnerships that aim to accelerate breakthroughs and reshape the future of healthcare.</p>
            </div>

            {/* Compassion & Integrity — gradient highlight */}
            <div className="ca-anim ca-up ca-d2 p-7 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #61A644 0%, #1D9FDA 100%)' }}>
              <i className="fa-solid fa-heart text-2xl text-white mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-white mb-3 uppercase tracking-wider">Compassion &amp; Integrity</h4>
              <p className="text-sm text-white/85 leading-relaxed">Our foundation is built upon compassion for patients and their families. We are unwavering in our commitment to integrity and transparency, ensuring every action is guided by doing what is right.</p>
            </div>

            {/* Pioneering Medicine Solutions */}
            <div className="ca-anim ca-up ca-d4 bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-flask text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Pioneering Medicine Solutions</h4>
              <p className="text-sm text-gray-500 leading-relaxed">We are dedicated to delivering medicine solutions that address the unmet needs of patients worldwide, exploring novel therapies that make a difference in challenging medical conditions.</p>
            </div>

            {/* Global Accessibility */}
            <div className="ca-anim ca-up ca-d1 bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-earth-americas text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Global Accessibility</h4>
              <p className="text-sm text-gray-500 leading-relaxed">We believe healthcare knows no boundaries. Our commitment to a seamless global presence through synergistic partnerships ensures the needs of patients are met globally without delay.</p>
            </div>

            {/* Empowering Patients */}
            <div className="ca-anim ca-up ca-d3 bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-user-shield text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Empowering Patients</h4>
              <p className="text-sm text-gray-500 leading-relaxed">We strive to empower patients by providing them with accessible connection to life-saving medicines and providers, cutting-edge treatments, and vital healthcare resources.</p>
            </div>

            {/* Advancing Healthcare E-Commerce */}
            <div className="ca-anim ca-up ca-d5 bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-cart-shopping text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Advancing Healthcare E-Commerce</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Through our state-of-the-art e-commerce platform, we aim to redefine healthcare accessibility. Our seamless and secure online marketplace will ensure patients and providers can access medications regardless of geographic boundaries.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="pt-10 md:pt-14 pb-16 bg-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 md:mb-14 ca-anim ca-up">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-sm uppercase tracking-widest mb-4 block">Core Values</span>
            <h2 className="text-[28px] md:text-[38px] leading-tight font-semibold text-dark mb-3 tracking-tight">
              The Heart of Our{' '}
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Purpose</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3" id="values-container" ref={valuesContainerRef}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-heart text-[#EC4899] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Compassion</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-shield-heart text-[#8B5CF6] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Integrity</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-microscope text-[#1D9FDA] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Precision</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-lightbulb text-[#EAB308] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Innovation</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-lock text-[#6366F1] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Security</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-truck-fast text-[#F59E0B] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Speed</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-user-doctor text-[#14B8A6] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Expertise</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-earth-asia text-[#06B6D4] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Global</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-vial-circle-check text-[#10B981] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Safety</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-hand-holding-medical text-[#F43F5E] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Care</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-tags text-[#8B5CF6] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Affordable</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-clipboard-check text-[#3B82F6] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Reliable</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-people-group text-[#F97316] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Community</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#1D9FDA] hover:text-[#1D9FDA] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ca-anim ca-zoom">
              <i className="fa-solid fa-award text-[#EAB308] text-sm"></i>
              <span className="text-[13px] font-medium text-gray-600">Excellence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="pt-12 pb-20 bg-white relative overflow-hidden">
        {/* Left gradient decoration */}
        <div className="absolute left-0 top-0 h-full w-56 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 224 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="whyChooseLeftGrad" cx="0%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#61A644" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#1D9FDA" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFF7ED" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="224" height="600" fill="url(#whyChooseLeftGrad)" />
            <path d="M 0 520 A 80 80 0 0 1 80 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 440 A 160 160 0 0 1 160 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 360 A 240 240 0 0 1 224 514" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 280 A 320 320 0 0 1 224 372" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 200 A 400 400 0 0 1 224 269" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 120 A 480 480 0 0 1 224 176" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 40 A 560 560 0 0 1 224 87" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Right gradient decoration */}
        <div className="absolute right-0 top-0 h-full w-56 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 224 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="whyChooseRightGrad" cx="100%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#61A644" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#1D9FDA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFF1F2" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="224" height="600" fill="url(#whyChooseRightGrad)" />
            <path d="M 224 520 A 80 80 0 0 0 144 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 440 A 160 160 0 0 0 64 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 360 A 240 240 0 0 0 0 514" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 280 A 320 320 0 0 0 0 372" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 200 A 400 400 0 0 0 0 269" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 120 A 480 480 0 0 0 0 176" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 40 A 560 560 0 0 0 0 87" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 ca-anim ca-up">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-sm uppercase tracking-wider mb-2 block">Our Advantages</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">Why Choose <span
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Getmeds</span>?
            </h2>
            <p className="text-gray-500 text-[15px]">We go above and beyond to ensure our services exceed your
              expectations when it comes to your health and convenience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="ca-anim ca-up bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-globe text-3xl text-primary mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Globally Sourced Quality</h4>
              <p className="text-sm text-gray-500">Verified under FDA Philippines and international quality standards.</p>
            </div>

            <div className="ca-anim ca-up ca-d2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-capsules text-3xl text-success mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Hard-to-Find Access</h4>
              <p className="text-sm text-gray-500">Compassionate Special Permit imports and rare disease therapies unavailable elsewhere.</p>
            </div>

            <div className="ca-anim ca-up ca-d4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-truck-fast text-3xl text-[#5533FF] mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Nationwide Logistics</h4>
              <p className="text-sm text-gray-500">Reliable cold-chain delivery across Luzon, Visayas, and Mindanao.</p>
            </div>

            <div className="ca-anim ca-up ca-d6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-hand-holding-heart text-3xl text-[#FFB020] mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Sustainable Pricing</h4>
              <p className="text-sm text-gray-500">Rapid-response sourcing and fair pricing for the patients and partners we serve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Leaders — Horizontal Carousel */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 px-4 ca-anim ca-zoom">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Our Leaders</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">The People Behind <span
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Getmeds</span>
            </h2>
            <p className="text-gray-500 text-[15px]">With combined expertise across pharmaceutical operations, sales and business development, in-licensing, regulatory affairs, finance, and supply chain, our team brings decades of experience guided by compassion, driven by innovation, and grounded in quality.</p>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={() => scrollTeam('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>

            {/* Scroll track */}
            <div
              ref={teamTrackRef}
              className="flex gap-4 overflow-x-auto"
              style={{
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingTop: '16px',
                paddingBottom: '28px',
              } as React.CSSProperties}
            >
              {TEAM_MEMBERS.map((member, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 relative overflow-hidden rounded-[1.3rem] group transition-all duration-500 hover:-translate-y-2"
                  style={{
                    width: 200,
                    height: 275,
                    scrollSnapAlign: 'center',
                    background: 'linear-gradient(180deg,#61A644,#1D9FDA)',
                    ...(member.isCeo ? { boxShadow: '0 8px 32px rgba(29,159,218,0.35)', outline: '2.5px solid rgba(29,159,218,0.4)' } : {}),
                  }}
                >
                  {/* GETMEDS watermark behind photo */}
                  <div className="absolute top-0 left-0 z-[1] flex items-start justify-center overflow-hidden" style={{ width: '42px', height: '100%', paddingTop: '16px' }}>
                    <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: 'rgba(255,255,255,0.22)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', whiteSpace: 'nowrap', userSelect: 'none' }}>Getmeds</span>
                  </div>
                  {/* Photo sits on top of gradient background; falls back to placeholder if the asset 404s */}
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-1 rounded-[1.3rem] z-[2]">
                    <i className="fa-regular fa-image text-white/70" style={{ fontSize: '16px' }}></i>
                    <span className="text-white/70" style={{ fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>No image</span>
                  </div>
                  {member.src && (
                    <img src={member.src} alt={member.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="absolute inset-0 w-full h-full object-cover object-top rounded-[1.3rem] transition-all duration-700 z-[3]" />
                  )}
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 w-full px-3 py-3 z-10" style={{ background: 'linear-gradient(to top,rgba(29,159,218,0.95) 0%,rgba(97,166,68,0.1) 70%,transparent 100%)' }}>
                    <h4 className="text-white font-semibold leading-tight" style={{ fontSize: '0.92rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '2px' }}>{member.name}</h4>
                    <p className="text-white/90 font-semibold uppercase tracking-wider" style={{ fontSize: '0.62rem' }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scrollTeam('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition"
            >
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>

            {/* Gradient edge fades */}
            <div className="absolute left-0 inset-y-0 w-28 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 inset-y-0 w-28 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          </div>

        </div>
      </section>

      {/* Our Partners */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 ca-anim ca-zoom">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Trust Network</span>
            <h2 className="text-3xl font-semibold text-dark mb-4">Strategic Partners &amp; Affiliates</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center ca-anim ca-zoom">
            <div className="flex items-center justify-center p-6 transition-all duration-300 transform hover:scale-110">
              <div className="flex items-center gap-2 opacity-60">
                <i className="fa-solid fa-hospital-user text-3xl"></i>
                <span className="font-bold text-xl tracking-tighter">PHARMA<span className="text-primary">LINK</span></span>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 transition-all duration-300 transform hover:scale-110">
              <div className="flex items-center gap-2 opacity-60">
                <i className="fa-solid fa-flask-vial text-3xl"></i>
                <span className="font-bold text-xl tracking-tighter">LAB<span className="text-accent text-[#61A644]">TECH</span></span>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 transition-all duration-300 transform hover:scale-110">
              <div className="flex items-center gap-2 opacity-60">
                <i className="fa-solid fa-heart-pulse text-3xl"></i>
                <span className="font-bold text-xl tracking-tighter">VITALI<span className="text-blue-400">CARE</span></span>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 transition-all duration-300 transform hover:scale-110">
              <div className="flex items-center gap-2 opacity-60">
                <i className="fa-solid fa-lock text-3xl"></i>
                <span className="font-bold text-xl tracking-tighter">SECURE<span className="text-gray-400">HEALTH</span></span>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 transition-all duration-300 transform hover:scale-110">
              <div className="flex items-center gap-2 opacity-60">
                <i className="fa-solid fa-truck-ramp-box text-3xl"></i>
                <span className="font-bold text-xl tracking-tighter">SWIFT<span className="text-primary">LOG</span></span>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 transition-all duration-300 transform hover:scale-110">
              <div className="flex items-center gap-2 opacity-60">
                <LinkableImage link={getImageLink('UNGC Logo Partner')} src={getImage('UNGC Logo Partner', 'assets/UNGClogo.png')} className="h-10 object-contain" alt="UNGC Logo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden ca-anim ca-zoom">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>

            <h2 className="text-xl md:text-2xl font-bold mb-3 relative z-10">Every patient. Every doctor. Every pharmacy. Every partner.</h2>
            <p className="text-blue-50 text-sm md:text-base mb-6 max-w-2xl mx-auto relative z-10">Getmeds is built for all of them. Whether you're seeking medicine, sourcing therapies, exploring partnerships, or joining our team — one message reaches the right hands.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
              <a href="contact-us.html"
                className="bg-white text-blue-600 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-gray-50 transition transform hover:-translate-y-1">
                Contact Us
              </a>
              <button onClick={() => setIsInquiryOpen(true)}
                className="bg-transparent border-2 border-white text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white/10 transition transform hover:-translate-y-1">
                Partner With Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

      {/* Slide-out Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isInquiryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsInquiryOpen(false)}
      ></div>

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-4 right-4 h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md bg-white shadow-2xl rounded-[15px] z-[160] transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto ${isInquiryOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}
      >
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={() => setIsInquiryOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>

          {/* Drawer Header */}
          <div className="mb-6 pr-8 mt-2">
            <h2 className="text-[28px] font-semibold text-slate-900 mb-1 leading-tight tracking-tight">Partner with Getmeds</h2>
            <h3 className="text-sm font-medium text-primary mb-4">Advancing Healthcare Together</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed text-justify">
              Join Getmeds in expanding access to quality medicines and innovative healthcare solutions across the Philippines and beyond.<br />We'd like to hear from you.
            </p>
          </div>

          {/* Inquiry Form */}
          <form className="space-y-4" onSubmit={handlePartnershipSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Juan Dela Cruz"
                value={partnershipData.name}
                onChange={e => setPartnershipData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Company/Organization <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. General Hospital Inc."
                value={partnershipData.company}
                onChange={e => setPartnershipData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" required placeholder="e.g. juan@hospital.com"
                value={partnershipData.email}
                onChange={e => setPartnershipData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile number <span className="text-red-500">*</span></label>
              <input type="tel" inputMode="numeric" required placeholder="e.g. +63 912 345 6789"
                value={partnershipData.phone}
                onChange={e => setPartnershipData(prev => ({ ...prev, phone: e.target.value.replace(/[^\d+\s\-()]/g, '') }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tell us how we can help <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={partnershipData.message}
                onChange={e => setPartnershipData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] resize-none placeholder-gray-400"
                placeholder="Briefly tell us about your inquiry — whether you're a hospital, pharmacy, manufacturer, or healthcare partner."
              ></textarea>
            </div>

            <div className="flex items-start space-x-3 pt-1">
              <input type="checkbox" required id="consent"
                checked={partnershipData.consent}
                onChange={e => setPartnershipData(prev => ({ ...prev, consent: e.target.checked }))}
                className="mt-[2px] w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" />
              <label htmlFor="consent" className="text-[11px] text-gray-500 leading-snug cursor-pointer select-none">
                I consent to Getmeds processing my information in accordance with the Data Privacy Act of 2012. <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="pt-2 pb-8">
              <button
                type="submit"
                disabled={submitState === 'sending'}
                className="w-full bg-gradient-to-r from-primary to-[#1D9FDA] hover:opacity-90 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
              >
                <span>{submitState === 'sending' ? 'Sending...' : 'Send inquiry'}</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Partnership Success Modal */}
      {successModalOpen && (
        <>
          <style>{`@keyframes checkBounce{0%{transform:scale(0);opacity:0}55%{transform:scale(1.06);opacity:1}75%{transform:scale(0.97)}100%{transform:scale(1);opacity:1}}.check-bounce{animation:checkBounce 0.8s ease-out forwards}`}</style>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden">
              <button onClick={() => setSuccessModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
              <div className="px-10 pt-12 pb-8 text-center">
                <div className="flex justify-center mb-7">
                  <div className="check-bounce w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#61A644,#1D9FDA)' }}>
                    <i className="fa-solid fa-check text-white text-xl"></i>
                  </div>
                </div>
                <h2 className="text-[19px] font-semibold text-gray-900 mb-4 leading-snug">Thank you for considering Getmeds as your partner.</h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Our business development team will contact you within 2 working days to discuss collaboration opportunities. For urgent concerns, please call{' '}
                  <a href="tel:+639190769103" className="text-[#1D9FDA] font-semibold hover:underline">+63 919 076 9103</a>.
                </p>
              </div>
              <div className="border-t border-gray-100 px-10 py-4 text-center">
                <button onClick={() => setSuccessModalOpen(false)}
                  className="text-[13px] font-semibold hover:underline"
                  style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
