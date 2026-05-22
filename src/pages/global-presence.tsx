import React, { useEffect, useRef } from 'react';

export default function GlobalPresence() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const itemsPerViewRef = useRef(4);
  const autoSlideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html')
        .then(r => r.text())
        .then(html => { navContainer.innerHTML = html; });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html')
        .then(r => r.text())
        .then(html => { footerContainer.innerHTML = html; });
    }
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const cards = slider.querySelectorAll('.country-card');

    const getItemsPerView = () =>
      window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 2 : 1;

    itemsPerViewRef.current = getItemsPerView();

    const updateSlider = () => {
      const offset = (currentIndexRef.current * 100) / itemsPerViewRef.current;
      slider.style.transform = `translateX(-${offset}%)`;
    };

    const nextSlide = () => {
      if (currentIndexRef.current >= cards.length - itemsPerViewRef.current) {
        currentIndexRef.current = 0;
      } else {
        currentIndexRef.current++;
      }
      updateSlider();
    };

    const prevSlide = () => {
      if (currentIndexRef.current <= 0) {
        currentIndexRef.current = cards.length - itemsPerViewRef.current;
      } else {
        currentIndexRef.current--;
      }
      updateSlider();
    };

    const resetInterval = () => {
      if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current);
      autoSlideIntervalRef.current = setInterval(nextSlide, 3500);
    };

    const handleNext = () => { nextSlide(); resetInterval(); };
    const handlePrev = () => { prevSlide(); resetInterval(); };
    const handleMouseEnter = () => { if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current); };
    const handleMouseLeave = () => resetInterval();

    const handleResize = () => {
      itemsPerViewRef.current = getItemsPerView();
      if (currentIndexRef.current > cards.length - itemsPerViewRef.current) {
        currentIndexRef.current = Math.max(0, cards.length - itemsPerViewRef.current);
      }
      updateSlider();
    };

    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    nextBtn?.addEventListener('click', handleNext);
    prevBtn?.addEventListener('click', handlePrev);
    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    autoSlideIntervalRef.current = setInterval(nextSlide, 3500);

    return () => {
      nextBtn?.removeEventListener('click', handleNext);
      prevBtn?.removeEventListener('click', handlePrev);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Header / Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-16 max-w-[1600px]">
        <div
          className="relative rounded-[1.5rem] border border-gray-100/20 overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end">
          {/* Background Image */}
          <img src="assets/globalpresencehero.jpg" alt="Global Healthcare" data-json-src="hero.image" data-json-alt="hero.imageAlt"
            className="absolute inset-0 w-full h-full object-cover object-center" />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-[100%] md:w-[70%]">
          </div>

          <div className="relative z-10 w-full px-8 md:px-14 pb-12 md:pb-16 pt-20 max-w-4xl">
            <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-3 tracking-tight">
              <span data-json="hero.headingLine1" className="text-white">Global Healthcare</span><br />
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">
                Without Borders
              </span>
            </h1>
            <p data-json="hero.description" className="text-white/90 text-[13px] md:text-[14px] max-w-[650px] mb-5 leading-normal font-normal">
              Discover seamless healthcare solutions. Access a world-class medical network worldwide, efficiently
              linking you with top care continuously.
            </p>
            <button
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-2 px-6 rounded-full text-[13px] inline-block transition shadow-md">
              Explore Now
            </button>
          </div>
        </div>
      </section>

      {/* Mini Cards Slider Container */}
      <section className="relative z-20 pb-16 pt-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center">

          <button id="slider-prev"
            className="hidden lg:flex h-10 w-10 shrink-0 bg-gray-50 border border-gray-100 hover:bg-white rounded-full items-center justify-center text-gray-400 hover:text-dark hover:shadow-md transition mr-2 z-10">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden relative flex-1 mx-2">
            <div id="country-slider" ref={sliderRef} className="flex transition-transform duration-700 ease-in-out">

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/ph.png" className="w-10 h-10 rounded-full object-cover" alt="Philippines" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Philippines (HQ)</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Importer | Distributor |
                  Marketing Pharmacy : Managing supply, distribution, and growth.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/in.png" className="w-10 h-10 rounded-full object-cover" alt="India" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">India</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Sales Office | Exporter :
                  Expert support and localized market management.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/kh.png" className="w-10 h-10 rounded-full object-cover" alt="Cambodia" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Cambodia</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/la.png" className="w-10 h-10 rounded-full object-cover" alt="Laos" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Laos</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/my.png" className="w-10 h-10 rounded-full object-cover" alt="Malaysia" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Malaysia</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/mm.png" className="w-10 h-10 rounded-full object-cover" alt="Myanmar" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Myanmar</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/pk.png" className="w-10 h-10 rounded-full object-cover" alt="Pakistan" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Pakistan</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Importer | Distributor :
                  Managing supply, distribution, and growth.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/sg.png" className="w-10 h-10 rounded-full object-cover" alt="Singapore" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Singapore</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/vn.png" className="w-10 h-10 rounded-full object-cover" alt="Vietnam" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Vietnam</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/vu.png" className="w-10 h-10 rounded-full object-cover" alt="Vanuatu" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Vanuatu</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

              <div className="country-card w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
                <div className="mb-5">
                  <div
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-50">
                    <img src="https://flagcdn.com/w80/kn.png" className="w-10 h-10 rounded-full object-cover" alt="Saint Kitts and Nevis" />
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-1.5 text-[16px] tracking-tight">Saint Kitts and Nevis</h4>
                <p className="text-[12px] text-gray-400 leading-[1.6] font-medium pr-4">Representative Office :
                  Official hubs managing regional partnerships and local compliance.</p>
              </div>

            </div>
          </div>

          <button id="slider-next"
            className="hidden lg:flex h-10 w-10 shrink-0 bg-gray-50 border border-gray-100 hover:bg-white rounded-full items-center justify-center text-gray-400 hover:text-dark hover:shadow-md transition ml-2 z-10">
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </section>

      {/* Blue Banner */}
      <section className="max-w-[1150px] mx-auto px-4 sm:px-6 md:mt-44 mt-32 mb-20 relative">
        {/* Earth Image, positioned exactly above the cutout */}
        <div className="absolute left-1/2 -top-[105px] transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="w-[210px] h-[210px] rounded-full overflow-hidden mix-blend-multiply flex items-center justify-center transform transition-transform"
            style={{ boxShadow: '-47px 45px 18px rgba(0,0,0,0.1), -30px 29px 17px rgba(0,0,0,0.1), -17px 16px 14px rgba(0,0,0,0.25), -2px 2px 6px rgba(0,0,0,0.40)' }}>
            <img src="assets/globe.jpg" id="earth-image" alt="Earth" className="w-full h-full object-cover scale-[1.2]" />
          </div>
        </div>

        {/* Blue Banner with U-Shape Semi-circle Cutout exactly at top-center */}
        <div className="bg-[#1DA1F2] rounded-[15px] p-8 lg:p-14 pb-14 flex flex-col lg:flex-row items-center justify-between text-white relative z-10 pt-[170px] lg:pt-14"
          style={{ WebkitMaskImage: 'radial-gradient(circle at 50% 0px, transparent 145px, black 146px)', maskImage: 'radial-gradient(circle at 50% 0px, transparent 145px, black 146px)' }}>

          {/* Left Content: Texts shielded from center */}
          <div className="lg:flex-1 w-full flex lg:justify-start justify-center">
            <div className="text-center lg:text-left w-full max-w-[340px] pl-0 lg:pl-4">
              <h2 className="text-[32px] lg:text-[38px] font-bold leading-[1.15] tracking-tight m-0"
                style={{ fontFamily: 'inherit' }}>
                <span className="text-white block">Grow beyond</span>
                <span className="text-white block">borders with</span>
                <span className="text-[#1a202c] block font-extrabold mt-1">GETMEDS</span>
              </h2>
            </div>
          </div>

          {/* Solid Spacer */}
          <div className="hidden lg:block w-[300px] flex-shrink-0 pointer-events-none"></div>

          {/* Right Content */}
          <div className="lg:flex-1 w-full flex lg:justify-end justify-center mt-10 lg:mt-0">
            <div
              className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[280px] pr-0">
              <p className="text-[13px] font-medium mb-5 leading-[1.45] text-white">
                Whether you're sourcing specialized medicines or expanding healthcare access overseas, GetMeds
                makes
                it simple, fast, secure, and reliable.
              </p>
              <button
                className="bg-[#1a202c] hover:bg-black text-white font-bold py-2.5 px-6 text-[11px] uppercase rounded-full shadow-md transition duration-300 tracking-[0.05em]">
                LEARN MORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* A Timeline of GetMeds Section */}
      <section className="py-16 md:py-24 bg-[#FFFFFF] relative border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 md:mb-28 relative z-20">
            <h2
              className="text-[30px] md:text-[36px] font-bold text-transparent bg-clip-text bg-[#2A2A2A] tracking-tight mb-4">
              A Timeline of GetMeds</h2>
            <div className="w-16 h-1 bg-[#2A2A2A] mx-auto rounded-full mb-6"></div>
            <p className="text-gray-500 text-[14px] max-w-2xl mx-auto leading-relaxed">Tracking our continuous journey
              of growth, innovation, and unwavering commitment to expanding global healthcare access.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Center Line */}
            <div
              className="absolute left-[35px] md:left-1/2 transform md:-translate-x-1/2 top-4 bottom-0 w-px border-l-[2px] border-dashed border-[#61A644]/30 z-0">
            </div>
            <div
              className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 -top-2 w-3 h-3 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full z-10 shadow-[0_0_10px_rgba(29,159,218,0.8)]">
            </div>
            <div
              className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 -bottom-2 w-3 h-3 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full z-10 shadow-[0_0_10px_rgba(29,159,218,0.8)]">
            </div>

            {/* ITEM 1: 2018 (Right Card) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 relative group">
              <div className="hidden md:flex flex-1 justify-end pr-8 sm:pr-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-flag text-[120px] text-gray-200 absolute right-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2018
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="w-full md:flex-1 pl-[70px] md:pl-8 sm:md:pl-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2018
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 text-left">
                  Established 2MG Inc.
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-500 text-[13.5px] leading-[1.7] text-left m-0">
                    Founded 2MG Inc., a pharmaceutical importer and distributor in the Philippines.
                  </p>
                </div>
              </div>
            </div>

            {/* ITEM 2: 2020 (Left Card) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 relative group">
              <div className="w-full md:flex-1 pl-[70px] md:pl-0 md:pr-8 sm:md:pr-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2020
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 md:text-right text-left">
                  Launch of Getmeds Digital Platform
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-500 text-[13.5px] leading-[1.7] md:text-right text-left m-0">
                    Introduced Getmeds, the first to pioneer a fully digital oncology care platform in the
                    Philippines, featuring an innovative e-commerce platform and mobile app.
                  </p>
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="hidden md:flex flex-1 justify-start pl-8 sm:pl-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-laptop-medical text-[120px] text-gray-200 absolute left-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2020
                </div>
              </div>
            </div>

            {/* ITEM 3: 2021 (Right Card) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 relative group">
              <div className="hidden md:flex flex-1 justify-end pr-8 sm:pr-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-globe-asia text-[120px] text-gray-200 absolute right-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2021
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="w-full md:flex-1 pl-[70px] md:pl-8 sm:md:pl-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2021
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 text-left">
                  Established Getmeds HealthTech Pte. Ltd.
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-500 text-[13.5px] leading-[1.7] text-left m-0">
                    Extending its global reach and creating new opportunities for international expansion
                    across Asia and beyond in Singapore.
                  </p>
                </div>
              </div>
            </div>

            {/* ITEM 4: 2022 (Left Card) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 relative group">
              <div className="w-full md:flex-1 pl-[70px] md:pl-0 md:pr-8 sm:md:pr-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2022
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 md:text-right text-left">
                  Established Getmeds Philippines Inc.
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-500 text-[13.5px] leading-[1.7] md:text-right text-left m-0">
                    A pharmaceutical company committed to redefining the Philippine healthcare landscape by
                    providing high-quality, affordable generic medicines that are accessible to every
                    Filipino.
                  </p>
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="hidden md:flex flex-1 justify-start pl-8 sm:pl-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-pills text-[120px] text-gray-200 absolute left-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2022
                </div>
              </div>
            </div>

            {/* ITEM 5: 2023 (Right Card) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 relative group">
              <div className="hidden md:flex flex-1 justify-end pr-8 sm:pr-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-map-location-dot text-[120px] text-gray-200 absolute right-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2023
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="w-full md:flex-1 pl-[70px] md:pl-8 sm:md:pl-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2023
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 text-left">
                  Continental Expansion
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  <ul
                    className="text-gray-500 text-[13.5px] leading-[1.7] text-left m-0 list-disc list-inside space-y-2">
                    <li>Established <strong>Getmeds India</strong></li>
                    <li>Established <strong>Getmeds Vietnam</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ITEM 6: 2024 (Left Card) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16 relative group">
              <div className="w-full md:flex-1 pl-[70px] md:pl-0 md:pr-8 sm:md:pr-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2024
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 md:text-right text-left">
                  Expansion to Pakistan
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-500 text-[13.5px] leading-[1.7] md:text-right text-left m-0">
                    Opened an office in Pakistan in partnership with a trusted healthcare provider,
                    supplying essential medicines and reaching more communities with reliable healthcare
                    solutions.
                  </p>
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="hidden md:flex flex-1 justify-start pl-8 sm:pl-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-handshake-angle text-[120px] text-gray-200 absolute left-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2024
                </div>
              </div>
            </div>

            {/* ITEM 7: 2025 (Right Card - Final) */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full relative group">
              <div className="hidden md:flex flex-1 justify-end pr-8 sm:pr-16 z-20 relative items-center">
                <i
                  className="fa-solid fa-rocket text-[120px] text-gray-200 absolute right-8 top-1/2 -translate-y-1/2 -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></i>
                <div
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-8 py-2.5 rounded-full font-extrabold shadow-[0_4px_15px_rgba(29,159,218,0.4)] text-[13px] tracking-widest leading-none">
                  2025
                </div>
              </div>
              <div
                className="absolute left-[35px] md:left-1/2 transform -translate-x-1/2 w-[18px] h-[18px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full border-[3px] border-white shadow-md z-20 transition-transform group-hover:scale-125">
              </div>
              <div className="w-full md:flex-1 pl-[70px] md:pl-8 sm:md:pl-16 relative z-20">
                <div
                  className="md:hidden bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white px-5 py-1.5 rounded-full font-bold shadow-sm text-[11px] tracking-widest inline-block mb-3">
                  2025
                </div>
                <h3
                  className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61A644] to-[#1D9FDA] mb-3 text-left">
                  2025 Milestones
                </h3>
                <div
                  className="bg-white p-7 rounded-[14px] shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
                  {/* Internal 2025 sub-sections */}
                  <div className="space-y-5">
                    <div>
                      <strong className="text-[#1a202c] block mb-1 text-[13.5px]">Registered in Saint Kitts
                        and Nevis</strong>
                      <p className="text-gray-500 text-[13px] leading-[1.65] m-0 text-left">
                        Strengthening its global presence and paving the way for further international
                        growth in the Caribbean and beyond.
                      </p>
                    </div>
                    <div className="w-full h-[1px] bg-gray-100"></div>
                    <div>
                      <strong className="text-[#1a202c] block mb-1 text-[13.5px]">Opened Office in
                        Vanuatu</strong>
                      <p className="text-gray-500 text-[13px] leading-[1.65] m-0 text-left">
                        Collaborated with the government to enhance medical support and introduce cancer
                        awareness initiatives and life-saving healthcare solutions for the Pacific
                        community.
                      </p>
                    </div>
                    <div className="w-full h-[1px] bg-gray-100"></div>
                    <div>
                      <strong className="text-[#1a202c] block mb-1 text-[13.5px]">First Specialty Cancer
                        Pharmacy in the Pacific</strong>
                      <p className="text-gray-500 text-[13px] leading-[1.65] m-0 text-left">
                        Opened the Pacific's first specialty pharmacy dedicated to cancer medicines,
                        providing localized access to life-saving treatments for patients in Vanuatu,
                        Fiji, and across the Pacific region.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Our Global Footprint */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark tracking-tight mb-4">Our Global Footprint</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">Exploring new horizons and expanding our
            global reach to bring health solutions closer to you.</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* 1. Philippines */}
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Philippines</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 123 Manila St, Metro Manila,
                    Philippines</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +63 900 123 4567</div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3">
                    <img src="assets/getmedslogo.png" className="h-3 w-auto object-contain" alt="GetMEDS" />
                  </div>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.ph</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80"
                alt="Philippines Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 2. India */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">India</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 456 Mumbai Road, Bandra West, India
                  </div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +91 98765 43210</div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3">
                    <img src="assets/getmedslogo.png" className="h-3 w-auto object-contain" alt="GetMEDS" />
                  </div>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.in</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80" alt="India Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 3. Cambodia */}
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Cambodia</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 12 Phnom Penh Ave, Cambodia</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +855 23 456 789</div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3">
                    <img src="assets/getmedslogo.png" className="h-3 w-auto object-contain" alt="GetMEDS" />
                  </div>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.com.kh</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1603204356075-f5bebb2ee218?w=600&q=80"
                alt="Cambodia Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 4. Laos */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Laos</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 78 Vientiane St, Laos</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +856 20 1234 5678</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.la</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1518655048521-f130df041f66?w=600&q=80" alt="Laos Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 5. Malaysia */}
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Malaysia</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 88 Kuala Lumpur Way, Malaysia</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +60 3 1234 5678</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.com.my</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?w=600&q=80"
                alt="Malaysia Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 6. Myanmar */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Myanmar</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 55 Yangon Road, Myanmar</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +95 1 234 567</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.com.mm</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80" alt="Myanmar Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 7. Pakistan */}
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Pakistan</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 99 Karachi Central, Pakistan</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +92 21 3456789</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.pk</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80"
                alt="Pakistan Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 8. Singapore */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Singapore</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 1 Marina Blvd, Singapore</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +65 6123 4567</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.sg</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80"
                alt="Singapore Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 9. Vietnam */}
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-asia mr-1"></i> Asia</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Vietnam</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> 123 Ho Chi Minh City, Vietnam</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +84 28 3456 7890</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.vn</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1557762692-74baea77e7bd?w=600&q=80" alt="Vietnam Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 10. Vanuatu */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-oceania mr-1"></i> Oceania</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Vanuatu</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> Port Vila, Vanuatu</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +678 22345</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.vu</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80"
                alt="Vanuatu Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

          {/* 11. Saint Kitts And Nevis */}
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center my-auto">
              <span
                className="bg-blue-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4"><i
                  className="fa-solid fa-earth-americas mr-1"></i> Caribbean</span>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-5">Saint Kitts And Nevis</h3>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-location-dot mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Head Office:</strong> Basseterre, Saint Kitts And Nevis</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-phone mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Contact Us:</strong> +1 869 123 4567</div>
                </div>
                <div className="flex items-start">
                  <i
                    className="fa-solid fa-globe mt-1 text-primary bg-blue-50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mr-3 text-[10px]"></i>
                  <div><strong className="text-dark">Website:</strong> www.getmeds.kn</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80"
                alt="Saint Kitts Office"
                className="w-full h-64 object-cover rounded-2xl shadow-sm border border-gray-100" />
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
