import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';

const Careers: React.FC = () => {
  const { getImage } = useImageMapper('careers');
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
              <span className="inline-block bg-[#E8F5E3] text-[#61A644] text-[11px] font-bold px-4 py-1.5 rounded-full mb-5 tracking-wider">
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
            <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Career Advantages</span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
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

      {/* JOB LISTINGS + APPLICATION FORM */}
      <section id="join-form" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[28px] md:text-[34px] font-extrabold text-dark mb-3">Join Our Team</h2>
            <p className="text-gray-400 text-[14px] max-w-xl mx-auto leading-relaxed">
              Discover exciting opportunities to grow your career with us. We are looking for passionate
              individuals to join our mission-driven team.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Job Listings */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
              <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full time</span>
                <h4 className="text-[16px] font-extrabold text-dark mb-3">Marketing Advisor</h4>
                <p className="text-gray-400 text-[12.5px] leading-[1.7] mb-5">
                  Drive our brand growth by developing innovative marketing strategies. Analyze market trends
                  and help connect our healthcare solutions with those who need them most.
                </p>
                <button className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-[11px] font-bold px-5 py-2 rounded-full tracking-wider hover:opacity-90 transition">
                  APPLY NOW
                </button>
              </div>

              <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full time</span>
                <h4 className="text-[16px] font-extrabold text-dark mb-3">Supervisor</h4>
                <p className="text-gray-400 text-[12.5px] leading-[1.7] mb-5">
                  Lead and inspire our daily operations team. Ensure seamless service delivery, manage staff
                  performance, and uphold our high standards of healthcare excellence.
                </p>
                <button className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-[11px] font-bold px-5 py-2 rounded-full tracking-wider hover:opacity-90 transition">
                  APPLY NOW
                </button>
              </div>

              <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full time</span>
                <h4 className="text-[16px] font-extrabold text-dark mb-3">Field Agent</h4>
                <p className="text-gray-400 text-[12.5px] leading-[1.7] mb-5">
                  Be the face of Getmeds in the community. Handle local deliveries, assist with on-site
                  customer inquiries, and ensure timely distribution of medical supplies.
                </p>
                <button className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-[11px] font-bold px-5 py-2 rounded-full tracking-wider hover:opacity-90 transition">
                  APPLY NOW
                </button>
              </div>

              <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full time</span>
                <h4 className="text-[16px] font-extrabold text-dark mb-3">Receptionist</h4>
                <p className="text-gray-400 text-[12.5px] leading-[1.7] mb-5">
                  Create a welcoming first impression for our clients. Manage front-desk operations, handle
                  patient inquiries, and coordinate appointments with empathy and professionalism.
                </p>
                <button className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white text-[11px] font-bold px-5 py-2 rounded-full tracking-wider hover:opacity-90 transition">
                  APPLY NOW
                </button>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:w-[340px] flex-shrink-0">
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm sticky top-24">
                <div className="bg-dark text-white px-6 py-4">
                  <h4 className="text-[15px] font-bold text-center">Join Our Team</h4>
                </div>
                <div className="p-6 space-y-3 bg-white">
                  <input type="text" placeholder="Your Name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder-gray-300" />
                  <input type="email" placeholder="Your Email"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder-gray-300" />
                  <input type="text" placeholder="Your Position"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder-gray-300" />
                  <textarea placeholder="Enter Your Message" rows={4}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder-gray-300 resize-none"></textarea>
                  <button className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white font-bold py-3 rounded-lg text-[13px] transition mt-1">
                    Send Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />
    </div>
  );
};

export default Careers;
