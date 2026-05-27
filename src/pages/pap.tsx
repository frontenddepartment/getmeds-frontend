import React, { useState, useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';

export default function PatientAssistanceProgram() {
  const [activeTab, setActiveTab] = useState<'dswd' | 'pcso'>('dswd');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html')
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html')
        .then(r => r.text())
        .then(html => { injectHTML(footerContainer, html); });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* 1. Hero Banner Section */}
      <section className="relative w-full aspect-[21/9] md:aspect-[24/7] overflow-hidden">
        <img
          src="assets/papbanner.png"
          data-json-src="hero.image" data-json-alt="hero.imageAlt"
          className="w-full h-full object-cover brightness-90"
          alt="Medical Support"
        />
      </section>

      {/* 2. Program Intro */}
      <section className="w-full overflow-hidden reveal relative bg-white">

        {/* Top — pap.png logo + subtitle side by side */}
        <div className="max-w-7xl mx-auto px-6 pt-1 pb-0 flex items-center gap-6 justify-center mb-0">
          <img
            src="assets/pap.png"
            alt="Patient Assistance Program"
            className="w-52 md:w-64 object-contain shrink-0"
          />
          <div>
            <p data-json="intro.subheading" className="text-xl md:text-2xl lg:text-3xl font-semibold uppercase tracking-widest whitespace-nowrap bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
              Chemotherapy at Mga Gamot sa Cancer
            </p>
            <div className="mt-2 w-10 h-1 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full" />
          </div>
        </div>

        {/* Body — patient image left, text right */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-6 -mt-10">

          {/* Left — patientpap.png anchored to bottom */}
          <div className="shrink-0 flex items-end self-end w-72 md:w-96 lg:w-[420px] xl:w-[480px] -mb-1">
            <img
              src="assets/patientpap.png"
              alt="Cancer Patient"
              className="w-full object-contain object-bottom"
            />
          </div>

          {/* Right — paragraphs only */}
          <div className="flex-1 py-2 space-y-2 text-gray-700 font-medium leading-normal text-sm md:text-base max-w-xl">
            <p data-json="intro.paragraphs.0">
              Ang Getmeds ay nakatuon sa pagsuporta sa kalusugan at kapakanan ng bawat Pilipinong lumalaban sa cancer. Sa pamamagitan ng aming Patient Assistance Program, nakikipagtulungan kami sa mga ahensya ng gobyerno tulad ng DSWD (AICS) at PCSO (MAP) upang makapagbigay ng tulong medikal, partikular na ang libreng chemotherapy at iba pang gamot sa cancer, sa mga higit na nangangailangan.
            </p>
            <p data-json="intro.paragraphs.1">
              Layunin ng programang ito na mapagaan ang gastusin ng mga Pilipinong pasyenteng may cancer at kanilang pamilya na nahaharap sa mataas na halaga ng gamutan.
            </p>

            {/* Partner agencies */}
            <div className="pt-2 space-y-2">
              <p className="text-gray-900 font-semibold text-sm">Mga katuwang na ahensya:</p>
              <div className="flex items-center gap-6 flex-nowrap">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] shrink-0"></span>
                  <p className="text-gray-900 text-sm font-semibold whitespace-nowrap">DSWD – AICS (Assistance to Individuals in Crisis Situation)</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] shrink-0"></span>
                  <p className="text-gray-900 text-sm font-semibold whitespace-nowrap">PCSO – Medical Assistance Program</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Steps Title */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center">
          Mga Hakbang Para Makakuha ng Cancer Assistance
        </h2>
      </div>

      {/* STEP 1 */}
      <section className="pt-6 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-black shrink-0">1</span>
            <h3 data-json="steps.0.title" className="text-white text-xl md:text-2xl font-black uppercase leading-tight tracking-tight flex-1">
              KUMONSULTA SA IYONG DOKTOR
            </h3>
            <div className="ml-auto shrink-0 flex items-end h-14 relative">
              <i className="fa-solid fa-user-doctor text-white/30 text-[80px] absolute -bottom-2 right-0 leading-none pointer-events-none" />
              <i className="fa-solid fa-user-doctor text-white/90 text-5xl relative z-10" />
            </div>
          </div>

          {/* Content row: connector left + content right */}
          <div className="flex items-stretch">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0 w-[88px]">
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#61A644] to-[#1D9FDA] flex items-center justify-center shadow-md shrink-0 my-3">
                <i className="fa-solid fa-file-medical text-white text-xl" />
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
            </div>

            {/* Step 1 content */}
            <div className="flex-1 py-6 flex flex-col gap-4">
              <p data-json="steps.0.instruction" className="text-gray-900 text-base md:text-lg font-semibold leading-snug">
                Tanungin ang iyong attending physician tungkol sa pagkuha ng government assistance para sa iyong mga gamot sa cancer.
              </p>
              <p className="text-gray-500 text-[15px] italic leading-relaxed">
                Ask your attending physician about obtaining government assistance for your cancer medications.
              </p>
              <div className="flex items-start gap-3 bg-[#61A644]/10 rounded-[12px] px-4 py-3 mt-1">
                <i className="fa-solid fa-lightbulb text-[#61A644] text-base mt-0.5 shrink-0" />
                <p className="text-gray-700 text-[14px] leading-relaxed">
                  <span className="font-bold">Tip:</span> Ihanda ang iyong diagnosis records bago ang konsultasyon.
                  <span className="text-gray-500 italic"> — Have your diagnosis records ready before the consultation.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section className="pt-0 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 overflow-hidden relative reveal">
            <span className="text-white text-3xl font-black shrink-0">2</span>
            <h3 data-json="steps.1.title" className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight flex-1">
              IHANDA ANG IYONG MEDICAL DOCUMENTS
            </h3>
            <div className="ml-auto shrink-0 flex items-end h-14 relative">
              <i className="fa-solid fa-folder-open text-white/30 text-[80px] absolute -bottom-2 right-0 leading-none pointer-events-none" />
              <i className="fa-solid fa-folder-open text-white/90 text-5xl relative z-10" />
            </div>
          </div>

          {/* Content row */}
          <div className="flex items-stretch">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0 w-[88px]">
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#61A644] to-[#1D9FDA] flex items-center justify-center shadow-md shrink-0 my-3">
                <i className="fa-solid fa-clipboard-list text-white text-xl" />
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
            </div>

            {/* Step 2 content */}
            <div className="flex-1 py-8">
              <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
                <div className="shrink-0 w-56 lg:w-64 flex items-center justify-center">
                  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#dbeafe"/>
                        <stop offset="100%" stopColor="#e0f2fe"/>
                      </linearGradient>
                      <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24"/>
                        <stop offset="100%" stopColor="#f59e0b"/>
                      </linearGradient>
                      <linearGradient id="blueDocGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6"/>
                        <stop offset="100%" stopColor="#2563eb"/>
                      </linearGradient>
                      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#94a3b8" floodOpacity="0.25"/>
                      </filter>
                    </defs>

                    {/* Blob background */}
                    <ellipse cx="118" cy="128" rx="96" ry="82" fill="url(#blobGrad)" opacity="0.8"/>
                    <ellipse cx="80" cy="88" rx="30" ry="24" fill="#bfdbfe" opacity="0.35"/>

                    {/* Ground shadow */}
                    <ellipse cx="118" cy="186" rx="58" ry="9" fill="#94a3b8" opacity="0.12"/>

                    {/* Back blue document */}
                    <g filter="url(#softShadow)">
                      <rect x="122" y="46" width="76" height="102" rx="10" fill="url(#blueDocGrad)"/>
                      <path d="M178 46 L198 66 L178 66 Z" fill="#1d4ed8"/>
                      <path d="M178 46 L198 66 L178 66 L178 46 Z" fill="#1e40af"/>
                      <rect x="178" y="46" width="20" height="20" rx="0" fill="#1d4ed8" opacity="0"/>
                      <path d="M178 46 L178 66 L198 66" fill="none" stroke="#1e40af" strokeWidth="1"/>
                    </g>
                    <rect x="133" y="76" width="54" height="5" rx="2.5" fill="#bfdbfe"/>
                    <rect x="133" y="89" width="54" height="5" rx="2.5" fill="#bfdbfe"/>
                    <rect x="133" y="102" width="40" height="5" rx="2.5" fill="#bfdbfe"/>
                    <rect x="133" y="115" width="48" height="5" rx="2.5" fill="#bfdbfe"/>
                    <rect x="133" y="128" width="34" height="5" rx="2.5" fill="#bfdbfe"/>

                    {/* Middle white document */}
                    <g filter="url(#softShadow)">
                      <rect x="84" y="54" width="76" height="102" rx="10" fill="white"/>
                    </g>
                    {/* Red header stripe like medical form */}
                    <rect x="84" y="54" width="76" height="14" rx="10" fill="#fca5a5" opacity="0.5"/>
                    <rect x="84" y="61" width="76" height="7" fill="#fca5a5" opacity="0.5"/>
                    {/* Cross icon in header */}
                    <rect x="115" y="57" width="4" height="10" rx="1" fill="#ef4444" opacity="0.7"/>
                    <rect x="111" y="61" width="12" height="4" rx="1" fill="#ef4444" opacity="0.7"/>
                    <rect x="94" y="78" width="56" height="4" rx="2" fill="#e2e8f0"/>
                    <rect x="94" y="90" width="56" height="4" rx="2" fill="#e2e8f0"/>
                    <rect x="94" y="102" width="40" height="4" rx="2" fill="#e2e8f0"/>
                    <rect x="94" y="114" width="48" height="4" rx="2" fill="#e2e8f0"/>
                    <rect x="94" y="126" width="34" height="4" rx="2" fill="#e2e8f0"/>
                    <line x1="94" y1="148" x2="150" y2="148" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <rect x="94" y="152" width="28" height="3" rx="1.5" fill="#e2e8f0"/>

                    {/* Orange folder */}
                    <g filter="url(#softShadow)">
                      {/* Tab */}
                      <path d="M42 98 Q42 89 51 89 L86 89 Q95 89 97 98 L97 104 L42 104 Z" fill="#d97706"/>
                      {/* Body back */}
                      <rect x="42" y="102" width="106" height="74" rx="11" fill="#d97706"/>
                      {/* Body front */}
                      <rect x="42" y="110" width="106" height="66" rx="9" fill="url(#folderGrad)"/>
                    </g>
                    {/* Folder sheen */}
                    <rect x="42" y="110" width="106" height="18" rx="9" fill="white" opacity="0.12"/>
                    {/* Medical cross on folder */}
                    <rect x="82" y="130" width="7" height="22" rx="3" fill="white" opacity="0.9"/>
                    <rect x="74" y="138" width="22" height="7" rx="3" fill="white" opacity="0.9"/>
                    {/* Cursor arrow */}
                    <path d="M108 132 L108 158 L116 149 L122 161 L129 158 L123 146 L136 141 Z" fill="white" opacity="0.95"/>

                    {/* Blue pill badge */}
                    <rect x="22" y="112" width="38" height="24" rx="12" fill="#1e40af"/>
                    <rect x="22" y="112" width="38" height="24" rx="12" fill="#3b82f6" opacity="0.3"/>
                    <line x1="41" y1="117" x2="41" y2="128" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    <polyline points="36,124 41,130 46,124" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

                    {/* Paperclip */}
                    <path d="M58 186 C51 186 46 181 46 174 L46 154 C46 145 52 139 61 139 C70 139 76 145 76 154 L76 174 C76 178 73 182 69 182 C65 182 62 178 62 174 L62 155" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

                    {/* Stethoscope accent */}
                    <path d="M174 60 C174 53 181 49 187 53 C193 58 191 68 185 71 L176 77 C169 82 167 92 171 99" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="171" cy="103" r="5" stroke="#f59e0b" strokeWidth="2.5" fill="white"/>
                    <circle cx="187" cy="52" r="4.5" fill="#fbbf24"/>

                    {/* Decorative dots */}
                    <circle cx="28" cy="90" r="7" fill="#3b82f6"/>
                    <circle cx="168" cy="74" r="5.5" fill="#3b82f6"/>
                    <circle cx="176" cy="156" r="8" fill="#3b82f6"/>
                    <circle cx="36" cy="162" r="4" fill="#93c5fd"/>
                    <circle cx="192" cy="108" r="3" fill="#93c5fd"/>
                  </svg>
                </div>
                <div className="flex-1 space-y-6">
                  <p className="font-black text-gray-900 text-lg border-l-4 border-accent pl-6 uppercase tracking-tight">Siguraduhing makuha ang sumusunod na requirements mula sa iyong doktor:</p>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {[
                      { icon: 'fa-file-prescription', label: 'Medical Prescription' },
                      { icon: 'fa-notes-medical', label: 'Treatment Protocol' },
                      { icon: 'fa-file-medical', label: 'Medical Abstract / Clinical Summary' },
                    ].map((doc, i) => (
                      <div key={i} className="bg-gray-50 p-6 rounded-[15px] border border-gray-100 flex flex-col items-center text-center space-y-3 hover:bg-green-50/50 transition-colors group">
                        <div className="w-12 h-12 bg-white rounded-[12px] flex items-center justify-center shadow-sm text-accent group-hover:scale-110 transition-transform">
                          <i className={`fa-solid ${doc.icon} text-xl`}></i>
                        </div>
                        <p className="font-bold text-gray-800 text-sm">{doc.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-gray-50 rounded-[15px] border border-dashed border-gray-200">
                    <p className="text-xs font-bold text-gray-500 leading-relaxed italic text-center uppercase tracking-wider">
                      Lahat ng dokumento ay dapat <span className="text-gray-900">original copy</span>, may buong pangalan, pirma, at license number ng doktor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3 — Tabs */}
      <section className="pt-0 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-black shrink-0">3</span>
            <h3 className="text-white text-xl md:text-2xl font-black uppercase leading-tight tracking-tight flex-1">
              KUMPLETUHIN ANG IYONG APPLICATION DOCUMENTS
            </h3>
            <div className="ml-auto shrink-0 flex items-end h-14 relative">
              <i className="fa-solid fa-pen-to-square text-white/30 text-[80px] absolute -bottom-2 right-0 leading-none pointer-events-none" />
              <i className="fa-solid fa-pen-to-square text-white/90 text-5xl relative z-10" />
            </div>
          </div>

          {/* Content row */}
          <div className="flex items-stretch">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0 w-[88px]">
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#61A644] to-[#1D9FDA] flex items-center justify-center shadow-md shrink-0 my-3">
                <i className="fa-solid fa-headset text-white text-xl" />
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
            </div>

            {/* Step 3 content */}
            <div className="flex-1 py-8">
              <div className="flex flex-col lg:flex-row items-start gap-10 reveal">
                <div className="flex-1 space-y-6">
                  <p className="text-gray-500 font-medium">Bukod sa medical documents mula sa doktor, ihanda ang karagdagang requirements depende sa ahensya na iyong aaplayan.</p>

                  <div className="flex gap-2">
                    <div className="bg-white p-1.5 rounded-[15px] shadow-sm flex gap-2 border border-gray-100">
                      <button
                        onClick={() => setActiveTab('dswd')}
                        className={`px-8 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dswd' ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        DSWD (AICS)
                      </button>
                      <button
                        onClick={() => setActiveTab('pcso')}
                        className={`px-8 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pcso' ? 'bg-accent text-white shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        PCSO (MAP)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[15px] shadow-xl overflow-hidden border border-gray-100">
                    {activeTab === 'dswd' && (
                      <div className="p-8 space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-tight text-primary">DSWD Medical Assistance (AICS)</h4>
                        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                          {[
                            'Medical Prescription (Original, signed by doctor)',
                            'Treatment Protocol (Original, signed by doctor)',
                            'Medical Abstract / Clinical Summary (Original)',
                            'Photocopy ng valid gov\'t ID ng pasyente & representative',
                            'Social Case Study Report (Mula sa CSWDO)',
                            'Certificate of Indigency (Mula sa barangay)',
                            'Official Price Quotation (Mula sa Getmeds)',
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 group">
                              <div className="mt-1 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-check text-[8px]"></i>
                              </div>
                              <span className="text-gray-600 font-bold text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activeTab === 'pcso' && (
                      <div className="p-8 space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-tight text-accent">PCSO Medical Assistance Program (MAP/IMAP)</h4>
                        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                          {[
                            'Medical Prescription (Original, signed by doctor)',
                            'Treatment Protocol (Original, signed by doctor)',
                            'Medical Abstract / Clinical Summary (Original)',
                            'Kumpletong PCSO IMAP Application Form',
                            'Photocopy ng valid gov\'t ID ng pasyente & representative',
                            'Tatlong (3) official price quotations mula sa suppliers',
                            'Note: Ang unang quotation ay makukuha sa Getmeds',
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 group">
                              <div className="mt-1 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-check text-[8px]"></i>
                              </div>
                              <span className="text-gray-600 font-bold text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-56 lg:w-64 flex items-center justify-center self-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-[#61A644]/15 to-[#1D9FDA]/20 rounded-[24px] flex items-center justify-center">
                    <i className="fa-solid fa-clipboard-list text-7xl text-[#61A644]/70"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4 */}
      <section className="pt-0 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 overflow-hidden relative reveal">
            <span className="text-white text-3xl font-black shrink-0">4</span>
            <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight flex-1">
              MAKIPAG-UGNAYAN SA AMING PATIENT ASSISTANCE OFFICER
            </h3>
            <div className="ml-auto shrink-0 flex items-end h-14 relative">
              <i className="fa-solid fa-headset text-white/30 text-[80px] absolute -bottom-2 right-0 leading-none pointer-events-none" />
              <i className="fa-solid fa-headset text-white/90 text-5xl relative z-10" />
            </div>
          </div>

          {/* Content row */}
          <div className="flex items-stretch">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0 w-[88px]">
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#61A644] to-[#1D9FDA] flex items-center justify-center shadow-md shrink-0 my-3">
                <i className="fa-solid fa-paper-plane text-white text-xl" />
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
            </div>

            {/* Step 4 content */}
            <div className="flex-1 py-8">
              <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
                <div className="shrink-0 w-56 lg:w-64 flex items-center justify-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-[#1D9FDA]/15 to-[#61A644]/20 rounded-[24px] flex items-center justify-center">
                    <i className="fa-solid fa-users text-7xl text-[#1D9FDA]/70"></i>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-xl font-black text-gray-900 leading-tight">Ang aming Getmeds Patient Assistance Officer ay narito para gabayan kayo.</p>
                  <div className="space-y-4 pt-2">
                    {[
                      'Gagabay sa buong proseso ng iyong aplikasyon.',
                      'Susuri sa inyong mga requirements bago ang submission.',
                      'Magbibigay ng opisyal na quotation para sa inyong gamot sa cancer.',
                    ].map((text, i) => (
                      <div key={i} className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center gap-6 hover:border-primary/30 transition-all group">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                        <p className="font-bold text-gray-700 text-sm leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 5 */}
      <section className="pt-0 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 overflow-hidden relative reveal">
            <span className="text-white text-3xl font-black shrink-0">5</span>
            <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight flex-1">
              I-SUBMIT ANG IYONG REQUIREMENTS
            </h3>
            <div className="ml-auto shrink-0 flex items-end h-14 relative">
              <i className="fa-solid fa-paper-plane text-white/30 text-[80px] absolute -bottom-2 right-0 leading-none pointer-events-none" />
              <i className="fa-solid fa-paper-plane text-white/90 text-5xl relative z-10" />
            </div>
          </div>

          {/* Content row */}
          <div className="flex items-stretch">
            {/* Connector column */}
            <div className="flex flex-col items-center shrink-0 w-[88px]">
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#61A644] to-[#1D9FDA] flex items-center justify-center shadow-md shrink-0 my-3">
                <i className="fa-solid fa-envelope-open-text text-white text-xl" />
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644] to-[#1D9FDA] min-h-[24px]" />
            </div>

            {/* Step 5 content */}
            <div className="flex-1 py-8">
              <div className="flex flex-col lg:flex-row items-start gap-10 reveal">
                <div className="flex-1 space-y-6">
                  <p className="font-black text-gray-900 text-lg uppercase tracking-tight">Ang paraan ng pagsusumite ay nakadepende sa government agency na iyong inaaplayan.</p>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="text-center py-3 bg-gray-50 rounded-[12px] border border-gray-100">
                        <p className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Ahensya / Programa</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center justify-center h-24 hover:bg-blue-50/30 transition-colors border-l-8 border-l-primary">
                        <p className="font-bold text-gray-800 text-sm text-center">DSWD Medical Assistance (AICS)</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center justify-center h-24 hover:bg-blue-50/30 transition-colors border-l-8 border-l-primary">
                        <p className="font-bold text-gray-800 text-sm text-center">PCSO Medical Assistance Program (MAP / IMAP)</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center py-3 bg-gray-50 rounded-[12px] border border-gray-100">
                        <p className="font-black text-accent text-[10px] uppercase tracking-[0.2em]">Paraan ng Pagsumite</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center justify-center h-24 hover:bg-green-50/30 transition-colors border-l-8 border-l-accent">
                        <p className="text-sm font-bold text-gray-500 text-center">Personal na isumite sa pinakamalapit na DSWD Satellite Office</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center justify-center h-24 hover:bg-green-50/30 transition-colors border-l-8 border-l-accent">
                        <p className="text-sm font-bold text-gray-500 text-center">Online submission (soft copy) sa PCSO website</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-56 lg:w-64 flex items-center justify-center self-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-[#61A644]/15 to-[#1D9FDA]/20 rounded-[24px] flex items-center justify-center">
                    <i className="fa-solid fa-paper-plane text-7xl text-[#61A644]/70"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 6 */}
      <section className="pt-0 pb-10 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 overflow-hidden relative reveal">
            <span className="text-white text-3xl font-black shrink-0">6</span>
            <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight flex-1">
              HINTAYIN ANG IYONG GUARANTEE LETTER (GL)
            </h3>
            <div className="ml-auto shrink-0 flex items-end h-14 relative">
              <i className="fa-solid fa-envelope-open-text text-white/30 text-[80px] absolute -bottom-2 right-0 leading-none pointer-events-none" />
              <i className="fa-solid fa-envelope-open-text text-white/90 text-5xl relative z-10" />
            </div>
          </div>

          {/* Content row — no bottom connector line (last step) */}
          <div className="flex items-stretch">
            {/* Connector column — top line only, ends with checkmark */}
            <div className="flex flex-col items-center shrink-0 w-[88px]">
              <div className="w-0.5 h-8 bg-gradient-to-b from-[#61A644] to-[#1D9FDA]" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#61A644] to-[#1D9FDA] flex items-center justify-center shadow-md shrink-0 my-3">
                <i className="fa-solid fa-circle-check text-white text-2xl" />
              </div>
            </div>

            {/* Step 6 content */}
            <div className="flex-1 py-8">
              <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
                <div className="shrink-0 w-56 lg:w-64 flex items-center justify-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-[#1D9FDA]/15 to-[#61A644]/20 rounded-[24px] flex items-center justify-center">
                    <i className="fa-solid fa-envelope-circle-check text-7xl text-[#1D9FDA]/70"></i>
                  </div>
                </div>
                <div className="flex-1 space-y-6 text-gray-600 font-medium leading-relaxed text-lg">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center shrink-0 mt-1">
                      <i className="fa-solid fa-envelope-circle-check text-xl text-primary"></i>
                    </div>
                    <p>Kapag naaprubahan, ibibigay ng ahensiya ang GL bilang patunay na sasagutin nila ang gastusin sa gamot ng pasyente. Ang GL ay dokumentong nagpapatunay na ang ahensiya ang may pananagutan sa pagbabayad.</p>
                  </div>
                  <p className="pl-14">Dalhin ito sa nakasaad na medicine distributor o supplier upang makuha ang gamot. Para sa gabay sa pag-claim, makipag-ugnayan muli sa aming Patient Assistance Officer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saan Makukuha ang Gamot */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
            <div className="lg:w-1/2 space-y-6 reveal">
              <h3 className="text-3xl md:text-4xl font-black text-primary tracking-tight leading-none uppercase">Saan Makukuha ang <br /><span className="text-accent">Iyong Mga Gamot</span></h3>
              <div className="bg-gray-50 p-8 rounded-[15px] border border-gray-100 space-y-6 shadow-inner border-l-8 border-primary">
                <div className="flex items-start gap-5 group">
                  <i className="fa-solid fa-location-dot text-2xl text-primary transform group-hover:scale-110 transition-transform"></i>
                  <p className="font-bold text-gray-700 text-[13px] leading-relaxed">Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747</p>
                </div>
                <div className="flex items-start gap-5 group">
                  <i className="fa-solid fa-clock text-2xl text-primary transform group-hover:scale-110 transition-transform"></i>
                  <p className="font-bold text-gray-700 text-[13px] leading-relaxed tracking-widest uppercase">8:00 AM – 5:00 PM</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 reveal" style={{ transitionDelay: '200ms' }}>
              <div className="bg-white p-12 rounded-[15px] shadow-2xl border border-gray-100 flex flex-col items-center group transition-all duration-500 hover:shadow-blue-200/50">
                <div className="h-20 flex items-center mb-10 transform group-hover:scale-110 transition-transform">
                  <span className="text-4xl font-extrabold text-primary">Get<span className="text-accent underline underline-offset-8">MEDS</span></span>
                </div>
                <div className="w-full h-1 bg-primary/10 mb-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent transform -translate-x-full group-hover:translate-x-full duration-1000"></div>
                </div>
                <p className="text-primary font-black italic text-xl uppercase tracking-widest">Your Compassionate Health Ally</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs & Compassionate Special Permit */}
      <section id="faqs" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto mx-auto px-6">
          <div className="text-center mb-10 space-y-3 reveal">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">FAQs &amp; Additional Info</h3>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="space-y-3 reveal">
            {/* FAQ 1 */}
            <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden group">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full px-6 py-4 flex items-center justify-between text-left group"
              >
                <span className="font-black text-gray-800 text-base group-hover:text-primary transition-colors uppercase tracking-tight">Ano ang Guarantee Letter o GL?</span>
                <i className={`fa-solid fa-chevron-down text-gray-400 group-hover:text-primary transition-all duration-300 text-sm ${activeFaq === 0 ? 'rotate-180' : ''}`}></i>
              </button>
              {activeFaq === 0 && (
                <div className="px-8 pb-8 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50 mt-2">
                  Kapag naaprubahan ang iyong aplikasyon at mga kinakailangang dokumento, maglalabas ang ahensiya ng Guarantee Letter (GL) para sa pasyente o sa kaniyang kinatawan. Ang GL ay isang mahalagang dokumento na nagpapatunay na ang ahensiya ang sasagot sa lahat ng gastusin para sa gamot ng pasyente. Sa pamamagitan ng GL, magkakaroon ka ng katiyakan na ang iyong gamot ay maibibigay nang walang abala sa bayad.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-[15px] shadow-sm border border-gray-100 overflow-hidden group">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors uppercase tracking-tight">Ano ang Compassionate Special Permit?</span>
                <i className={`fa-solid fa-chevron-down text-gray-400 group-hover:text-primary transition-all duration-300 ${activeFaq === 1 ? 'rotate-180' : ''}`}></i>
              </button>
              {activeFaq === 1 && (
                <div className="px-8 pb-8 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50 mt-2">
                  Nag-aalok din ang Getmeds ng tulong para sa mga gamot sa cancer na nangangailangan ng espesyal na permit, upang mas mapabilis at maayos ang proseso ng pagkuha. Halimbawa nito ang Compassionate Special Permit (CSP), na ginagamit para sa Restricted Use of Covered Pharmaceutical Products o Access to unregistered drugs for seriously ill patients.
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 bg-primary rounded-[15px] p-10 text-white shadow-2xl space-y-8 reveal" style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-[15px] backdrop-blur-md">
                <i className="fa-solid fa-shield-virus text-4xl"></i>
              </div>
              <h4 className="text-3xl font-black tracking-tight leading-none uppercase">Compassionate <br /> Special Permit (CSP)</h4>
            </div>
            <p className="font-bold text-blue-50 leading-relaxed text-lg">
              Nag-aalok din ang Getmeds ng tulong para sa mga gamot sa cancer na nangangailangan ng espesyal na permit upang mas mapabilis at maayos ang proseso.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-6 rounded-[15px] border border-white/10 hover:bg-white/20 transition-all group">
                <h5 className="font-black mb-3 text-xs uppercase tracking-[0.2em] text-blue-200">Restricted Use</h5>
                <p className="text-xs font-semibold leading-relaxed text-blue-50/80">Para makagamit ng mga gamot at medical devices na limitado ang paggamit alinsunod sa standard protocols.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-[15px] border border-white/10 hover:bg-white/20 transition-all group">
                <h5 className="font-black mb-3 text-xs uppercase tracking-[0.2em] text-blue-200">Access to Unregistered Drugs</h5>
                <p className="text-xs font-semibold leading-relaxed text-blue-50/80">Para sa mga pasyenteng may advanced stage cancer lalo na kung walang mas mabisa o alternatibong therapy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Contact Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto mx-auto px-6 text-center space-y-10">
          <div className="space-y-3 reveal">
            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Need immediate assistance?</p>
            <h4 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">Contact our Patient Assistance Officer today via Viber for a quick quotation.</h4>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 justify-center reveal" style={{ transitionDelay: '200ms' }}>
            <a href="#" className="bg-primary hover:bg-blue-600 text-white px-10 py-5 rounded-[12px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 group transform hover:scale-105 transition-all">
              <i className="fa-solid fa-phone group-hover:rotate-12 transition-transform"></i> VIBER INQUIRY
            </a>
            <a href="contact-us.html" className="bg-white text-primary border-2 border-primary px-10 py-5 rounded-[12px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 group">
              <i className="fa-solid fa-info-circle"></i> MORE INFORMATION
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
