import React, { useState, useEffect, useRef } from 'react';
import { injectHTML } from '../lib/injectHTML';

export default function OrderMedicines() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSlides = 3;

  // Slider auto-advance
  useEffect(() => {
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => { if (slideIntervalRef.current) clearInterval(slideIntervalRef.current); };
  }, []);

  const goToSlide = (index: number) => {
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    setCurrentSlide(index);
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
  };

  // Upload modal simulation
  const openUploadModal = () => {
    setModalOpen(true);
    setProgress(0);
    let prog = 0;
    uploadIntervalRef.current = setInterval(() => {
      prog += Math.floor(Math.random() * 15) + 5;
      if (prog >= 100) {
        prog = 100;
        if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
        setTimeout(() => {
          alert('Prescription Uploaded Successfully!');
          closeUploadModal();
        }, 500);
      }
      setProgress(prog);
    }, 400);
  };

  const closeUploadModal = () => {
    setModalOpen(false);
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    setTimeout(() => setProgress(0), 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) openUploadModal();
  };

  // Load navbar & footer
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

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Hero Banner */}
      <section className="w-full px-4 md:px-6 pt-5 pb-4">
        <div
          className="relative rounded-[15px] overflow-hidden flex items-center px-8 md:px-12"
          style={{ background: 'linear-gradient(135deg, #3aaf5c 0%, #1ab8c4 45%, #1a99d6 100%)', minHeight: '130px' }}
        >
          {/* Glassy circles */}
          <div className="absolute pointer-events-none" style={{ width: 160, height: 160, borderRadius: '50%', bottom: '-55px', left: '28%', background: 'radial-gradient(circle at 40% 35%, rgba(100,240,200,0.55), rgba(30,180,210,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
          <div className="absolute pointer-events-none" style={{ width: 130, height: 130, borderRadius: '50%', bottom: '-42px', left: '45%', background: 'radial-gradient(circle at 38% 30%, rgba(120,100,240,0.55), rgba(60,80,220,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.20)' }} />
          <div className="absolute pointer-events-none hidden md:block" style={{ width: 180, height: 180, borderRadius: '50%', bottom: '-70px', right: '8%', background: 'radial-gradient(circle at 42% 38%, rgba(130,230,230,0.45), rgba(60,190,210,0.22))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
          <div className="absolute pointer-events-none hidden md:block" style={{ width: 90, height: 90, borderRadius: '50%', bottom: '-20px', left: '18%', background: 'radial-gradient(circle at 35% 30%, rgba(160,240,120,0.60), rgba(40,210,130,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
          <div className="absolute pointer-events-none hidden md:block" style={{ width: 52, height: 52, borderRadius: '50%', top: '10px', right: '28%', background: 'radial-gradient(circle at 35% 30%, rgba(170,110,240,0.70), rgba(100,60,210,0.45))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
          <div className="absolute pointer-events-none hidden md:block" style={{ width: 85, height: 85, borderRadius: '50%', top: '-15px', right: '38%', background: 'radial-gradient(circle at 38% 32%, rgba(80,220,210,0.55), rgba(30,170,200,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
          <div className="absolute pointer-events-none" style={{ width: 280, height: 80, borderRadius: '50%', bottom: '-48px', left: '22%', background: 'radial-gradient(ellipse at 50% 40%, rgba(40,160,230,0.38), rgba(20,130,210,0.18))', backdropFilter: 'blur(2px)' }} />
          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
              Order Medicines
            </h1>
            <p className="text-white/75 text-[12px] sm:text-[13px] mt-1 font-medium">Order your medicines with ease. Upload your prescription and we'll handle the rest.</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          ORDER PROCESS SECTION
      ============================================================ */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">

            {/* How It Works */}
            <div className="mb-12">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-dark">How to Order with Prescription</h2>
                <p className="text-gray-500 text-sm mt-1">A simple 3-step process designed for your convenience</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 rounded-[15px] bg-blue-50 text-primary flex items-center justify-center text-2xl mb-5 shadow-sm border border-blue-100/50">
                    <i className="fa-solid fa-camera-retro"></i>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-dark mb-2">1. Upload</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed px-4">Take a clear photo or upload a digital copy of your valid prescription.</p>
                  </div>
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-200">
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 rounded-[15px] bg-green-50 text-green-600 flex items-center justify-center text-2xl mb-5 shadow-sm border border-green-100/50">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-dark mb-2">2. Verification</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed px-4">Our licensed pharmacists will verify the details within minutes.</p>
                  </div>
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-200">
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 rounded-[15px] bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-5 shadow-sm border border-purple-100/50">
                    <i className="fa-solid fa-clipboard-check"></i>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-dark mb-2">3. Confirmation</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed px-4">You'll receive a notification once your order is confirmed and ready.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP ROW: Tools & Assistance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {/* Upload Prescription Card (Col Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-[15px] border border-gray-100 p-8 shadow-sm flex flex-col h-full hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-blue-100"
                    style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}>
                    <i className="fa-solid fa-file-prescription text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-dark tracking-tight">Upload Prescription</h2>
                    <p className="text-gray-400 text-[11px] mt-0.5">JPEG, PNG, or PDF formats</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 flex-grow">
                  {/* Upload New */}
                  <label className="group relative cursor-pointer">
                    <input type="file" className="hidden" onChange={handleFileChange} />
                    <div className="h-full border-2 border-dashed border-gray-100 rounded-[15px] p-6 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/40 group-hover:bg-blue-50/30">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-primary flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                      </div>
                      <span className="text-[14px] font-semibold text-dark mb-1">Upload New</span>
                      <span className="text-gray-400 text-[11px]">Click to browse files</span>
                    </div>
                  </label>

                  {/* Past Prescriptions */}
                  <div className="group relative cursor-pointer">
                    <div className="h-full border border-gray-100 rounded-[15px] p-5 flex items-center gap-4 transition-all bg-gray-50/50 hover:bg-white hover:border-[#61A644]/40 hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-[#E8F5E3] text-[#61A644] flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:bg-[#61A644] group-hover:text-white">
                        <i className="fa-solid fa-clock-rotate-left text-lg"></i>
                      </div>
                      <div className="text-left">
                        <span className="text-[14px] font-semibold text-dark block">Use Past Record</span>
                        <span className="text-gray-400 text-[10px]">Select from history</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-start gap-4 p-4 bg-blue-50/50 rounded-[12px] border border-blue-100/50">
                  <i className="fa-solid fa-circle-info text-[#1D9FDA] mt-1 text-sm"></i>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    <span className="font-bold text-[#1A202C]">Note:</span> Always upload a clean version for faster verification.
                  </p>
                </div>
              </div>

              {/* Guide Slider (Col Span 5) */}
              <div className="lg:col-span-5 rounded-[15px] overflow-hidden flex flex-col h-full relative border-none shadow-lg"
                style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}>
                <div className="p-6 border-b border-white/10 bg-black/5">
                  <h2 className="text-lg font-semibold text-white tracking-tight">Guide for a Valid Prescription</h2>
                  <p className="text-white/70 text-[11px] mt-1">Make sure your upload includes these critical details</p>
                </div>

                <div className="relative flex-grow overflow-hidden group">
                  <div
                    className="flex transition-transform duration-700 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {/* Slide 1 */}
                    <div className="w-full flex-shrink-0 flex flex-col items-center justify-center p-6">
                      <div className="relative group/img overflow-hidden rounded-[15px] shadow-2xl border border-white/20 w-full max-w-[260px] aspect-[4/5] bg-white">
                        <img src="assets/clinicdetails.png" alt="Doctor Information Guide" className="w-full h-full object-cover transition duration-500 group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="text-[13px] font-bold text-white">Clinic Details</h3>
                        <p className="text-white/70 text-[11px] mt-1 max-w-[200px]">The clinic address and doctor's license number must be visible.</p>
                      </div>
                    </div>
                    {/* Slide 2 */}
                    <div className="w-full flex-shrink-0 flex flex-col items-center justify-center p-6">
                      <div className="relative group/img overflow-hidden rounded-[15px] shadow-2xl border border-white/20 w-full max-w-[260px] aspect-[4/5] bg-white">
                        <img src="assets/medicationinfo.png" alt="Medication Details Guide" className="w-full h-full object-cover transition duration-500 group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="text-[13px] font-bold text-white">Medication Info</h3>
                        <p className="text-white/70 text-[11px] mt-1 max-w-[200px]">Clearly list medicine name, strength, and frequency.</p>
                      </div>
                    </div>
                    {/* Slide 3 */}
                    <div className="w-full flex-shrink-0 flex flex-col items-center justify-center p-6">
                      <div className="relative group/img overflow-hidden rounded-[15px] shadow-2xl border border-white/20 w-full max-w-[260px] aspect-[4/5] bg-white">
                        <img src="assets/legalvalidation.png" alt="Signature and Stamp Guide" className="w-full h-full object-cover transition duration-500 group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="text-[13px] font-bold text-white">Legal Validation</h3>
                        <p className="text-white/70 text-[11px] mt-1 max-w-[200px]">Physical signature and clinic stamp are mandatory.</p>
                      </div>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {[0, 1, 2].map(i => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: currentSlide === i ? '16px' : '6px',
                          height: '6px',
                          background: currentSlide === i ? 'white' : 'rgba(255,255,255,0.4)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Column C: Guidance & Trust (Col Span 3) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Assistance Card */}
                <div className="bg-white p-6 rounded-[15px] border border-gray-100 flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1"
                    style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Need Assistance?
                  </p>
                  <h3 className="text-sm font-semibold mb-4 px-1"
                    style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Chat with our Pharmacist
                  </h3>

                  <div className="space-y-4">
                    <a href="tel:(02)8888-8888" className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-dark text-xs group-hover:bg-primary group-hover:text-white transition shadow-sm">
                        <i className="fa-solid fa-phone"></i>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-medium">Customer Support</p>
                        <p className="text-[12px] font-bold text-dark">(02) 8888-8888</p>
                      </div>
                    </a>
                    <a href="mailto:support@getmeds.ph" className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-dark text-xs group-hover:bg-primary group-hover:text-white transition shadow-sm">
                        <i className="fa-solid fa-envelope"></i>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-medium">Email Address</p>
                        <p className="text-[11px] font-bold text-dark">support@getmeds.ph</p>
                      </div>
                    </a>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="bg-white p-4 rounded-[12px] border border-gray-100 flex flex-col items-center text-center shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-2">
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <p className="text-[11px] font-bold text-dark mb-1 leading-tight">Secure Prescription Storage</p>
                      <p className="text-[9px] text-gray-400 leading-relaxed px-1">Your data is stored with bank-level encryption.</p>
                    </div>
                  </div>
                </div>

                {/* Data Protection */}
                <div className="bg-white p-6 rounded-[15px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group h-full hover:shadow-md transition">
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-125 transition duration-700 pointer-events-none">
                    <i className="fa-solid fa-user-shield text-8xl text-dark"></i>
                  </div>
                  <div className="w-9 h-9 rounded-[10px] bg-green-50 flex items-center justify-center text-green-500 text-xs mb-4">
                    <i className="fa-solid fa-check-double"></i>
                  </div>
                  <h3 className="text-sm font-bold text-dark mb-2">Pharmacy Verified</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed z-10">We strictly follow FDA standards for medication dispensing and privacy.</p>
                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-tight">HIPAA Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Validation Form */}
            <div className="w-full">
              <div className="bg-white rounded-[15px] border border-gray-100 p-8 md:p-12 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">Customer Validation</h2>
                  <p className="text-gray-400 text-[13px]">Please provide accurate details for legal verification.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Patient Full Name</label>
                      <input type="text" placeholder="As written on prescription"
                        className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Email Address</label>
                      <input type="email" placeholder="example@domain.com"
                        className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Phone Number</label>
                      <input type="tel" placeholder="+63 9xx xxx xxxx"
                        className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Date of Birth</label>
                      <input type="date"
                        className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-800 ml-1">Delivery Address</label>
                    <textarea placeholder="Complete address for courier delivery..." rows={3}
                      className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-4 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300 resize-none" />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="terms" className="w-4 h-4 rounded-md border-gray-200 text-success focus:ring-success" />
                    <label htmlFor="terms" className="text-[12px] text-gray-500 cursor-pointer">
                      I confirm that all provided information is authentic.
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      className="hover:opacity-90 text-white font-bold py-3.5 px-10 rounded-[15px] text-[14px] transition shadow-lg shadow-blue-100"
                      style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}
                    >
                      Submit Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          UPLOAD MODAL
      ============================================================ */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: modalOpen ? 1 : 0, pointerEvents: modalOpen ? 'all' : 'none' }}
      >
        <div
          className="bg-[#1A1C1E] w-full max-w-[340px] rounded-[15px] p-8 text-center shadow-2xl relative transform transition-transform duration-300"
          style={{ transform: modalOpen ? 'scale(1)' : 'scale(0.95)' }}
        >
          <button onClick={closeUploadModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>

          <div className="w-16 h-16 bg-[#5E5CE6]/20 text-[#5E5CE6] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-file-arrow-up text-3xl"></i>
          </div>

          <h3 className="text-white text-lg font-bold mb-2">Just a minute....</h3>
          <p className="text-gray-400 text-[12px] leading-relaxed mb-8 px-4">
            Your file is uploading right now. Just<br />please wait for a few moments
          </p>

          <div className="mb-8">
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}
              />
            </div>
            <div className="text-[#5E5CE6] text-sm font-bold">{progress}%</div>
          </div>

          <button onClick={closeUploadModal}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-[12px] text-[13px] transition">
            Cancel
          </button>
        </div>
      </div>

      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
