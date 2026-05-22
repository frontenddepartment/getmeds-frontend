import React, { useState, useEffect } from 'react';

// Declare global properties for window/Tailwind
declare global {
  interface Window {
    tailwind?: any;
  }
}

export default function PatientAssistanceProgram() {
  const [activeTab, setActiveTab] = useState<'dswd' | 'pcso'>('dswd');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // 1. Inject Fonts if not present
    if (!document.getElementById('google-fonts-pap')) {
      const link = document.createElement('link');
      link.id = 'google-fonts-pap';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // 2. Inject FontAwesome if not present
    if (!document.getElementById('font-awesome-pap')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-pap';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // 3. Inject Tailwind CDN if not present (with custom configurations matching pap.html)
    if (!window.tailwind && !document.getElementById('tailwind-cdn-pap')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn-pap';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        if (window.tailwind) {
          window.tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#1D9FDA',
                  accent: '#6BB84A',
                  dark: '#1A202C',
                },
                fontFamily: {
                  sans: ['Inter', 'Poppins', 'sans-serif'],
                }
              }
            }
          };
        }
      };
      document.head.appendChild(script);
    } else if (window.tailwind) {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#1D9FDA',
              accent: '#6BB84A',
              dark: '#1A202C',
            },
            fontFamily: {
              sans: ['Inter', 'Poppins', 'sans-serif'],
            }
          }
        }
      };
    }

    // 4. Scroll Reveal Intersection Observer
    const revealOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // 5. Load external global component loader script
    const scriptComp = document.createElement('script');
    scriptComp.src = 'components/components.js?v=PAP';
    scriptComp.async = true;
    document.body.appendChild(scriptComp);

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
      if (document.body.contains(scriptComp)) {
        document.body.removeChild(scriptComp);
      }
    };
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-white text-gray-800 antialiased overflow-x-hidden">
      {/* Dynamic styles insertion for animations and tabs */}
      <style dangerouslySetInnerHTML={{
        __html: `
        body { font-family: 'Inter', sans-serif; }
        .reveal { transform: translateY(30px); opacity: 0; transition: all 0.8s ease-out; }
        .reveal.active { transform: translateY(0); opacity: 1; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .faq-content { max-height: 0; overflow: hidden; transition: max-height 0.5s ease-in-out, opacity 0.3s; opacity: 0; }
        .faq-content.active { max-height: 500px; opacity: 1; }
        .chevron-rotate { transition: transform 0.3s; }
        .chevron-rotate.active { transform: rotate(180deg); }
      ` }} />

      {/* Navbar Component Placeholder */}
      <div id="navbar-placeholder"></div>

      {/* 1. Hero Banner Section */}
      <section className="relative w-full aspect-[21/9] md:aspect-[24/7] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover brightness-90"
          alt="Medical Support"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-tr-[50px] rounded-bl-[50px] shadow-2xl inline-block border-l-[10px] border-primary reveal">
                <h1 className="text-3xl md:text-5xl font-black text-primary leading-none mb-2 tracking-tight">
                  PATIENT <br className="hidden md:block" /> ASSISTANCE <br className="hidden md:block" /> PROGRAM
                </h1>
                <p className="text-accent text-sm md:text-xl font-extrabold uppercase tracking-wide">
                  Chemotherapy at Mga Gamot sa Cancer
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-accent py-3 text-center">
          <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">DSWD & PCSO Accredited</p>
        </div>
      </section>

      {/* 2. Program Intro */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start gap-12 reveal">
          <div className="shrink-0">
            <div className="w-16 h-16 bg-accent/10 flex items-center justify-center rounded-[15px]">
              <i className="fa-solid fa-shield-virus text-4xl text-accent"></i>
            </div>
          </div>
          <div className="space-y-6 flex-grow">
            <h2 className="text-2xl font-black text-accent leading-none">
              Patient Assistance Program <br />
              <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Chemotherapy at Mga Gamot sa Cancer</span>
            </h2>
            <div className="text-gray-500 font-medium leading-relaxed max-w-5xl space-y-4 text-sm md:text-base">
              <p>
                Ang Getmeds ay nakatuon sa pagsuporta sa kalusugan at kapakanan ng bawat Pilipinong lumalaban sa cancer. Sa pamamagitan ng aming Patient Assistance Program, nakikipagtulungan kami sa mga ahensya ng gobyerno tulad ng DSWD (AICS) at PCSO (MAP) upang makapagbigay ng tulong medikal, partikular na ang libreng chemotherapy at iba pang gamot sa cancer, sa mga higit na nangangailangan.
              </p>
              <p>
                Layunin ng programang ito na mapagaan ang gastusin ng mga Pilipinong pasyenteng may cancer at kanilang pamilya na nahaharap sa mataas na halaga ng gamutan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 1: Section */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="bg-primary py-4 px-8 rounded-[15px] flex items-center gap-6 shadow-xl mb-8 reveal">
          <span className="text-white text-4xl font-black">1</span>
          <h3 className="text-white text-xl md:text-2xl font-black uppercase leading-tight tracking-tight">
            KUMONSULTA SA IYONG DOKTOR
          </h3>
        </div>
        <div className="bg-white border border-gray-100 p-8 lg:p-10 rounded-[15px] shadow-sm flex flex-col md:flex-row items-center gap-10 reveal">
          <div className="w-16 h-16 bg-blue-50 rounded-[15px] flex items-center justify-center shrink-0">
            <i className="fa-solid fa-stethoscope text-3xl text-primary"></i>
          </div>
          <p className="text-lg font-bold text-gray-700 leading-relaxed text-center md:text-left">
            Tanungin ang iyong attending physician tungkol sa pagkuha ng government assistance para sa iyong mga gamot sa cancer.
          </p>
        </div>
      </section>

      {/* STEP 2: Section */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-accent py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal">
          <span className="text-white text-3xl font-black">2</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            IHANDA ANG IYONG MEDICAL DOCUMENTS
          </h3>
        </div>
        <div className="bg-white border border-gray-100 p-10 lg:p-14 rounded-[15px] shadow-sm space-y-10 reveal">
          <p className="font-black text-gray-900 text-lg border-l-4 border-accent pl-6 uppercase tracking-tight">Siguraduhing makuha ang sumusunod na requirements mula sa iyong doktor:</p>

          <div className="grid sm:grid-cols-3 gap-8">
            {/* Doc 1 */}
            <div className="bg-gray-50 p-8 rounded-[15px] border border-gray-100 flex flex-col items-center text-center space-y-4 hover:bg-green-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-[12px] flex items-center justify-center shadow-sm text-accent group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-file-prescription text-xl"></i>
              </div>
              <p className="font-bold text-gray-800 text-sm">Medical Prescription</p>
            </div>
            {/* Doc 2 */}
            <div className="bg-gray-50 p-8 rounded-[15px] border border-gray-100 flex flex-col items-center text-center space-y-4 hover:bg-green-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-[12px] flex items-center justify-center shadow-sm text-accent group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-notes-medical text-xl"></i>
              </div>
              <p className="font-bold text-gray-800 text-sm">Treatment Protocol</p>
            </div>
            {/* Doc 3 */}
            <div className="bg-gray-50 p-8 rounded-[15px] border border-gray-100 flex flex-col items-center text-center space-y-4 hover:bg-green-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-[12px] flex items-center justify-center shadow-sm text-accent group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-file-medical text-xl"></i>
              </div>
              <p className="font-bold text-gray-800 text-sm">Medical Abstract / Clinical Summary</p>
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-[15px] border border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-500 leading-relaxed italic text-center uppercase tracking-wider">
              Lahat ng dokumento ay dapat <span className="text-gray-900">original copy</span>, may buong pangalan, pirma, at license number ng doktor upang masigurong maayos at mabilis ang proseso.
            </p>
          </div>
        </div>
      </section>

      {/* STEP 3: Section (Integrated with Tabs) */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="bg-primary py-4 px-8 rounded-[15px] flex items-center gap-6 shadow-xl mb-8 reveal">
          <span className="text-white text-4xl font-black">3</span>
          <h3 className="text-white text-xl md:text-2xl font-black uppercase leading-tight tracking-tight">
            KUMPLETUHIN ANG IYONG APPLICATION DOCUMENTS
          </h3>
        </div>

        <div className="mb-10 text-center max-w-3xl mx-auto reveal">
          <p className="text-gray-500 font-medium">Bukod sa medical documents mula sa doktor, ihanda ang karagdagang requirements depende sa ahensya na iyong aaplayan.</p>
        </div>

        <div className="flex justify-center mb-10 reveal">
          <div className="bg-white p-1.5 rounded-[15px] shadow-sm flex gap-2 border border-gray-100">
            <button
              id="btn-dswd"
              onClick={() => setActiveTab('dswd')}
              className={`tab-btn px-8 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dswd'
                  ? 'bg-primary text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              DSWD (AICS)
            </button>
            <button
              id="btn-pcso"
              onClick={() => setActiveTab('pcso')}
              className={`tab-btn px-8 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pcso'
                  ? 'bg-accent text-white shadow-lg shadow-green-500/20'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              PCSO (MAP)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[15px] shadow-xl overflow-hidden border border-gray-100 max-w-5xl mx-auto reveal">
          <div
            id="tab-dswd"
            className={`tab-content p-8 lg:p-14 space-y-10 ${activeTab === 'dswd' ? 'active' : ''}`}
            style={{ display: activeTab === 'dswd' ? 'block' : 'none' }}
          >
            <h4 className="text-2xl font-black uppercase tracking-tight text-primary">DSWD Medical Assistance (AICS)</h4>
            <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Medical Prescription (Original, signed by doctor)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Treatment Protocol (Original, signed by doctor)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Medical Abstract / Clinical Summary (Original)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Photocopy ng valid gov't ID ng pasyente & representative</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Social Case Study Report (Mula sa CSWDO)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Certificate of Indigency (Mula sa barangay)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Official Price Quotation (Mula sa Getmeds)</span>
              </li>
            </ul>
          </div>

          <div
            id="tab-pcso"
            className={`tab-content p-8 lg:p-14 space-y-10 ${activeTab === 'pcso' ? 'active' : ''}`}
            style={{ display: activeTab === 'pcso' ? 'block' : 'none' }}
          >
            <h4 className="text-2xl font-black uppercase tracking-tight text-accent">PCSO Medical Assistance Program (MAP/IMAP)</h4>
            <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Medical Prescription (Original, signed by doctor)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Treatment Protocol (Original, signed by doctor)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Medical Abstract / Clinical Summary (Original)</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Kumpletong PCSO IMAP Application Form</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Photocopy ng valid gov't ID ng pasyente & representative</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Tatlong (3) official price quotations mula sa suppliers</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-green-50 text-accent flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-[8px]"></i>
                </div>
                <span className="text-gray-600 font-bold text-sm">Note: Ang unang quotation ay makukuha sa Getmeds</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* STEP 4: Section */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-primary py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal">
          <span className="text-white text-3xl font-black">4</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            MAKIPAG-UGNAYAN SA AMING PATIENT ASSISTANCE OFFICER
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch reveal">
          <div className="bg-white border border-gray-100 p-12 rounded-[15px] shadow-sm flex flex-col justify-center border-l-8 border-primary transition-all hover:bg-blue-50/20">
            <div className="bg-blue-50 p-4 rounded-[15px] inline-block self-start mb-6">
              <i className="fa-solid fa-users text-4xl text-primary"></i>
            </div>
            <p className="text-xl font-black text-gray-900 leading-tight">Ang aming Getmeds Patient Assistance Officer ay narito para gabayan kayo.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center gap-6 hover:border-primary/30 transition-all group">
              <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
              <p className="font-bold text-gray-700 text-sm leading-relaxed">Gagabay sa buong proseso ng iyong aplikasyon.</p>
            </div>
            <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center gap-6 hover:border-primary/30 transition-all group">
              <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
              <p className="font-bold text-gray-700 text-sm leading-relaxed">Susuri sa inyong mga requirements bago ang submission.</p>
            </div>
            <div className="bg-white border border-gray-100 p-6 rounded-[15px] shadow-sm flex items-center gap-6 hover:border-primary/30 transition-all group">
              <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
              <p className="font-bold text-gray-700 text-sm leading-relaxed">Magbibigay ng opisyal na quotation para sa inyong gamot sa cancer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 5: Section */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-accent py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal">
          <span className="text-white text-3xl font-black">5</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            I-SUBMIT ANG IYONG REQUIREMENTS
          </h3>
        </div>

        <div className="bg-white border border-gray-100 p-12 lg:p-16 rounded-[15px] shadow-sm space-y-12 reveal">
          <p className="text-center font-black text-gray-900 text-lg uppercase tracking-tight">Ang paraan ng pagsusumite ay nakadepende sa government agency na iyong inaaplayan.</p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="text-center py-4 bg-gray-50 rounded-[15px] border border-gray-100">
                <p className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Ahensya / Programa</p>
              </div>
              <div className="bg-white border border-gray-100 p-8 rounded-[15px] shadow-sm text-center h-28 flex items-center justify-center group hover:bg-blue-50/30 transition-colors border-l-8 border-l-primary">
                <p className="font-bold text-gray-800">DSWD Medical Assistance (AICS)</p>
              </div>
              <div className="bg-white border border-gray-100 p-8 rounded-[15px] shadow-sm text-center h-28 flex items-center justify-center group hover:bg-blue-50/30 transition-colors border-l-8 border-l-primary">
                <p className="font-bold text-gray-800">PCSO Medical Assistance Program (MAP / IMAP)</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center py-4 bg-gray-50 rounded-[15px] border border-gray-100">
                <p className="font-black text-accent text-[10px] uppercase tracking-[0.2em]">Paraan ng Pagsumite</p>
              </div>
              <div className="bg-white border border-gray-100 p-8 rounded-[15px] shadow-sm text-center h-28 flex items-center justify-center group hover:bg-green-50/30 transition-colors border-l-8 border-l-accent">
                <p className="text-sm font-bold text-gray-500">Personal na isumite sa pinakamalapit na DSWD Satellite Office</p>
              </div>
              <div className="bg-white border border-gray-100 p-8 rounded-[15px] shadow-sm text-center h-28 flex items-center justify-center group hover:bg-green-50/30 transition-colors border-l-8 border-l-accent">
                <p className="text-sm font-bold text-gray-500">Online submission (soft copy) sa PCSO website</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 6: Section */}
      <section className="py-10 max-w-7xl mx-auto px-6">
        <div className="bg-primary py-4 px-8 rounded-[12px] flex items-center gap-5 shadow-lg mb-8 reveal">
          <span className="text-white text-3xl font-black">6</span>
          <h3 className="text-white text-lg md:text-xl font-black uppercase leading-tight tracking-tight">
            HINTAYIN ANG IYONG GUARANTEE LETTER (GL)
          </h3>
        </div>

        <div className="bg-white border border-gray-100 p-12 lg:p-20 rounded-[15px] shadow-sm space-y-10 leading-relaxed text-gray-600 font-medium text-lg reveal">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-blue-50 rounded-[15px] flex items-center justify-center shrink-0">
              <i className="fa-solid fa-envelope-circle-check text-2xl text-primary"></i>
            </div>
            <p>Kapag naaprubahan, ibibigay ng ahensiya ang GL bilang patunay na sasagutin nila ang gastusin sa gamot ng pasyente. Ang GL ay dokumentong nagpapatunay na ang ahensiya ang may pananagutan sa pagbabayad.</p>
          </div>
          <p className="pl-18">Dalhin ito sa nakasaad na medicine distributor o supplier upang makuha ang gamot. Para sa gabay sa pag-claim, makipag-ugnayan muli sa aming Patient Assistance Officer.</p>
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
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10 space-y-3 reveal">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">FAQs & Additional Info</h3>
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
                <i
                  id="faq-icon-0"
                  className={`fa-solid fa-chevron-down text-gray-400 group-hover:text-primary transition-all duration-300 chevron-rotate text-sm ${activeFaq === 0 ? 'active' : ''}`}
                ></i>
              </button>
              <div
                id="faq-content-0"
                className={`faq-content ${activeFaq === 0 ? 'active' : ''}`}
                style={{
                  maxHeight: activeFaq === 0 ? '500px' : '0px',
                  opacity: activeFaq === 0 ? 1 : 0
                }}
              >
                <div className="px-8 pb-8 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50 mt-2">
                  Kapag naaprubahan ang iyong aplikasyon at mga kinakailangang dokumento, maglalabas ang ahensiya ng Guarantee Letter (GL) para sa pasyente o sa kaniyang kinatawan. Ang GL ay isang mahalagang dokumento na nagpapatunay na ang ahensiya ang sasagot sa lahat ng gastusin para sa gamot ng pasyente. Sa pamamagitan ng GL, magkakaroon ka ng katiyakan na ang iyong gamot ay maibibigay nang walang abala sa bayad.
                </div>
              </div>
            </div>
            {/* FAQ 2 */}
            <div className="bg-white rounded-[15px] shadow-sm border border-gray-100 overflow-hidden group">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors uppercase tracking-tight">Ano ang Compassionate Special Permit?</span>
                <i
                  id="faq-icon-1"
                  className={`fa-solid fa-chevron-down text-gray-400 group-hover:text-primary transition-all duration-300 chevron-rotate ${activeFaq === 1 ? 'active' : ''}`}
                ></i>
              </button>
              <div
                id="faq-content-1"
                className={`faq-content ${activeFaq === 1 ? 'active' : ''}`}
                style={{
                  maxHeight: activeFaq === 1 ? '500px' : '0px',
                  opacity: activeFaq === 1 ? 1 : 0
                }}
              >
                <div className="px-8 pb-8 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50 mt-2">
                  Nag-aalok din ang Getmeds ng tulong para sa mga gamot sa cancer na nangangailangan ng espesyal na permit, upang mas mapabilis at maayos ang proseso ng pagkuha. Halimbawa nito ang Compassionate Special Permit (CSP), na ginagamit para sa Restricted Use of Covered Pharmaceutical Products o Access to unregistered drugs for seriously ill patients.
                </div>
              </div>
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
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
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

      {/* Footer Component Placeholder */}
      <div id="footer-placeholder"></div>
    </div>
  );
}
