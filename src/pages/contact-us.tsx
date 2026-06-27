import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper, useSiteSettings } from '../lib/useSanity';
import { getGoogleSpreadsheetBySlug } from '../lib/queries';
import { getApiUrl } from '../lib/api';
import type { ContactGroup } from '../types/sanity';


// Icon map for contact group purposes
const PURPOSE_ICONS: Record<string, string> = {
  'general': 'fa-solid fa-building',
  'hr': 'fa-solid fa-users',
  'careers': 'fa-solid fa-briefcase',
  'hr / careers': 'fa-solid fa-briefcase',
  'medical': 'fa-solid fa-stethoscope',
  'medical inquiries': 'fa-solid fa-stethoscope',
  'call center': 'fa-solid fa-phone-volume',
  'default': 'fa-solid fa-address-card',
};

function getPurposeIcon(purpose: string): string {
  const key = purpose.toLowerCase();
  for (const [k, v] of Object.entries(PURPOSE_ICONS)) {
    if (key.includes(k)) return v;
  }
  return PURPOSE_ICONS['default'];
}




export default function ContactUs() {
  const { getImage, loading: imagesLoading } = useImageMapper('contact-us');
  const { data: settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in Name and Email fields.');
      return;
    }
    setSubmitState('sending');
    try {
      const inquiryType = formData.subject === 'partnership' ? 'Partnership' : 'Contact Us';

      const subjectMap: Record<string, string> = {
        general: 'General Inquiry',
        support: 'Customer Support',
        sales: 'Sales & Pricing',
        hr: 'HR / Careers',
        medical: 'Medical Inquiry',
        partnership: 'Partnership'
      };
      const subjectText = subjectMap[formData.subject] || formData.subject;

      const payload = {
        inquiryType: inquiryType,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: subjectText,
        message: formData.message,
        files: []
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Submission request failed.');
      }

      setSubmitState('sent');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSuccessModalOpen(true);
      setTimeout(() => setSubmitState('idle'), 300);
    } catch (err: any) {
      console.error(err);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 3000);
    }
  };

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

  // Derive contact groups — use siteSettings.contactGroups if available, else static fallback
  const contactGroups: ContactGroup[] = settings?.contactGroups && settings.contactGroups.length > 0
    ? settings.contactGroups
    : [
      {
        _key: 'general',
        purpose: 'Medicine Inquiries',
        addresses: ['Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747'],
        phones: ['+63 919 076 9103'],
        emails: ['info@getmeds.ph'],
        showInFooter: true,
        showInTopBar: true,
      },
      {
        _key: 'hr',
        purpose: 'HR / Careers',
        phones: ['+63 917 154 5029'],
        emails: ['hr@getmeds.ph', 'hr2@getmeds.ph'],
      },
      {
        _key: 'medical',
        purpose: 'Partnerships',
        phones: ['+63 919 076 9103'],
        emails: ['care@getmeds.ph'],
      },
    ];


  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Contact Us Hero Section */}

      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-6 max-w-[1600px]">
        <div
          className={`relative rounded-[1.5rem] border border-gray-100/20 overflow-hidden min-h-[280px] sm:min-h-[360px] md:min-h-[450px] lg:min-h-[500px] flex items-end shadow-sm transition-colors duration-500 ${!heroImgLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
          {/* Background Image — only mount after Sanity resolves so the src never changes */}
          {!imagesLoading && (
            <img
              src={getImage('assets/contactushero.png', 'assets/contactushero.png')}
              alt="Contact Us"
              onLoad={() => setHeroImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover object-[78%_top] sm:object-[82%_center] md:object-[80%_center] lg:object-center transition-opacity duration-700 ${heroImgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          <div className="relative z-10 w-full px-5 sm:px-8 md:px-14 pb-1 sm:pb-5 md:pb-16 pt-16 sm:pt-20 max-w-4xl">
            <h1 className="text-[22px] sm:text-[28px] md:text-[42px] leading-tight font-bold mb-3 md:mb-4 tracking-tight">
              <span className="inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">For patients, partners,</span><br />
              <span className="inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">and providers.</span>
            </h1>
            <p className="text-[#000b5d] text-[12px] sm:text-[13px] md:text-[15px] max-w-[90%] sm:max-w-[480px] md:max-w-[620px] mb-5 leading-relaxed font-medium">
              For inquiries about our pharmaceutical portfolio, partnership opportunities, careers, or patient access programs — our team is ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 mb-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* Left Info Area */}
          <div className="w-full lg:w-[45%] lg:pt-2">
            <h2 className="text-2xl md:text-[28px] font-bold text-dark mb-3 leading-tight tracking-tight">
              How to Reach Us
            </h2>
            <p className="text-gray-500 text-[14px] mb-6 lg:mb-10 leading-relaxed max-w-[90%]">
              Pick the channel that fits your need. General inquiries, careers, and partnerships are routed directly to the right team for faster response.
            </p>

            {/* Dynamic contact groups grid */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-y-10 lg:gap-x-8">
              {contactGroups.map((group) => (
                <div key={group._key} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm lg:bg-transparent lg:rounded-none lg:p-0 lg:border-0 lg:shadow-none">
                  {/* Purpose heading with icon */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                      <i className={`${getPurposeIcon(group.purpose)} text-white text-xs`}></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-base">{group.purpose}</h4>
                  </div>

                  {/* Addresses */}
                  {group.addresses && group.addresses.length > 0 && (
                    <div className="mb-2">
                      {group.addresses.map((addr, i) => (
                        <p key={i} className="text-gray-500 text-[13px] leading-relaxed flex items-start gap-1.5">
                          <i className="fa-solid fa-location-dot text-primary mt-0.5 text-[11px] flex-shrink-0"></i>
                          {addr}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Phones */}
                  {group.phones && group.phones.length > 0 && (
                    <div className="mb-2">
                      {group.phones.map((ph, i) => (
                        <a key={i} href={`tel:${ph.replace(/[^+\d]/g, '')}`}
                          className="flex items-center gap-1.5 text-gray-500 text-[13px] hover:text-primary transition font-medium">
                          <i className="fa-solid fa-phone text-primary text-[11px] flex-shrink-0"></i>
                          {ph}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Emails */}
                  {group.emails && group.emails.length > 0 && (
                    <div>
                      {group.emails.map((em, i) => (
                        <a key={i} href={`mailto:${em}`}
                          className="flex items-center gap-1.5 text-gray-500 text-[13px] hover:text-primary transition font-medium">
                          <i className="fa-solid fa-envelope text-primary text-[11px] flex-shrink-0"></i>
                          {em}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Social Network — always last */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm lg:bg-transparent lg:rounded-none lg:p-0 lg:border-0 lg:shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                    <i className="fa-solid fa-share-nodes text-white text-xs"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-base">Social Network</h4>
                </div>
                <div className="flex space-x-4 items-center flex-wrap gap-y-2">
                  <a href="https://www.facebook.com/getmedsphilippines/" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-[#1877F2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-facebook"></i></a>
                  <a href="https://twitter.com/getmeds_ph" target="_blank" rel="noopener noreferrer" title="Twitter" className="text-[#1DA1F2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-twitter"></i></a>
                  <a href="https://www.linkedin.com/company/getmeds" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-[#0A66C2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-linkedin"></i></a>
                  <a href="https://www.tiktok.com/@getmedsph?_t=8lQqwFgifZJ&_r=1" target="_blank" rel="noopener noreferrer" title="TikTok" className="text-[#010101] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-tiktok"></i></a>
                  <a href="https://www.instagram.com/getmeds_ph/" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-[#E1306C] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-instagram"></i></a>
                  <a href="https://www.youtube.com/channel/UC9cpdBilPaA8xQHBzs_ezvA" target="_blank" rel="noopener noreferrer" title="YouTube" className="text-[#FF0000] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-youtube"></i></a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="w-full lg:w-[55%] bg-white rounded-3xl p-8 md:p-11 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/50">
            <h3 className="text-[21px] font-bold bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-7 tracking-tight">
              Get in Touch with Us
            </h3>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-[14px] font-semibold text-gray-700">Full Name</label>
                  <input type="text" placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[14px] font-semibold text-gray-700">Email Address</label>
                  <input type="email" placeholder="e.g. johndoe@email.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-[14px] font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" inputMode="numeric" placeholder="e.g. +63 912 345 6789"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/[^\d+\s\-()\s]/g, '') }))}
                    className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[14px] font-semibold text-gray-700">Subject</label>
                  <div className="relative">
                    <select value={formData.subject}
                      onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors text-gray-400 font-medium appearance-none cursor-pointer">
                      <option value="" disabled hidden>Select Subject</option>
                      <option value="general" className="text-gray-700">General Inquiry</option>
                      <option value="support" className="text-gray-700">Customer Support</option>
                      <option value="sales" className="text-gray-700">Sales &amp; Pricing</option>
                      <option value="hr" className="text-gray-700">HR / Careers</option>
                      <option value="medical" className="text-gray-700">Medical Inquiry</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <i className="fa-solid fa-chevron-down text-[10px]"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col space-y-2 pt-1">
                <label className="text-[14px] font-semibold text-gray-700">Message</label>
                <textarea placeholder="e.g. I would like to inquire about your pharmaceutical products..." rows={4}
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-[#F4F6F9] rounded-xl px-4 py-4 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium resize-none"></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button type="submit"
                  disabled={submitState === 'sending'}
                  className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-bold py-3.5 rounded-full text-[14px] transition shadow-md disabled:opacity-50">
                  {submitState === 'sending' ? 'Sending...' : submitState === 'sent' ? '✓ Submitted Successfully!' : submitState === 'error' ? 'Failed. Try Again' : 'Submit'}
                </button>
              </div>

              {/* Footer Link */}
              <div className="pt-2 text-left pb-2">
                <p className="text-[11px] text-gray-500 font-medium">By submitting, I agree to the <a href="#"
                  className="text-[#0057FF] hover:underline transition">Privacy Policy</a>.</p>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

      {/* ── Contact Us Success Modal ── */}
      {successModalOpen && (
        <>
        <style>{`@keyframes checkBounce{0%{transform:scale(0);opacity:0}55%{transform:scale(1.06);opacity:1}75%{transform:scale(0.97)}100%{transform:scale(1);opacity:1}}.check-bounce{animation:checkBounce 0.8s ease-out forwards}`}</style>
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden">
            <button onClick={() => setSuccessModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10">
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
            <div className="px-10 pt-12 pb-8 text-center">
              <div className="flex justify-center mb-7">
                <div className="check-bounce w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#61A644,#1D9FDA)' }}>
                  <i className="fa-solid fa-check text-white text-xl"></i>
                </div>
              </div>
              <h2 className="text-[19px] font-semibold text-gray-900 mb-4 leading-snug">Thank you for reaching out.</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Our team will get back to you shortly. For urgent concerns, please call{' '}
                <a href="tel:+639190769105" className="text-[#1D9FDA] font-semibold hover:underline">+63 919 076 9105</a>.
              </p>
            </div>
            <div className="border-t border-gray-100 px-10 py-4 text-center">
              <button onClick={() => setSuccessModalOpen(false)}
                className="text-[13px] font-semibold hover:underline"
                style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Close
              </button>
            </div>
          </div>
        </div>
        </>
      )}

    </div>
  );
}
