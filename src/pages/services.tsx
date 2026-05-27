import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';

export default function Services() {
  const { getImage } = useImageMapper('services');
  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html')
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }
  }, []);

  useEffect(() => {
    const animateCounters = () => {
      document.querySelectorAll<HTMLElement>('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target || '0');
        let current = 0;
        const step = target / (1800 / 16);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = target >= 1000
            ? Math.floor(current).toLocaleString() + '+'
            : Math.floor(current) + (target === 24 ? '/7' : '+');
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

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Enhanced Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
        <div className="relative rounded-[1.5rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end group">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={getImage('assets/services_hero_new.png', 'assets/services_hero_new.png')} data-json-src="hero.image" data-json-alt="hero.imageAlt"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-[4s]"
              alt="Healthcare Services" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-full md:w-[70%]">
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full px-8 md:px-14 pb-12 md:pb-16 pt-20 max-w-4xl reveal">
            <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-3 tracking-tight">
              <span data-json="hero.headingLine1" className="text-white">Our Premium</span><br />
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight">Services</span>
            </h1>
            <p data-json="hero.description" className="text-white/90 text-[13px] md:text-[14px] max-w-[600px] mb-5 leading-normal font-normal">
              Getmeds delivers precision pharmaceutical solutions and nationwide distribution — from regulatory
              compliance and government bidding to pioneering digital oncology care.
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

      {/* Stats Bar */}
      <section className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 mb-10">
        <div className="rounded-b-[2rem] px-8 py-7 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          <div className="stat-item flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-0 reveal">
            <span className="text-[32px] font-black text-gradient leading-none" data-target="120">0</span>
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest mt-2">Countries
              Served</span>
          </div>
          <div className="stat-item flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-0 reveal">
            <span className="text-[32px] font-black text-gradient leading-none" data-target="50000">0</span>
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest mt-2">Patients
              Helped</span>
          </div>
          <div className="stat-item flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-0 reveal">
            <span className="text-[32px] font-black text-gradient leading-none" data-target="500">0</span>
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest mt-2">Partner
              Clinics</span>
          </div>
          <div className="stat-item flex flex-col items-center px-6 py-2 last:border-0 reveal">
            <span className="text-[32px] font-black text-gradient leading-none" data-target="24">0</span>
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest mt-2">Hour Support</span>
          </div>
        </div>
      </section>

      {/* Services — Direct Layout */}
      <section id="services-grid" className="pt-10 pb-8 scroll-mt-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="mb-16 reveal">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-pill text-[11px] font-bold uppercase tracking-widest mb-4">
              <i className="fa-solid fa-briefcase-medical"></i> Corporate Services
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-[#2A2A2A]"><span
              className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Our</span>
              {' '}Core Competencies</h2>
            <p data-json="sectionDescription" className="text-gray-500 mt-3 text-[15px] max-w-none">We provide specialized pharmaceutical solutions
              designed for reliability, compliance, and nationwide impact across the healthcare sector. Our
              commitment to excellence ensures that every partner and patient receives the highest standard of
              care through innovative distribution and strategic collaboration.</p>
          </div>

          {/* Divider list of services */}
          <div className="divide-y divide-gray-100">

            {/* Service 1: Regulatory & Compliance */}
            <div className="flex flex-col md:flex-row gap-6 py-12 reveal">
              <div className="flex-shrink-0">
                <div
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644] to-[#1D9FDA] flex items-center justify-center text-xl text-white shadow-lg">
                  <i className="fa-solid fa-file-shield"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[20px] font-bold text-dark">Regulatory &amp; <span
                    className="text-gradient">Compliance</span></h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-50 px-3 py-1 rounded-full">FDA
                    Registration</span>
                </div>
                <p className="text-gray-500 text-[15px] leading-[1.8] mb-5">We ensure full compliance with the Food
                  and Drug Administration (FDA) regulations and industry standards, maintaining proper product
                  registration, documentation, and adherence to guarantee safe, legal, and reliable healthcare
                  solutions. Our dedicated compliance team manages every detail of the regulatory lifecycle to
                  keep operations seamless and secure.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">FDA
                    Quality Standards</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Proper
                    Product Registration</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Documentation
                    Adherence</span>
                </div>
              </div>
            </div>

            {/* Service 2: Precision Supply Chain */}
            <div className="flex flex-col md:flex-row gap-6 py-12 reveal">
              <div className="flex-shrink-0">
                <div
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644] to-[#1D9FDA] flex items-center justify-center text-xl text-white shadow-lg">
                  <i className="fa-solid fa-truck-ramp-box"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[20px] font-bold text-dark">Precision Supply <span
                    className="text-gradient">Chain</span></h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-50 px-3 py-1 rounded-full">Nationwide
                    Logistics</span>
                </div>
                <p className="text-gray-500 text-[15px] leading-[1.8] mb-5">A precision-managed supply chain that
                  ensures every medicine batch is tracked, handled, and delivered with maximum control and
                  accountability. Backed by rapid response and flexible delivery schedules, we move beyond
                  fixed timetables to support urgent and critical patient needs — because access to
                  life-saving medicines should never be delayed.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Flexible
                    Delivery Schedules</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Batch-level
                    Accountability</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Urgent
                    Response Systems</span>
                </div>
              </div>
            </div>

            {/* Service 3: Sales and Distribution */}
            <div className="flex flex-col md:flex-row gap-6 py-12 reveal">
              <div className="flex-shrink-0">
                <div
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644] to-[#1D9FDA] flex items-center justify-center text-xl text-white shadow-lg">
                  <i className="fa-solid fa-handshake"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[20px] font-bold text-dark">Sales and <span
                    className="text-gradient">Distribution</span></h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-teal-500 bg-teal-50 px-3 py-1 rounded-full">Market
                    Solutions</span>
                </div>
                <p className="text-gray-500 text-[15px] leading-[1.8] mb-5">We deliver comprehensive solutions for
                  the pharmaceutical sector, building strong connections with partners and clients across the
                  industry. Our services extend to distributors, wholesalers, traders, drugstores, and
                  standalone clinics, ensuring seamless collaboration, reliable access to high-quality
                  medicines, and support for the efficient growth of every business we work with.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Strategic
                    Telemarketing</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Agile
                    Solutions</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Nationwide
                    Reach</span>
                </div>
              </div>
            </div>

            {/* Service 4: Government Bidding */}
            <div className="flex flex-col md:flex-row gap-6 py-12 reveal">
              <div className="flex-shrink-0">
                <div
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644] to-[#1D9FDA] flex items-center justify-center text-xl text-white shadow-lg">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[20px] font-bold text-dark">Government <span
                    className="text-gradient">Bidding</span></h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-50 px-3 py-1 rounded-full">Public
                    Healthcare</span>
                </div>
                <p className="text-gray-500 text-[15px] leading-[1.8] mb-5">Fully equipped to participate in
                  government bidding across large public hospitals nationwide, we provide competitive,
                  high-quality Oncology, Hematology, and Anesthesiology medicines. Our bidding specialists,
                  with over 15 years of experience, bring unmatched connections, expertise, and competence to
                  every participation, ensuring strict compliance and the delivery of safe, reliable
                  healthcare solutions.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">15+
                    Years Proven Experience</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Nationwide
                    Public Hospitals</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Strict
                    Bidding Compliance</span>
                </div>
              </div>
            </div>

            {/* Service 5: Certificate of Listing (CLIDP) */}
            <div className="flex flex-col md:flex-row gap-6 py-12 reveal">
              <div className="flex-shrink-0">
                <div
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644] to-[#1D9FDA] flex items-center justify-center text-xl text-white shadow-lg">
                  <i className="fa-solid fa-box-open"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[20px] font-bold text-dark">Certificate of Listing <span
                    className="text-gradient">(CLIDP)</span></h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-50 px-3 py-1 rounded-full">Rebranding</span>
                </div>
                <p className="text-gray-500 text-[15px] leading-[1.8] mb-5">We provide CLIDP services across our CPR
                  portfolio, enabling partners to rebrand and commercialize their own product lines with
                  fast-track processing, efficient execution, and shorter time-to-market. We grow with our
                  clients through every stage of their expansion, providing the infrastructure needed for
                  low-risk growth.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">End-to-End
                    Execution</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Low-Risk
                    &amp; Flexible MOQs</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Prioritized
                    Manufacturing</span>
                </div>
              </div>
            </div>

            {/* Service 6: Digital & Smart Solutions */}
            <div className="flex flex-col md:flex-row gap-6 py-12 reveal">
              <div className="flex-shrink-0">
                <div
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644] to-[#1D9FDA] flex items-center justify-center text-xl text-white shadow-lg">
                  <i className="fa-solid fa-mobile-screen-button"></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[20px] font-bold text-dark">Digital &amp; Smart <span
                    className="text-gradient">Solutions</span></h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-3 py-1 rounded-full">Innovation</span>
                </div>
                <p className="text-gray-500 text-[15px] leading-[1.8] mb-5">Introducing Getmeds, the first to
                  pioneer fully digital oncology care in the Philippines. We deliver fast, reliable, and
                  flexible access to life-saving medicines anytime, anywhere through our innovative e-commerce
                  platform and mobile app. Smart, tech-driven solutions that put patients first — setting a
                  new standard in pharmaceutical services.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Pioneering
                    Digital Oncology</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Innovative
                    E-commerce Platform</span>
                  <span
                    className="text-[12px] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full">Mobile
                    App Integration</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-12">
            {/* Left Content */}
            <div className="lg:w-[48%] reveal">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-pill text-[11px] font-bold uppercase tracking-widest mb-6">
                <i className="fa-solid fa-medal"></i> Our Promise</div>
              <h2 className="text-[28px] md:text-[38px] font-bold text-dark leading-tight mb-6 tracking-tight">Why
                Trust <br /><span
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Getmeds</span>
                {' '}for Your Health?</h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-lg">We don't just distribute
                medicine; we facilitate healing. Through strict quality standards and advanced digital
                solutions, we ensure your healthcare journey is safe, private, and efficient.</p>
              <a href="about-us.html"
                className="btn-gradient text-white font-bold py-4 px-10 rounded-xl text-[14px] inline-flex items-center gap-3 shadow-lg">Learn
                More <i className="fa-solid fa-arrow-right text-xs"></i></a>
            </div>

            {/* Right Content (Staggered Cards) */}
            <div className="lg:w-[52%] relative reveal">
              {/* Background blobs for depth */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60"></div>

              <div className="space-y-6 relative z-10">
                {/* Card 1 */}
                <div
                  className="bg-white p-7 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-6 relative max-w-[540px] group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-2xl text-[#61A644]">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-dark mb-1">Verified Authenticity</h4>
                    <p className="text-gray-400 text-[13px] leading-relaxed">Strict international quality
                      standards ensuring genuine care.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-6 right-8 text-gray-100 text-2xl opacity-50"></i>
                </div>

                {/* Card 2 (Staggered) */}
                <div
                  className="bg-white p-7 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-6 relative max-w-[540px] lg:ml-12 group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-2xl text-[#1D9FDA]">
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-dark mb-1">Patient Data Privacy</h4>
                    <p className="text-gray-400 text-[13px] leading-relaxed">Banking-grade encryption protecting
                      your health records.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-6 right-8 text-gray-100 text-2xl opacity-50"></i>
                </div>

                {/* Card 3 */}
                <div
                  className="bg-white p-7 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.05)] flex items-center gap-6 relative max-w-[540px] group hover:translate-y-[-5px] transition-all duration-300 overflow-hidden">
                  {/* Gradient Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]">
                  </div>
                  <div
                    className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-[#61A644]/10 to-[#1D9FDA]/10 flex items-center justify-center text-2xl text-[#61A644]">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-dark mb-1">Efficiency Redefined</h4>
                    <p className="text-gray-400 text-[13px] leading-relaxed">Optimized steps for speed — less
                      waiting, more healing.</p>
                  </div>
                  <i
                    className="fa-solid fa-quote-right absolute top-6 right-8 text-gray-100 text-2xl opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-[#1a2744] to-[#0f3460]">
        <div className="max-w-7xl mx-auto px-4 text-center reveal">
          <h2 className="text-[28px] md:text-[38px] font-bold text-white mb-4 tracking-tight">Ready to Experience <span
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Better
            Healthcare?</span></h2>
          <p className="text-white/60 text-[15px] mb-10 max-w-xl mx-auto">Join thousands of patients who trust Getmeds for
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

      {/* Footer (Dark Theme) */}
      <footer className="bg-[#1A1D2B] text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 relative">
            {/* Branding */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center">
                <img src={getImage('assets/getmedslogo.png', 'assets/getmedslogo.png')} alt="Getmeds Logo"
                  className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                Getmeds is your trusted online healthcare partner, providing access to top-quality medicines,
                doctor consultations, and lab tests from anywhere in the world.
              </p>
              <div className="flex space-x-4">
                <a href="#"
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition"><i
                    className="fa-brands fa-facebook-f"></i></a>
                <a href="#"
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition"><i
                    className="fa-brands fa-twitter"></i></a>
                <a href="#"
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition"><i
                    className="fa-brands fa-instagram"></i></a>
                <a href="#"
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition"><i
                    className="fa-brands fa-linkedin-in"></i></a>
              </div>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">About</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="about-us.html" className="hover:text-primary transition">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition">Our Leadership</a></li>
                <li><a href="#" className="hover:text-primary transition">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition">News &amp; Media</a></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Delivery</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-primary transition">Track Order</a></li>
                <li><a href="#" className="hover:text-primary transition">Return Policy</a></li>
                <li><a href="#" className="hover:text-primary transition">Delivery Info</a></li>
                <li><a href="#" className="hover:text-primary transition">FAQs</a></li>
              </ul>
            </div>

            {/* Links 3 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-location-dot mt-1 text-primary"></i>
                  <span>123 Medical Drive, Health City, NY 10001</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fa-solid fa-phone text-primary"></i>
                  <span>+1 (800) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="fa-solid fa-envelope text-primary"></i>
                  <span>support@getmeds.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; 2023 Getmeds. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
