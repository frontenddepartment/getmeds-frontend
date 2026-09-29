'use client';

/**
 * The modals footer.html carried on every page, with the same element ids, the same
 * starting `hidden` class, and the same open/close mechanism: each is shown by removing
 * `hidden` from the element and closed by adding it back, through the same window
 * functions footer.html defined (closeDisclaimer, openDynamicPolicyModal,
 * closeDynamicPolicyModal, closeProductDisclaimer, closePrivacyPolicy,
 * closeTermsOfService, closePrescriptionPolicy, closeShippingDeliveryPolicy,
 * closeReturnRefundPolicy). Pages that open one by id (order-medicines opens
 * #privacy-policy-modal) behave as they did.
 *
 * React never re-renders these after mount (no props or state feed them), so the class
 * toggling done here and by page code is never overwritten.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MedicalDisclaimerModal from '@/components/MedicalDisclaimerModal';

const GRADIENT_BTN = { background: 'linear-gradient(135deg, #61A644, #1D9FDA)' };
const SCROLL_STYLE = { scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' } as const;
const OVERLAY_CLS = 'hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
const HEADER_CLS = 'flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0';
const TITLE_CLS = 'text-[15px] font-semibold text-gray-900 uppercase tracking-wide';
const CLOSE_CLS = 'w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition';
const BODY_CLS = 'overflow-y-auto px-6 py-5 space-y-5 text-[13px] text-gray-600 leading-relaxed';
const FOOTER_CLS = 'px-6 py-4 border-t border-gray-100 flex-shrink-0';
const UNDERSTAND_CLS = 'w-full py-2.5 rounded-xl text-sm font-semibold text-white transition';

const PRODUCT_DISCLAIMER_KEY = 'gmeds_product_disclaimer_seen';

function hide(id: string) {
  document.getElementById(id)?.classList.add('hidden');
}

function closeProductDisclaimer() {
  hide('product-disclaimer-modal');
  sessionStorage.setItem(PRODUCT_DISCLAIMER_KEY, '1');
}

type ModalWindow = Window & {
  closeDisclaimer?: () => void;
  closeDynamicPolicyModal?: () => void;
  openDynamicPolicyModal?: (title?: string, contentHtml?: string) => void;
  closeProductDisclaimer?: () => void;
  closePrivacyPolicy?: () => void;
  closeTermsOfService?: () => void;
  closePrescriptionPolicy?: () => void;
  closeShippingDeliveryPolicy?: () => void;
  closeReturnRefundPolicy?: () => void;
};

export function openDynamicPolicyModal(title?: string, contentHtml?: string) {
  const modal = document.getElementById('policy-dynamic-modal');
  const titleEl = document.getElementById('policy-dynamic-modal-title');
  const contentEl = document.getElementById('policy-dynamic-modal-content');
  if (modal && titleEl && contentEl) {
    titleEl.textContent = title || 'Policy';
    contentEl.innerHTML = contentHtml || '<p>No content available.</p>';
    modal.classList.remove('hidden');
  }
}

/** A simple footer.html policy modal: backdrop click and both buttons close it. */
function SimpleModal({ id, title, close, children }: { id: string; title: string; close: () => void; children: React.ReactNode }) {
  return (
    <div id={id} className={OVERLAY_CLS} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className={HEADER_CLS}>
          <h2 className={TITLE_CLS}>{title}</h2>
          <button type="button" onClick={close} className={CLOSE_CLS}>
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
        <div className={BODY_CLS} style={SCROLL_STYLE}>
          {children}
        </div>
        <div className={FOOTER_CLS}>
          <button type="button" onClick={close} className={UNDERSTAND_CLS} style={GRADIENT_BTN}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FooterModals() {
  const pathname = usePathname();

  // Window functions footer.html exposed.
  useEffect(() => {
    const w = window as ModalWindow;
    w.closeDisclaimer = () => hide('medical-disclaimer-modal');
    w.closeDynamicPolicyModal = () => hide('policy-dynamic-modal');
    w.openDynamicPolicyModal = openDynamicPolicyModal;
    w.closeProductDisclaimer = closeProductDisclaimer;
    w.closePrivacyPolicy = () => hide('privacy-policy-modal');
    w.closeTermsOfService = () => hide('terms-of-service-modal');
    w.closePrescriptionPolicy = () => hide('prescription-policy-modal');
    w.closeShippingDeliveryPolicy = () => hide('shipping-delivery-policy-modal');
    w.closeReturnRefundPolicy = () => hide('return-refund-policy-modal');
  }, []);

  // Auto-show the product disclaimer once per session on the product-range /
  // cancer-medicines listing pages (footer.html ran this on every page load).
  useEffect(() => {
    const path = (pathname || '').replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    if ((path === 'product-range' || path === 'cancer-medicines') && !sessionStorage.getItem(PRODUCT_DISCLAIMER_KEY)) {
      document.getElementById('product-disclaimer-modal')?.classList.remove('hidden');
    }
  }, [pathname]);

  return (
    <>
      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimerModal />

      {/* Generic Dynamic Policy Modal (used when displayMode in Sanity is set to 'modal') */}
      <div id="policy-dynamic-modal" className={OVERLAY_CLS}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className={HEADER_CLS}>
            <h2 id="policy-dynamic-modal-title" className={TITLE_CLS} suppressHydrationWarning>Policy</h2>
            <button type="button" onClick={() => hide('policy-dynamic-modal')} className={`${CLOSE_CLS} flex-shrink-0`}>
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
          <div
            id="policy-dynamic-modal-content"
            className="policy-html-content overflow-y-auto px-6 py-5 space-y-4 text-[13px] text-gray-700 leading-relaxed"
            style={SCROLL_STYLE}
            suppressHydrationWarning
          />
          <div className={FOOTER_CLS}>
            <button type="button" onClick={() => hide('policy-dynamic-modal')} className={UNDERSTAND_CLS} style={GRADIENT_BTN}>
              I Understand
            </button>
          </div>
        </div>
      </div>

      {/* Product Range Disclaimer Modal (auto-shown once per session on /product-range and /cancer-medicines) */}
      <SimpleModal id="product-disclaimer-modal" title="Medical and Regulatory Disclaimer" close={closeProductDisclaimer}>
        <p>Product information on this page is intended for educational purposes only. It does not constitute medical advice, a prescription, or an endorsement of any product for a specific condition. Prescription medicines require a valid prescription from a licensed physician. Self-medication is discouraged. Always seek guidance from a qualified healthcare professional before starting, changing, or stopping any treatment.</p>
        <p>All products listed are registered with the Philippine Food and Drug Administration (FDA). This content adheres to the PHAP Code of Practice and RA 9711 (FDA Act of 2009).</p>
      </SimpleModal>

      {/* Privacy Policy Modal */}
      <div id="privacy-policy-modal" className={OVERLAY_CLS} onClick={(e) => { if (e.target === e.currentTarget) hide('privacy-policy-modal'); }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
          <div className={HEADER_CLS}>
            <div>
              <h2 className={TITLE_CLS}>Privacy Policy</h2>
            </div>
            <button type="button" onClick={() => hide('privacy-policy-modal')} className={`${CLOSE_CLS} flex-shrink-0`}>
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
          <div className={BODY_CLS} style={SCROLL_STYLE}>
            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Introduction</h3>
              <p>Getmeds values your privacy and is committed to protecting the personal information of visitors, partners, healthcare professionals, and other stakeholders who interact with our website.</p>
              <p className="mt-2">This Privacy Policy explains how we collect, use, store, and protect personal information obtained through our website and related communications. Our practices comply with the Data Privacy Act of 2012 and other applicable data protection regulations.</p>
              <p className="mt-2">By accessing or using this website, you acknowledge and agree to the practices described in this Privacy Policy.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Information We Collect</h3>
              <p className="font-semibold text-gray-800 mb-1">Personal Information</p>
              <p>We may collect personal information that you voluntarily provide when contacting us or submitting inquiries through the website, including:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Company or organization name</li>
                <li>Professional affiliation (if applicable)</li>
                <li>Any information included in your message or inquiry</li>
              </ul>
              <p className="font-semibold text-gray-800 mt-4 mb-1">Non-Personal Information</p>
              <p>We may automatically collect certain technical information when you visit our website, including:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and browsing activity</li>
                <li>Date and time of access</li>
              </ul>
              <p className="mt-2">This information helps us improve website performance and user experience.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">How We Use Your Information</h3>
              <p>The information collected may be used for the following purposes:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>To respond to inquiries and requests for information</li>
                <li>To provide details about our pharmaceutical products and services</li>
                <li>To communicate with healthcare professionals, partners, and stakeholders</li>
                <li>To improve our website, services, and user experience</li>
                <li>To maintain security and prevent fraudulent activities</li>
                <li>To comply with applicable legal and regulatory obligations</li>
              </ul>
              <p className="mt-2">We ensure that personal data is processed only for legitimate and lawful purposes.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Sharing and Disclosure of Information</h3>
              <p>Getmeds does not sell, rent, or trade personal information to third parties.</p>
              <p className="mt-2">Personal information may be shared only when necessary with:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>Authorized employees and representatives of the company</li>
                <li>Service providers supporting website operations or communication systems</li>
                <li>Regulatory authorities or government agencies when required by law</li>
              </ul>
              <p className="mt-2">All parties receiving such information are required to maintain strict confidentiality and protect the data in accordance with applicable laws.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Cookies and Website Analytics</h3>
              <p>Our website may use cookies and similar technologies to enhance the browsing experience and analyze website usage. Cookies help us:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>Understand how visitors interact with our website</li>
                <li>Improve website functionality and performance</li>
                <li>Optimize content and navigation</li>
              </ul>
              <p className="mt-2">Users may modify their browser settings to disable cookies; however, some features of the website may not function properly if cookies are disabled.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Data Security</h3>
              <p>We implement appropriate technical and organizational security measures to safeguard personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              <p className="mt-2">While we strive to protect personal data, no electronic transmission or storage system can be guaranteed to be completely secure.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Data Subject Rights</h3>
              <p>In accordance with the Data Privacy Act of 2012, individuals whose personal information is processed have the following rights:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc">
                <li>Right to be informed</li>
                <li>Right to access personal information</li>
                <li>Right to correct inaccurate or incomplete data</li>
                <li>Right to object to data processing</li>
                <li>Right to request deletion or blocking of personal data</li>
                <li>Right to file a complaint with the appropriate regulatory authority</li>
              </ul>
              <p className="mt-2">Requests regarding personal data may be submitted through the contact details provided below.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Third-Party Links</h3>
              <p>Our website may contain links to external websites operated by third parties. These websites have their own privacy policies, and Getmeds is not responsible for their content or privacy practices.</p>
              <p className="mt-2">Users are encouraged to review the privacy policies of any external websites they visit.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Retention of Personal Data</h3>
              <p>Personal information will be retained only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Changes to This Privacy Policy</h3>
              <p>Getmeds reserves the right to update or modify this Privacy Policy at any time to reflect changes in legal requirements, company practices, or website functionality. Updates will be posted on this page with the revised effective date.</p>
            </section>

            <section>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Contact Information</h3>
              <p>For questions or requests regarding this Privacy Policy or the handling of personal data, you may contact:</p>
              <div className="mt-3 space-y-1">
                <p className="font-semibold text-gray-800">Getmeds</p>
                <p>Unit 301 &amp; 305, 17 Vatican Building, Vatican Drive, BF Resort Village, Las Piñas City, Philippines</p>
                <p>Email: <a href="mailto:info@getmeds.ph" className="text-[#1D9FDA] hover:underline">info@getmeds.ph</a></p>
                <p>Phone: <a href="tel:+639190769103" className="text-[#1D9FDA] hover:underline">+63 919 076 9103</a></p>
              </div>
            </section>
          </div>
          <div className={FOOTER_CLS}>
            <button type="button" onClick={() => hide('privacy-policy-modal')} className={UNDERSTAND_CLS} style={GRADIENT_BTN}>
              I Understand
            </button>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <SimpleModal id="terms-of-service-modal" title="Terms of Service" close={() => hide('terms-of-service-modal')}>
        <p>By accessing or using the Getmeds website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use this website.</p>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Use of Website</p>
          <p>This website is intended for informational purposes only. Content is provided for healthcare professionals, partners, and the general public seeking information about Getmeds and its pharmaceutical products. Unauthorized use, reproduction, or distribution of any content is strictly prohibited.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Intellectual Property</p>
          <p>All content on this website — including text, images, logos, and graphics — is the property of Getmeds and is protected under applicable intellectual property laws. No material may be copied, reproduced, or redistributed without prior written consent.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Disclaimer of Warranties</p>
          <p>The information on this website is provided &quot;as is&quot; without warranties of any kind. Getmeds makes no representations regarding the accuracy, completeness, or suitability of the content for any particular purpose.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Limitation of Liability</p>
          <p>Getmeds shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use this website or its content.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Governing Law</p>
          <p>These Terms of Service are governed by the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts of Las Piñas City, Metro Manila.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Changes to Terms</p>
          <p>Getmeds reserves the right to modify these Terms of Service at any time. Continued use of the website after any changes constitutes acceptance of the revised terms.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Contact Us</p>
          <p>For questions regarding these terms, contact us at <a href="mailto:info@getmeds.ph" className="text-[#1D9FDA] hover:underline">info@getmeds.ph</a> or call <a href="tel:+639190769103" className="text-[#1D9FDA] hover:underline">+63 919 076 9103</a>.</p>
        </div>
      </SimpleModal>

      {/* Prescription / Shipping & Delivery / Return & Refund modals: footer.html shipped these
          with an empty body (a TODO comment) — kept identical, including the empty <p>. */}
      <SimpleModal id="prescription-policy-modal" title="Prescription Policy" close={() => hide('prescription-policy-modal')}>
        <p></p>
      </SimpleModal>

      <SimpleModal id="shipping-delivery-policy-modal" title="Shipping & Delivery Policy" close={() => hide('shipping-delivery-policy-modal')}>
        <p></p>
      </SimpleModal>

      <SimpleModal id="return-refund-policy-modal" title="Return & Refund Policy" close={() => hide('return-refund-policy-modal')}>
        <p></p>
      </SimpleModal>
    </>
  );
}
