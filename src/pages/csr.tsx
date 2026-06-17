import React, { useEffect, useRef } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';

const Csr: React.FC = () => {
  const { getImage, getSliderImages } = useImageMapper('csr');

  const csrSliderImages = getSliderImages('CSR Slider Gallery', [
    'assets/csrslider3.png',
    'assets/csrslider2.png',
    'assets/csrslider1.png',
    'assets/csrslider4.png',
    'assets/csrslider5.png'
  ]);

  const papSliderImages = getSliderImages('PAP Slider Gallery', [
    'assets/papsliderone.png',
    'assets/papslidertwo.png',
    'assets/papsliderthree.png'
  ]);

  const pinkSliderImages = getSliderImages('Pink Run Slider Gallery', [
    'assets/pinkrunone.png',
    'assets/pinkruntwo.png',
    'assets/pinkrunthree.png'
  ]);
  const galleryRef = useRef<HTMLDivElement>(null);
  const assistViewportRef = useRef<HTMLDivElement>(null);
  const pinkViewportRef = useRef<HTMLDivElement>(null);

  // Navbar / Footer injection
  useEffect(() => {
    fetch('/components/navbar.html')
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('navbar-container');
        if (el) injectHTML(el, html);
      });
    fetch('/components/footer.html')
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

  // Pink Run 3D slider
  useEffect(() => {
    if (!pinkViewportRef.current) return;
    const pinkCards = pinkViewportRef.current.querySelectorAll<HTMLElement>('.pink-card');
    const pinkNext = document.getElementById('pink-next');
    const pinkPrev = document.getElementById('pink-prev');
    let pinkPositions = [0, 1, -1];

    const updatePinkCards = () => {
      pinkCards.forEach((card, i) => {
        card.setAttribute('data-pos', String(pinkPositions[i]));
      });
    };

    const handleNext = () => {
      pinkPositions.push(pinkPositions.shift()!);
      updatePinkCards();
    };

    const handlePrev = () => {
      pinkPositions.unshift(pinkPositions.pop()!);
      updatePinkCards();
    };

    pinkNext?.addEventListener('click', handleNext);
    pinkPrev?.addEventListener('click', handlePrev);
    const interval = setInterval(handleNext, 6000);

    return () => {
      pinkNext?.removeEventListener('click', handleNext);
      pinkPrev?.removeEventListener('click', handlePrev);
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

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      {/* Navbar — outside overflow wrapper so sticky works */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden mb-0" style={{ height: '505px' }}>
        <img
          src={getImage('assets/patienthand.jpg', 'assets/patienthand.jpg')}
          alt="Corporate Social Responsibility"
          className="w-full h-full object-cover object-center brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

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

        <div className="absolute bottom-0 left-0 px-8 md:px-14 pb-12 md:pb-16 max-w-4xl reveal z-[3]">
          <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-3 tracking-tight">
            <span className="text-white">Corporate Social</span><br />
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">
              Responsibility
            </span>
          </h1>
          <p className="text-white/90 text-[13px] md:text-[14px] max-w-[650px] mb-5 leading-normal font-normal">
            We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital
            health advocacy, we ensure no patient navigates their journey alone.
          </p>
          <button
            onClick={() => document.getElementById('csr-content-start')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-2 px-6 rounded-full text-[13px] inline-block transition shadow-md">
            Read More
          </button>
        </div>
      </section>

      {/* FREE CANCER MEDICINES PROGRAM */}
      <section id="csr-content-start" className="pt-16 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 items-center mb-12 reveal">
            {/* Left: Image */}
            <div className="lg:w-1/2 flex justify-center">
              <img
                src={getImage('assets/csrimage1.png', 'assets/csrimage1.png')}
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
          <div className="max-w-5xl mx-auto mb-24 reveal">
            <h4 className="text-dark font-semibold text-[16px] mb-6 tracking-tight">Watch some of our patients' journeys here:</h4>
            <div className="flex items-center gap-6">
              <a href="https://youtu.be/aIKzCDi2NGA" target="_blank" rel="noreferrer"
                className="text-[#0D99FF] text-[13px] font-medium flex flex-col items-center gap-2 hover:underline shrink-0 w-28 text-center">
                <i className="fa-brands fa-youtube text-red-500 text-2xl"></i>
                https://youtu.be/aIKzCDi2NGA
              </a>
              <div className="flex-1 overflow-hidden rounded-2xl shadow-lg aspect-video">
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
              <a href="https://www.facebook.com/reel/971664227768897" target="_blank" rel="noreferrer"
                className="text-[#0D99FF] text-[13px] font-medium flex flex-col items-center gap-2 hover:underline shrink-0 w-28 text-center">
                <i className="fa-brands fa-facebook text-blue-600 text-2xl"></i>
                https://www.facebook.com/reel/971664227768897
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SLIDER */}
      <section className="py-10 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16 reveal">
          <h2 className="text-dark font-semibold text-3xl md:text-4xl tracking-tight mb-4">Free Cancer Medicines{' '}<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Program</span></h2>
          <p className="text-gray-500 text-[14px] md:text-[16px] max-w-2xl mx-auto leading-relaxed">
            Discover exciting opportunities to grow your career with us. We are looking for passionate individuals
            to join our mission-driven team.
          </p>
        </div>
        <div className="gallery-container" ref={galleryRef}>
          {csrSliderImages.map((src, idx) => (
            <div key={idx} className={`gallery-item pos-${idx}`}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </section>

      {/* PATIENT ASSISTANCE PROGRAM */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12 reveal">
          <h2 className="text-dark font-semibold text-3xl md:text-4xl tracking-tight mb-4">Patient Assistance{' '}<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Program</span></h2>
          <p className="text-gray-500 text-[14px] md:text-[15px] max-w-2xl mx-auto leading-relaxed">
            Discover exciting opportunities to grow your career with us. We are looking for passionate individuals
            to join our mission-driven team.
          </p>
        </div>
        <div className="relative w-full max-w-[1200px] mx-auto px-4">
          <div
            id="assist-3d-viewport"
            ref={assistViewportRef}
            className="relative h-[280px] md:h-[400px] w-full flex items-center justify-center [perspective:1200px] overflow-visible"
          >
            {papSliderImages.map((src, idx) => {
              const posMap = ['0', '1', '-1'];
              const extraMap = ['z-20 opacity-100', 'z-10 opacity-60', 'z-10 opacity-60'];
              const shadowMap = ['shadow-2xl', 'shadow-lg', 'shadow-lg'];
              return (
                <div
                  key={idx}
                  className={`assist-card absolute w-[280px] md:w-[750px] transition-all duration-700 ease-out cursor-pointer ${extraMap[idx]}`}
                  data-pos={posMap[idx]}
                >
                  <img
                    src={src}
                    alt=""
                    className={`w-full h-[220px] md:h-[360px] object-cover rounded-[1rem] ${shadowMap[idx]}`}
                  />
                </div>
              );
            })}
            <button id="assist-prev"
              className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-all z-40 hover:scale-110">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button id="assist-next"
              className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-all z-40 hover:scale-110">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* CHRISTMAS PROMO & CANCER WARRIORS */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center mb-32">
            <div className="lg:w-1/2">
              <img src={getImage('assets/cancerpatient.png', 'assets/cancerpatient.png')} alt="Christmas Promo Hug" className="w-full rounded-3xl shadow-2xl" />
            </div>
            <div className="lg:w-1/2 reveal">
              <h2 className="text-3xl md:text-4xl font-semibold text-dark leading-tight mb-8">
                Christmas Promo For<br />
                Cancer{' '}<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Patients</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-gift text-[#1D9FDA] text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-dark mb-1">Celebrate with us</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Spreading holiday cheer to those
                      undergoing treatment during the festive season.</p>
                  </div>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-heart text-[#1D9FDA] text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-dark mb-1">Spread the joy</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Connecting survivors and patients
                      through community events and shared experiences.</p>
                  </div>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-handshake-angle text-[#1D9FDA] text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-dark mb-1">Give more</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Providing extra support and medicine
                      packs to brighten the holiday season for everyone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breast Cancer Warriors */}
          <div className="flex flex-col lg:flex-row gap-10 items-center mb-8">
            <div className="lg:w-1/2 reveal">
              <div className="flex gap-3 mb-5">
                <span className="bg-[#1D9FDA] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase">NGO
                  PARTNERSHIPS</span>
                <span className="bg-[#1D9FDA] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase">COLLABORATION</span>
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
              <img src={getImage('assets/one.png', 'assets/one.png')} alt="Warriors Event"
                className="w-full md:h-[350px] object-cover rounded-tl-[150px] rounded-tr-[1rem] rounded-br-[1rem] rounded-bl-[1rem] shadow-xl" />
            </div>
          </div>

          {/* Event Mini Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <img src={getImage('assets/two.png', 'assets/two.png')} alt=""
              className="w-full h-60 object-cover rounded-2xl shadow-sm transition-transform hover:scale-[1.02]" />
            <img src={getImage('assets/three.png', 'assets/three.png')} alt=""
              className="w-full h-60 object-cover rounded-2xl shadow-sm transition-transform hover:scale-[1.02]" />
            <img src={getImage('assets/four.png', 'assets/four.png')} alt=""
              className="w-full h-60 object-cover rounded-tl-2xl rounded-tr-2xl rounded-br-[100px] rounded-bl-2xl shadow-sm transition-transform hover:scale-[1.02]" />
          </div>
        </div>
      </section>

      {/* EPCALM FOUNDATION */}
      <section className="pt-0 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 items-center mb-8">
            <div className="md:w-1/2">
              <img src={getImage('assets/five.png', 'assets/five.png')} alt="EPCALM Partnership"
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
                  <img src={getImage('assets/epcalmlogo.png', 'assets/epcalmlogo.png')} alt="" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="overflow-hidden h-60 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[100px]">
              <img src={getImage('assets/six.png', 'assets/six.png')} alt=""
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]" />
            </div>
            <div className="overflow-hidden h-60 rounded-2xl">
              <img src={getImage('assets/seven.png', 'assets/seven.png')} alt=""
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]" />
            </div>
            <div className="relative overflow-hidden h-60 rounded-tl-2xl rounded-tr-2xl rounded-br-[100px] rounded-bl-2xl">
              <img src={getImage('assets/eight.png', 'assets/eight.png')} alt=""
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
              <img src={getImage('assets/fohimage.png', 'assets/fohimage.png')} alt="Faces of Hope" className="w-full h-full object-cover" />
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

      {/* PINK RUN SECTION */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <img src={getImage('assets/pinkrun.png', 'assets/pinkrun.png')} alt="Pink Run Screen" className="w-full rounded-2xl shadow-xl" />
            </div>
            <div className="lg:w-1/2 reveal">
              <div className="mb-5">
                <span className="bg-[#26A8E1] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  HEALTH PROMOTION EVENTS
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-dark leading-tight mb-8">
                Pink Run Breast Cancer{' '}<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Awareness</span>
              </h2>
              <div className="space-y-6">
                <p className="text-gray-400 text-[15px] leading-[1.8]">
                  The Pink Run is a running event in the Philippines dedicated to promoting breast cancer
                  awareness. As the official health partner, Getmeds supports the advocacy by championing
                  early detection, survivor support, improved healthcare access, and physical wellness.
                </p>
                <p className="text-gray-400 text-[15px] leading-[1.8]">
                  To support participants, Getmeds provides free supplements for their well-being and
                  highlights its Patient Assistance Program, helping patients gain access to essential
                  oncology products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PINK RUN GALLERY (3D SLIDER) */}
      <section className="py-10 bg-white overflow-hidden">
        <div className="relative w-full max-w-[1200px] mx-auto px-4">
          <div
            id="pink-3d-viewport"
            ref={pinkViewportRef}
            className="relative h-[280px] md:h-[400px] w-full flex items-center justify-center [perspective:1200px] overflow-visible"
          >
            {pinkSliderImages.map((src, idx) => {
              const posMap = ['0', '1', '-1'];
              const shadowMap = ['shadow-2xl', 'shadow-lg', 'shadow-lg'];
              return (
                <div
                  key={idx}
                  className="pink-card absolute w-[280px] md:w-[750px] transition-all duration-700 ease-out cursor-pointer"
                  data-pos={posMap[idx]}
                >
                  <img
                    src={src}
                    alt=""
                    className={`w-full h-[220px] md:h-[360px] object-cover rounded-[1rem] ${shadowMap[idx]}`}
                  />
                </div>
              );
            })}
            <button id="pink-prev"
              className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-400 hover:text-[#26A8E1] transition-all z-40 hover:scale-110">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button id="pink-next"
              className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-400 hover:text-[#26A8E1] transition-all z-40 hover:scale-110">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
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
