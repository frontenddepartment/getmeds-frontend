import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';

const JOB_LISTINGS = [
  {
    title: 'Human Resource Head',
    desc: 'Lead HR initiatives, talent acquisition, and employee development. Drive organizational culture and ensure compliance with Philippine labor laws.',
    responsibilities: [
      'Lead end-to-end recruitment, selection, and onboarding processes',
      'Develop and implement HR policies, procedures, and programs',
      'Manage employee relations, performance reviews, and career development plans',
      'Ensure compliance with Philippine Labor Code and DOLE regulations',
      'Drive organizational culture, engagement, and retention initiatives',
      'Partner with leadership on workforce planning and succession management',
    ],
    requirements: [
      "Bachelor's degree in Human Resources, Psychology, or related field",
      'Minimum 5 years of HR experience, at least 2 years in a leadership role',
      'Strong knowledge of Philippine Labor Code and employment regulations',
      'Excellent interpersonal, communication, and conflict-resolution skills',
      'Experience in the pharmaceutical or healthcare industry is a plus',
    ],
  },
  {
    title: 'B2B Telemarketer',
    desc: 'Build and maintain business relationships over the phone. Generate leads, present Getmeds products, and coordinate with the sales team to close deals.',
    responsibilities: [
      'Prospect and qualify new B2B leads through outbound calls and email',
      'Present Getmeds products and value propositions to potential clients',
      'Schedule meetings and product demos for the field sales team',
      'Maintain accurate CRM records of all client interactions and follow-ups',
      'Meet or exceed weekly and monthly lead generation targets',
      'Collaborate with the marketing team on campaign follow-ups',
    ],
    requirements: [
      "Bachelor's degree in Business, Marketing, or a related field",
      'At least 1 year of telemarketing or inside sales experience',
      'Strong verbal communication and persuasion skills',
      'Proficiency in CRM tools and MS Office',
      'Resilient, target-driven, and comfortable with high-volume calling',
    ],
  },
  {
    title: 'Government Bidding Associate',
    desc: 'Prepare and manage government procurement bid documents. Coordinate with agencies and ensure full compliance with PhilGEPS requirements.',
    responsibilities: [
      'Monitor and evaluate government procurement opportunities via PhilGEPS',
      'Prepare, compile, and submit complete bid documents and proposals',
      'Coordinate with internal teams to gather technical and financial bid requirements',
      'Liaise with government agencies for bid clarifications and post-award activities',
      'Maintain a tracker for all active, awarded, and pending bids',
      'Ensure adherence to RA 9184 (Government Procurement Reform Act)',
    ],
    requirements: [
      "Bachelor's degree in Business Administration, Public Administration, or related field",
      'At least 2 years of experience in government procurement or bidding',
      'Solid understanding of PhilGEPS processes and RA 9184',
      'Detail-oriented with strong document management skills',
      'Ability to work under tight deadlines and manage multiple submissions',
    ],
  },
  {
    title: 'Sales Admin Assistant',
    desc: 'Provide administrative support to the sales team. Handle order processing, documentation, and client coordination to keep operations running smoothly.',
    responsibilities: [
      'Process and monitor sales orders, delivery receipts, and invoices',
      'Maintain and update client databases, sales reports, and dashboards',
      'Coordinate with logistics, finance, and warehouse for order fulfillment',
      'Assist in preparing sales presentations, proposals, and quotations',
      'Handle client inquiries and escalate issues to the appropriate team',
      'Support the sales team with scheduling and administrative tasks',
    ],
    requirements: [
      "Bachelor's degree in Business Administration or a related course",
      '1–2 years of experience in sales administration or operations support',
      'Proficient in MS Excel, Word, and Google Workspace',
      'Strong organizational skills and high attention to detail',
      'Excellent written and verbal communication skills',
    ],
  },
  {
    title: 'Sales Manager (CLIP)',
    desc: 'Lead and manage the CLIP sales division. Develop strategies to grow market share and consistently achieve sales targets in the healthcare sector.',
    responsibilities: [
      'Develop and execute strategic sales plans for the CLIP product line',
      'Lead, coach, and motivate the CLIP sales team to hit monthly and quarterly targets',
      'Identify and pursue new business opportunities in the healthcare sector',
      'Build and nurture key accounts with hospitals, clinics, and distributors',
      'Analyze sales data to identify trends, gaps, and growth opportunities',
      'Report sales performance to senior management with actionable insights',
    ],
    requirements: [
      "Bachelor's degree in Business, Marketing, Pharmacy, or related field",
      'Minimum 5 years of pharmaceutical or healthcare sales experience',
      'At least 2 years in a managerial or team lead role',
      'Strong leadership, negotiation, and client-relationship skills',
      'Proven track record of achieving and exceeding sales targets',
    ],
  },
  {
    title: 'District Sales Manager',
    desc: 'Oversee sales operations within an assigned district. Coach field agents, monitor performance metrics, and drive revenue growth.',
    responsibilities: [
      'Manage and supervise field sales representatives across an assigned district',
      'Set individual and team sales targets aligned with company goals',
      'Conduct regular field visits, coaching sessions, and performance reviews',
      'Analyze district sales data and implement corrective action plans when needed',
      'Build and maintain relationships with key accounts and distributors in the district',
      'Report district performance and market intelligence to the national sales head',
    ],
    requirements: [
      "Bachelor's degree in Business, Marketing, or a related field",
      'Minimum 4 years of field sales experience in pharmaceuticals or FMCG',
      'At least 2 years of experience managing a sales team',
      'Strong analytical, leadership, and territory management skills',
      'Willingness to travel extensively within the assigned district',
    ],
  },
];

