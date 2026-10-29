"use client";

/* Open positions + application flow for /careers, ported from the previous CareersClient:
   jobs come from /api/careers (proxied to the backend), applications go through submitInquiry
   with the resume attached. Same behaviour, restyled to the site's flat cards and pill buttons. */

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Paperclip, UploadCloud, X } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { submitInquiry } from "@/lib/offlineInquiry";
import { Turnstile, useTurnstile } from "@/lib/turnstile";
import { QueuedInquiryNotice } from "@/lib/QueuedInquiryNotice";
import { contact } from "@/lib/data";
import { Reveal } from "@/components/ui";

type Job = {
  id?: number | string;
  job_title?: string;
  job_type?: string;
  location?: string;
  job_description_text?: string;
  job_description_html?: string;
};

const positionType = (title: string, desc: string): string => {
  const text = (title + " " + desc).toLowerCase();
  if (text.includes("part time") || text.includes("part-time")) return "Part Time";
  if (text.includes("contract")) return "Contract";
  if (text.includes("intern") || text.includes("internship")) return "Internship";
  if (text.includes("freelance")) return "Freelance";
  return "Full Time";
};

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 placeholder:text-gray-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-gray-800";

const emptyForm = { name: "", email: "", phone: "", message: "", resumeName: "", resumeType: "", resumeBase64: "" };

