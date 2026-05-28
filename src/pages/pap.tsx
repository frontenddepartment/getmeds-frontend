import React, { useState, useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';

export default function PatientAssistanceProgram() {
  const { getImage } = useImageMapper('pap');
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
          src={getImage('assets/papbanner.png', 'assets/papbanner.png')}
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
            src={getImage('assets/pap.png', 'assets/pap.png')}
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
            <div className="relative inline-block">
              <div className="absolute inset-0 shadow-[inset_0_0_120px_60px_white] rounded-[20px] pointer-events-none z-10"></div>
              <img
                src={getImage('assets/patientpap.png', 'assets/patientpap.png')}
                alt="Cancer Patient"
                className="w-full object-contain object-bottom rounded-[20px]"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                }}
              />
            </div>
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
          Mga Hakbang Para Makakuha ng{' '}
          <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Cancer Assistance</span>
        </h2>
      </div>

      {/* STEP 1 */}
      <section className="pt-6 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-semibold shrink-0">1</span>
            <h3 data-json="steps.0.title" className="text-white text-xl md:text-2xl font-semibold uppercase leading-tight tracking-tight flex-1">
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
            <div className="flex-1 py-6">
              <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
                <div className="flex-1 flex flex-col gap-4">
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
                <div className="shrink-0 w-72 lg:w-96 flex items-center justify-center">
                  <img
                    src={getImage('assets/stepone.png', 'assets/stepone.png')}
                    alt="Kumonsulta sa Doktor"
                    className="w-full object-contain"
                    style={{
                      maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
                      maskComposite: 'intersect',
                      WebkitMaskComposite: 'destination-in',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section className="pt-0 pb-0 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-semibold shrink-0">2</span>
            <h3 data-json="steps.1.title" className="text-white text-xl md:text-2xl font-semibold uppercase leading-tight tracking-tight flex-1">
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
                        <stop offset="0%" stopColor="#dbeafe" />
                        <stop offset="100%" stopColor="#e0f2fe" />
                      </linearGradient>
                      <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                      <linearGradient id="blueDocGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#94a3b8" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    {/* Blob background */}
                    <ellipse cx="118" cy="128" rx="96" ry="82" fill="url(#blobGrad)" opacity="0.8" />
                    <ellipse cx="80" cy="88" rx="30" ry="24" fill="#bfdbfe" opacity="0.35" />

                    {/* Ground shadow */}
                    <ellipse cx="118" cy="186" rx="58" ry="9" fill="#94a3b8" opacity="0.12" />

                    {/* Back blue document */}
                    <g filter="url(#softShadow)">
                      <rect x="122" y="46" width="76" height="102" rx="10" fill="url(#blueDocGrad)" />
                      <path d="M178 46 L198 66 L178 66 Z" fill="#1d4ed8" />
                      <path d="M178 46 L198 66 L178 66 L178 46 Z" fill="#1e40af" />
                      <rect x="178" y="46" width="20" height="20" rx="0" fill="#1d4ed8" opacity="0" />
                      <path d="M178 46 L178 66 L198 66" fill="none" stroke="#1e40af" strokeWidth="1" />
                    </g>
                    <rect x="133" y="76" width="54" height="5" rx="2.5" fill="#bfdbfe" />
                    <rect x="133" y="89" width="54" height="5" rx="2.5" fill="#bfdbfe" />
                    <rect x="133" y="102" width="40" height="5" rx="2.5" fill="#bfdbfe" />
                    <rect x="133" y="115" width="48" height="5" rx="2.5" fill="#bfdbfe" />
                    <rect x="133" y="128" width="34" height="5" rx="2.5" fill="#bfdbfe" />

                    {/* Middle white document */}
                    <g filter="url(#softShadow)">
                      <rect x="84" y="54" width="76" height="102" rx="10" fill="white" />
                    </g>
                    {/* Red header stripe like medical form */}
                    <rect x="84" y="54" width="76" height="14" rx="10" fill="#fca5a5" opacity="0.5" />
                    <rect x="84" y="61" width="76" height="7" fill="#fca5a5" opacity="0.5" />
                    {/* Cross icon in header */}
                    <rect x="115" y="57" width="4" height="10" rx="1" fill="#ef4444" opacity="0.7" />
                    <rect x="111" y="61" width="12" height="4" rx="1" fill="#ef4444" opacity="0.7" />
                    <rect x="94" y="78" width="56" height="4" rx="2" fill="#e2e8f0" />
                    <rect x="94" y="90" width="56" height="4" rx="2" fill="#e2e8f0" />
                    <rect x="94" y="102" width="40" height="4" rx="2" fill="#e2e8f0" />
                    <rect x="94" y="114" width="48" height="4" rx="2" fill="#e2e8f0" />
                    <rect x="94" y="126" width="34" height="4" rx="2" fill="#e2e8f0" />
                    <line x1="94" y1="148" x2="150" y2="148" stroke="#e2e8f0" strokeWidth="1.5" />
                    <rect x="94" y="152" width="28" height="3" rx="1.5" fill="#e2e8f0" />

                    {/* Orange folder */}
                    <g filter="url(#softShadow)">
                      {/* Tab */}
                      <path d="M42 98 Q42 89 51 89 L86 89 Q95 89 97 98 L97 104 L42 104 Z" fill="#d97706" />
                      {/* Body back */}
                      <rect x="42" y="102" width="106" height="74" rx="11" fill="#d97706" />
                      {/* Body front */}
                      <rect x="42" y="110" width="106" height="66" rx="9" fill="url(#folderGrad)" />
                    </g>
                    {/* Folder sheen */}
                    <rect x="42" y="110" width="106" height="18" rx="9" fill="white" opacity="0.12" />
                    {/* Medical cross on folder */}
                    <rect x="82" y="130" width="7" height="22" rx="3" fill="white" opacity="0.9" />
                    <rect x="74" y="138" width="22" height="7" rx="3" fill="white" opacity="0.9" />
                    {/* Cursor arrow */}
                    <path d="M108 132 L108 158 L116 149 L122 161 L129 158 L123 146 L136 141 Z" fill="white" opacity="0.95" />

                    {/* Blue pill badge */}
                    <rect x="22" y="112" width="38" height="24" rx="12" fill="#1e40af" />
                    <rect x="22" y="112" width="38" height="24" rx="12" fill="#3b82f6" opacity="0.3" />
                    <line x1="41" y1="117" x2="41" y2="128" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <polyline points="36,124 41,130 46,124" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* Paperclip */}
                    <path d="M58 186 C51 186 46 181 46 174 L46 154 C46 145 52 139 61 139 C70 139 76 145 76 154 L76 174 C76 178 73 182 69 182 C65 182 62 178 62 174 L62 155" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Stethoscope accent */}
                    <path d="M174 60 C174 53 181 49 187 53 C193 58 191 68 185 71 L176 77 C169 82 167 92 171 99" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="171" cy="103" r="5" stroke="#f59e0b" strokeWidth="2.5" fill="white" />
                    <circle cx="187" cy="52" r="4.5" fill="#fbbf24" />

                    {/* Decorative dots */}
                    <circle cx="28" cy="90" r="7" fill="#3b82f6" />
                    <circle cx="168" cy="74" r="5.5" fill="#3b82f6" />
                    <circle cx="176" cy="156" r="8" fill="#3b82f6" />
                    <circle cx="36" cy="162" r="4" fill="#93c5fd" />
                    <circle cx="192" cy="108" r="3" fill="#93c5fd" />
                  </svg>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-base md:text-lg leading-snug">Siguraduhing makuha ang sumusunod na requirements mula sa iyong doktor:</p>
                    <p className="text-gray-500 text-[15px] italic leading-relaxed">Make sure to get the following requirements from your doctor:</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: 'fa-file-prescription', label: 'Medical Prescription', color: '#1D9FDA' },
                      { icon: 'fa-notes-medical', label: 'Treatment Protocol', color: '#61A644' },
                      { icon: 'fa-file-medical', label: 'Medical Abstract / Clinical Summary', color: '#6366F1' },
                    ].map((doc, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: doc.color }}>
                          <i className={`fa-solid ${doc.icon} text-white text-lg`}></i>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">{doc.label}</h4>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 bg-[#61A644]/10 rounded-[12px] px-4 py-3">
                    <i className="fa-solid fa-thumbtack text-[#61A644] text-base mt-0.5 shrink-0" />
                    <p className="text-gray-700 text-[14px] leading-relaxed"><span className="font-bold">Note:</span> Lahat ng dokumento ay dapat <span className="font-bold">original copy</span>, may buong pangalan, pirma, at license number ng doktor. <span className="text-gray-500 italic">— All documents must be original copies with the doctor's full name, signature, and license number.</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3 — Tabs */}
      <section className="pt-0 pb-10 max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Bar */}
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-semibold shrink-0">3</span>
            <h3 className="text-white text-xl md:text-2xl font-semibold uppercase leading-tight tracking-tight flex-1">
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
            <div className="flex-1 pt-1 pb-0">
              {/* Text + image row */}
              <div className="flex flex-col lg:flex-row items-center justify-end gap-4 mb-2 reveal">
                <div className="flex-1 flex flex-col gap-4">
                  <p className="text-gray-900 text-base md:text-lg font-semibold leading-snug">Bukod sa medical documents mula sa doktor, ihanda ang karagdagang requirements depende sa ahensya na iyong aaplayan.</p>
                  <p className="text-gray-500 text-[15px] italic leading-relaxed">— Aside from medical documents from your doctor, prepare additional requirements depending on the agency you will apply to.</p>
                </div>
                <div className="shrink-0 w-44 lg:w-52 flex items-center justify-center">
                  <svg viewBox="0 0 260 290" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M32 30C66 3 196 5 232 42C268 79 265 188 228 218C191 248 64 262 30 228C-4 194 2 152 10 110C18 68 -2 57 32 30Z" fill="#ecfdf5" opacity="0.9"/>
                    <circle cx="16" cy="122" r="5" fill="#4ade80"/>
                    <circle cx="16" cy="138" r="5" fill="#4ade80"/>
                    <circle cx="16" cy="154" r="5" fill="#4ade80"/>
                    <rect x="198" y="18" width="48" height="56" rx="6" fill="white" stroke="#d1fae5" strokeWidth="1.5"/>
                    <path d="M206 30L209 33L216 26" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="205" y="40" width="32" height="3" rx="1.5" fill="#bbf7d0"/>
                    <rect x="205" y="48" width="24" height="3" rx="1.5" fill="#bbf7d0"/>
                    <rect x="205" y="56" width="28" height="3" rx="1.5" fill="#bbf7d0"/>
                    <rect x="205" y="64" width="20" height="3" rx="1.5" fill="#bbf7d0"/>
                    <path d="M232 172L234 178L240 180L234 182L232 188L230 182L224 180L230 178Z" fill="#fbbf24" opacity="0.85"/>
                    <rect x="48" y="56" width="168" height="228" rx="13" fill="#d1d5db" opacity="0.4"/>
                    <rect x="46" y="54" width="168" height="228" rx="12" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
                    <rect x="107" y="44" width="46" height="22" rx="8" fill="#94a3b8"/>
                    <rect x="115" y="49" width="30" height="12" rx="4" fill="#64748b"/>
                    <rect x="58" y="68" width="144" height="6" rx="3" fill="#d1fae5"/>
                    <rect x="58" y="68" width="86" height="6" rx="3" fill="#4ade80" opacity="0.6"/>
                    <rect x="56" y="83" width="148" height="26" rx="6" fill="#f0fdf4"/>
                    <circle cx="71" cy="96" r="9" fill="#bbf7d0"/>
                    <path d="M67 96L71 100L78 91" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="87" y="91" width="86" height="4" rx="2" fill="#4b5563"/>
                    <rect x="87" y="99" width="56" height="3" rx="1.5" fill="#d1d5db"/>
                    <rect x="56" y="113" width="148" height="26" rx="6" fill="#f0fdf4"/>
                    <circle cx="71" cy="126" r="9" fill="#bbf7d0"/>
                    <path d="M67 126L71 130L78 121" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="87" y="121" width="74" height="4" rx="2" fill="#4b5563"/>
                    <rect x="87" y="129" width="48" height="3" rx="1.5" fill="#d1d5db"/>
                    <rect x="56" y="143" width="148" height="26" rx="6" fill="#eff6ff"/>
                    <circle cx="71" cy="156" r="9" fill="#bfdbfe"/>
                    <path d="M67 156L71 160L78 151" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="87" y="151" width="92" height="4" rx="2" fill="#4b5563"/>
                    <rect x="87" y="159" width="62" height="3" rx="1.5" fill="#d1d5db"/>
                    <rect x="56" y="173" width="148" height="26" rx="6" fill="#f8fafc"/>
                    <circle cx="71" cy="186" r="9" fill="#e2e8f0"/>
                    <rect x="87" y="181" width="80" height="4" rx="2" fill="#9ca3af"/>
                    <rect x="87" y="189" width="52" height="3" rx="1.5" fill="#e5e7eb"/>
                    <rect x="56" y="203" width="148" height="26" rx="6" fill="#f8fafc"/>
                    <circle cx="71" cy="216" r="9" fill="#e2e8f0"/>
                    <rect x="87" y="211" width="68" height="4" rx="2" fill="#9ca3af"/>
                    <rect x="87" y="219" width="44" height="3" rx="1.5" fill="#e5e7eb"/>
                    <rect x="56" y="233" width="148" height="26" rx="6" fill="#f8fafc"/>
                    <circle cx="71" cy="246" r="9" fill="#e2e8f0"/>
                    <rect x="87" y="241" width="75" height="4" rx="2" fill="#9ca3af"/>
                    <rect x="87" y="249" width="48" height="3" rx="1.5" fill="#e5e7eb"/>
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-center -mt-1">
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
                        <h4 className="text-lg font-semibold tracking-tight text-primary">DSWD Medical Assistance (AICS)</h4>
                        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                          {[
                            { text: 'Medical Prescription', note: null },
                            { text: 'Treatment Protocol', note: null },
                            { text: 'Medical Abstract / Clinical Summary', note: null },
                            { text: 'Photocopy ng valid government-issued ID ng pasyente', note: 'Isama rin ang ID ng representative kung sila ang magsusumite' },
                            { text: 'Social Case Study Report', note: 'Mula sa City Social Welfare and Development Office (CSWDO) sa City Hall ng lungsod kung saan kasalukuyang nakatira' },
                            { text: 'Certificate of Indigency', note: 'Makukuha mula sa inyong barangay; kinakailangan para makuha ang iyong Social Case Study Report' },
                            { text: 'Official Price Quotation para sa mga gamot sa cancer', note: 'Makukuha mula sa Getmeds' },
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 group">
                              <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-check text-[11px]"></i>
                              </div>
                              <div>
                                <span className="text-gray-600 font-bold text-sm">{item.text}</span>
                                {item.note && <p className="text-gray-600 text-xs italic mt-0.5">{item.note}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activeTab === 'pcso' && (
                      <div className="p-8 space-y-6">
                        <h4 className="text-lg font-semibold tracking-tight text-accent">PCSO Medical Assistance Program (MAP/IMAP)</h4>
                        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                          {[
                            { text: 'Medical Prescription', note: null },
                            { text: 'Treatment Protocol', note: null },
                            { text: 'Medical Abstract / Clinical Summary', note: null },
                            { text: 'Kumpletong PCSO IMAP Application Form', note: 'Maaaring i-download mula sa PCSO website' },
                            { text: 'Photocopy ng valid government-issued ID ng pasyente', note: 'Isama rin ang ID ng representative kung sila ang magsusumite' },
                            { text: 'Tatlong (3) official price quotations para sa gamot sa cancer mula sa magkakaibang distributor o supplier', note: 'Ang unang quotation ay makukuha mula sa Getmeds. Ang dalawa pang natitira ay kailangang i-request ng pasyente mula sa ibang distributor o supplier.' },
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 group">
                              <div className="mt-1 w-5 h-5 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-check text-[11px]"></i>
                              </div>
                              <div>
                                <span className="text-gray-600 font-bold text-sm">{item.text}</span>
                                {item.note && <p className="text-gray-600 text-xs italic mt-0.5">{item.note}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-semibold shrink-0">4</span>
            <h3 className="text-white text-xl md:text-2xl font-semibold uppercase leading-tight tracking-tight flex-1">
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
              <div className="flex flex-col lg:flex-row items-center gap-8 reveal">
                <div className="shrink-0 w-44 lg:w-52 flex items-center justify-center">
                  <img
                    src={getImage('assets/stepthree.png', 'assets/stepthree.png')}
                    alt="Patient Assistance Officer"
                    className="w-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-900 text-base md:text-lg font-semibold leading-snug">Ang aming Getmeds Patient Assistance Officer ay narito para gabayan kayo.</p>
                    <p className="text-gray-500 text-[15px] italic leading-relaxed">— Our Getmeds Patient Assistance Officer is here to guide you.</p>
                  </div>
                  <div className="flex items-start gap-0 pt-2">
                    {[
                      'Gagabay sa buong proseso ng iyong aplikasyon.',
                      'Susuri sa inyong mga requirements bago ang submission.',
                      'Magbibigay ng opisyal na quotation para sa inyong gamot sa cancer.',
                    ].map((text, i, arr) => (
                      <React.Fragment key={i}>
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <span className="text-4xl font-black text-primary leading-none">{String(i + 1).padStart(2, '0')}</span>
                          <p className="font-bold text-gray-900 text-sm leading-snug">{text}</p>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="pt-3 px-1 shrink-0">
                            <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                              <path d="M0 7H20M20 7L14 1M20 7L14 13" stroke="#1D9FDA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </React.Fragment>
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
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-semibold shrink-0">5</span>
            <h3 className="text-white text-xl md:text-2xl font-semibold uppercase leading-tight tracking-tight flex-1">
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
              <div className="flex flex-col lg:flex-row items-center gap-8 reveal">
                <div className="flex-1 space-y-5">
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-900 text-base md:text-lg font-semibold leading-snug">Ang paraan ng pagsusumite ay nakadepende sa government agency na iyong inaaplayan.</p>
                    <p className="text-gray-500 text-[15px] italic leading-relaxed">— The method of submission depends on the government agency you are applying to.</p>
                  </div>
                  <div className="space-y-5 pt-1">
                    {[
                      { color: '#1D9FDA', title: 'DSWD Medical Assistance (AICS)', desc: 'Personal na isumite sa pinakamalapit na DSWD Satellite Office' },
                      { color: '#61A644', title: 'PCSO Medical Assistance Program (MAP / IMAP)', desc: 'Online submission (soft copy) sa PCSO website' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-md" style={{ background: item.color }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-bold text-gray-900 text-sm leading-snug">{item.title}</p>
                          <p className="text-gray-700 text-sm mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 w-44 lg:w-52 flex items-center justify-center">
                  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M38 32C72 6 168 8 200 44C232 80 228 152 196 180C164 208 112 224 72 212C32 200 6 164 8 128C10 92 4 58 38 32Z" fill="#dbeafe" opacity="0.7"/>
                    <circle cx="18" cy="108" r="5" fill="#60a5fa"/>
                    <circle cx="18" cy="124" r="5" fill="#60a5fa"/>
                    <circle cx="18" cy="140" r="5" fill="#60a5fa"/>
                    <path d="M210 148L212 154L218 156L212 158L210 164L208 158L202 156L208 154Z" fill="#fbbf24" opacity="0.85"/>
                    {/* DSWD card */}
                    <rect x="22" y="58" width="90" height="122" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <rect x="22" y="58" width="90" height="22" rx="14" fill="#1D9FDA"/>
                    <rect x="22" y="70" width="90" height="10" fill="#1D9FDA"/>
                    <rect x="46" y="104" width="42" height="40" rx="4" fill="#dbeafe"/>
                    <rect x="51" y="109" width="9" height="9" rx="1.5" fill="#60a5fa"/>
                    <rect x="66" y="109" width="9" height="9" rx="1.5" fill="#60a5fa"/>
                    <rect x="51" y="123" width="9" height="9" rx="1.5" fill="#60a5fa"/>
                    <rect x="66" y="123" width="9" height="9" rx="1.5" fill="#60a5fa"/>
                    <polygon points="46,104 67,90 88,104" fill="#93c5fd"/>
                    <rect x="32" y="154" width="70" height="5" rx="2.5" fill="#bfdbfe"/>
                    <rect x="40" y="154" width="44" height="5" rx="2.5" fill="#60a5fa" opacity="0.8"/>
                    <rect x="30" y="165" width="74" height="8" rx="4" fill="#eff6ff"/>
                    <rect x="36" y="168" width="58" height="2" rx="1" fill="#93c5fd"/>
                    {/* PCSO card */}
                    <rect x="128" y="58" width="90" height="122" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <rect x="128" y="58" width="90" height="22" rx="14" fill="#61A644"/>
                    <rect x="128" y="70" width="90" height="10" fill="#61A644"/>
                    <rect x="140" y="95" width="66" height="50" rx="5" fill="#d1fae5"/>
                    <rect x="146" y="101" width="54" height="34" rx="3" fill="#6ee7b7" opacity="0.45"/>
                    <path d="M163 122C166 118 181 118 184 122" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M159 118C164 112 183 112 188 118" stroke="#065f46" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5"/>
                    <circle cx="173" cy="126" r="3" fill="#065f46"/>
                    <rect x="138" y="145" width="70" height="5" rx="2.5" fill="#34d399" opacity="0.4"/>
                    <rect x="138" y="154" width="70" height="5" rx="2.5" fill="#bbf7d0"/>
                    <rect x="146" y="154" width="44" height="5" rx="2.5" fill="#61A644" opacity="0.8"/>
                    <rect x="136" y="165" width="74" height="8" rx="4" fill="#f0fdf4"/>
                    <rect x="142" y="168" width="58" height="2" rx="1" fill="#86efac"/>
                    {/* OR badge */}
                    <circle cx="120" cy="119" r="13" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
                    <text x="120" y="123" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="bold" fill="#6b7280">OR</text>
                  </svg>
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
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 overflow-hidden relative reveal">
            <span className="text-white text-4xl font-semibold shrink-0">6</span>
            <h3 className="text-white text-xl md:text-2xl font-semibold uppercase leading-tight tracking-tight flex-1">
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
                  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Background blob */}
                    <path d="M32 24C66 0 176 2 208 40C240 78 234 162 202 192C170 222 60 232 28 206C-4 180 0 148 4 112C8 76 -2 48 32 24Z" fill="#dbeafe" opacity="0.65"/>
                    {/* Document shadow */}
                    <rect x="34" y="44" width="152" height="182" rx="16" fill="#94a3b8" opacity="0.12"/>
                    {/* Document body */}
                    <rect x="28" y="36" width="152" height="182" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
                    {/* Header */}
                    <rect x="28" y="36" width="152" height="44" rx="16" fill="#1D9FDA"/>
                    <rect x="28" y="58" width="152" height="22" fill="#1D9FDA"/>
                    {/* GL title */}
                    <text x="104" y="56" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="bold" fill="white">GL</text>
                    <text x="104" y="71" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="6.5" fontWeight="600" fill="white" letterSpacing="1.5">GUARANTEE LETTER</text>
                    {/* Label 1 */}
                    <rect x="44" y="88" width="38" height="4.5" rx="2.25" fill="#93c5fd" opacity="0.9"/>
                    {/* Content line 1 */}
                    <rect x="44" y="97" width="112" height="5.5" rx="2.75" fill="#374151"/>
                    {/* Sub line 1 */}
                    <rect x="44" y="107" width="80" height="4" rx="2" fill="#9ca3af"/>
                    {/* Divider 1 */}
                    <rect x="44" y="119" width="124" height="1" rx="0.5" fill="#f1f5f9"/>
                    {/* Label 2 */}
                    <rect x="44" y="127" width="46" height="4.5" rx="2.25" fill="#93c5fd" opacity="0.9"/>
                    {/* Content line 2 */}
                    <rect x="44" y="136" width="100" height="5.5" rx="2.75" fill="#374151"/>
                    {/* Sub line 2 */}
                    <rect x="44" y="146" width="68" height="4" rx="2" fill="#9ca3af"/>
                    {/* Divider 2 */}
                    <rect x="44" y="158" width="124" height="1" rx="0.5" fill="#f1f5f9"/>
                    {/* Signature lines */}
                    <rect x="44" y="166" width="72" height="3.5" rx="1.75" fill="#e2e8f0"/>
                    <rect x="44" y="174" width="52" height="3" rx="1.5" fill="#cbd5e1"/>
                    <rect x="44" y="182" width="40" height="2.5" rx="1.25" fill="#e2e8f0"/>
                    {/* Approval seal */}
                    <circle cx="168" cy="178" r="30" fill="#61A644"/>
                    <circle cx="168" cy="178" r="30" fill="white" opacity="0.1"/>
                    <circle cx="168" cy="178" r="24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3"/>
                    <path d="M155 178L165 188L182 162" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    {/* Left dots */}
                    <circle cx="16" cy="110" r="5" fill="#60a5fa"/>
                    <circle cx="16" cy="126" r="5" fill="#60a5fa"/>
                    <circle cx="16" cy="142" r="5" fill="#60a5fa"/>
                    {/* Gold sparkle */}
                    <path d="M216 50L218 56L224 58L218 60L216 66L214 60L208 58L214 56Z" fill="#fbbf24" opacity="0.85"/>
                    {/* Accent circles */}
                    <circle cx="24" cy="56" r="6" fill="#34d399" opacity="0.4"/>
                    <circle cx="210" cy="104" r="4" fill="#60a5fa" opacity="0.5"/>
                    <circle cx="22" cy="196" r="3.5" fill="#93c5fd" opacity="0.5"/>
                  </svg>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center shrink-0 mt-1">
                      <i className="fa-solid fa-envelope-circle-check text-xl text-primary"></i>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900 text-base md:text-lg font-semibold leading-snug">Kapag naaprubahan, ibibigay ng ahensiya ang GL bilang patunay na sasagutin nila ang gamot.</p>
                      <p className="text-gray-500 text-[15px] italic leading-relaxed">— When approved, the agency will provide the GL as proof that they will cover the medication.</p>
                    </div>
                  </div>
                  <div className="pl-14 space-y-1">
                    <p className="text-gray-900 text-base md:text-lg font-semibold leading-snug">Dalhin ito sa nakasaad na medicine distributor o supplier upang makuha ang gamot. Para sa gabay, makipag-ugnayan sa aming Patient Assistance Officer.</p>
                    <p className="text-gray-500 text-[15px] italic leading-relaxed">— Bring it to the designated medicine distributor or supplier to get the medicine. For guidance, contact our Patient Assistance Officer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saan Makukuha ang Gamot */}
      <section className="py-16 lg:pt-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-8 reveal">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center">
              Saan Makukuha ang{' '}
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Iyong Mga Gamot</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Location card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-8 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-gradient-to-tr from-[#1D9FDA]/20 via-[#1D9FDA]/5 to-transparent -translate-x-10 translate-y-10 pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                  <i className="fa-solid fa-location-dot text-[26px] text-[#1D9FDA]"></i>
                  <i className="fa-solid fa-map-location-dot text-[22px] text-[#1D9FDA]/30"></i>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-3">Aming Lokasyon</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <span className="font-bold text-gray-800">Unit 305, 17 Vatican Bldg.,</span> Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747
                </p>
              </div>
              {/* Hours card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-8 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-gradient-to-tr from-[#61A644]/20 via-[#61A644]/5 to-transparent -translate-x-10 translate-y-10 pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                  <i className="fa-solid fa-clock text-[26px] text-[#61A644]"></i>
                  <i className="fa-solid fa-calendar-days text-[22px] text-[#61A644]/30"></i>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-3">Oras ng Operasyon</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <span className="font-bold text-gray-800">8:00 AM – 5:00 PM,</span> Lunes hanggang Biyernes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-14 px-6 bg-white reveal">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* LEFT */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: '#f0f7ff', border: '1px solid #dbeeff' }}>
                <i className="fa-regular fa-circle-question text-xs" style={{ color: '#1D9FDA' }}></i>
                <span className="text-xs font-medium" style={{ color: '#1D9FDA' }}>Mga katanungan</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-4">
                Mga madalas<br />itanong tungkol sa{' '}
                <span className="bg-gradient-to-r from-[#1D9FDA] to-[#61A644] bg-clip-text text-transparent">PAP.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Lahat ng kailangan mong malaman tungkol sa Patient Assistance Program ng Getmeds.
              </p>
            </div>

            {/* RIGHT — accordion */}
            <div className="flex-1 flex flex-col gap-3">
              {([
                {
                  q: 'Ano ang Guarantee Letter o GL?',
                  a: (
                    <span>
                      Kapag naaprubahan ang iyong aplikasyon at mga kinakailangang dokumento, maglalabas ang ahensiya ng Guarantee Letter (GL) para sa pasyente o sa kaniyang kinatawan. Ang GL ay isang mahalagang dokumento na nagpapatunay na ang ahensiya ang sasagot sa lahat ng gastusin para sa gamot ng pasyente. Sa pamamagitan ng GL, magkakaroon ka ng katiyakan na ang iyong gamot ay maibibigay nang walang abala sa bayad.<br /><br />
                      Ang pasyente o ang kinatawan nito ang kailangang magdala ng GL sa nakasaad na medicine distributor o supplier. Sila ang responsable sa pagbibigay ng gamot ayon sa nakasaad sa dokumento.<br /><br />
                      Para sa mas malinaw na gabay sa pag-claim ng iyong mga gamot, makipag-ugnayan sa aming Patient Assistance Officer, na handang tumulong sa bawat hakbang ng proseso.
                    </span>
                  ),
                },
                {
                  q: 'Ano ang Compassionate Special Permit?',
                  a: (
                    <span>
                      Nag-aalok din ang Getmeds ng tulong para sa mga gamot sa cancer na nangangailangan ng espesyal na permit, upang mas mapabilis at maayos ang proseso ng pagkuha.<br /><br />
                      Halimbawa nito ang Compassionate Special Permit, na ginagamit para sa:<br /><br />
                      <span className="block space-y-2">
                        <span className="block">• <strong>Restricted Use of Covered Pharmaceutical Products and Medical Devices for Human Use</strong> – para makagamit ng mga gamot at medical devices na limitado ang paggamit.</span>
                        <span className="block">• <strong>Access to unregistered drugs and medical devices for seriously ill patients</strong> – tulad ng mga pasyenteng may advanced stage cancer, lalo na kung walang mas mabisa o alternatibong therapy na magagamit.</span>
                      </span>
                    </span>
                  ),
                },
              ] as { q: string; a: React.ReactNode }[]).map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300"
                  style={{
                    background: activeFaq === i ? '#fff' : '#f5f6f8',
                    boxShadow: activeFaq === i ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
                  }}
                  onClick={() => toggleFaq(i)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className={`font-semibold text-[14px] leading-snug ${activeFaq === i ? 'text-gray-900' : 'text-gray-600'}`}>
                      {faq.q}
                    </span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{
                      background: 'linear-gradient(135deg, #1D9FDA, #61A644)',
                    }}>
                      <i className={`fa-solid ${activeFaq === i ? 'fa-chevron-up' : 'fa-chevron-down'} text-white`} style={{ fontSize: '9px' }}></i>
                    </div>
                  </div>
                  {activeFaq === i && (
                    <p className="text-gray-500 text-sm leading-relaxed mt-3">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>



      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