const Careers: React.FC = () => {
  const { getImage } = useImageMapper('careers');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyingFor, setApplyingFor] = useState('');
  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [jobDescOpen, setJobDescOpen] = useState(false);
  const activeJob = JOB_LISTINGS.find(j => j.title === applyingFor);

  // Navbar / Footer injection
  useEffect(() => {
    fetch('/components/navbar.html')
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('navbar-container');
        if (el) injectHTML(el, html);
      });
    fetch('/components/footer.html')
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById('footer-container');
        if (el) injectHTML(el, html);
      });
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* HERO SECTION */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-16 max-w-[1600px]">
        <div className="relative rounded-[1.5rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end bg-gray-100">
          <img src={getImage('assets/careershero.png', 'assets/careershero.png')} alt="Getmeds Team"
            className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="relative z-10 w-full px-8 md:px-14 pb-7 md:pb-8 pt-0">
            <div className="inline-block bg-black/60 backdrop-blur-md rounded-2xl px-10 py-9 max-w-[500px]">
              <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-4 tracking-tight">
                <span className="text-white">Join the Minds</span><br />
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                  Behind the Medicine
                </span>
              </h1>
              <p className="text-white/95 text-[14px] md:text-[15px] max-w-[420px] mb-6 leading-relaxed font-normal">
                Join our mission to make healthcare accessible worldwide. We're looking
                for passionate individuals to innovate and grow with us.
              </p>
              <a href="#join-form"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-semibold py-2.5 px-8 rounded-full text-[13px] inline-block transition shadow-lg">
                Read More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-8 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center">
            <div className="shrink-0 lg:w-[42%]">
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg block mb-4">
                Our Benefits
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-dark leading-snug">
                Getmeds Has Been Present For<br />
                Over A Decade In{' '}
                <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                  Healthcare
                </span>
              </h2>
            </div>
            <div className="flex-1 flex items-center">
              <div>
                <p className="text-gray-500 text-[14px] leading-[1.8] mb-4">
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

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] flex items-center justify-center">
                  <i className="fa-solid fa-rotate text-white text-sm"></i>
                </div>
                <h3 className="text-[15px] font-bold text-dark">
                  Innovate{' '}
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Healthcare</span>
                </h3>
              </div>
              <p className="text-gray-400 text-[13px] leading-[1.7] mb-5">
                Your career has no boundaries at Getmeds. Leverage our global footprint to build a fulfilling
                legacy in an environment that rewards merit and thrives on lifelong learning. We provide the
                experiences you need to become a leader of tomorrow.
              </p>
              <a href="#"
                className="mt-auto inline-flex items-center gap-1.5 text-[#61A644] text-[13px] font-semibold hover:gap-2.5 transition-all">
                Read more <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>

            <div className="p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] flex items-center justify-center">
                  <i className="fa-solid fa-paper-plane text-white text-sm"></i>
                </div>
                <h3 className="text-[15px] font-bold text-dark">
                  Empower{' '}
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Yourself</span>
                </h3>
              </div>
              <p className="text-gray-400 text-[13px] leading-[1.7] mb-5">
                Break boundaries, not just ground. At Getmeds, we encourage you to look beyond your role and
                lead with thoughtful, decisive action. Your fresh perspectives are exactly what fuel our next
                breakthrough.
              </p>
              <a href="#"
                className="mt-auto inline-flex items-center gap-1.5 text-[#61A644] text-[13px] font-semibold hover:gap-2.5 transition-all">
                Read more <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>

            <div className="p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] flex items-center justify-center">
                  <i className="fa-solid fa-people-group text-white text-sm"></i>
                </div>
                <h3 className="text-[15px] font-bold text-dark">
                  Grow{' '}
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">With Us</span>
                </h3>
              </div>
              <p className="text-gray-400 text-[13px] leading-[1.7] mb-5">
                Success is a team sport at Getmeds. We've built a culture of radical transparency and
                professional support, ensuring you have a team that stands behind you — no matter the challenge.
              </p>
              <a href="#"
                className="mt-auto inline-flex items-center gap-1.5 text-[#61A644] text-[13px] font-semibold hover:gap-2.5 transition-all">
                Read more <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1">
              <i className="fa-solid fa-quote-left text-[#1D9FDA] text-4xl mb-6 block"></i>
              <blockquote className="text-[20px] md:text-[24px] font-bold text-dark leading-snug mb-6">
                Join a culture where your growth is measured by the lives we touch.
              </blockquote>
              <div>
                <p className="text-dark font-bold text-[14px]">Naresh Bishnoi</p>
                <p className="text-gray-400 text-[12px]">Founder, Getmeds Inc.</p>
              </div>
            </div>
            <div className="w-52 h-52 md:w-64 md:h-64 flex-shrink-0">
              <img src={getImage('assets/CEO.jpg', 'assets/CEO.jpg')} alt="Naresh Bishnoi, Founder"
                className="w-full h-full object-cover rounded-full shadow-xl border-4 border-white ring-2 ring-gray-100" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#1D9FDA] to-[#0D99FF] rounded-2xl px-8 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
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

      {/* WHY PROFESSIONALS CHOOSE Getmeds */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg block mb-4">Career Advantages</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-4">
              Why professionals choose{' '}
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">Getmeds</span>?
            </h2>
            <p className="text-gray-500 text-[15px]">We provide more than just a job; we offer a path to excellence,
              innovation, and global impact in the healthcare industry.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-microscope text-2xl text-primary"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Major Portfolio</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">One of the largest Hematology &amp; Oncology
                portfolios in the Philippines.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-certificate text-2xl text-success"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Exclusive Products</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Exclusive CSP products available to Filipino
                patients only through Getmeds.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-route text-2xl text-[#8B5CF6]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Structured Path</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Structured Career Development Path within the
                first 6 months of joining.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-arrow-up-right-dots text-2xl text-[#F59E0B]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Fast Promotion</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Fast-track Promotions &amp; Annual Salary
                Increments for high performers.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-money-bill-trend-up text-2xl text-[#EF4444]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Top Compensation</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Competitive Compensation Package with
                Attractive Monthly Incentives.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-car-side text-2xl text-[#6366F1]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Company Car</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Free Company Car Program — vehicle ownership
                under the employee's name.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-plane-departure text-2xl text-[#06B6D4]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Travel Incentives</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">All-Expense-Paid International Travel
                Incentives after 2 years of service.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-heart-pulse text-2xl text-[#EC4899]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Wellness Focus</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Employee Wellness &amp; Meditation Programs to
                support mental health.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-award text-2xl text-[#EAB308]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Recognition</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Recognition, Awards, and Employee Engagement
                Initiatives year-round.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <i className="fa-solid fa-bolt-lightning text-2xl text-[#14B8A6]"></i>
              </div>
              <h4 className="text-[15px] font-bold text-dark mb-2">Growth Environment</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">Dynamic, high-performing, and growth-oriented
                work environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      <section id="join-form" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg block mb-4">Open Positions</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-dark mb-3">Join Our{' '}<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Team</span></h2>
            <p className="text-gray-400 text-[14px] max-w-xl mx-auto leading-relaxed">
              Discover exciting opportunities to grow your career with us. We are looking for passionate
              individuals to join our mission-driven team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOB_LISTINGS.map((job) => (
              <div key={job.title} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300 flex flex-col">
                <span className="text-[12px] font-semibold text-gray-400 tracking-widest block mb-2">Full Time</span>
                <h4 className="text-[16px] font-semibold text-dark mb-3">{job.title}</h4>
                <p className="text-gray-400 text-[12.5px] leading-[1.7] mb-5 flex-1">{job.desc}</p>
                <button
                  onClick={() => { setApplyingFor(job.title); setApplyModalOpen(true); setJobDescOpen(true); }}
                  className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-[11px] font-bold px-5 py-2 rounded-full tracking-wider hover:opacity-90 transition self-start"
                >
                  APPLY NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

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
                <h2 className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight">{activeJob?.title}</h2>
                <span className="inline-block text-[11px] font-semibold text-gray-400 tracking-wider mt-1">Full Time</span>
              </div>
              <button
                onClick={() => { setJobDescOpen(false); setApplyModalOpen(false); }}
                className="shrink-0 text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Scrollable content with right padding for scrollbar */}
            <div className="flex-1 px-8 pr-14 pb-8 overflow-y-auto">
              {activeJob && (
                <div className="space-y-6 pt-6">
                  <div>
                    <p className="text-[13.5px] text-gray-500 leading-relaxed">{activeJob.desc}</p>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-slate-800 mb-3">Key Responsibilities</h4>
                    <ul className="space-y-2">
                      {activeJob.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-500 leading-relaxed">
                          <i className="fa-solid fa-circle-check text-[#61A644] text-[11px] mt-[3px] shrink-0"></i>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-slate-800 mb-3">Qualifications & Requirements</h4>
                    <ul className="space-y-2">
                      {activeJob.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-500 leading-relaxed">
                          <i className="fa-solid fa-circle-check text-[#1D9FDA] text-[11px] mt-[3px] shrink-0"></i>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
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

          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setApplyModalOpen(false); setApplyForm({ name: '', email: '', phone: '', message: '' }); }}>
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
              <input type="tel" required placeholder="e.g. +63 912 345 6789"
                value={applyForm.phone}
                onChange={e => setApplyForm(prev => ({ ...prev, phone: e.target.value }))}
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
                    if (file) setApplyForm(prev => ({ ...prev, resumeName: file.name }));
                  }}
                />
                {(applyForm as any).resumeName && (
                  <span className="text-[11px] text-primary font-semibold mt-1">
                    <i className="fa-solid fa-paperclip mr-1"></i>{(applyForm as any).resumeName}
                  </span>
                )}
              </label>
            </div>
            <div className="pt-2 pb-8">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Send Application</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Careers;
