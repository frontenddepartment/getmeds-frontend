import React, { useState, useEffect, useRef } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';
import { ProgressiveHeroImage } from '../lib/ProgressiveHeroImage';

type SectionTab = 'steps' | 'requirements' | 'faqs';

const GRADIENT = 'linear-gradient(135deg, #61A644, #1D9FDA)';

function StepNumber({ n, done }: { n: number; done?: boolean }) {
  return (
    <div
      className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md text-white font-bold text-xs sm:text-sm shrink-0"
      style={{ background: GRADIENT }}
    >
      {done ? <i className="fa-solid fa-check text-xs sm:text-sm" /> : n}
    </div>
  );
}

function CheckItem({ text, note, bullets }: { text: string; note?: string; bullets?: string[] }) {
  return (
    <li className="flex items-start gap-2.5">
      <i className="fa-solid fa-circle-check text-[#61A644] text-sm mt-0.5 shrink-0" />
      <div>
        <p className="text-gray-800 font-semibold text-sm">{text}</p>
        {note && <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{note}</p>}
        {bullets && (
          <ul className="mt-1 space-y-0.5 pl-1">
            {bullets.map((b, i) => (
              <li key={i} className="text-gray-500 text-xs leading-relaxed before:content-['—'] before:mr-1">{b}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function PatientAssistanceProgram() {
  useEffect(() => {
    setPageMeta({
      title: 'Patient Assistance Program',
      description: 'Getmeds Patient Assistance Program — access free cancer medicines and chemotherapy support through DSWD and PCSO accreditation in the Philippines.',
      path: '/patient-assistance-program',
    });
  }, []);

  const { getImage, getLowResImage, getImageLink, loading: imagesLoading } = useImageMapper('pap');
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionTab>('steps');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [tabBarFloating, setTabBarFloating] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabBarPassedRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const introHeaderRef = useRef<HTMLDivElement>(null);
  const [introHeaderWidth, setIntroHeaderWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = introHeaderRef.current;
    if (!el) return;
    const update = () => setIntroHeaderWidth(el.getBoundingClientRect().width);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' }).then(r => r.text()).then(html => { injectHTML(navContainer, html); });
    }
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' }).then(r => r.text()).then(html => { injectHTML(footerContainer, html); });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        tabBarPassedRef.current = false;
        setTabBarFloating(false);
      } else {
        // Only treat as "passed" if element is above the viewport (scrolled past it),
        // not when it's below the fold on initial page load.
        tabBarPassedRef.current = e.boundingClientRect.top < 0;
        if (!tabBarPassedRef.current) setTabBarFloating(false);
      }
    }, { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      if (tabBarPassedRef.current) setTabBarFloating(goingDown);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchTab = (id: SectionTab) => {
    setActiveSection(id);
    if (sectionRef.current) {
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => setActiveFaq(activeFaq === index ? null : index);

  const TABS: { id: SectionTab; label: string; sub: string }[] = [
    { id: 'steps', label: 'Mga Hakbang', sub: 'PAP GUIDE' },
    { id: 'requirements', label: 'Requirements', sub: 'DOCUMENTS' },
    { id: 'faqs', label: 'FAQs', sub: 'TANONG' },
  ];

  const FAQS: { q: string; a: React.ReactNode }[] = [
    {
      q: 'Ano ang Guarantee Letter o GL?',
      a: (
        <>
          Kapag naaprubahan ang iyong aplikasyon at mga kinakailangang dokumento, maglalabas ang ahensiya ng Guarantee Letter (GL) para sa pasyente o sa kaniyang kinatawan. Ang GL ay isang mahalagang dokumento na nagpapatunay na ang ahensiya ang sasagot sa lahat ng gastusin para sa gamot ng pasyente. Sa pamamagitan ng GL, magkakaroon ka ng katiyakan na ang iyong gamot ay maibibigay nang walang abala sa bayad.
          <br /><br />
          Ang pasyente o ang kinatawan nito ang kailangang magdala ng GL sa nakasaad na medicine distributor o supplier. Sila ang responsable sa pagbibigay ng gamot ayon sa nakasaad sa dokumento.
          <br /><br />
          Para sa mas malinaw na gabay sa pag-claim ng iyong mga gamot, makipag-ugnayan sa aming Patient Assistance Officer, na handang tumulong sa bawat hakbang ng proseso.
        </>
      ),
    },
    {
      q: 'Ano ang Compassionate Special Permit?',
      a: (
        <>
          Nag-aalok din ang Getmeds ng tulong para sa mga gamot sa cancer na nangangailangan ng espesyal na permit, upang mas mapabilis at maayos ang proseso ng pagkuha.
          <br /><br />
          Halimbawa nito ang Compassionate Special Permit, na ginagamit para sa:
          <span className="block mt-3 space-y-2">
            <span className="block bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="font-bold text-gray-800 text-sm block mb-0.5">Restricted Use of Covered Pharmaceutical Products and Medical Devices for Human Use</span>
              Para makagamit ng mga gamot at medical devices na limitado ang paggamit.
            </span>
            <span className="block bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="font-bold text-gray-800 text-sm block mb-0.5">Access to unregistered drugs and medical devices for seriously ill patients</span>
              Tulad ng mga pasyenteng may advanced stage cancer, lalo na kung walang mas mabisa o alternatibong therapy na magagamit.
            </span>
          </span>
        </>
      ),
    },
  ];

  const connectorLine = (
    <div className="w-0.5 flex-1 bg-gradient-to-b from-[#61A644]/25 to-[#1D9FDA]/25 min-h-[28px] my-1.5" />
  );

  return (
    <div className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Floating Tab Bar (appears when inline tab bar scrolls out of view) */}
      <div className={`fixed top-[92px] left-0 right-0 z-[49] flex justify-center px-4 pointer-events-none transition-all duration-500 ease-in-out ${tabBarFloating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="pointer-events-auto relative w-full max-w-5xl">
          <div className="bg-white rounded-2xl p-2 flex gap-2 overflow-x-auto border border-gray-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`cursor-pointer shrink-0 min-w-[150px] sm:flex-1 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all duration-200 text-left ${activeSection === tab.id ? 'shadow-md' : 'hover:bg-gray-50'
                  }`}
                style={activeSection === tab.id ? { background: GRADIENT } : {}}
              >
                <div className="min-w-0">
                  <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeSection === tab.id ? 'text-white/70' : 'text-gray-400'}`}>
                    {tab.sub}
                  </p>
                  <p className={`font-bold text-xs sm:text-sm leading-tight ${activeSection === tab.id ? 'text-white' : 'text-gray-700'}`}>
                    {tab.label}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${activeSection === tab.id ? 'border-white/40 bg-white/20' : 'border-gray-200 bg-white'
                  }`}>
                  <i className={`fa-solid fa-arrow-right text-[10px] ${activeSection === tab.id ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </button>
            ))}
          </div>
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 h-full w-16 flex items-center justify-end z-10">
            <div className="absolute inset-0 bg-gradient-to-l from-white via-white/70 to-transparent rounded-r-2xl" />
            <i className="fa-solid fa-chevron-right text-gray-400 text-[10px] relative z-10 mr-3" />
          </div>
        </div>
      </div>

      <div className="overflow-x-hidden">

        {/* Hero Banner */}
        <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
          <div className={`relative rounded-[10px] md:rounded-[1.5rem] overflow-hidden min-h-[190px] sm:min-h-[360px] md:min-h-[450px] lg:min-h-[500px] flex items-end group transition-colors duration-500 ${!heroImgLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
            {!imagesLoading && (() => {
              const heroFullSrc = getImage('PAP Hero Background', 'assets/pap-banner.png');
              return (
                <div className="absolute inset-0 z-0">
                  <ProgressiveHeroImage
                    link={getImageLink('PAP Hero Background')}
                    fullSrc={heroFullSrc}
                    lowSrc={getLowResImage('PAP Hero Background', heroFullSrc)}
                    onLoaded={() => setHeroImgLoaded(true)}
                    className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105"
                    transitionClassName="transition-[opacity,transform] duration-700"
                    alt="Medical Support"
                  />
                </div>
              );
            })()}
          </div>
        </section>

        {/* Program Intro */}
        <section className="w-full overflow-hidden reveal relative bg-white">
          <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10 pb-0 flex justify-center mb-0">
            <div ref={introHeaderRef} className="inline-flex items-center">
              <div className="min-w-0">
                <p className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-semibold uppercase tracking-normal sm:tracking-widest bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-snug">
                  Chemotherapy at Mga Gamot sa Cancer
                </p>
                <div className="mt-2 w-10 h-1 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-full" />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4 mt-2 md:mt-4 lg:mt-6">
            <div
              className="py-2 space-y-2 text-gray-700 font-medium leading-normal text-sm md:text-base w-full"
              style={introHeaderWidth ? { maxWidth: introHeaderWidth } : undefined}
            >
              <p>
                Ang Getmeds ay nakatuon sa pagsuporta sa kalusugan at kapakanan ng bawat Pilipinong lumalaban sa cancer. Sa pamamagitan ng aming Patient Assistance Program, nakikipagtulungan kami sa mga ahensya ng gobyerno tulad ng DSWD (AICS) at PCSO (MAP) upang makapagbigay ng tulong medikal, partikular na ang libreng chemotherapy at iba pang gamot sa cancer, sa mga higit na nangangailangan.
              </p>
              <div className="pt-2 space-y-2">
                <p className="text-gray-900 font-semibold text-sm">Mga katuwang na ahensya:</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] shrink-0 mt-1" />
                    <p className="text-gray-900 text-sm font-semibold">DSWD – AICS (Assistance to Individuals in Crisis Situation)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] shrink-0 mt-1" />
                    <p className="text-gray-900 text-sm font-semibold">PCSO – Medical Assistance Program</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">

          {/* Heading */}
          <div ref={sectionRef} className="text-center mb-7">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Mga Hakbang Para Makakuha ng Cancer Assistance
            </h2>
          </div>

          {/* Tab Bar (sentinel — floating copy takes over when this scrolls out) */}
          <div className="relative mb-8">
            <div ref={tabBarRef} className="bg-white border border-gray-200 rounded-2xl p-2 flex gap-2 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`cursor-pointer shrink-0 min-w-[150px] sm:flex-1 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all duration-200 text-left ${activeSection === tab.id ? 'shadow-md' : 'hover:bg-gray-50'
                    }`}
                  style={activeSection === tab.id ? { background: GRADIENT } : {}}
                >
                  <div className="min-w-0">
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeSection === tab.id ? 'text-white/70' : 'text-gray-400'
                      }`}>
                      {tab.sub}
                    </p>
                    <p className={`font-bold text-xs sm:text-sm leading-tight ${activeSection === tab.id ? 'text-white' : 'text-gray-700'
                      }`}>
                      {tab.label}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${activeSection === tab.id ? 'border-white/40 bg-white/20' : 'border-gray-200 bg-white'
                    }`}>
                    <i className={`fa-solid fa-arrow-right text-[10px] ${activeSection === tab.id ? 'text-white' : 'text-gray-400'
                      }`} />
                  </div>
                </button>
              ))}
            </div>
            <div className="sm:hidden pointer-events-none absolute right-0 top-0 h-full w-16 flex items-center justify-end z-10">
              <div className="absolute inset-0 bg-gradient-to-l from-white via-white/70 to-transparent rounded-r-2xl" />
              <i className="fa-solid fa-chevron-right text-gray-400 text-[10px] relative z-10 mr-3" />
            </div>
          </div>

          {/* ── Mga Hakbang ── */}
          {activeSection === 'steps' && (
            <div className="sm:bg-white sm:rounded-2xl sm:border sm:border-gray-100 sm:shadow-sm p-0 sm:p-8">
              <div className="space-y-0">

                {/* Step 1 */}
                <div className="flex gap-2.5 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <StepNumber n={1} />
                    {connectorLine}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">Kumonsulta sa Iyong Doktor</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Tanungin ang iyong attending physician tungkol sa government assistance para sa iyong mga gamot sa cancer.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-2.5 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <StepNumber n={2} />
                    {connectorLine}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">Ihanda ang Iyong Mga Medical Documents</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Kunin ang sumusunod mula sa iyong doktor — original copy, may buong pangalan, pirma, at license number:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Medical Prescription', 'Treatment Protocol', 'Medical Abstract / Clinical Summary'].map((tag, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-600 bg-gray-50">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-2.5 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <StepNumber n={3} />
                    {connectorLine}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">Kumpletuhin ang Iyong Application Documents</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Bukod sa mga medikal na dokumento mula sa iyong doktor, may karagdagang requirements na kailangang i-submit, na nakadepende sa ahensya ng gobyerno na iyong aaplayan:
                    </p>

                    {/* 2-column requirements */}
                    <div className="grid sm:grid-cols-2 gap-4">

                      {/* DSWD */}
                      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #1D9FDA, #1a8fc7)' }}>
                          <p className="text-white font-bold text-xs sm:text-sm">DSWD Medical Assistance (AICS)</p>
                        </div>
                        <div className="p-4">
                          <ul className="space-y-2.5">
                            <CheckItem text="Medical Prescription" />
                            <CheckItem text="Treatment Protocol" />
                            <CheckItem text="Medical Abstract / Clinical Summary" />
                            <CheckItem text="Photocopy ng valid government-issued ID ng pasyente" note="Isama rin ang ID ng representative kung sila ang magsusumite." />
                            <CheckItem text="Social Case Study Report" note="Mula sa City Social Welfare and Development Office (CSWDO) sa City Hall ng lungsod kung saan kasalukuyang nakatira." />
                            <CheckItem text="Certificate of Indigency" note="Makukuha mula sa inyong barangay; kinakailangan para makuha ang iyong Social Case Study Report." />
                            <CheckItem text="Official Price Quotation para sa mga gamot sa cancer" note="Makukuha mula sa Getmeds." />
                          </ul>
                        </div>
                      </div>

                      {/* PCSO */}
                      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #61A644, #4d8f36)' }}>
                          <p className="text-white font-bold text-xs sm:text-sm">PCSO Medical Assistance Program (MAP/IMAP)</p>
                        </div>
                        <div className="p-4">
                          <ul className="space-y-2.5">
                            <CheckItem text="Medical Prescription" />
                            <CheckItem text="Treatment Protocol" />
                            <CheckItem text="Medical Abstract / Clinical Summary" />
                            <CheckItem text="Kumpletong PCSO IMAP Application Form" note="Maaaring i-download mula sa PCSO website." />
                            <CheckItem text="Photocopy ng valid government-issued ID ng pasyente" note="Isama rin ang ID ng representative kung sila ang magsusumite." />
                            <CheckItem
                              text="Tatlong (3) official price quotations para sa gamot sa cancer mula sa magkakaibang distributor o supplier"
                              bullets={[
                                'Ang unang quotation ay makukuha mula sa Getmeds',
                                'Ang dalawa pang natitira ay kailangang i-request ng pasyente mula sa ibang distributor o supplier',
                              ]}
                            />
                          </ul>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-2.5 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <StepNumber n={4} />
                    {connectorLine}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">Makipag-ugnayan sa Aming Team</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Kontakin ang aming Patient Assistance Officer para sa pagsusuri ng inyong requirements at pagkuha ng opisyal na quotation para sa inyong gamot sa cancer.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-2.5 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <StepNumber n={5} />
                    {connectorLine}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">I-submit ang Iyong Requirements</h3>
                    </div>
                    <div className="rounded-xl border border-gray-100 overflow-hidden text-sm">
                      <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-100">
                        <div className="px-4 py-2.5 font-bold text-gray-700 text-xs sm:text-sm">Ahensya</div>
                        <div className="px-4 py-2.5 font-bold text-gray-700 text-xs sm:text-sm border-l border-gray-100">Paraan ng Pagsumite</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-gray-100">
                        <div className="px-4 py-3 text-gray-800 font-semibold text-xs sm:text-sm">DSWD (AICS)</div>
                        <div className="px-4 py-3 text-gray-600 text-xs sm:text-sm border-l border-gray-100">Personal sa pinakamalapit na DSWD Satellite Office</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-3 text-gray-800 font-semibold text-xs sm:text-sm">PCSO (MAP / IMAP)</div>
                        <div className="px-4 py-3 text-gray-600 text-xs sm:text-sm border-l border-gray-100">Online submission sa PCSO website</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-2.5 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <StepNumber n={6} done />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">Hintayin ang Iyong Guarantee Letter (GL)</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Kapag naaprubahan, dalhin ang GL sa nakasaad na supplier para makuha ang gamot. Para sa gabay, makipag-ugnayan sa aming Patient Assistance Officer.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── Requirements ── */}
          {activeSection === 'requirements' && (
            <div className="space-y-5">
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Bukod sa Medical Prescription, Treatment Protocol, at Medical Abstract / Clinical Summary na kinukuha mula sa doktor, kailangan din ang mga sumusunod na dokumento ayon sa ahensyang iyong aaplayan.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">

                {/* DSWD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #1D9FDA, #1a8fc7)' }}>
                    <h4 className="text-white font-bold text-sm sm:text-base">DSWD Medical Assistance (AICS)</h4>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3.5">
                      <CheckItem text="Photocopy ng valid government-issued ID ng pasyente" note="Isama rin ang ID ng representative kung sila ang magsusumite." />
                      <CheckItem text="Social Case Study Report" note="Mula sa City Social Welfare and Development Office (CSWDO) sa City Hall ng lungsod kung saan kasalukuyang nakatira." />
                      <CheckItem text="Certificate of Indigency" note="Makukuha mula sa inyong barangay; kinakailangan para makuha ang iyong Social Case Study Report." />
                      <CheckItem text="Official Price Quotation para sa mga gamot sa cancer" note="Makukuha mula sa Getmeds." />
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-[#1D9FDA] text-xs font-medium">
                      <i className="fa-solid fa-location-dot text-sm shrink-0" />
                      <span>Personal na isumite sa pinakamalapit na DSWD Satellite Office</span>
                    </div>
                  </div>
                </div>

                {/* PCSO */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #61A644, #4d8f36)' }}>
                    <h4 className="text-white font-bold text-sm sm:text-base">PCSO Medical Assistance Program (MAP/IMAP)</h4>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3.5">
                      <CheckItem text="Kumpletong PCSO IMAP Application Form" note="Maaaring i-download mula sa PCSO website." />
                      <CheckItem text="Photocopy ng valid government-issued ID ng pasyente" note="Isama rin ang ID ng representative kung sila ang magsusumite." />
                      <CheckItem
                        text="Tatlong (3) official price quotations para sa gamot sa cancer mula sa magkakaibang distributor o supplier"
                        bullets={[
                          'Ang unang quotation ay makukuha mula sa Getmeds',
                          'Ang dalawa pang natitira ay kailangang i-request ng pasyente mula sa ibang distributor o supplier',
                        ]}
                      />
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-[#61A644] text-xs font-medium">
                      <i className="fa-solid fa-globe text-sm shrink-0" />
                      <span>Online submission (soft copy) sa PCSO website</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── FAQs ── */}
          {activeSection === 'faqs' && (
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border transition-all duration-200 overflow-hidden"
                  style={{
                    borderColor: activeFaq === i ? '#dbeafe' : '#f0f0f0',
                    background: activeFaq === i ? '#fff' : '#fafafa',
                    boxShadow: activeFaq === i ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => toggleFaq(i)}
                  >
                    <span className={`font-semibold text-sm sm:text-base leading-snug ${activeFaq === i ? 'text-gray-900' : 'text-gray-600'}`}>
                      {faq.q}
                    </span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GRADIENT }}>
                      <i className={`fa-solid ${activeFaq === i ? 'fa-minus' : 'fa-plus'} text-white`} style={{ fontSize: '9px' }} />
                    </div>
                  </button>
                  {activeFaq === i && (
                    <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}

              {/* Saan Makukuha ang Iyong Mga Gamot */}
              <div className="mt-6 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Saan Makukuha ang Iyong Mga Gamot</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Pagkatapos matanggap ang inyong Guarantee Letter (GL) mula sa ahensiya, maaari kayong pumunta sa aming opisina upang makuha ang inyong gamot.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-5 sm:p-7 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-gradient-to-tr from-[#1D9FDA]/20 via-[#1D9FDA]/5 to-transparent -translate-x-10 translate-y-10 pointer-events-none" />
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #1D9FDA, #1a8fc7)' }}>
                      <i className="fa-solid fa-location-dot text-white text-base" />
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">Aming Lokasyon</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      <span className="font-bold text-gray-800">Unit 305, 17 Vatican Bldg.,</span> Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-5 sm:p-7 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-gradient-to-tr from-[#61A644]/20 via-[#61A644]/5 to-transparent -translate-x-10 translate-y-10 pointer-events-none" />
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #61A644, #4d8f36)' }}>
                      <i className="fa-solid fa-clock text-white text-base" />
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">Oras ng Operasyon</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      <span className="font-bold text-gray-800">8:00 AM – 5:00 PM,</span> Lunes hanggang Biyernes.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

        </section>

        {/* Footer */}
        <div id="footer-container" />

      </div>
    </div>
  );
}
