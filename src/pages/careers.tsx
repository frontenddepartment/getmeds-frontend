import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';
import { LinkableImage } from '../lib/LinkableImage';
import { ProgressiveHeroImage } from '../lib/ProgressiveHeroImage';
import { getCareers } from '../lib/queries';
import { getApiUrl } from '../lib/api';
import { setPageMeta } from '../lib/seo';

const getPositionType = (title: string, desc: string): string => {
  const text = (title + ' ' + desc).toLowerCase();
  if (text.includes('part time') || text.includes('part-time')) return 'Part Time';
  if (text.includes('contract')) return 'Contract';
  if (text.includes('intern') || text.includes('internship')) return 'Internship';
  if (text.includes('freelance')) return 'Freelance';
  return 'Full Time';
};

const Careers: React.FC = () => {
  useEffect(() => {
    setPageMeta({
      title: 'Careers',
      description: "Join our mission to make healthcare accessible worldwide. We're looking for passionate individuals to innovate and grow with us.",
      path: '/careers',
    });
  }, []);

  const { getImage, getLowResImage, getImageLink, loading: imagesLoading } = useImageMapper('careers');
  const [activeCareersPanel, setActiveCareersPanel] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyingFor, setApplyingFor] = useState('');
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    resumeName: '',
    resumeType: '',
    resumeBase64: ''
  });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [jobDescOpen, setJobDescOpen] = useState(false);
  const activeJob = jobs.find(j => j.job_title === applyingFor);

  const careersSlides = [
    {
      imageKey: 'About Us Team Image 1',
      fallback: 'assets/aboutussix.jpg',
      alt: 'Getmeds Team',
      title: 'Build Your Career With Us',
      description: 'Join a team of passionate professionals dedicated to transforming healthcare access across the Philippines and beyond.',
    },
    {
      imageKey: 'About Us Team Image 2',
      fallback: 'assets/aboutusseven.jpg',
      alt: 'Getmeds Learning',
      title: 'Grow & Learn',
      description: 'We invest in our people through continuous learning, mentorship, and professional development programs that fuel long-term growth.',
    },
    {
      imageKey: 'About Us Team Image 3',
      fallback: 'assets/aboutuseight.jpg',
      alt: 'Getmeds Impact',
      title: 'Make Real Impact',
      description: 'Your work directly shapes patient lives. Be part of a mission-driven company where every contribution makes a meaningful difference.',
    },
    {
      imageKey: 'Careers Culture Image 4',
      fallback: 'assets/employeeone.png',
      alt: 'Getmeds Collaboration',
      title: 'Collaborate With Purpose',
      description: 'Work alongside driven teammates who share ideas openly and turn patient-first goals into daily action.',
    },
    {
      imageKey: 'Careers Culture Image 5',
      fallback: 'assets/employeetwo.png',
      alt: 'Getmeds Recognition',
      title: 'Celebrate Progress',
      description: 'From milestones to everyday wins, we recognize the effort and dedication that move healthcare forward.',
    },
    {
      imageKey: 'Careers Culture Image 6',
      fallback: 'assets/employeethree.png',
      alt: 'Getmeds Growth',
      title: 'Shape What Comes Next',
      description: 'Bring your strengths into a growing organization where curiosity, ownership, and care create new possibilities.',
    },
  ];

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.email || !applyForm.resumeBase64) {
      alert('Please fill in all required fields and upload your resume.');
      return;
    }
    setSubmitState('sending');
    try {
      const payload = {
        inquiryType: 'Career Inquiry',
        fullName: applyForm.name,
        email: applyForm.email,
        phone: applyForm.phone,
        message: applyForm.message,
        additionalData: {
          position: applyingFor
        },
        files: [
          {
            name: applyForm.resumeName,
            type: applyForm.resumeType || 'application/pdf',
            base64: applyForm.resumeBase64
          }
        ]
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Application submission request failed.');
      }

      setSubmitState('sent');
      setApplyForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        resumeName: '',
        resumeType: '',
        resumeBase64: ''
      });

      setApplyModalOpen(false);
      setJobDescOpen(false);
      setSuccessModalOpen(true);
      setTimeout(() => setSubmitState('idle'), 300);
    } catch (err: any) {
      console.error(err);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 3000);
    }
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = window.setInterval(() => {
      setActiveCareersPanel((current) => (current + 1) % careersSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [careersSlides.length, isHovered]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = decodeURIComponent(hash.substring(1));
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ca-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.ca-anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [jobs]);

  useEffect(() => {
    // Fetch careers from public API
    fetch('/api/careers')
      .then(r => r.json())
      .then(resData => {
        if (resData && resData.success && Array.isArray(resData.data)) {
          setJobs(resData.data);
        } else {
          setJobs([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching careers:', err);
        setJobs([]);
        setLoading(false);
      });

    fetch('/components/navbar.html', { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('navbar-container');
        if (el) injectHTML(el, html);
      });
    fetch('/components/footer.html', { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('footer-container');
        if (el) injectHTML(el, html);
      });
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      <style>{`
        @keyframes caFadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes caFadeLeft { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes caFadeRight{ from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes caZoomIn   { from { opacity:0; transform:scale(0.93);       } to { opacity:1; transform:scale(1);    } }
        @keyframes caFadeIn   { from { opacity:0; }                              to { opacity:1; }                        }

        .ca-anim { opacity: 0; }
        .ca-anim.ca-in.ca-up    { animation: caFadeUp    0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-left  { animation: caFadeLeft  0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-right { animation: caFadeRight 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-zoom  { animation: caZoomIn    0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-fade  { animation: caFadeIn    0.65s ease forwards; }

        .ca-d1 { animation-delay: 0.10s !important; }
        .ca-d2 { animation-delay: 0.20s !important; }
        .ca-d3 { animation-delay: 0.30s !important; }
        .ca-d4 { animation-delay: 0.40s !important; }
        .ca-d5 { animation-delay: 0.50s !important; }
        .ca-d6 { animation-delay: 0.60s !important; }
        .ca-d7 { animation-delay: 0.70s !important; }
        .ca-d8 { animation-delay: 0.80s !important; }
        .ca-d9 { animation-delay: 0.90s !important; }
        .ca-d10{ animation-delay: 1.00s !important; }

        /* Hero — plays on load */
        .hero-l1 { animation: caFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .hero-l2 { animation: caFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .hero-p  { animation: caFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.48s both; }
        .hero-btn{ animation: caFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.62s both; }

        /* Quill Editor rich HTML styles */
        .job-desc-content p {
          margin-bottom: 0.75rem;
        }
        .job-desc-content strong {
          font-weight: 700;
        }
        .job-desc-content em {
          font-style: italic;
        }
        .job-desc-content u {
          text-decoration: underline;
        }
        .job-desc-content ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .job-desc-content ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .job-desc-content li {
          margin-bottom: 0.25rem;
        }
        .job-desc-content blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          font-style: italic;
          margin-bottom: 0.75rem;
          color: #475569;
        }
        .job-desc-content pre.ql-syntax {
          background-color: #f1f5f9;
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-family: monospace;
          white-space: pre-wrap;
          margin-bottom: 0.75rem;
        }
        .job-desc-content .ql-align-center {
          text-align: center;
        }
        .job-desc-content .ql-align-right {
          text-align: right;
        }
        .job-desc-content .ql-align-justify {
          text-align: justify;
        }
        .job-desc-content .ql-indent-1 {
          padding-left: 1.5rem;
        }
        .job-desc-content .ql-indent-2 {
          padding-left: 3rem;
        }
        .job-desc-content a {
          color: #1D9FDA;
          text-decoration: underline;
        }
        .job-desc-content a:hover {
          color: #0D99FF;
        }
      `}</style>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Desktop HERO SECTION */}
      <section className="hidden sm:block w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-0 max-w-[1600px]">
        <div className={`relative rounded-[10px] md:rounded-[1.5rem] overflow-hidden min-h-[360px] md:min-h-[500px] flex items-end transition-colors duration-500 ${!heroImgLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
          {!imagesLoading && (() => {
            const heroFullSrc = getImage('Careers Hero Background', 'assets/careershero.png');
            return (
              <ProgressiveHeroImage
                link={getImageLink('Careers Hero Background')}
                fullSrc={heroFullSrc}
                lowSrc={getLowResImage('Careers Hero Background', heroFullSrc)}
                alt="Getmeds Team"
                onLoaded={() => setHeroImgLoaded(true)}
                className="absolute inset-0 w-full h-full object-cover object-right-top"
              />
            );
          })()}
          <div className="relative z-10 w-full px-8 md:px-14 pb-5 md:pb-8 pt-0">
            <div className="inline-block max-w-[70%] md:max-w-[60%]">
              <h1 className="text-3xl md:text-5xl lg:text-6xl leading-[1.2] font-bold mb-4 tracking-tight">
                <span className="hero-l1 block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Join the Minds</span>
                <span className="hero-l2 block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent whitespace-nowrap">
                  Behind the Medicine
                </span>
              </h1>
              <p className="hero-p text-[#000b5d] text-[13px] md:text-[15px] max-w-[420px] mb-6 leading-relaxed font-medium">
                Join our mission to make healthcare accessible worldwide. We're looking
                for passionate individuals to innovate and grow with us.
              </p>
              <a href="#join-form"
                className="hero-btn bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-2.5 px-8 rounded-full text-[13px] inline-block transition shadow-lg">
                Read More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile HERO SECTION */}
      <section className="block sm:hidden w-full px-3 mt-3 mb-4">
        <div className={`relative aspect-[16/10] w-full rounded-[10px] overflow-hidden mb-3 shadow-sm transition-colors duration-500 ${!heroImgLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
          {!imagesLoading && (() => {
            const heroFullSrc = getImage('Careers Hero Background', 'assets/careershero.png');
            return (
              <ProgressiveHeroImage
                link={getImageLink('Careers Hero Background')}
                fullSrc={heroFullSrc}
                lowSrc={getLowResImage('Careers Hero Background', heroFullSrc)}
                alt="Getmeds Team"
                onLoaded={() => setHeroImgLoaded(true)}
                className="absolute inset-0 w-full h-full object-cover object-right-top"
              />
            );
          })()}
        </div>
        <div className="px-1">
          <h1 className="text-xl font-bold leading-tight mb-2 tracking-tight">
            <span className="hero-l1 block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Join the Minds Behind the Medicine</span>
          </h1>
          <p className="hero-p text-gray-600 text-xs mb-3 leading-relaxed font-normal text-left">
            Join our mission to make healthcare accessible worldwide. We're looking
            for passionate individuals to innovate and grow with us.
          </p>
        </div>
      </section>

      {/* WHY PROFESSIONALS CHOOSE Getmeds */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Left gradient decoration */}
        <div className="absolute left-0 top-0 h-full w-56 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 224 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="careersLeftGrad" cx="0%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#61A644" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#1D9FDA" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFF7ED" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="224" height="600" fill="url(#careersLeftGrad)" />
            <path d="M 0 520 A 80 80 0 0 1 80 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 440 A 160 160 0 0 1 160 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 360 A 240 240 0 0 1 224 514" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 280 A 320 320 0 0 1 224 372" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 200 A 400 400 0 0 1 224 269" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 120 A 480 480 0 0 1 224 176" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 40 A 560 560 0 0 1 224 87" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Right gradient decoration */}
        <div className="absolute right-0 top-0 h-full w-56 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 224 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="careersRightGrad" cx="100%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#61A644" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#1D9FDA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFF1F2" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="224" height="600" fill="url(#careersRightGrad)" />
            <path d="M 224 520 A 80 80 0 0 0 144 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 440 A 160 160 0 0 0 64 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 360 A 240 240 0 0 0 0 514" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 280 A 320 320 0 0 0 0 372" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 200 A 400 400 0 0 0 0 269" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 120 A 480 480 0 0 0 0 176" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 40 A 560 560 0 0 0 0 87" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="ca-anim ca-up text-center max-w-3xl mx-auto mb-16">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg block mb-4">Career Advantages</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">
              Why professionals choose Getmeds?
            </h2>
            <p className="text-gray-500 text-[15px]">We provide more than just a job; we offer a path to excellence,
              innovation, and global impact in the healthcare industry.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-6">
            <div className="ca-anim ca-up bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-microscope text-2xl text-primary"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Major Portfolio</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">One of the largest Hematology &amp; Oncology
                portfolios in the Philippines.</p>
            </div>

            <div className="ca-anim ca-up ca-d1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-certificate text-2xl text-success"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Exclusive Products</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Exclusive CSP products available to Filipino
                patients.</p>
            </div>

            <div className="ca-anim ca-up ca-d2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-route text-2xl text-[#8B5CF6]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Structured Path</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Structured Career Development Path within the
                first 6 months of joining.</p>
            </div>

            <div className="ca-anim ca-up ca-d3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-arrow-up-right-dots text-2xl text-[#F59E0B]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Fast Promotion</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Fast-track Promotions &amp; Annual Salary
                Increments for high performers.</p>
            </div>

            <div className="ca-anim ca-up ca-d4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-money-bill-trend-up text-2xl text-[#EF4444]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Top Compensation</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Competitive Compensation Package with
                Attractive Monthly Incentives.</p>
            </div>

            <div className="ca-anim ca-up ca-d5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-car-side text-2xl text-[#6366F1]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Company Car</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Free Company Car Program — vehicle ownership
                under the employee's name.</p>
            </div>

            <div className="ca-anim ca-up ca-d6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-plane-departure text-2xl text-[#06B6D4]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Travel Incentives</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">All-Expense-Paid International Travel
                Incentives after 2 years of service.</p>
            </div>

            <div className="ca-anim ca-up ca-d7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-heart-pulse text-2xl text-[#EC4899]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Wellness Focus</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Employee Wellness &amp; Meditation Programs to
                support mental health.</p>
            </div>

            <div className="ca-anim ca-up ca-d8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-award text-2xl text-[#EAB308]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Recognition</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Recognition, Awards, and Employee Engagement
                Initiatives year-round.</p>
            </div>

            <div className="ca-anim ca-up ca-d9 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-bolt-lightning text-2xl text-[#14B8A6]"></i>
              </div>
              <h4 className="text-[15px] font-semibold text-dark mb-2">Growth Environment</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Dynamic, high-performing, and growth-oriented
                work environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="pt-10 pb-8 lg:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center">
            <div className="shrink-0 lg:w-[42%]">
              <span className="ca-anim ca-left block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg mb-4">
                Our Benefits
              </span>
              <h2 className="ca-anim ca-left ca-d1 text-3xl md:text-4xl font-semibold text-dark leading-snug">
                Getmeds Has Been Present For Over A Decade In Healthcare
              </h2>
            </div>
            <div className="flex-1 flex items-center">
              <div>
                <p className="ca-anim ca-right text-gray-500 text-[14px] leading-[1.8] mb-4">
                  Join a team of dedicated professionals working to make healthcare
                  accessible and affordable for everyone. We believe in empowering our
                  employees to innovate and make a real difference in people's lives.
                </p>
                <p className="text-gray-500 text-[14px] leading-[1.8]">
                  Our culture fosters growth, collaboration, and a relentless pursuit of
                  excellence. Be part of a journey that matters, where your contributions
                  directly impact global well-being.
                </p>
              </div>
            </div>
          </div>

          {/* Employee Recognition Header */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start mt-16 mb-6">
            <div className="shrink-0 lg:w-[42%]">
              <h3 className="ca-anim ca-left text-3xl md:text-4xl font-semibold text-dark leading-snug">
                Employee Recognition
              </h3>
            </div>
            <div className="flex-1 flex items-center">
              <p className="ca-anim ca-right text-gray-500 text-[14px] leading-[1.8]">
                Great work doesn't fade into the background here. It's recognized, championed, and celebrated.
              </p>
            </div>
          </div>

          {/* 6 Expanding Accordion Panels (Desktop Only) */}
          <div
            className="hidden md:flex gap-3 h-[400px] mt-12"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setActiveCareersPanel(0);
            }}
          >
            {careersSlides.map((slide, index) => (
              <div
                key={slide.title}
                className="ca-anim ca-up relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  flex: activeCareersPanel === index ? 3 : 0.8,
                  minWidth: 0,
                  transition: 'flex 0.5s ease',
                }}
                onMouseEnter={() => setActiveCareersPanel(index)}
              >
                <img
                  src={`/assets/recognitionimage${index + 1}.jpg`}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Employee Recognition Horizontal Slider (Mobile Only) */}
          <div
            className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory mt-8 pb-2 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            <style>{`
              .scrollbar-none::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {careersSlides.map((slide, index) => (
              <div
                key={slide.title}
                className="ca-anim ca-up flex-shrink-0 snap-center rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                style={{ width: '320px', height: '220px' }}
              >
                <img
                  src={`/assets/recognitionimage${index + 1}.jpg`}
                  alt={slide.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="ca-anim ca-up p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] flex items-center justify-center">
                  <i className="fa-solid fa-rotate text-white text-sm"></i>
                </div>
                <h3 className="text-[15px] font-bold text-dark">
                  Innovate{' '}
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Healthcare</span>
                </h3>
              </div>
              <p className="text-gray-400 text-[13px] leading-[1.7]">
                Your career has no boundaries at Getmeds. Leverage our global footprint to build a fulfilling
                legacy in an environment that rewards merit and thrives on lifelong learning. We provide the
                experiences you need to become a leader of tomorrow.
              </p>
            </div>

            <div className="ca-anim ca-up ca-d2 p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] flex items-center justify-center">
                  <i className="fa-solid fa-paper-plane text-white text-sm"></i>
                </div>
                <h3 className="text-[15px] font-bold text-dark">
                  Empower{' '}
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Yourself</span>
                </h3>
              </div>
              <p className="text-gray-400 text-[13px] leading-[1.7]">
                Break boundaries, not just ground. At Getmeds, we encourage you to look beyond your role and
                lead with thoughtful, decisive action. Your fresh perspectives are exactly what fuel our next
                breakthrough.
              </p>
            </div>

            <div className="ca-anim ca-up ca-d4 p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] flex items-center justify-center">
                  <i className="fa-solid fa-people-group text-white text-sm"></i>
                </div>
                <h3 className="text-[15px] font-bold text-dark">
                  Grow{' '}
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">With Us</span>
                </h3>
              </div>
              <p className="text-gray-400 text-[13px] leading-[1.7]">
                Success is a team sport at Getmeds. We've built a culture of radical transparency and
                professional support, ensuring you have a team that stands behind you — no matter the challenge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONVENTIONS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ca-anim ca-up text-center max-w-3xl mx-auto mb-14">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg block mb-4">Industry Engagement</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">
              Conventions We've Been Part Of
            </h2>
            <p className="text-gray-500 text-[15px]">Our team regularly represents Getmeds at leading local and
              international medical conventions, building partnerships that expand access to care.</p>
          </div>

          <span className="ca-anim ca-up inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-sm font-semibold rounded-full px-4 py-1.5 mb-6">Local</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            <div className="ca-anim ca-up bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionfirst.jpg"
                  alt="Philippine Society of Medical Oncology"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">Philippine Society of Medical Oncology</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Engaged with the country's leading oncology
                  professionals to support better access to cancer care and treatment solutions.</p>
              </div>
            </div>

            <div className="ca-anim ca-up ca-d1 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionsecond.JPG"
                  alt="Philippine Society of Hematology and Blood Transfusion Annual Convention"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">Philippine Society of Hematology and Blood
                  Transfusion Annual Convention</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Connected with hematology experts to advance
                  patient access to therapies for blood disorders and related conditions.</p>
              </div>
            </div>

            <div className="ca-anim ca-up ca-d2 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionthird.jpg"
                  alt="ASEAN Congress of Anesthesiologists"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">ASEAN Congress of Anesthesiologists</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Strengthened regional partnerships with
                  anesthesiology professionals while showcasing Getmeds' healthcare solutions.</p>
              </div>
            </div>

            <div className="ca-anim ca-up ca-d3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionfourth.JPG"
                  alt="Philippine Society of Anesthesiologist Annual Convention"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">Philippine Society of Anesthesiologist
                  Annual Convention</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Collaborated with anesthesiologists
                  nationwide to promote accessible and reliable healthcare solutions for patients.</p>
              </div>
            </div>

            <div className="ca-anim ca-up ca-d4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionfifth.jpg"
                  alt="Society of Gynecologic Oncologists of the Philippines (SGOP) Annual Convention"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">Society of Gynecologic Oncologists of the
                  Philippines (SGOP) Annual Convention</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Demonstrated Getmeds' dedication to
                  advancing care for women through collaboration with gynecologic oncology specialists.</p>
              </div>
            </div>

            <div className="ca-anim ca-up ca-d5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventioneight.jpg"
                  alt="Philippine College of Radiology Annual Convention"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">Philippine College of Radiology Annual
                  Convention</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Collaborated with radiology professionals
                  to advance diagnostic imaging and support improved patient care through high-quality contrast
                  media solutions.</p>
              </div>
            </div>
          </div>

          <span className="ca-anim ca-up inline-block bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-sm font-semibold rounded-full px-4 py-1.5 mb-6">International</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ca-anim ca-up ca-d6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionsixth.DNG"
                  alt="CPHI"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                  <h4 className="text-[15px] font-semibold text-dark">CPHI</h4>
                  <span className="text-[11px] text-gray-400">
                    {['Southeast Asia', 'Korea', 'Japan', 'America', 'India', 'Europe', 'China'].join(' · ')}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed">Strengthened global pharmaceutical
                  partnerships and explored innovative healthcare solutions through one of the world's leading pharma
                  exhibitions.</p>
              </div>
            </div>

            <div className="ca-anim ca-up ca-d7 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                <img
                  src="/assets/conventionsevent.jpg"
                  alt="IPHEX"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-dark mb-2">IPHEX</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">Connected with international pharmaceutical
                  manufacturers to expand collaboration and improve access to quality medicines in the Philippines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHARMACEUTICAL INTERNSHIP SECTION */}
      <section className="py-12 px-0 md:px-6">
        <div className="relative max-w-7xl mx-auto rounded-none md:rounded-3xl overflow-hidden pb-10" style={{ background: 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #c8e8f5 45%, #1D9FDA 100%)' }}>

          {/* Glassy decorative circles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute rounded-full" style={{ width: 220, height: 220, top: '-60px', left: '-50px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)' }} />
            <div className="absolute rounded-full" style={{ width: 140, height: 140, top: '30px', right: '10%', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }} />
            <div className="absolute rounded-full" style={{ width: 90, height: 90, top: '55%', left: '8%', background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)' }} />
            <div className="absolute rounded-full" style={{ width: 180, height: 180, bottom: '-50px', right: '-40px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.28)' }} />
            <div className="absolute rounded-full" style={{ width: 60, height: 60, bottom: '25%', left: '40%', background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.45)' }} />
            <div className="absolute rounded-full" style={{ width: 110, height: 110, top: '40%', right: '25%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }} />
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start justify-between px-8 pt-10 pb-8 gap-6 md:gap-10">
            <div className="md:w-1/2">
              <span className="text-white font-bold uppercase tracking-widest text-[13px] inline-block mb-3 ca-anim ca-left">Internship Program</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight ca-anim ca-up">
                Pharmaceutical Internship
              </h2>
            </div>
            <div className="md:w-1/2 ca-anim ca-right mt-2 md:mt-0">
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Step into a journey where your work touches real lives. Guided by experienced pharmacists across regulatory affairs, business development, and community pharmacy, you'll gain hands-on experience in healthcare that goes far beyond theory.
              </p>
            </div>
          </div>

          <div
            className="px-8 pb-2 flex gap-4 overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            {[1, 2, 3, 4, 5, 6].map((n, i) => (
              <div
                key={n}
                className={`ca-anim ca-up ca-d${i} flex-shrink-0 snap-center rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group`}
                style={{ width: '320px', height: '220px' }}
              >
                <img
                  src={`/assets/${n}.png`}
                  alt={`Internship ${n}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="ca-anim ca-left flex-1">
              <i className="fa-solid fa-quote-left text-[#1D9FDA] text-4xl mb-6 block"></i>
              <blockquote className="text-[20px] md:text-[24px] font-bold text-dark leading-snug mb-6">
                Join a culture where your growth is measured by the lives we touch.
              </blockquote>
              <div>
                <p className="text-dark font-bold text-[14px]">Naresh Bishnoi</p>
                <p className="text-gray-400 text-[12px]">Founder, Getmeds Philippines Inc - 2MG Inc.</p>
              </div>
            </div>
            <div className="ca-anim ca-right ca-d2 w-52 h-52 md:w-64 md:h-64 flex-shrink-0">
              <LinkableImage link={getImageLink('Naresh Bishnoi Careers Quote Image')} src={getImage('Naresh Bishnoi Careers Quote Image', 'assets/CEO.jpg')} alt="Naresh Bishnoi, Founder"
                className="w-full h-full object-cover rounded-full shadow-xl border-4 border-white ring-2 ring-gray-100" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ca-anim ca-zoom bg-gradient-to-r from-[#1D9FDA] to-[#0D99FF] rounded-2xl px-8 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-white font-bold text-[20px] md:text-[22px] mb-2">Ready to lead the future of
                medicine?</h3>
              <p className="text-white/80 text-[13px] leading-relaxed max-w-xl">
                Join a global team where your expertise meets a higher purpose. Explore how our collaborative
                culture and rapid scale can accelerate your professional journey.
              </p>
            </div>
            <a href="#join-form"
              className="flex-shrink-0 bg-dark hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl text-[13px] transition whitespace-nowrap shadow-md">
              Explore Your Future Roles
            </a>
          </div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      {(!loading && jobs.length === 0) ? null : (
        <section id="join-form" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="ca-anim ca-up text-center mb-14">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg block mb-4">Open Positions</span>
              <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-3">Join Our Team</h2>
              <p className="text-gray-400 text-[14px] max-w-xl mx-auto leading-relaxed">
                Discover exciting opportunities to grow your career with us. We are looking for passionate
                individuals to join our mission-driven team.
              </p>
            </div>

            <div className={`grid grid-cols-1 ${jobs.length === 1 ? 'lg:grid-cols-1 max-w-md mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
              {loading ? (
                <p className="text-gray-400 text-center col-span-full">Loading positions...</p>
              ) : jobs.length === 0 ? (
                <p className="text-gray-400 text-center col-span-full">No open positions at the moment.</p>
              ) : (
                jobs.map((job, idx) => {
                  const posType = getPositionType(job.job_title || '', job.job_description_text || '');
                  return (
                    <div key={job.id || idx} className={`ca-anim ca-up ca-d${(idx % 5) + 1} border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300 flex flex-col w-full`}>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[12px] font-semibold text-gray-400 tracking-widest">{job.job_type || posType}</span>
                        {job.location && (
                          <>
                            <span className="text-gray-300 text-[10px]">•</span>
                            <span className="text-[12px] font-semibold text-[#1D9FDA] tracking-wider">{job.location}</span>
                          </>
                        )}
                      </div>
                      <h4 className="text-[16px] font-semibold text-dark mb-3">{job.job_title}</h4>
                      <p className="text-gray-400 text-[12.5px] leading-[1.7] mb-5 flex-1 line-clamp-3">
                        {job.job_description_text || 'No description available.'}
                      </p>
                      <button
                        onClick={() => { setApplyingFor(job.job_title); setApplyModalOpen(true); setJobDescOpen(true); }}
                        className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-[11px] font-bold px-5 py-2 rounded-full tracking-wider hover:opacity-90 transition self-start"
                      >
                        APPLY NOW
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <div id="footer-container" />

      {/* ── Careers Success Modal ── */}
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
                <h2 className="text-[19px] font-semibold text-gray-900 mb-4 leading-snug">Thank you for your interest in Getmeds.</h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Our HR team will review your application and reach out shortly regarding next steps. For urgent concerns, please call{' '}
                  <a href="tel:+639171545029" className="text-[#1D9FDA] font-semibold hover:underline">+63 917 154 5029</a>.
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

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${applyModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { setApplyModalOpen(false); setJobDescOpen(false); }}
      />

      {/* Job Description Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:top-4 md:right-4 h-[calc(100vh-2rem)] w-full md:w-[calc(100%-2rem)] max-w-full md:max-w-md bg-white shadow-2xl rounded-t-[20px] md:rounded-[15px] z-[65] transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto flex flex-col ${jobDescOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-[calc(100%+2rem)]'}`}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
        </div>
        {/* Sticky header — always visible, scrollbar space reserved */}
        <div className="sticky top-0 z-10 bg-white rounded-t-[20px] md:rounded-t-[15px] flex items-center justify-between px-8 pt-4 md:pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent block mb-1">Job Description</span>
            <h2 className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight">{activeJob?.job_title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-block text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                {activeJob ? (activeJob.job_type || getPositionType(activeJob.job_title || '', activeJob.job_description_text || '')) : 'Full Time'}
              </span>
              {activeJob?.location && (
                <>
                  <span className="text-gray-300 text-[10px]">•</span>
                  <span className="inline-block text-[11px] font-semibold text-[#1D9FDA] tracking-wider uppercase">
                    {activeJob.location}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => { setJobDescOpen(false); setApplyModalOpen(false); }}
            className="shrink-0 text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Scrollable content with right padding for scrollbar */}
        <div className="flex-1 px-8 pr-14 pb-8 overflow-y-auto">
          {activeJob && (
            <div className="space-y-6 pt-6">
              <div
                className="job-desc-content text-[13.5px] text-gray-500 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: activeJob.job_description_html || '<p class="text-gray-400 italic">No job description provided.</p>'
                }}
              />
              <div className="pt-2 pb-4">
                <button
                  onClick={() => {
                    setJobDescOpen(false);
                    setTimeout(() => {
                      const modal = document.getElementById('apply-form-modal');
                      if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all text-[13px] flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Fill Out Application</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Application Drawer */}
      <div
        id="apply-form-modal"
        className={`fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:top-4 md:right-4 h-[calc(100vh-2rem)] w-full md:w-[calc(100%-2rem)] max-w-full md:max-w-md bg-white shadow-2xl rounded-t-[20px] md:rounded-[15px] z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto ${applyModalOpen && !jobDescOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-[calc(100%+2rem)]'}`}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <div className="p-8 pt-4 md:pt-8">
          {/* Header row — title + X aligned */}
          <div className="flex items-center justify-between mb-1 mt-2">
            <h2 className="text-[24px] font-bold text-slate-900 leading-tight tracking-tight">Apply for this Position</h2>
            <button
              onClick={() => { setApplyModalOpen(false); setJobDescOpen(false); }}
              className="shrink-0 ml-3 text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-primary mb-3">{applyingFor}</h3>
            <button
              type="button"
              onClick={() => setJobDescOpen(true)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-primary transition-colors mb-3 group"
            >
              <i className="fa-solid fa-arrow-left text-[11px] text-gray-400 group-hover:text-primary transition-colors"></i>
              <span>View Job Description</span>
            </button>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Fill out the form below and our HR team will get back to you as soon as possible.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Juan Dela Cruz"
                value={applyForm.name}
                onChange={e => setApplyForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input type="email" required placeholder="e.g. juan@email.com"
                value={applyForm.email}
                onChange={e => setApplyForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" inputMode="numeric" required placeholder="e.g. +63 912 345 6789"
                value={applyForm.phone}
                onChange={e => setApplyForm(prev => ({ ...prev, phone: e.target.value.replace(/[^\d+\s\-()]/g, '') }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Position Applying For</label>
              <input type="text" readOnly value={applyingFor}
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-[13px] text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cover Letter / Message <span className="text-red-500">*</span></label>
              <textarea required rows={4}
                value={applyForm.message}
                onChange={e => setApplyForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] resize-none placeholder-gray-400"
                placeholder="Tell us why you're a great fit for this role."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Upload Resume <span className="text-red-500">*</span></label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer py-5 px-4 gap-2">
                <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-400"></i>
                <span className="text-[12px] text-gray-500 font-medium">Click to upload or drag and drop</span>
                <span className="text-[11px] text-gray-400">PDF, DOC, DOCX, PNG, JPG (max 10MB)</span>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64String = (event.target?.result as string).split(',')[1];
                        setApplyForm(prev => ({
                          ...prev,
                          resumeName: file.name,
                          resumeType: file.type,
                          resumeBase64: base64String
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {applyForm.resumeName && (
                  <span className="text-[11px] text-primary font-semibold mt-1">
                    <i className="fa-solid fa-paperclip mr-1"></i>{applyForm.resumeName}
                  </span>
                )}
              </label>
            </div>
            <div className="pt-2 pb-8">
              <button
                type="submit"
                disabled={submitState === 'sending'}
                className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
              >
                <span>{submitState === 'sending' ? 'Sending...' : submitState === 'sent' ? '✓ Applied Successfully!' : submitState === 'error' ? 'Failed. Try Again' : 'Send Application'}</span>
                {submitState === 'idle' && <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Careers;