export default function CareersJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingFor, setApplyingFor] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [successOpen, setSuccessOpen] = useState(false);
  const turnstile = useTurnstile();
  const activeJob = jobs.find((j) => j.job_title === applyingFor);

  useEffect(() => {
    fetch("/api/careers")
      .then((r) => r.json())
      .then((res) => {
        setJobs(res && res.success && Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching careers:", err);
        setJobs([]);
        setLoading(false);
      });
  }, []);

  const close = () => {
    setDrawerOpen(false);
    setDescOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.resumeBase64) {
      alert("Please fill in all required fields and upload your resume.");
      return;
    }
    setSubmitState("sending");
    try {
      const submission = await submitInquiry(
        {
          turnstileToken: turnstile.token,
          inquiryType: "Career Inquiry",
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          additionalData: { position: applyingFor },
          files: [{ name: form.resumeName, type: form.resumeType || "application/pdf", base64: form.resumeBase64 }],
        },
        { endpoint: getApiUrl(), returnPath: "/careers" }
      );
      // Tokens are single-use, so the solved widget is replaced whatever the outcome.
      turnstile.reset();
      if (submission.status === "failed") throw new Error(submission.error);
      setSubmitState("sent");
      setForm(emptyForm);
      close();
      // A queued inquiry is not a delivered one; QueuedInquiryNotice reports those.
      if (submission.status === "sent") setSuccessOpen(true);
      setTimeout(() => setSubmitState("idle"), 300);
    } catch (err) {
      console.error(err);
      setSubmitState("error");
      setTimeout(() => setSubmitState("idle"), 3000);
    }
  };

  if (!loading && jobs.length === 0) return <QueuedInquiryNotice />;

  const panelClass =
    "fixed inset-x-0 bottom-0 z-[160] flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:inset-x-auto md:right-4 md:top-4 md:w-[calc(100%-2rem)] md:max-w-md md:rounded-[15px]";

  return (
    <>
      {/* Open positions: header like the other sections (title left, line right), flat job cards */}
      {/* heading on white above the band (title left, line right, like the other section headers) */}
      <div id="open-positions" className="scroll-mt-28 bg-white pb-8 pt-8 md:pb-10 md:pt-10">
        <Reveal className="mx-auto grid max-w-7xl items-end gap-5 px-5 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10">
          <div>
            <p className="text-sm font-semibold text-primary">Open Positions</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">Join Our Team</h2>
          </div>
          <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
            Discover exciting opportunities to grow your career with us. We are looking for passionate
            individuals to join our mission-driven team.
          </p>
        </Reveal>
      </div>

      {/* brand-green band with the job cards, sitting directly on the footer */}
      <section className="bg-[#61A644] py-12 text-white md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className={`grid gap-4 ${jobs.length === 1 ? "mx-auto max-w-md" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {loading ? (
              <p className="col-span-full py-10 text-center text-sm text-white/85">Loading positions...</p>
            ) : (
              jobs.map((job, idx) => {
                const type = job.job_type || positionType(job.job_title || "", job.job_description_text || "");
                return (
                  <div
                    key={job.id ?? idx}
                    className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 md:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{type}</span>
                      {job.location && <span className="text-slate-500">{job.location}</span>}
                    </div>
                    <h3 className="font-display mt-4 font-semibold text-black">{job.job_title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
                      {job.job_description_text || "No description available."}
                    </p>
                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          setApplyingFor(job.job_title || "");
                          setDrawerOpen(true);
                          setDescOpen(true);
                        }}
                        className="rounded-full border-2 border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
      />

      {/* Job description panel */}
      <div className={`${panelClass} ${drawerOpen && descOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-[calc(100%+2rem)] md:translate-y-0"}`}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-7 pb-4 pt-6">
          <div>
            <p className="text-sm font-semibold text-primary">Job Description</p>
            <h2 className="font-display mt-1 text-xl font-semibold text-black">{activeJob?.job_title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                {activeJob ? activeJob.job_type || positionType(activeJob.job_title || "", activeJob.job_description_text || "") : "Full Time"}
              </span>
              {activeJob?.location && <span className="text-slate-500">{activeJob.location}</span>}
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {activeJob && (
            <>
              <div
                className="job-desc text-[14px] leading-relaxed text-slate-600"
                dangerouslySetInnerHTML={{ __html: activeJob.job_description_html || "<p>No job description provided.</p>" }}
              />
              <button
                type="button"
                onClick={() => setDescOpen(false)}
                className="mt-8 w-full rounded-full border-2 border-primary bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Fill Out Application
              </button>
            </>
          )}
        </div>
      </div>

      {/* Application drawer */}
      <div className={`${panelClass} ${drawerOpen && !descOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-[calc(100%+2rem)] md:translate-y-0"}`}>
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-black">Apply for this Position</h2>
            <button type="button" onClick={close} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm font-semibold text-primary">{applyingFor}</p>
          <button
            type="button"
            onClick={() => setDescOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> View Job Description
          </button>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Fill out the form below and our HR team will get back to you as soon as possible.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Juan Dela Cruz" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
              <input type="email" required placeholder="e.g. juan@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" inputMode="numeric" required placeholder="e.g. +63 912 345 6789" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^0-9+ ()-]/g, "") }))} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Position Applying For</label>
              <input type="text" readOnly value={applyingFor} className={`${fieldClass} cursor-not-allowed bg-gray-50 text-gray-500`} />
            </div>
            <div>
              <label className={labelClass}>Cover Letter / Message <span className="text-red-500">*</span></label>
              <textarea required rows={4} placeholder="Tell us why you're a great fit for this role." value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className={`${fieldClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Upload Resume <span className="text-red-500">*</span></label>
              <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:bg-gray-100">
                <UploadCloud className="h-6 w-6 text-gray-400" />
                <span className="text-[13px] font-medium text-gray-600">Click to upload or drag and drop</span>
                <span className="text-[12px] text-gray-400">PDF, DOC, DOCX, PNG, JPG (max 10MB)</span>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64 = String(ev.target?.result || "").split(",")[1] || "";
                      setForm((f) => ({ ...f, resumeName: file.name, resumeType: file.type, resumeBase64: base64 }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {form.resumeName && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-primary">
                    <Paperclip className="h-3.5 w-3.5" /> {form.resumeName}
                  </span>
                )}
              </label>
            </div>
            <Turnstile turnstile={turnstile} />
            <div className="pb-6 pt-2">
              <button
                type="submit"
                disabled={submitState === "sending" || (turnstile.enabled && !turnstile.token)}
                className="w-full rounded-full border-2 border-primary bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState === "sending" ? "Sending..." : submitState === "sent" ? "Applied Successfully" : submitState === "error" ? "Failed. Try Again" : "Send Application"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success modal */}
      {successOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button type="button" onClick={() => setSuccessOpen(false)} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
            <div className="px-10 pb-8 pt-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#61A644] text-white">
                <Check className="h-6 w-6" strokeWidth={3} />
              </div>
              <h2 className="font-display mt-6 text-lg font-semibold text-black">Thank you for your interest in Getmeds.</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Our HR team will review your application and reach out shortly regarding next steps. For urgent
                concerns, please call{" "}
                <a href={`tel:${contact.hrPhone.replace(/ /g, "")}`} className="font-semibold text-primary hover:underline">
                  {contact.hrPhone}
                </a>
                .
              </p>
            </div>
            <div className="border-t border-gray-100 px-10 py-4 text-center">
              <button type="button" onClick={() => setSuccessOpen(false)} className="text-sm font-semibold text-primary hover:underline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backend job descriptions arrive as plain HTML; give their lists and headings some shape. */}
      <style>{`
        .job-desc p { margin: 0 0 0.75rem; }
        .job-desc ul, .job-desc ol { margin: 0 0 0.75rem; padding-left: 1.25rem; }
        .job-desc ul { list-style: disc; }
        .job-desc ol { list-style: decimal; }
        .job-desc li { margin: 0.25rem 0; }
        .job-desc strong { color: #111; font-weight: 600; }
      `}</style>

      <QueuedInquiryNotice />
    </>
  );
}
