import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { setPageMeta } from '../lib/seo';
import { getVerifiedEmployees } from '../lib/queries';
import { BadgeCheck } from "lucide-react";

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
  const [matchedEmployee, setMatchedEmployee] = useState<{ name: string; employeeId: string } | null>(null);
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
        const empName = found.fullName?.[0] || 
                        `${found.firstName?.[0] || ''} ${found.lastName?.[0] || ''}`.trim() || 
                        'Getmeds Employee';
        const empId = found.employeeId?.[0] || 'N/A';
        setMatchedEmployee({ name: empName, employeeId: empId });
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

      {/* Verification result modal — same pattern as the partnership inquiry confirmation modal */}
      {modalState && (
        <>
          <style>{`@keyframes checkBounce{0%{transform:scale(0);opacity:0}55%{transform:scale(1.06);opacity:1}75%{transform:scale(0.97)}100%{transform:scale(1);opacity:1}}.check-bounce{animation:checkBounce 0.8s ease-out forwards}`}</style>
          <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 transition-opacity duration-200 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeModal}
          >
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
                  {modalState === 'verified' ? (
                    <div
                      className="check-bounce w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#61A644,#1D9FDA)' }}
                    >
                      <i className="fa-solid fa-check text-white text-xl"></i>
                    </div>
                  ) : (
                    <div
                      className="check-bounce w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#EF4444,#F59E0B)' }}
                    >
                      <i className="fa-solid fa-xmark text-white text-xl"></i>
                    </div>
                  )}
                </div>

                {modalState === 'verified' ? (
                  <>
                    <h2 className="text-[19px] font-semibold text-gray-900 mb-2 leading-snug">Verified Employee</h2>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 my-4">
  <div className="flex items-center justify-center gap-2">
    {/* Verified Badge */}
    <BadgeCheck
      size={18}
      className="text-green-600 fill-green-100"
      strokeWidth={2}
    />

    {/* Name */}
    <span className="text-[15px] font-medium text-gray-900">
      {matchedEmployee?.name}
    </span>

    {/* Company ID Chip */}
    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-[10px] font-semibold">
      {matchedEmployee?.employeeId}
    </span>
  </div>
</div>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      This contact matches an active Getmeds Philippines employee record. You can proceed with
                      confidence.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-[19px] font-semibold text-gray-900 mb-2 leading-snug">Not on Record</h2>
                    <p className="text-[13px] text-red-600 font-medium mb-3 leading-relaxed">
                      The {searchQueryUsed.includes('@') ? 'email' : 'contact number'} <span className="break-all font-semibold">"{searchQueryUsed}"</span> is not listed as getmeds verified employees.
                    </p>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      We couldn't find this contact in our employee records. Please don't share personal
                      information or make any payment based on this contact alone.
                    </p>
                  </>
                )}
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
          </div>
        </>
      )}
    </div>
  );
}
