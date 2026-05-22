import React, { useEffect, useRef } from 'react';

export default function AboutUs() {
  const valuesContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Enhanced Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
        <div className="relative rounded-[1.5rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end group">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src="assets/aboutusone.jpg" data-json-src="hero.image" data-json-alt="hero.imageAlt"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-[4s]"
              alt="About GetMEDS" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-full md:w-[70%]"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full px-8 md:px-14 pb-12 md:pb-16 pt-20 max-w-4xl reveal">
            <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-3 tracking-tight">
              <span data-json="hero.heading" className="text-white">Your Compassionate</span><br />
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">Health
                Ally</span>
            </h1>
            <p data-json="hero.description" className="text-white/90 text-[13px] md:text-[14px] max-w-[600px] mb-5 leading-normal font-normal">
              A new standard of care for a new generation of patients.
              Advanced science. Trusted medicine. Closer access. Better outcomes. Greater hope.

            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#our-story"
                className="btn-gradient text-white font-semibold py-2 px-6 rounded-full text-[13px] inline-flex items-center gap-2 shadow-md">
                Discover Our Story <i className="fa-solid fa-arrow-down text-xs"></i>
              </a>
              <a href="contact-us.html"
                className="bg-white/10 backdrop-blur-md border border-white/25 text-white font-semibold py-2 px-6 rounded-full text-[13px] hover:bg-white/20 transition inline-flex items-center gap-2">
                Contact Us <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section id="our-story" className="pt-10 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Image Grid (Top) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-20 reveal">
            {/* Large Image (Left) */}
            <div className="md:col-span-8">
              <div className="relative h-[300px] md:h-[380px] rounded-[1rem] overflow-hidden shadow-xl group">
                <img src="assets/aboutustwo.jpg" alt="GetMEDS Logistics"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
            {/* Stacked Images (Right) */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="h-[142px] md:h-[182px] rounded-[1rem] overflow-hidden shadow-lg group">
                <img src="assets/aboutusthree.jpg" alt="Medical Technology"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="h-[142px] md:h-[182px] rounded-[1rem] overflow-hidden shadow-lg group">
                <img src="assets/aboutusfour.jpg" alt="Healthcare Excellence"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>

          {/* Content Section (Bottom) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left side: Introduction about getmeds */}
            <div className="lg:col-span-8 reveal">
              <h3
                className="inline-block text-3xl md:text-4xl lg:text-[35px] leading-tight font-semibold mb-8 tracking-tight text-gray-900">
                About Us</h3>
              <div className="space-y-6">
                <p className="text-gray-600 text-[15px] leading-[1.8]">
                  Getmeds, established in 2020, is a global pharmaceutical company based in the Philippines with a diverse portfolio spanning Oncology, Hematology, Anesthesiology, and Rare Diseases. It is driven by innovation, science, and a deep commitment to improving access and affordability of life-changing therapies for Filipino patients and healthcare partners.
                  At its core, Getmeds is guided by compassion — ensuring that every medicine delivered reflects care, dignity, and hope for patients and families in need. With a strong focus on accessibility and cost-effective healthcare solutions, the company works to make high-quality treatments more reachable, especially for underserved communities.
                  With its continuing expansion across the Asia-Pacific region and beyond, Getmeds is poised to create an even greater impact on global healthcare.

                </p>
                <p className="text-gray-600 text-[15px] leading-[1.8]">
                  We've refined every detail to perfection, from enhanced patient distribution models to more
                  sophisticated logistics treatments. Our new dashboard layouts, expanded messaging
                  interfaces, and innovative data visualizations provide even more tools for managing health
                  experiences effectively.
                </p>

                <div className="pt-6">
                  <p className="text-dark font-black text-[13px] uppercase tracking-widest mb-4">Dedicated to:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-[14px] text-gray-500 font-medium">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Precision Distribution
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Patient Support Systems
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Strategic Global
                      Partnerships
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Digital Oncology Care
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Regulatory Compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Public Hospital Logistics
                    </li>
                  </ul>
                </div>

                <p className="text-gray-600 text-[15px] leading-[1.8] pt-6">
                  Transform your healthcare journey with our most comprehensive pharmaceutical release yet.
                  Whether you're navigating complex treatments, social platforms, or enterprise health
                  applications, GetMEDS delivers the precision you deserve.
                </p>
              </div>
            </div>

            {/* Right side: Highlights section list of certifications */}
            <div className="lg:col-span-4 reveal">
              <h3
                className="inline-block text-3xl md:text-3xl lg:text-[35px] leading-tight font-semibold mb-8 tracking-tight text-gray-900">
                Highlights</h3>
              <div className="space-y-6">
                {/* Cert 1 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <p className="inline-block font-bold text-[15px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                    FDA Licensed Distributor</p>
                </div>
                <div className="h-[1px] w-full bg-gray-100"></div>

                {/* Cert 2 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <p className="inline-block font-bold text-[15px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                    UN Global Compact Member</p>
                </div>
                <div className="h-[1px] w-full bg-gray-100"></div>

                {/* Cert 3 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <p className="inline-block font-bold text-[15px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                    ISO 9001:2015 Certified</p>
                </div>
                <div className="h-[1px] w-full bg-gray-100"></div>

                {/* Cert 4 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <p className="inline-block font-bold text-[15px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                    GDSP Compliant Logistics</p>
                </div>
                <div className="h-[1px] w-full bg-gray-100"></div>

                {/* Cert 5 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <p className="inline-block font-bold text-[15px] bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                    Verified ESG Performance</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enhanced Mission, Vision & Values */}
      <section className="pt-0 pb-16 bg-white overflow-hidden">
        <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
          {/* Mission Card */}
          <div
            className="relative bg-white p-8 md:p-12 flex flex-col md:flex-row items-center text-center md:text-left group rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden gap-8 md:gap-12">
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
              <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 block">Our Drive</span>
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
            className="relative bg-white p-8 md:p-12 flex flex-col md:flex-row items-center text-center md:text-left group rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden gap-8 md:gap-12">
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
              <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 block">Our Goal</span>
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-14 reveal">
            {/* Left: title */}
            <div>
              <h2 className="text-[28px] md:text-[36px] font-semibold text-dark leading-tight tracking-tight">
                Enhancing patient connectivity and clinical reach.
              </h2>
            </div>
            {/* Right: eyebrow + description */}
            <div>
              <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">OUR COMMITMENTS</span>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                With relentless dedication to innovation, empathy, and accessible global healthcare solutions.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">

            {/* Collaboration and Excellence */}
            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-handshake text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Collaboration and Excellence</h4>
              <p className="text-sm text-gray-500 leading-relaxed">By fostering collaborations with leading medical professionals, researchers, and partners, we strive for synergistic partnerships that aim to accelerate breakthroughs and reshape the future of healthcare.</p>
            </div>

            {/* Compassion & Integrity — gradient highlight */}
            <div className="p-7 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #61A644 0%, #1D9FDA 100%)' }}>
              <i className="fa-solid fa-heart text-2xl text-white mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-white mb-3 uppercase tracking-wider">Compassion &amp; Integrity</h4>
              <p className="text-sm text-white/85 leading-relaxed">Our foundation is built upon compassion for patients and their families. We are unwavering in our commitment to integrity and transparency, ensuring every action is guided by doing what is right.</p>
            </div>

            {/* Pioneering Medicine Solutions */}
            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-flask text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Pioneering Medicine Solutions</h4>
              <p className="text-sm text-gray-500 leading-relaxed">We are dedicated to delivering medicine solutions that address the unmet needs of patients worldwide, exploring novel therapies that make a difference in challenging medical conditions.</p>
            </div>

            {/* Global Accessibility */}
            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-earth-americas text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Global Accessibility</h4>
              <p className="text-sm text-gray-500 leading-relaxed">We believe healthcare knows no boundaries. Our commitment to a seamless global presence through synergistic partnerships ensures the needs of patients are met globally without delay.</p>
            </div>

            {/* Empowering Patients */}
            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-user-shield text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Empowering Patients</h4>
              <p className="text-sm text-gray-500 leading-relaxed">We strive to empower patients by providing them with accessible connection to life-saving medicines and providers, cutting-edge treatments, and vital healthcare resources.</p>
            </div>

            {/* Advancing Healthcare E-Commerce */}
            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-cart-shopping text-2xl text-gray-800 mb-5 block"></i>
              <h4 className="text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Advancing Healthcare E-Commerce</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Through our state-of-the-art e-commerce platform, we aim to redefine healthcare accessibility. Our seamless and secure online marketplace will ensure patients and providers can access medications regardless of geographic boundaries.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="pt-32 pb-12 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24 reveal">
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">Core Values</span>
            <h2 className="text-[28px] md:text-[38px] leading-tight font-semibold text-dark mb-3 tracking-tight">The Heart of Our Purpose</h2>
          </div>

          <div className="relative min-h-[600px] flex flex-col items-center justify-center py-8" id="values-container" ref={valuesContainerRef}>
            {/* 15-Card Diamond Cluster (Optimized Scale) */}
            <div className="relative z-10 flex items-center justify-center gap-2 md:gap-4 mb-2 px-4">
              {/* Col 1 (1 Card) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.2">
                  <i className="fa-solid fa-heart text-[#EC4899] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Compassion</span>
                </div>
              </div>

              {/* Col 2 (2 Cards) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.5" style={{ transitionDelay: '100ms' }}>
                  <i className="fa-solid fa-shield-heart text-[#8B5CF6] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Integrity</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.4" style={{ transitionDelay: '200ms' }}>
                  <i className="fa-solid fa-truck-fast text-[#F59E0B] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Speed</span>
                </div>
              </div>

              {/* Col 3 (3 Cards) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.8" style={{ transitionDelay: '300ms' }}>
                  <i className="fa-solid fa-microscope text-[#1D9FDA] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Precision</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.7" style={{ transitionDelay: '400ms' }}>
                  <i className="fa-solid fa-user-doctor text-[#14B8A6] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Expertise</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.9" style={{ transitionDelay: '500ms' }}>
                  <i className="fa-solid fa-hand-holding-medical text-[#F43F5E] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Care</span>
                </div>
              </div>

              {/* Col 4 (3 Cards - CENTER) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="2.2" style={{ transitionDelay: '600ms' }}>
                  <i className="fa-solid fa-lightbulb text-[#EAB308] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Innovation</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-xl border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal z-30 bg-gradient-to-br from-white to-gray-50"
                  data-speed="2.5" style={{ transitionDelay: '700ms' }}>
                  <img src="assets/logo.png" className="h-6 md:h-8" alt="GetMEDS Logo" />
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="2.1" style={{ transitionDelay: '800ms' }}>
                  <i className="fa-solid fa-earth-asia text-[#06B6D4] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Global</span>
                </div>
              </div>

              {/* Col 5 (3 Cards) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.8" style={{ transitionDelay: '900ms' }}>
                  <i className="fa-solid fa-lock text-[#6366F1] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Security</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.7" style={{ transitionDelay: '1000ms' }}>
                  <i className="fa-solid fa-vial-circle-check text-[#10B981] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Safety</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.9" style={{ transitionDelay: '1100ms' }}>
                  <i className="fa-solid fa-people-group text-[#F97316] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Community</span>
                </div>
              </div>

              {/* Col 6 (2 Cards) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.5" style={{ transitionDelay: '1200ms' }}>
                  <i className="fa-solid fa-tags text-[#8B5CF6] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Affordable</span>
                </div>
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.4" style={{ transitionDelay: '1300ms' }}>
                  <i className="fa-solid fa-clipboard-check text-[#3B82F6] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Reliable</span>
                </div>
              </div>

              {/* Col 7 (1 Card) */}
              <div className="flex flex-col gap-3">
                <div className="value-card bg-white p-3 rounded-full shadow-md border border-gray-100 w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center text-center reveal"
                  data-speed="1.2" style={{ transitionDelay: '1400ms' }}>
                  <i className="fa-solid fa-award text-[#EAB308] text-lg md:text-xl mb-1"></i>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-[#2A2A2A]">Excellence</span>
                </div>
              </div>
            </div>

            {/* Supportive Hand Image (Optimized Size) */}
            <div className="relative z-0 w-full max-w-[280px] md:max-w-xs reveal mt-0">
              <img src="assets/hand.png" alt="Supportive Hand"
                className="w-full h-auto object-cover transform -rotate-1 rounded-[1.5rem]" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="pt-12 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Our Advantages</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">Why Choose <span
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Getmeds</span>?
            </h2>
            <p className="text-gray-500 text-[15px]">We go above and beyond to ensure our services exceed your
              expectations when it comes to your health and convenience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal">
              <i className="fa-solid fa-truck-fast text-3xl text-primary mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Fast Delivery</h4>
              <p className="text-sm text-gray-500">Speedy medication delivery straight to your door step.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal">
              <i className="fa-solid fa-shield-halved text-3xl text-success mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Secure Platform</h4>
              <p className="text-sm text-gray-500">Your health data is safe with our advanced security.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal">
              <i className="fa-solid fa-headset text-3xl text-[#5533FF] mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">24/7 Support</h4>
              <p className="text-sm text-gray-500">Our customer care and medical experts are always ready.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal">
              <i className="fa-solid fa-tags text-3xl text-[#FFB020] mb-4"></i>
              <h4 className="text-lg font-bold text-dark mb-2">Best Prices</h4>
              <p className="text-sm text-gray-500">Affordable medicine and discounted lab tests for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Leaders */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 reveal">
            <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Executive Team</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">The Minds Behind <span
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">GetMEDS</span>
            </h2>
            <p className="text-gray-500 text-[15px]">Our leadership team brings decades of experience in healthcare,
              technology, and logistics to revolutionize patient care.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* CEO Row */}
            <div className="flex justify-center mb-8">
              <div className="reveal w-full max-w-[280px]">
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text mb-16">GETMEDS</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/CEO.png" alt="Mr. Naresh Bishnoi" data-json-src="team.members.0.image" data-json-alt="team.members.0.name"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.0.name" className="team-name">Mr. Naresh Bishnoi</h4>
                    <p data-json="team.members.0.role" className="team-role">Founder &amp; CEO</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Leader 2 */}
              <div className="reveal" style={{ transitionDelay: '150ms' }}>
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text">GetMEDS</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/employeeone.png" alt="Dr. Elena Rodriguez"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.1.name" className="team-name">Dr. Elena Rodriguez</h4>
                    <p data-json="team.members.1.role" className="team-role">Chief Operations Officer</p>
                  </div>
                </div>
              </div>

              {/* Leader 3 */}
              <div className="reveal" style={{ transitionDelay: '300ms' }}>
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text">GetMEDS</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/employeetwo.png" alt="Dr. Michael Chen"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.2.name" className="team-name">Dr. Michael Chen</h4>
                    <p data-json="team.members.2.role" className="team-role">Medical Director</p>
                  </div>
                </div>
              </div>

              {/* Leader 4 */}
              <div className="reveal" style={{ transitionDelay: '450ms' }}>
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text">Finance</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/employeethree.png" alt="Dr. Sarah Jenkins"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.3.name" className="team-name">Dr. Sarah Jenkins</h4>
                    <p data-json="team.members.3.role" className="team-role">Chief Financial Officer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Leader 5 */}
              <div className="reveal" style={{ transitionDelay: '150ms' }}>
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text">Technology</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/employeefour.png" alt="Mr. David Torres"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.4.name" className="team-name">Mr. David Torres</h4>
                    <p data-json="team.members.4.role" className="team-role">Chief Technology Officer</p>
                  </div>
                </div>
              </div>

              {/* Leader 6 */}
              <div className="reveal" style={{ transitionDelay: '300ms' }}>
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text">Research</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/employeefive.png" alt="Dr. Emily Wong"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.5.name" className="team-name">Dr. Emily Wong</h4>
                    <p data-json="team.members.5.role" className="team-role">Head of R&amp;D</p>
                  </div>
                </div>
              </div>

              {/* Leader 7 */}
              <div className="reveal" style={{ transitionDelay: '450ms' }}>
                <div className="team-card bg-gray-100 group">
                  <div className="team-ribbon">
                    <span className="vertical-text">People</span>
                  </div>
                  <div className="team-img-wrapper">
                    <img src="assets/employeesix.png" alt="Ms. Rachel Green"
                      className="team-img transition-all duration-700" />
                  </div>
                  <div className="team-social">
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg"><i
                        className="fa-brands fa-twitter"></i></a>
                  </div>
                  <div className="team-content">
                    <h4 data-json="team.members.6.name" className="team-name">Ms. Rachel Green</h4>
                    <p data-json="team.members.6.role" className="team-role">VP of Human Resources</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Trust Network</span>
            <h2 className="text-3xl font-semibold text-dark mb-4">Strategic Partners &amp; Affiliates</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center reveal">
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
                <img src="assets/UNGClogo.png" className="h-10 object-contain" alt="UNGC Logo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden reveal">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Ready to take control of your health?</h2>
            <p className="text-blue-50 text-lg mb-8 max-w-2xl mx-auto relative z-10">Join thousands of satisfied
              patients and experience the future of healthcare today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <a href="order-medicines.html"
                className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-gray-50 transition transform hover:-translate-y-1">
                Order Medicines
              </a>
              <a href="contact-us.html"
                className="bg-transparent border-2 border-white text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/10 transition transform hover:-translate-y-1">
                Contact Us
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
