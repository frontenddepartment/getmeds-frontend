import React, { useState, useEffect } from 'react';

export default function PatientAssistanceProgram() {
  const [activeTab, setActiveTab] = useState<'dswd' | 'pcso'>('dswd');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
      <section className="w-full overflow-hidden reveal relative bg-gradient-to-br from-[#dff5e8] via-white to-[#ceedf8]">
        {/* Abstract decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#61A644]/40 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-tl from-[#1D9FDA]/35 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-[#61A644]/20 to-[#1D9FDA]/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        {/* Top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#61A644] to-[#1D9FDA]" />
        {/* Bottom white fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        {/* Top — pap.png logo + subtitle side by side */}
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-0 flex items-center gap-6 justify-center mb-0">
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
          <div className="flex-1 py-4 space-y-4 text-gray-700 font-medium leading-relaxed text-sm md:text-base max-w-xl">
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
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#dff5e8] via-white to-[#ceedf8]">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#61A644]/30 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-tl from-[#1D9FDA]/25 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 shadow-xl mb-8 reveal max-w-6xl mx-auto">
            <span className="text-white text-4xl font-black">1</span>
            <h3 data-json="steps.0.title" className="text-white text-xl md:text-2xl font-black uppercase leading-tight tracking-tight">
              KUMONSULTA SA IYONG DOKTOR
            </h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 reveal">
            <p data-json="steps.0.instruction" className="max-w-sm text-xl font-semibold text-gray-800 leading-relaxed">
              Tanungin ang iyong attending physician tungkol sa pagkuha ng government assistance para sa iyong mga gamot sa cancer.
            </p>
            <div className="shrink-0 w-72 md:w-96 lg:w-[480px]">
              <img
                src="assets/stepone.png"
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
      </section>

      {/* STEP 2 */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal max-w-6xl mx-auto">
          <span className="text-white text-3xl font-black">2</span>
          <h3 data-json="steps.1.title" className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            IHANDA ANG IYONG MEDICAL DOCUMENTS
          </h3>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
          {/* Visual LEFT */}
          <div className="shrink-0 w-56 lg:w-72 flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-[#61A644]/15 to-[#1D9FDA]/20 rounded-[24px] flex items-center justify-center">
              <i className="fa-solid fa-file-medical text-7xl text-[#1D9FDA]/70"></i>
            </div>
          </div>
          {/* Content RIGHT */}
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
      </section>

      {/* STEP 3 — Tabs */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[15px] flex items-center gap-6 shadow-xl mb-8 reveal max-w-6xl mx-auto">
          <span className="text-white text-4xl font-black">3</span>
          <h3 className="text-white text-xl md:text-2xl font-black uppercase leading-tight tracking-tight">
            KUMPLETUHIN ANG IYONG APPLICATION DOCUMENTS
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 reveal">
          {/* Content LEFT */}
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

          {/* Visual RIGHT */}
          <div className="shrink-0 w-56 lg:w-72 flex items-center justify-center self-center">
            <div className="w-full aspect-square bg-gradient-to-br from-[#61A644]/15 to-[#1D9FDA]/20 rounded-[24px] flex items-center justify-center">
              <i className="fa-solid fa-clipboard-list text-7xl text-[#61A644]/70"></i>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4 */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal max-w-6xl mx-auto">
          <span className="text-white text-3xl font-black">4</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            MAKIPAG-UGNAYAN SA AMING PATIENT ASSISTANCE OFFICER
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
          {/* Visual LEFT */}
          <div className="shrink-0 w-56 lg:w-72 flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-[#1D9FDA]/15 to-[#61A644]/20 rounded-[24px] flex items-center justify-center">
              <i className="fa-solid fa-users text-7xl text-[#1D9FDA]/70"></i>
            </div>
          </div>

          {/* Content RIGHT */}
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
      </section>

      {/* STEP 5 */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal max-w-6xl mx-auto">
          <span className="text-white text-3xl font-black">5</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            I-SUBMIT ANG IYONG REQUIREMENTS
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 reveal">
          {/* Content LEFT */}
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

          {/* Visual RIGHT */}
          <div className="shrink-0 w-56 lg:w-72 flex items-center justify-center self-center">
            <div className="w-full aspect-square bg-gradient-to-br from-[#61A644]/15 to-[#1D9FDA]/20 rounded-[24px] flex items-center justify-center">
              <i className="fa-solid fa-paper-plane text-7xl text-[#61A644]/70"></i>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 6 */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal max-w-6xl mx-auto">
          <span className="text-white text-3xl font-black">6</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            HINTAYIN ANG IYONG GUARANTEE LETTER (GL)
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-10 reveal">
          {/* Visual LEFT */}
          <div className="shrink-0 w-56 lg:w-72 flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-[#1D9FDA]/15 to-[#61A644]/20 rounded-[24px] flex items-center justify-center">
              <i className="fa-solid fa-envelope-circle-check text-7xl text-[#1D9FDA]/70"></i>
            </div>
          </div>

          {/* Content RIGHT */}
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
