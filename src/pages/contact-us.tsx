import React, { useEffect } from 'react';

export default function ContactUs() {
  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('public/components/navbar.html')
        .then(r => r.text())
        .then(html => { navContainer.innerHTML = html; });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('public/components/footer.html')
        .then(r => r.text())
        .then(html => { footerContainer.innerHTML = html; });
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Contact Us Hero Section */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-6 max-w-[1600px]">
        <div
          className="relative rounded-[1.5rem] border border-gray-100/20 overflow-hidden min-h-[450px] md:min-h-[500px] flex items-end shadow-sm">
          {/* Background Image */}
          <img src="assets/contactushero.png" alt="Contact Us" data-json-src="hero.image" data-json-alt="hero.imageAlt"
            className="absolute inset-0 w-full h-full object-cover object-[85%_center] md:object-center" />
          {/* Overlay for readability */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-[100%] md:w-[70%] z-0">
          </div>

          {/* Floating Email */}
          <div
            className="absolute top-[12%] right-[25%] md:top-[18%] md:right-[30%] lg:right-[25%] flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl w-12 h-12 md:w-[70px] md:h-[70px] animate-float-1 z-20 transition-transform cursor-pointer hover:bg-white/30">
            <i className="fa-solid fa-envelope text-white text-xl md:text-3xl drop-shadow-md"></i>
          </div>

          {/* Floating Phone */}
          <div
            className="absolute top-[40%] right-[2%] md:top-[45%] md:right-[6%] lg:right-[8%] flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl w-10 h-10 md:w-[60px] md:h-[60px] animate-float-2 z-20 transition-transform cursor-pointer hover:bg-white/30">
            <i className="fa-solid fa-phone-volume text-white text-lg md:text-2xl drop-shadow-md"></i>
          </div>

          {/* Floating Chat */}
          <div
            className="absolute top-[25%] left-[5%] md:top-[60%] md:left-[auto] md:right-[22%] lg:right-[25%] flex items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-[20px] w-14 h-14 md:w-[84px] md:h-[84px] animate-float-3 z-20 transition-transform cursor-pointer hover:bg-white/30">
            <i className="fa-solid fa-comments text-white text-2xl md:text-[38px] drop-shadow-md"></i>
          </div>

          <div className="relative z-10 w-full px-8 md:px-14 pb-12 md:pb-16 pt-20 max-w-4xl">
            <h1 className="text-[28px] md:text-[38px] leading-tight font-bold mb-3 tracking-tight">
              <span className="text-white" data-json="hero.headingLine1">Get in Touch</span><br />
              <span data-json="hero.headingAccent"
                className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-sm">
                CONTACT US
              </span>
            </h1>
            <p data-json="hero.description" className="text-white/90 text-[13px] md:text-[14px] max-w-[650px] mb-5 leading-relaxed font-normal">
              We'd love to hear from you. Whether you have a question about services, pricing, need a
              consultation, or
              anything else, our team is ready to answer all your questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 mb-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* Left Info Area */}
          <div className="w-full lg:w-[45%] lg:pt-2">
            <span data-json="info.tagline" className="text-gray-500 font-medium text-[13px] block mb-3 italic">I get in touch!</span>
            <h2 data-json="info.heading"
              className="text-3xl md:text-[36px] font-bold bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-5 leading-[1.15] tracking-tight">
              We are always ready to help you and answer your questions</h2>
            <p data-json="info.description" className="text-gray-500 text-[14px] mb-10 leading-relaxed max-w-[90%]">
              We're here to assist you and provide the answers you need. Your well-being is our priority, and
              we're just a message away.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
              {/* Call Center */}
              <div>
                <h4 data-json="info.items.0.label" className="font-bold text-dark text-base mb-2 hover:text-primary transition cursor-pointer">Call Center</h4>
                <p data-json="info.items.0.values.0" className="text-gray-500 text-[14px] mb-0.5 font-medium">800 188 975 20 34</p>
                <p data-json="info.items.0.values.1" className="text-gray-500 text-[14px] font-medium">+ (123) 1800-234-5678</p>
              </div>

              {/* Location */}
              <div>
                <h4 data-json="info.items.1.label" className="font-bold text-dark text-base mb-2 hover:text-primary transition cursor-pointer">Our location</h4>
                <p data-json="info.items.1.values.0" className="text-gray-500 text-[14px] mb-0.5 font-medium">USA, New York - 1080</p>
                <p data-json="info.items.1.values.1" className="text-gray-500 text-[14px] font-medium">Str. First Avenue 1</p>
              </div>

              {/* Email */}
              <div>
                <h4 data-json="info.items.2.label" className="font-bold text-dark text-base mb-2 hover:text-primary transition cursor-pointer">Email</h4>
                <p data-json="info.items.2.values.0" className="text-gray-500 text-[14px] font-medium">getmeds@mail.co</p>
              </div>

              {/* Social Network */}
              <div>
                <h4 data-json="info.items.3.label" className="font-bold text-dark text-base mb-2 hover:text-primary transition cursor-pointer">Social network</h4>
                <div className="flex space-x-4 items-center">
                  <a href="#" data-json-href="info.items.3.socials.0.href" title="Facebook"
                    className="text-[#1877F2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i
                      className="fa-brands fa-facebook"></i></a>
                  <a href="#" data-json-href="info.items.3.socials.1.href" title="Twitter"
                    className="text-[#1DA1F2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i
                      className="fa-brands fa-twitter"></i></a>
                  <a href="#" data-json-href="info.items.3.socials.2.href" title="LinkedIn"
                    className="text-[#0A66C2] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i
                      className="fa-brands fa-linkedin"></i></a>
                  <a href="#" data-json-href="info.items.3.socials.3.href" title="Telegram"
                    className="text-[#2AABEE] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i
                      className="fa-brands fa-telegram"></i></a>
                  <a href="#" data-json-href="info.items.3.socials.4.href" title="YouTube"
                    className="text-[#FF0000] hover:scale-110 transition-transform duration-300 text-[22px] drop-shadow-sm"><i
                      className="fa-brands fa-youtube"></i></a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Area */}
          <div
            className="w-full lg:w-[55%] bg-white rounded-3xl p-8 md:p-11 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/50">
            <h3 data-json="form.heading"
              className="text-[21px] font-bold bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-7 tracking-tight">
              Get in Touch with Us</h3>

            <form className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-[12px] font-bold text-gray-700">Full Name *</label>
                  <input type="text" placeholder="Type Full Name" data-json-placeholder="form.fields.0.placeholder"
                    className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[12px] font-bold text-gray-700">Email Address *</label>
                  <input type="email" placeholder="Type Email Address" data-json-placeholder="form.fields.1.placeholder"
                    className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-[12px] font-bold text-gray-700">Phone Number</label>
                  <input type="tel" placeholder="Type Phone Number" data-json-placeholder="form.fields.2.placeholder"
                    className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[12px] font-bold text-gray-700">Subject</label>
                  <div className="relative">
                    <select defaultValue=""
                      className="w-full bg-[#F4F6F9] rounded-xl px-4 py-3.5 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors text-gray-400 font-medium appearance-none cursor-pointer">
                      <option value="" disabled hidden>Select Subject</option>
                      <option value="general" className="text-gray-700">General Inquiry</option>
                      <option value="support" className="text-gray-700">Customer Support</option>
                      <option value="sales" className="text-gray-700">Sales &amp; Pricing</option>
                    </select>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <i className="fa-solid fa-chevron-down text-[10px]"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col space-y-2 pt-1">
                <label className="text-[12px] font-bold text-gray-700">Message</label>
                <textarea placeholder="Let us know how we can help you." data-json-placeholder="form.fields.4.placeholder" rows={4}
                  className="w-full bg-[#F4F6F9] rounded-xl px-4 py-4 text-[13px] outline-none border-2 border-transparent focus:border-primary/20 transition-colors placeholder-gray-400 font-medium resize-none"></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button type="button"
                  className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:from-[#1D9FDA] hover:to-[#61A644] text-white font-bold py-3.5 rounded-full text-[14px] transition shadow-md">
                  Submit
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
