import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { setPageMeta } from '../lib/seo';
import { getVerifiedEmployees } from '../lib/queries';
import { BadgeCheck, ShieldCheck, User } from "lucide-react";

export default function EmployeeVerification() {
  useEffect(() => {
    setPageMeta({
      title: 'Employee Verification Portal',
      description: "Verify whether someone contacting you is a genuine Getmeds Philippines employee before sharing personal information or making any payment.",
      path: '/employee-verification.html',
    });
  }, []);

  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalState, setModalState] = useState<'verified' | 'not-verified' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [matchedEmployee, setMatchedEmployee] = useState<{
    name: string;
    initials: string;
    employeeId: string | null;
    email: string | null;
    phone: string | null;
    verificationDate: string;
    imageUrl?: string | null;
  } | null>(null);
  const [searchQueryUsed, setSearchQueryUsed] = useState('');

  // Mount the modal first, then flip to visible on the next frame so the
  // opacity/scale transition actually has something to animate from.
  useEffect(() => {
    if (modalState) {
      const raf = requestAnimationFrame(() => setModalVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [modalState]);



  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setModalState(null);
      setMatchedEmployee(null);
    }, 200);
  };

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(footerContainer, html); });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitting(true);
    setModalState(null);
    setMatchedEmployee(null);
    setImageError(false);
    setSearchQueryUsed(query.trim());

    try {
      const docs = await getVerifiedEmployees();
      let found: any = null;

      const normQuery = query.trim().toLowerCase();
      const queryDigits = normQuery.replace(/\D/g, '');
      const queryLast10 = queryDigits.slice(-10);

      for (const doc of docs) {
        if (!doc.json_data) continue;
        let parsed;
        try {
          parsed = JSON.parse(doc.json_data);
        } catch (err) {
          console.error("Failed to parse json_data for doc:", doc._id, err);
          continue;
        }

        for (const sheetName of Object.keys(parsed)) {
          const rows = parsed[sheetName];
          if (!Array.isArray(rows)) continue;

          for (const row of rows) {
            // Check email
            if (Array.isArray(row.companyEmail)) {
              const matchedEmail = row.companyEmail.some((email: any) =>
                typeof email === 'string' && email.trim().toLowerCase() === normQuery
              );
              if (matchedEmail) {
                found = row;
                break;
              }
            }

            // Check contact number (mobileNumber, companyIssuedNo., etc.)
            const phoneFields = [row.mobileNumber, row.companyIssuedNo, row['companyIssuedNo.']].filter(Boolean);
            let matchedPhone = false;
            for (const field of phoneFields) {
              if (Array.isArray(field)) {
                matchedPhone = field.some((num: any) => {
                  if (typeof num !== 'string') return false;
                  const dbDigits = num.replace(/\D/g, '');
                  const dbLast10 = dbDigits.slice(-10);
                  return dbLast10.length >= 10 && dbLast10 === queryLast10;
                });
              }
              if (matchedPhone) break;
            }

            if (matchedPhone) {
              found = row;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }

      if (found) {
        // Build display name — convert "Lastname, Firstname M." → "Firstname M. Lastname"
        let rawName = found.fullName?.[0] ||
          `${found.firstName?.[0] || ''} ${found.lastName?.[0] || ''}`.trim() ||
          'Getmeds Employee';
        if (rawName.includes(',')) {
          const [last, rest] = rawName.split(',').map((s: string) => s.trim());
          rawName = rest ? `${rest} ${last}` : last;
        }
        const empName = rawName;

        const empId = found.employeeId?.[0] || null;

        // Initials from display name
        const words = empName.split(' ').filter(Boolean);
        const initials = words.length >= 2
          ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
          : (words[0]?.[0] || 'G').toUpperCase();

        // All emails joined
        const emailJoined = Array.isArray(found.companyEmail)
          ? found.companyEmail.filter(Boolean).join(' / ')
          : (found.companyEmail || '');
        const email = emailJoined || null;

        // Company-issued number first, fall back to mobile
        const issuedNums = (found['companyIssuedNo.'] || found.companyIssuedNo || []);
        const mobileNums = (found.mobileNumber || []);
        const phoneArr = Array.isArray(issuedNums) ? issuedNums.filter(Boolean) : [];
        const mobileArr = Array.isArray(mobileNums) ? mobileNums.filter(Boolean) : [];
        const phoneJoined = (phoneArr.length ? phoneArr : mobileArr).join(' / ');
        const phone = phoneJoined || null;

        // Verification date (timestamp with date and time)
        const dateStr = new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        const timeStr = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true
        });
        const verificationDate = `${dateStr} at ${timeStr}`;

        const imageUrl = found.image?.[0] || found.imageUrl?.[0] || found.photo?.[0] || found.avatar?.[0] || null;

        setMatchedEmployee({ name: empName, initials, employeeId: empId, email, phone, verificationDate, imageUrl });
        setModalState('verified');
      } else {
        setModalState('not-verified');
      }
    } catch (err) {
      console.error("Error matching employee:", err);
      setModalState('not-verified');
    } finally {
      setSubmitting(false);
    }
  };

  // Only fields the database actually gave us — no fabricated placeholders,
  // and the grid auto-flows around whichever ones are missing.
  const detailRows: { label: string; value: string; breakAll?: boolean }[] = [
    matchedEmployee?.email ? { label: 'Company Email', value: matchedEmployee.email, breakAll: true } : null,
    matchedEmployee?.phone ? { label: 'Company No.', value: matchedEmployee.phone } : null,
  ].filter((row): row is { label: string; value: string; breakAll?: boolean } => row !== null);


  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="mb-10 md:mb-12">
          <span className="inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-[10px] md:text-sm mb-3">Verification Portal</span>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight mb-3">
            Employee{' '}
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Verification</span>
          </h1>
          <p className="text-gray-500 text-[15px] max-w-full leading-relaxed">
            Confirm you're speaking with a genuine Getmeds Philippines employee before sharing personal
            information or making any payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left: How Verification Works */}
          <div className="md:col-span-5">
            <h2 className="text-xl md:text-2xl font-semibold text-dark mb-6">How Verification Works</h2>
            <div className="relative">
              {/* Connector line, sits behind the icon badges */}
              <div className="absolute left-[21px] top-2 bottom-2 border-l-2 border-dashed border-gray-200 z-0"></div>

              <div className="relative z-10 space-y-8">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-keyboard text-lg text-primary"></i>
                  </div>
                  <div className="pt-1.5">
                    <h4 className="text-[15px] font-semibold text-dark mb-1">Enter their contact</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      Paste the exact email or phone number the person gave you. No account or sign-in required.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-magnifying-glass text-lg text-[#61A644]"></i>
                  </div>
                  <div className="pt-1.5">
                    <h4 className="text-[15px] font-semibold text-dark mb-1">We match it to our employee records</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      The system checks it against active Getmeds employee and authorized-agent records in real time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-circle-check text-lg text-[#8B5CF6]"></i>
                  </div>
                  <div className="pt-1.5">
                    <h4 className="text-[15px] font-semibold text-dark mb-1">See a clear result</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      You'll see a clear verified or not-on-record status, right away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: verification form, centered */}
          <div className="md:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">Verify an Employee</h2>
              <p className="text-[13px] text-gray-500 text-center mb-6 leading-relaxed">
                Enter the employee's email address or phone number exactly as given to you.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. juan.delacruz@getmeds.ph or 0917 123 4567"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition placeholder-gray-400"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white font-semibold py-3 rounded-xl text-[14px] transition shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Checking…' : 'Verify'}
                </button>
              </form>

              <p className="mt-6 text-center text-[12px] text-gray-400">
                Having trouble?{' '}
                <a href="/contact-us.html" className="text-primary font-semibold hover:underline">
                  Contact our support team
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

      {/* Verification result modal */}
      {modalState && (
        <>
          <style>{`
            @keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .modal-slide-up{animation:slideUp 0.32s cubic-bezier(.22,1,.36,1) forwards}
            @keyframes fadeInRow{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
            .fade-row{animation:fadeInRow 0.3s ease forwards}
          `}</style>

          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-opacity duration-200 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeModal}
          >
            {modalState === 'verified' ? (
              /* ── VERIFIED CARD (landscape) ─────────────────────────── */
              <div
                className={`w-full max-w-[680px] rounded-[15px] bg-white shadow-2xl overflow-hidden transform transition-all duration-200 modal-slide-up relative p-7 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Slanted repeated watermark background pattern with customized spacing */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                  <div
                    className="absolute -inset-24 grid grid-cols-6 gap-x-12 gap-y-8 justify-items-center align-middle"
                    style={{ transform: 'rotate(-20deg)' }}
                  >
                    {Array.from({ length: 36 }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-center">
                        <img
                          src="/assets/getmedslogo.png"
                          alt=""
                          className="w-30 opacity-[0.20] object-contain"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top-right corner radial gradient bleed (matches style from image flipped to top-right) */}
                <div
                  className="absolute inset-0 pointer-events-none select-none z-0"
                  style={{
                    background: 'radial-gradient(circle at 100% 0%, rgba(29, 127, 186, 0.25) 0%, rgba(42, 138, 106, 0.15) 40%, rgba(58, 140, 63, 0.06) 70%, transparent 100%)'
                  }}
                />

                {/* Close button */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition z-20"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>

                {/* Content wrapper */}
                <div className="relative z-10 space-y-5">
                  {/* Top Header Section (No gradient) */}
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    {/* Circle avatar */}
                    {matchedEmployee?.imageUrl && !imageError ? (
                      <img
                        src={matchedEmployee.imageUrl}
                        alt={matchedEmployee.name}
                        className="w-20 h-20 rounded-full object-cover flex-shrink-0 border border-gray-200 shadow-sm"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 flex-shrink-0 shadow-inner">
                        <User size={38} className="text-slate-400/80" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="text-gray-900 font-semibold text-[17px] leading-snug truncate block">
                        {matchedEmployee?.name}
                      </span>
                      {matchedEmployee?.employeeId && (
                        <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                          <ShieldCheck size={14} className="text-green-600" />
                          <span className="text-[12px]">{matchedEmployee.employeeId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3-column detail grid — only fields the database actually provided,
                      plus the two always-present ones (Status, Verified On) */}
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    {detailRows.map((row, i) => (
                      <div key={row.label} className="fade-row" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                        <span className="block text-[11px] text-gray-400 font-medium mb-1">{row.label}</span>
                        <span className={`text-[13px] text-gray-800 font-medium ${row.breakAll ? 'break-all' : ''}`}>{row.value}</span>
                      </div>
                    ))}

                    {/* Status */}
                    <div className="fade-row" style={{ animationDelay: `${0.05 + detailRows.length * 0.03}s` }}>
                      <span className="block text-[11px] text-gray-400 font-medium mb-1">Status</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                        <span className="text-[13px] text-green-700 font-semibold">Active Employee</span>
                      </span>
                    </div>

                    {/* Verified On */}
                    <div className="fade-row" style={{ animationDelay: `${0.05 + (detailRows.length + 1) * 0.03}s` }}>
                      <span className="block text-[11px] text-gray-400 font-medium mb-1">Verified On</span>
                      <span className="text-[13px] text-gray-800">{matchedEmployee?.verificationDate}</span>
                    </div>
                  </div>

                  {/* Disclaimer bottom text (no gray container) */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[12px] text-gray-700 leading-relaxed">
                      This verification portal is intended solely to confirm the identity and employment status of authorized representatives of GetMeds Philippines Inc. and 2MG Incorporated. The information displayed is limited to what is necessary for verification purposes and must not be copied, reproduced, or used for any purpose other than verifying the representative's identity.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── NOT VERIFIED CARD ──────────────────────────────────── */
              <div
                className={`bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden transform transition-all duration-200 ${modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
                <div className="px-8 pt-8 pb-5 text-center">
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#EF4444,#F59E0B)' }}
                    >
                      <i className="fa-solid fa-xmark text-white text-xl"></i>
                    </div>
                  </div>
                  <h2 className="text-[19px] font-semibold text-gray-900 mb-2 leading-snug">Not on Record</h2>
                  <p className="text-[13px] text-red-600 font-medium mb-3 leading-relaxed">
                    The {searchQueryUsed.includes('@') ? 'email' : 'contact number'}{' '}
                    <span className="break-all font-semibold">"{searchQueryUsed}"</span>{' '}
                    is not listed as a verified Getmeds employee.
                  </p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    We couldn't find this contact in our employee records. Please don't share personal
                    information or make any payment based on this contact alone.
                  </p>
                </div>
                <div className="border-t border-gray-100 px-8 py-3 text-center">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-[13px] font-semibold hover:underline"
                    style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
