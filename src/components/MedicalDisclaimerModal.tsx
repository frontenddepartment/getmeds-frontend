'use client';

/**
 * The Medical Disclaimer modal from getmeds_frontend/public/components/footer.html
 * (#medical-disclaimer-modal). Like the original it starts with the `hidden` class and
 * is shown/hidden by toggling that class on the element (window.closeDisclaimer closes
 * it), so any page script that opens it by id keeps working. Rendered once, by Footer.
 */

const GRADIENT_BTN = { background: 'linear-gradient(135deg, #61A644, #1D9FDA)' };
const SCROLL_STYLE = { scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' } as const;

function closeDisclaimer() {
  document.getElementById('medical-disclaimer-modal')?.classList.add('hidden');
}

export default function MedicalDisclaimerModal() {
  return (
    <div
      id="medical-disclaimer-modal"
      className="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDisclaimer();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-gray-900 uppercase tracking-wide">Medical Disclaimer</h2>
          <button
            type="button"
            onClick={closeDisclaimer}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-[13px] text-gray-600 leading-relaxed" style={SCROLL_STYLE}>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">About Getmeds</h3>
            <p>Getmeds is a fully-licensed pharmaceutical company operating as a wholesaler, importer, distributor, and retail pharmacy in the Philippines. As an FDA Philippines Licensed pharmaceutical company and member of the United Nations Global Compact, Getmeds is committed to safe, ethical, and compliant pharmaceutical operations across the full supply chain — from global sourcing to direct patient dispensing.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Educational Information Only</h3>
            <p>The information provided on the Getmeds website (getmeds.ph) — including product descriptions, therapeutic area content, blog articles, patient resources, and health awareness materials — is intended for educational and informational purposes only.</p>
            <p className="mt-2">Our content is designed to help patients, caregivers, healthcare professionals, hospitals, pharmacies, and pharmaceutical partners understand the medicines, therapies, and services Getmeds offers. It is not intended to diagnose, treat, cure, or prevent any disease or medical condition.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Not a Substitute for Professional Medical Advice</h3>
            <p>The information on the Getmeds website is not a substitute for professional medical advice, diagnosis, or treatment.</p>
            <p className="mt-2">Always consult a licensed healthcare professional — such as your doctor, oncologist, hematologist, pharmacist, or other qualified specialist — before:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Starting, stopping, or changing any medication</li>
              <li>Making decisions about your treatment plan</li>
              <li>Relying on any medical information for personal health decisions</li>
              <li>Interpreting symptoms, side effects, or drug interactions</li>
            </ul>
            <p className="mt-2">Never disregard, delay, or avoid seeking professional medical advice because of something you read on our website.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Prescription Medicines and Dispensing</h3>
            <p>As a licensed retail pharmacy and distributor, Getmeds dispenses many products that are prescription-only medicines (Rx) regulated by the Food and Drug Administration of the Philippines (FDA Philippines) under Republic Act No. 9711.</p>
            <p className="mt-2">Prescription medicines require:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>A valid prescription from a licensed healthcare professional</li>
              <li>Verification and dispensing by a Getmeds licensed pharmacist</li>
              <li>Compliance with applicable regulatory requirements (FDA, DOH, PDEA, PHAP Code of Practice)</li>
            </ul>
            <p className="mt-2">Product information provided on our website is intended to support informed conversations between patients, healthcare providers, and our pharmacists — not to serve as a self-diagnosis or self-prescribing resource.</p>
            <p className="mt-2">Our licensed pharmacists reserve the right to refuse or delay dispensing if a prescription is incomplete, expired, suspicious, or non-compliant with regulatory standards.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Wholesale, Import, and Distribution Services</h3>
            <p>For our hospital, institutional, pharmacy, and pharmaceutical partners, Getmeds operates as a licensed pharmaceutical wholesaler, importer, and distributor across the Philippines.</p>
            <p className="mt-2">Product information provided to institutional partners:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Is sourced from certified manufacturers and international suppliers with GMP issued by FDA Philippines</li>
              <li>Complies with FDA Philippines registration requirements (Certificate of Product Registration)</li>
              <li>Is verified through our regulatory affairs team</li>
              <li>Meets WHO Good Storage and Distribution Practices (GSDP) standards for handling and delivery</li>
            </ul>
            <p className="mt-2">For product data sheets, batch documentation, Certificate of Analysis, or other regulatory/related documents, hospital pharmacy committees and healthcare professionals may contact our regulatory affairs team directly at <a href="mailto:info@getmeds.ph" className="text-blue-600 hover:underline">info@getmeds.ph</a> and <a href="mailto:dra2@2mginc.com" className="text-blue-600 hover:underline">dra2@2mginc.com</a>.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Product and Content Accuracy</h3>
            <p>While Getmeds strives to provide accurate, current, and evidence-based information, we make no representation or warranty regarding the completeness, accuracy, reliability, or suitability of any content on this website for any specific purpose.</p>
            <p className="mt-2">Product information — including dosages, indications, side effects, packaging, and clinical guidance — may be updated without notice due to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Regulatory changes issued by FDA Philippines</li>
              <li>Manufacturer updates to product labeling and inserts</li>
              <li>New clinical evidence or scientific research</li>
              <li>Post-market surveillance findings</li>
            </ul>
            <p className="mt-2">Always refer to the official product insert, prescribing information, or your healthcare professional for the most current and accurate guidance.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Individual Medical Situations</h3>
            <p>Every patient is unique. Medical treatments, medicine dosages, and healthcare outcomes vary based on factors including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Age, weight, and overall health</li>
              <li>Medical history and existing conditions</li>
              <li>Concurrent medications and potential interactions</li>
              <li>Genetic factors and individual response to therapy</li>
            </ul>
            <p className="mt-2">Getmeds content cannot address individual medical situations. Only your treating healthcare provider can evaluate your specific condition and recommend appropriate care.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Emergency Medical Situations</h3>
            <p>In case of a medical emergency, contact your nearest hospital, emergency medical service, or call the Philippine emergency hotline (911) immediately.</p>
            <p className="mt-2">Getmeds is not an emergency medical service. Our website, inquiry forms, and communication channels are not monitored for emergencies and should not be used to report or address urgent medical situations.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Third-Party Content and Links</h3>
            <p>The Getmeds website may include links to third-party websites, government agencies, healthcare organizations, or clinical resources for informational purposes. Getmeds is not responsible for the accuracy, completeness, or currency of content on external websites.</p>
            <p className="mt-2">Any reliance on third-party medical information is at your own risk.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Regulatory Compliance</h3>
            <p>Getmeds operates as a fully-licensed pharmaceutical wholesaler, importer, distributor, and retail pharmacy in compliance with applicable Philippine pharmaceutical regulations, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Republic Act No. 9711 — Food and Drug Administration Act of 2009 (FDA Philippines LTO for wholesale, distribution, and retail)</li>
              <li>Republic Act No. 10918 — Philippine Pharmacy Act of 2016</li>
              <li>Republic Act No. 6675 — Generics Act of 1988</li>
              <li>Republic Act No. 9502 — Universally Accessible Cheaper and Quality Medicines Act</li>
              <li>PHAP Code of Practice on ethical pharmaceutical marketing and operations</li>
              <li>PDEA regulations for controlled substances (S-2, S-3, S-4, S-5 licensing)</li>
              <li>Bureau of Customs (BOC) and EDPMS regulations for pharmaceutical imports</li>
              <li>WHO Good Storage and Distribution Practices (GSDP) for supply chain integrity</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Acknowledgment</h3>
            <p>By using the Getmeds website, you acknowledge that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You have read and understood this Medical Disclaimer</li>
              <li>You will not rely on Getmeds content as medical advice</li>
              <li>You will consult qualified healthcare professionals for all medical decisions</li>
              <li>You understand that Getmeds is a pharmaceutical wholesaler, importer, distributor, and retail pharmacy — not a medical provider or clinical service</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Contact Us</h3>
            <p>For questions about this Medical Disclaimer or the information on our website, please contact:</p>
            <p className="mt-2">
              Getmeds<br />
              Unit 301 &amp; 305, 17 Vatican Building<br />
              Vatican Drive, BF Resort Village<br />
              Las Piñas City, Metro Manila 1747, Philippines<br />
              <a href="tel:+639190769105" className="text-blue-600 hover:underline">+63 919 076 9105</a><br />
              <a href="mailto:info@getmeds.ph" className="text-blue-600 hover:underline">info@getmeds.ph</a><br />
              <a href="https://getmeds.ph" className="text-blue-600 hover:underline">getmeds.ph</a>
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={closeDisclaimer}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={GRADIENT_BTN}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
