import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper, useSiteSettings } from '../lib/useSanity';
import { getGoogleSpreadsheetBySlug } from '../lib/queries';
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
  const { getImage } = useImageMapper('contact-us');
  const { data: settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in Name and Email fields.');
      return;
    }
    setSubmitState('sending');
    try {
      const sheetInfo = await getGoogleSpreadsheetBySlug('contact-us-list');
      if (!sheetInfo || !sheetInfo.spreadsheetId) {
        throw new Error('Google Spreadsheet settings not found in Sanity.');
      }

      const timestamp = new Date().toLocaleString();
      const payload = {
        spreadsheetId: sheetInfo.spreadsheetId,
        row: [formData.name, formData.email, formData.phone, formData.subject, formData.message, timestamp]
      };

      const response = await fetch(import.meta.env.VITE_SPREADSHEET_API_URL || '/api/append-to-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Submission request failed.');
      }

      setSubmitState('sent');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitState('idle'), 3000);
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
        purpose: 'General',
        addresses: ['Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747'],
        phones: ['+63 919 076 9105'],
        emails: ['info@getmeds.ph'],
        showInFooter: true,
        showInTopBar: true,
      },
      {
        _key: 'hr',
        purpose: 'HR / Careers',
        phones: ['+63 919 076 9106'],
        emails: ['careers@getmeds.ph', 'hr@getmeds.ph', 'hr2@getmeds.ph'],
      },
      {
        _key: 'medical',
        purpose: 'Medical Inquiries',
        phones: ['+63 919 076 9107'],
        emails: ['medical@getmeds.ph'],
      },
    ];


  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Contact Us Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-6 max-w-[1600px]">
        <div
          className="relative rounded-[1.5rem] border border-gray-100/20 overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end shadow-sm">
          {/* Background Image */}
          <img src={getImage('assets/contactushero.png', 'assets/contactushero.png')} alt="Contact Us"
            className="absolute inset-0 w-full h-full object-cover object-[85%_center] md:object-center" />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-[100%] md:w-[70%] z-0" />

          {/* Floating icons */}
          <div className="absolute top-[12%] right-[25%] md:top-[18%] md:right-[30%] lg:right-[25%] flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl w-12 h-12 md:w-[70px] md:h-[70px] animate-float-1 z-20">
            <i className="fa-solid fa-envelope text-white text-xl md:text-3xl drop-shadow-md"></i>
          </div>
          <div className="absolute top-[40%] right-[2%] md:top-[45%] md:right-[6%] lg:right-[8%] flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl w-10 h-10 md:w-[60px] md:h-[60px] animate-float-2 z-20">
            <i className="fa-solid fa-phone-volume text-white text-lg md:text-2xl drop-shadow-md"></i>
          </div>
          <div className="absolute top-[25%] left-[5%] md:top-[60%] md:left-[auto] md:right-[22%] lg:right-[25%] flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-[20px] w-14 h-14 md:w-[84px] md:h-[84px] animate-float-3 z-20">
            <i className="fa-solid fa-comments text-white text-2xl md:text-[38px] drop-shadow-md"></i>
          </div>

          <div className="relative z-10 w-full px-8 md:px-14 pb-12 md:pb-16 pt-20 max-w-4xl">
            <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-3 tracking-tight">
              <span className="text-white">Get in Touch</span><br />
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-sm">
                CONTACT US
              </span>
            </h1>
            <p className="text-white/90 text-[13px] md:text-[14px] max-w-[650px] mb-5 leading-relaxed font-normal">
              We'd love to hear from you. Whether you have a question about services, pricing, need a
              consultation, or anything else, our team is ready to answer all your questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 mb-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* Left Info Area */}
          <div className="w-full lg:w-[45%] lg:pt-2">
            <span className="text-gray-500 font-medium text-[13px] block mb-3 italic">I get in touch!</span>
            <h2 className="text-3xl md:text-[36px] font-bold bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-5 leading-[1.15] tracking-tight">
              We are always ready to help you and answer your questions
            </h2>
            <p className="text-gray-500 text-[14px] mb-10 leading-relaxed max-w-[90%]">
              We're here to assist you and provide the answers you need. Your well-being is our priority, and
              we're just a message away.
            </p>

            {/* Dynamic contact groups grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
              {contactGroups.map((group) => (
                <div key={group._key}>
                  {/* Purpose heading with icon */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                      <i className={`${getPurposeIcon(group.purpose)} text-white text-xs`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{group.purpose}</h4>
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
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                    <i className="fa-solid fa-share-nodes text-white text-xs"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">Social Network</h4>
                </div>
                <div className="flex space-x-4 items-center flex-wrap gap-y-2">
                  <a href="#" title="Facebook" className="text-[#1877F2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-facebook"></i></a>
                  <a href="#" title="Twitter" className="text-[#1DA1F2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-twitter"></i></a>
                  <a href="#" title="LinkedIn" className="text-[#0A66C2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-linkedin"></i></a>
                  <a href="#" title="Telegram" className="text-[#2AABEE] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-telegram"></i></a>
                  <a href="#" title="YouTube" className="text-[#FF0000] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i className="fa-brands fa-youtube"></i></a>
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
                  <input type="tel" placeholder="e.g. +63 912 345 6789"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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

    </div>
  );
}
