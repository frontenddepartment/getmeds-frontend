import React, { useEffect, useState, useRef } from 'react';
import { useProducts, useCategories, useImageMapper } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';
import type { Product as SanityProduct, Category } from '../types/sanity';
import { injectHTML } from '../lib/injectHTML';
import { getApiUrl } from '../lib/api';
import { setPageMeta } from '../lib/seo';
import { validateFiles, ALLOWED_FILE_TYPES_ACCEPT } from '../lib/fileUpload';
import { PortableText } from '@portabletext/react';

interface ProductWithCategory extends Omit<SanityProduct, 'category'> {
  category?: Category;
}

const formatFieldWithLineBreaks = (text: string | undefined | null) => {
  if (!text) return null;
  const parts = text.split(/\\n|\n/g);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part.trim()}
      {i < parts.length - 1 && <br />}
    </React.Fragment>
  ));
};

const renderRichContent = (val: any) => {
  if (!val) return null;
  if (Array.isArray(val)) {
    return <PortableText value={val} />;
  }
  return <React.Fragment>{formatFieldWithLineBreaks(val)}</React.Fragment>;
};

export default function ProductDetail() {
  const { getImage } = useImageMapper('product-range');
  const { data: productsDataRaw, loading: productsLoading } = useProducts();
  const productsData = productsDataRaw as ProductWithCategory[] | null;
  const { data: categoriesData } = useCategories();
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [descriptionTab, setDescriptionTab] = useState<'description' | 'prescription'>('description');

  const [zoomedImageOpen, setZoomedImageOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', message: '', age: '',
    address: '', contactName: '', contactRelationship: '', terms: false, privacyConsent: false
  });
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const ageDropdownRef = useRef<HTMLDivElement>(null);
  const [userTypeMenuOpen, setUserTypeMenuOpen] = useState(false);
  const userTypeMenuRef = useRef<HTMLDivElement>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [userType, setUserType] = useState<string>('');
  const [userTypeConfirmed, setUserTypeConfirmed] = useState(false);
  const [prescriptionRequiredModalOpen, setPrescriptionRequiredModalOpen] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  // Patient/Caregiver flow only — mirrors the Customer Information form on order-medicines.tsx
  const [patientIdFile, setPatientIdFile] = useState<File | null>(null);
  const [contactSameAsPatient, setContactSameAsPatient] = useState(false);
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [idRequiredModalOpen, setIdRequiredModalOpen] = useState(false);
  const [idModalVisible, setIdModalVisible] = useState(false);

  const USER_TYPE_LABELS: Record<string, string> = {
    patient:  'Patient / Caregiver',
    doctor:   'Doctor / Healthcare Professional',
    pharmacy: 'Pharmacy Owner / Retail Pharmacy',
    hospital: 'Hospital / Institution',
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ut = params.get('userType');
    if (ut) {
      setUserType(ut);
      setUserTypeConfirmed(true);
    }
  }, []);

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

  useEffect(() => {
    if (!ageDropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (ageDropdownRef.current && !ageDropdownRef.current.contains(e.target as Node)) {
        setAgeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [ageDropdownOpen]);

  useEffect(() => {
    if (!userTypeMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (userTypeMenuRef.current && !userTypeMenuRef.current.contains(e.target as Node)) {
        setUserTypeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userTypeMenuOpen]);

  // Excel rows often only populate brandName/genericName and leave `name` blank,
  // so every display spot needs the same brandName+genericName fallback chain.
  const getProductDisplayName = (p: ProductWithCategory) =>
    p.brandName && p.genericName && p.brandName !== p.genericName
      ? `${p.brandName} (${p.genericName})`
      : p.name || p.brandName || p.genericName || 'Product Details';

  // Conditions this product belongs under (primary subCategory + "Also Linked
  // From") come straight from the sheet now — see queries.ts `conditions`.
  const getProductSubcategories = (p: ProductWithCategory) =>
    p.conditions && p.conditions.length ? p.conditions : (p.subCategory ? [p.subCategory] : []);

  // Which condition the user was actually browsing under, so the badge and
  // breadcrumb agree with the listing page instead of always showing the
  // product's primary condition. Checked in order: explicit "?category="
  // link, then the cancer-medicines listing's saved `selectedCategory`
  // (localStorage) — same key cancer-medicines.tsx reads/writes.
  const getContextCondition = (p: ProductWithCategory) => {
    if (typeof window === 'undefined') return null;
    const subcats = getProductSubcategories(p);
    if (subcats.length === 0) return null;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
      const matched = subcats.find(s => s.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matched) return matched;
    }

    try {
      const saved = localStorage.getItem('selectedCategory');
      if (saved) {
        const savedObj = JSON.parse(saved) as { subCategory?: string };
        if (savedObj?.subCategory && savedObj.subCategory !== 'All') {
          const matched = subcats.find(s => s.toLowerCase() === savedObj.subCategory!.toLowerCase());
          if (matched) return matched;
        }
      }
    } catch {
      // Ignore malformed localStorage value
    }

    return null;
  };

  const getCategorizationDisplay = (p: ProductWithCategory) => {
    const contextCondition = getContextCondition(p);
    if (contextCondition) return contextCondition;

    const subcats = getProductSubcategories(p);
    if (subcats.length === 0) {
      return p.category?.category || 'General';
    }
    return subcats[0] || 'General';
  };

  // "Home > Category > Condition > Product" — precomputed in the sheet
  // (Breadcrumb (auto)). The Condition segment is swapped for the actual
  // browsing context (see getContextCondition) so it matches the badge above
  // instead of always showing the product's primary condition.
  const getBreadcrumbParts = (p: ProductWithCategory | null) => {
    if (!p?.breadcrumb) return [];
    const parts = p.breadcrumb.split('>').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const contextCondition = getContextCondition(p);
      if (contextCondition) {
        parts[parts.length - 2] = contextCondition;
      }
    }
    return parts;
  };

  useEffect(() => {
    if (!productsLoading && productsData) {
      let productSlug = '';

      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length === 2) {
        productSlug = pathParts[1];
      }

      // Fallback to query param
      if (!productSlug) {
        const urlParams = new URLSearchParams(window.location.search);
        productSlug = urlParams.get('product') || '';
      }

      if (!productSlug) {
        setNotFound(true);
        return;
      }

      const targetSlug = productSlug.toLowerCase();
      const decodedTarget = decodeURIComponent(productSlug).toLowerCase();

      const found = productsData.find(p => {
        const pSlug = p.slug?.current?.toLowerCase();
        const bName = p.brandName?.toLowerCase();

        if (pSlug === targetSlug || pSlug === decodedTarget) return true;
        if (bName === targetSlug || bName === decodedTarget) return true;

        if (p.productPageUrl) {
          const stripped = p.productPageUrl.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '').toLowerCase();
          const pageSlug = stripped.split('/').filter(Boolean).pop();
          if (pageSlug === targetSlug || pageSlug === decodedTarget) return true;
        }

        return false;
      });
      if (found) {
        setProduct(found);
        const displayName = found.brandName && found.genericName && found.brandName !== found.genericName
          ? `${found.brandName} (${found.genericName})`
          : found.name || found.brandName || 'Product Details';
        const description = found.metaDescription
          || found.indications
          || found.description
          || `${displayName} — available through Getmeds Philippines. Quality pharmaceutical product for healthcare needs.`;
        // productPageUrl from the sheet has no protocol (e.g. "getmeds.ph/cancer-medicines/..."),
        // so the leading domain segment has to be stripped even without an "https://" to match.
        const prettyPath = found.productPageUrl
          ? '/' + found.productPageUrl.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '')
          : `/${found.categoryFolder || 'product-range'}/${found.slug?.current || ''}`;
        const imgUrl = found.image ? urlFor(found.image).width(1200).url() : undefined;
        setPageMeta({
          title: found.metaTitle || displayName,
          description: description.slice(0, 160),
          path: prettyPath,
          image: imgUrl,
          type: 'product',
        });
      } else {
        setNotFound(true);
      }
    }
  }, [productsLoading, productsData, categoriesData]);

  const backUrl = product?.categoryFolder ? `/${product.categoryFolder}` : '/cancer-medicines';


  const getProductImage = (p: ProductWithCategory, size?: number) => {
    if (p.image && p.image.asset) {
      try {
        if (size) return urlFor(p.image).width(size).height(size).url();
        return urlFor(p.image).url();
      } catch (err) {
        console.error('Error generating image URL:', err);
      }
    }

    return '/assets/no-image.png';
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const { valid, errors } = validateFiles(Array.from(e.target.files));
      if (errors.length > 0) alert(errors.join('\n'));
      setUploadedFiles(valid);
    }
  };

  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { valid, errors } = validateFiles([e.target.files[0]]);
      if (errors.length > 0) alert(errors.join('\n'));
      if (valid.length > 0) setPatientIdFile(valid[0]);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', message: '', age: '', address: '', contactName: '', contactRelationship: '', terms: false, privacyConsent: false });
    setUploadedFiles([]);
    setPatientIdFile(null);
    setContactSameAsPatient(false);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userType === 'patient') {
      // Block submission for patients without a prescription
      if (uploadedFiles.length === 0) {
        setPrescriptionRequiredModalOpen(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setPrescriptionModalVisible(true)));
        return;
      }
      if (!patientIdFile) {
        setIdRequiredModalOpen(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setIdModalVisible(true)));
        return;
      }
      if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.address) {
        alert('Please fill in all required fields.');
        return;
      }
      if (!contactSameAsPatient && !formData.contactName) {
        alert("Please provide the contact person's full name.");
        return;
      }
      if (!formData.terms) {
        alert('Please confirm that all provided information is authentic.');
        return;
      }
      if (!formData.privacyConsent) {
        alert('Please consent to the Privacy Policy to proceed.');
        return;
      }
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (formData.phone && (phoneDigits.length < 7 || phoneDigits.length > 15)) {
      alert('Please enter a valid phone number.');
      return;
    }

    setSubmitState('sending');
    const filesData: { name: string; type: string; base64: string; category?: 'id' | 'prescription' }[] = [];
    for (const file of uploadedFiles) {
      try {
        const base64 = await fileToBase64(file);
        filesData.push(userType === 'patient'
          ? { name: file.name, type: file.type, base64, category: 'prescription' }
          : { name: file.name, type: file.type, base64 });
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }
    if (userType === 'patient' && patientIdFile) {
      try {
        const base64 = await fileToBase64(patientIdFile);
        filesData.push({ name: patientIdFile.name, type: patientIdFile.type, base64, category: 'id' });
      } catch (err) {
        console.error('Error processing file:', patientIdFile.name, err);
      }
    }

    try {
      const contactInfo = contactSameAsPatient
        ? 'Same as patient'
        : `${formData.contactName}${formData.contactRelationship ? ` (${formData.contactRelationship})` : ''}`;

      const payload = userType === 'patient'
        ? {
            // Patient/Caregiver submissions use the same fields as the Order Medicines form,
            // so they're routed to that same Google Sheet instead of the Product Inquiry one.
            inquiryType: 'Order Medicine',
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: `Product Inquiry Request. Age: ${formData.age}, Address: ${formData.address}, Contact Person: ${contactInfo}`,
            additionalData: {
              productName: product?.brandName || product?.name || '',
              age: formData.age,
              address: formData.address,
              contactSameAsPatient,
              contactName: formData.contactName,
              contactRelationship: formData.contactRelationship,
              privacyPolicyConsent: formData.privacyConsent
            },
            files: filesData
          }
        : {
            inquiryType: 'Product Inquiry',
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            additionalData: {
              productName: product?.brandName || product?.name || '',
              age: formData.age,
              customerType: USER_TYPE_LABELS[userType] || userType
            },
            files: filesData
          };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Form submission failed.');

      setSubmitState('sent');
      resetForm();
      setSuccessModalOpen(true);
      setTimeout(() => setSubmitState('idle'), 300);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };



  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased min-h-screen flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div id="navbar-container" className="shrink-0 z-[50]" />

      <main className="flex-1">
        {/* Breadcrumb Header */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12px] flex-wrap">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary transition-colors font-medium">
                  Home
                </a>
              </li>
              {product && (() => {
                // "Home > Category > Condition > Product" — precomputed in the
                // sheet (Breadcrumb (auto)); only "Home" is replaced above since
                // it should link to "/" instead of being plain text.
                const parts = getBreadcrumbParts(product).filter(p => p.toLowerCase() !== 'home');
                const fallbackParts = parts.length ? parts : [getCategorizationDisplay(product), product.brandName || product.name || 'Product Details'];
                return fallbackParts.map((part, idx) => {
                  const isLast = idx === fallbackParts.length - 1;
                  const isCondition = idx === fallbackParts.length - 2;
                  // Condition Hub URL (auto) is a separate "/conditions/:slug" namespace
                  // used only for the sitemap/crawling, not an in-app destination — every
                  // breadcrumb link here uses the category folder from Product Page URL
                  // (auto) instead, same as the rest of the app's internal navigation.
                  let href: string | null = null;
                  if (!isLast && product.categoryFolder && (idx === 0 || isCondition)) {
                    href = `/${product.categoryFolder}`;
                  }
                  return (
                    <React.Fragment key={idx}>
                      <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[9px]" /></li>
                      <li className={isLast ? 'font-semibold text-gray-700' : ''}>
                        {href ? (
                          <a href={href} className="text-gray-400 hover:text-primary transition-colors font-medium">
                            {part}
                          </a>
                        ) : (
                          part
                        )}
                      </li>
                    </React.Fragment>
                  );
                });
              })()}
              {!product && (
                <>
                  <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[9px]" /></li>
                  <li className="font-semibold text-gray-700">Product Details</li>
                </>
              )}
            </ol>
          </nav>
          <button
            className="hidden sm:flex items-center text-gray-500 hover:text-primary transition text-sm space-x-1.5"
            onClick={() => {
              const chatWindow = document.getElementById('zap-chat-window');
              if (chatWindow) chatWindow.classList.add('active');
              const trigger = document.getElementById('zap-ai-trigger');
              if (trigger) trigger.classList.remove('zap-modal-open');
            }}
          >
            <i className="fa-regular fa-circle-question" />
            <span>Do you need help?</span>
          </button>
        </div>

        {/* Loading skeleton */}
        {productsLoading && (
          <div className="max-w-6xl mx-auto p-6 lg:p-8 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-0 border border-gray-100 rounded-2xl overflow-hidden mt-4">
              <div className="lg:w-1/2 p-8 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="h-4 bg-gray-100 rounded-full w-1/3" />
                <div className="h-6 bg-gray-100 rounded-full w-2/3" />
                <div className="h-4 bg-gray-100 rounded-full w-full" />
                <div className="aspect-square bg-gray-100 rounded-2xl w-full max-w-xs mx-auto" />
                <div className="h-48 bg-gray-100 rounded-2xl" />
              </div>
              <div className="lg:w-1/2 p-8 space-y-4">
                <div className="h-6 bg-gray-100 rounded-full w-1/2" />
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* Not found state */}
        {!productsLoading && notFound && (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <i className="fa-regular fa-circle-xmark text-5xl text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-sm text-gray-500 mb-6">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <a
              href="/cancer-medicines"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md transition-all"
              style={{ background: 'linear-gradient(to right, #61A644, #0D99FF)' }}
            >
              <i className="fa-solid fa-arrow-left text-xs" />
              Browse All Products
            </a>
          </div>
        )}

        {/* Product detail content */}
        {!productsLoading && product && (
          <div className="max-w-6xl mx-auto lg:px-4 lg:py-6">
            <div className="flex flex-col lg:flex-row lg:border lg:border-gray-100 lg:rounded-2xl lg:shadow-sm overflow-hidden bg-white">

              {/* Left Column: Product Info */}
              <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="flex flex-col-reverse md:flex-row gap-8 mb-4">
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 mb-3 text-sm text-gray-600">
                      <span className="flex items-center font-medium whitespace-nowrap" style={{ color: '#61A644' }}>
                        <i className="fa-solid fa-check mr-1.5" /> In stock
                      </span>
                      <span className="text-gray-300 whitespace-nowrap">|</span>
                      <span className="capitalize font-medium leading-snug" style={{ color: '#0D99FF' }}>
                        {getCategorizationDisplay(product)}
                      </span>
                      {product.prescription?.toUpperCase() === 'RX' && (
                        <>
                          <span className="text-gray-300 whitespace-nowrap">|</span>
                          <span className="font-medium whitespace-nowrap text-red-600">
                            Rx — Prescription Required
                          </span>
                        </>
                      )}
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                      {getProductDisplayName(product)}
                    </h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {product.strength && (
                        <div>
                          <span className="block text-[11px] text-gray-400 font-semibold">Strength</span>
                          <span className="text-gray-800 font-medium text-[13px]">{formatFieldWithLineBreaks(product.strength)}</span>
                        </div>
                      )}
                      {product.form && (
                        <div>
                          <span className="block text-[11px] text-gray-400 font-semibold">Form</span>
                          <span className="text-gray-800 font-medium text-[13px]">{formatFieldWithLineBreaks(product.form)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 flex items-center justify-center">
                    {(() => {
                      const resolvedImageUrl = getProductImage(product);
                      const hasImage = resolvedImageUrl && !resolvedImageUrl.endsWith('no-image.png');
                      return (
                        <div
                          onClick={hasImage ? () => setZoomedImageOpen(true) : undefined}
                          className={`w-full max-w-[320px] aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-[15px] border border-gray-100 p-4 overflow-hidden relative group/zoom hover:shadow-md transition-all duration-300 ${hasImage ? 'cursor-zoom-in' : ''}`}
                        >
                          {hasImage ? (
                            <>
                              <img
                                src={resolvedImageUrl}
                                className="w-full h-full object-contain mix-blend-multiply group-hover/zoom:scale-105 transition-transform duration-500"
                                alt={product.name}
                                onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = '/assets/no-image.png'; }}
                              />
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/zoom:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <div className="bg-white/95 backdrop-blur-sm text-gray-800 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm text-xs font-semibold">
                                  <i className="fa-solid fa-magnifying-glass-plus text-primary" />
                                  Click to Zoom
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <i className="fa-regular fa-image text-4xl mb-3 text-gray-300" />
                              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">No Image</span>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-[15px] border border-gray-100 p-5">
                  <div className="border-b border-gray-100 mb-5 flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() => setDescriptionTab('description')}
                      className="inline-block pb-3 text-[13px] font-semibold transition-colors"
                      style={descriptionTab === 'description'
                        ? { color: '#0D99FF', borderBottom: '2px solid #0D99FF' }
                        : { color: '#9CA3AF', borderBottom: '2px solid transparent' }}
                    >
                      Description
                    </button>
                    {product.prescription?.toUpperCase() === 'RX' && (
                      <button
                        type="button"
                        onClick={() => setDescriptionTab('prescription')}
                        className="inline-block pb-3 text-[13px] font-semibold transition-colors"
                        style={descriptionTab === 'prescription'
                          ? { color: '#DC2626', borderBottom: '2px solid #DC2626' }
                          : { color: '#9CA3AF', borderBottom: '2px solid transparent' }}
                      >
                        Prescription Requirement
                      </button>
                    )}
                  </div>
                  {descriptionTab === 'description' ? (
                    <div className="text-[14px] text-gray-600 leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-4">
                        {product.description && (
                          <div className="text-[14px] text-gray-600 leading-relaxed">
                            {renderRichContent(product.description)}
                          </div>
                        )}
                        {(product.indications || (product as any).indication) && (
                          <div>
                            <span className="block text-[13px] font-semibold mb-1 text-gray-400">Indications</span>
                            <div className="text-[14px] text-gray-600 leading-relaxed">
                              {renderRichContent(product.indications || (product as any).indication)}
                            </div>
                          </div>
                        )}
                        {(product.dosageAdministration || (product as any).dosageAndAdministration) && (
                          <div>
                            <span className="block text-[13px] font-semibold mb-1 text-gray-400">Dosage & Administration</span>
                            <div className="text-[14px] text-gray-600 leading-relaxed">
                              {renderRichContent(product.dosageAdministration || (product as any).dosageAndAdministration)}
                            </div>
                          </div>
                        )}
                        {!product.description && !product.indications && !(product as any).indication && !product.dosageAdministration && !(product as any).dosageAndAdministration && (
                          <p>Detailed therapeutic description is not available.</p>
                        )}
                        <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                          {product.packaging && (
                            <div>
                              <span className="block text-[11px] text-gray-400 uppercase font-semibold">Packaging</span>
                              <span className="text-gray-800 font-medium text-[13px]">{product.packaging}</span>
                            </div>
                          )}
                          {product.innovator && (
                            <div>
                              <span className="block text-[11px] text-gray-400 uppercase font-semibold">Innovator</span>
                              <span className="text-gray-800 font-medium text-[13px]">{product.innovator}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[14px] text-gray-600 leading-relaxed">
                      This medicine is prescription-only (Rx). A valid prescription from a licensed
                      healthcare professional is required for purchase and dispensing, as regulated by
                      FDA Philippines under RA 9711.
                    </div>
                  )}
                </div>

                {/* Also used for — "Also Linked From" (auto), the other condition
                    hubs this same product page is also linked from */}
                {(() => {
                  const allSubcats = getProductSubcategories(product);
                  const primarySubcat = getCategorizationDisplay(product);
                  const otherSubcats = allSubcats.filter(s => s !== primarySubcat);
                  if (otherSubcats.length === 0) return null;
                  return (
                    <div className="mt-4 px-5 pb-5">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Also used for</p>
                      <div className="flex flex-wrap gap-2">
                        {otherSubcats.map((sub, idx) => {
                          // Resolve the condition slug: prefer the precomputed slug from the sheet,
                          // fall back to slugifying the condition name (same algorithm cancer-medicines.tsx uses)
                          const conditionSlug =
                            product.conditionSlugsByName?.[sub]?.conditionSlug ||
                            sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          const href = `/${product.categoryFolder || 'cancer-medicines'}/${conditionSlug}`;
                          return (
                            <a
                              key={idx}
                              href={href}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-blue-100 bg-blue-50 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                            >
                              <i className="fa-solid fa-arrow-right-to-bracket text-[9px]" />
                              {sub}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Inquiry Form */}
              <div className="lg:w-1/2 bg-white p-6 lg:p-8 pb-10">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900">Send Inquiry</h4>
                  <p className="text-xs text-gray-500 mt-1">Submit your details to get a formal quote for this product.</p>
                  {userTypeConfirmed && userType && USER_TYPE_LABELS[userType] && (
                    <div className="relative inline-block mt-2" ref={userTypeMenuRef}>
                      <button
                        type="button"
                        onClick={() => setUserTypeMenuOpen(o => !o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-primary border border-blue-100 hover:bg-blue-100 transition"
                      >
                        <i className="fa-solid fa-user-tag text-[9px]" />
                        {USER_TYPE_LABELS[userType]}
                        <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${userTypeMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {userTypeMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
                          {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => { setUserType(value); setUserTypeMenuOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-[12px] font-medium transition ${userType === value ? 'bg-blue-50 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!userTypeConfirmed ? (
                  <div>
                    <p className="text-[13px] font-medium text-gray-500 mb-3">I am a:</p>
                    <div className="space-y-2 mb-6">
                      {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setUserType(value)}
                          className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left text-[13px] font-semibold transition ${userType === value ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                        >
                          <i className="fa-solid fa-user-tag text-[11px]" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={!userType}
                      onClick={() => setUserTypeConfirmed(true)}
                      className="w-full text-white font-bold py-3 rounded-xl transition-all duration-300 text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(to right, #61A644, #0D99FF)' }}
                    >
                      Continue
                    </button>
                  </div>
                ) : userType === 'patient' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Target Product</label>
                    <input
                      type="text"
                      readOnly
                      value={getProductDisplayName(product)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-semibold outline-none cursor-default"
                      style={{ color: '#0D99FF' }}
                    />
                  </div>

                  {/* Patient full name + Upload valid ID — mirrors order-medicines.tsx Customer Information */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Full name as shown on the prescription"
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-gray-500">Upload valid ID of the patient</label>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      A valid government-issued ID of the patient helps us process your order faster and ensures the prescription is dispensed to the right person.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      {!patientIdFile ? (
                        <label className="cursor-pointer inline-flex items-center gap-2 hover:opacity-90 text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl transition"
                          style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}>
                          <input type="file" accept={ALLOWED_FILE_TYPES_ACCEPT} className="hidden" onChange={handlePatientIdChange} />
                          <i className="fa-solid fa-upload text-[11px]"></i>
                          Upload File
                        </label>
                      ) : (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl pl-1.5 pr-3 py-1.5">
                          {patientIdFile.type.startsWith('image/') ? (
                            <button type="button" onClick={() => setViewingFileUrl(URL.createObjectURL(patientIdFile))}
                              className="w-8 h-8 rounded-[7px] overflow-hidden border border-gray-100 flex-shrink-0">
                              <img src={URL.createObjectURL(patientIdFile)} alt={patientIdFile.name} className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <i className="fa-solid fa-file-pdf text-red-400"></i>
                          )}
                          <span className="text-[12px] text-gray-600 truncate max-w-[160px]">{patientIdFile.name}</span>
                          <button type="button" onClick={() => setPatientIdFile(null)}
                            className="text-gray-400 hover:text-red-500 transition">
                            <i className="fa-solid fa-xmark text-[11px]"></i>
                          </button>
                        </div>
                      )}
                      <span className="text-[11px] text-gray-400">JPG, PNG, PDF</span>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/40 space-y-3">
                    <h3 className="text-[13px] font-semibold text-gray-800">Contact Person</h3>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox"
                        checked={contactSameAsPatient}
                        onChange={e => setContactSameAsPatient(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded-md border-gray-200 text-success focus:ring-success cursor-pointer" />
                      <span>
                        <span className="block text-[12px] font-semibold text-gray-700">Same as patient details</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">Check this if the patient is the one placing the inquiry.</span>
                      </span>
                    </label>

                    {!contactSameAsPatient && (
                      <div className="grid grid-cols-1 gap-3 pt-1">
                        <div className="space-y-1.5">
                          <label className="block text-[12px] font-medium text-gray-500">Contact Person's Full Name</label>
                          <input type="text" placeholder="Person we should contact"
                            required={!contactSameAsPatient}
                            value={formData.contactName}
                            onChange={e => setFormData(f => ({ ...f, contactName: e.target.value }))}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[12px] font-medium text-gray-500">Relationship to Patient</label>
                          <select
                            value={formData.contactRelationship}
                            onChange={e => setFormData(f => ({ ...f, contactRelationship: e.target.value }))}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition">
                            <option value="">Select relationship (optional)</option>
                            <option value="Family member">Family member</option>
                            <option value="Caregiver">Caregiver</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Healthcare professional">Healthcare professional</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[13px] font-medium text-gray-500 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+63 900 000 0000"
                        value={formData.phone}
                        onChange={e => setFormData(f => ({ ...f, phone: e.target.value.replace(/[^\d+\s\-()]/g, '') }))}
                        inputMode="numeric"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                      />
                    </div>
                    <div className="w-[90px] shrink-0" ref={ageDropdownRef}>
                      <label className="block text-[13px] font-medium text-gray-500 mb-2">Age</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setAgeDropdownOpen(o => !o)}
                          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition cursor-pointer"
                        >
                          <span className={formData.age ? 'text-gray-700' : 'text-gray-400'}>{formData.age || 'Age'}</span>
                          <i className="fa-solid fa-chevron-down text-[10px] text-gray-400" />
                        </button>
                        {ageDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
                            <div className="max-h-48 overflow-y-auto">
                              {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                                <button
                                  key={age}
                                  type="button"
                                  onClick={() => { setFormData(f => ({ ...f, age: String(age) })); setAgeDropdownOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition ${formData.age === String(age) ? 'bg-blue-50 text-primary font-semibold' : 'text-gray-700'}`}
                                >
                                  {age}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Delivery Address</label>
                    <input type="text" placeholder="Complete address for courier delivery"
                      required
                      value={formData.address}
                      onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Upload Prescription (Required)</label>
                    <input
                      type="file"
                      multiple
                      accept={ALLOWED_FILE_TYPES_ACCEPT}
                      onChange={handleFileChange}
                      className="w-full text-[13px] text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition cursor-pointer border border-gray-200 rounded-xl p-1.5 bg-white outline-none"
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploadedFiles.map((file, fi) => (
                          <div key={fi} className="flex items-center text-[11px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                            <i className="fa-solid fa-file-lines mr-2" style={{ color: 'rgba(13,153,255,0.7)' }} />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-gray-400 pt-1">
                    <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
                    <span>Our pharmacists will contact you on the mobile number provided.</span>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-2.5">
                    <h3 className="text-[13px] font-semibold text-gray-800">Declarations and Consent</h3>
                    <div className="flex items-start gap-2.5">
                      <input type="checkbox" id="pd-terms"
                        checked={formData.terms}
                        onChange={e => setFormData(f => ({ ...f, terms: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 rounded-md border-gray-200 text-success focus:ring-success cursor-pointer" />
                      <label htmlFor="pd-terms" className="text-[11px] text-gray-500 cursor-pointer">
                        I confirm that the information provided is accurate and that the prescription submitted is valid.
                      </label>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <input type="checkbox" id="pd-privacyConsent"
                        checked={formData.privacyConsent}
                        onChange={e => setFormData(f => ({ ...f, privacyConsent: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 rounded-md border-gray-200 text-success focus:ring-success cursor-pointer" />
                      <label htmlFor="pd-privacyConsent" className="text-[11px] text-gray-500 cursor-pointer">
                        I have read and understood the Privacy Policy and consent to the collection, use, and processing of my personal and sensitive personal information for the purpose of verifying and processing this inquiry.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitState === 'sending' || submitState === 'sent'}
                    className="w-full text-white font-bold py-3 rounded-xl transition-all duration-500 transform active:scale-[0.98] mt-6 mb-4 text-[13px]"
                    style={submitState === 'sent'
                      ? { background: '#61A644' }
                      : { background: 'linear-gradient(to right, #61A644, #0D99FF)' }}
                  >
                    {submitState === 'sending'
                      ? 'Sending...'
                      : submitState === 'sent'
                        ? '✓ Inquiry Sent Successfully!'
                        : submitState === 'error'
                          ? 'Failed to submit. Try again.'
                          : 'Submit Inquiry Request'}
                  </button>

                  {/* Medical Disclaimer */}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5 mb-4">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5 flex-shrink-0 text-sm"></i>
                    <p className="text-[10.5px] text-amber-800 leading-relaxed">
                      <span className="font-bold">Medical Disclaimer: </span>
                      Getmeds dispenses prescription medicines only upon receipt of a valid prescription from a licensed physician. This service does not replace professional medical advice, diagnosis, or treatment.
                    </p>
                  </div>
                  <div className="h-4" />
                </form>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Target Product</label>
                    <input
                      type="text"
                      readOnly
                      value={getProductDisplayName(product)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-semibold outline-none cursor-default"
                      style={{ color: '#0D99FF' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[13px] font-medium text-gray-500 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+63 900 000 0000"
                        value={formData.phone}
                        onChange={e => setFormData(f => ({ ...f, phone: e.target.value.replace(/[^\d+\s\-()]/g, '') }))}
                        inputMode="numeric"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                      />
                    </div>
                    <div className="w-[90px] shrink-0" ref={ageDropdownRef}>
                      <label className="block text-[13px] font-medium text-gray-500 mb-2">Age</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setAgeDropdownOpen(o => !o)}
                          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition cursor-pointer"
                        >
                          <span className={formData.age ? 'text-gray-700' : 'text-gray-400'}>{formData.age || 'Age'}</span>
                          <i className="fa-solid fa-chevron-down text-[10px] text-gray-400" />
                        </button>
                        {ageDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
                            <div className="max-h-48 overflow-y-auto">
                              {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                                <button
                                  key={age}
                                  type="button"
                                  onClick={() => { setFormData(f => ({ ...f, age: String(age) })); setAgeDropdownOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition ${formData.age === String(age) ? 'bg-blue-50 text-primary font-semibold' : 'text-gray-700'}`}
                                >
                                  {age}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Message</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us more about your requirements..."
                      value={formData.message}
                      onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitState === 'sending' || submitState === 'sent'}
                    className="w-full text-white font-bold py-3 rounded-xl transition-all duration-500 transform active:scale-[0.98] mt-6 mb-8 text-[13px]"
                    style={submitState === 'sent'
                      ? { background: '#61A644' }
                      : { background: 'linear-gradient(to right, #61A644, #0D99FF)' }}
                  >
                    {submitState === 'sending'
                      ? 'Sending...'
                      : submitState === 'sent'
                        ? '✓ Inquiry Sent Successfully!'
                        : submitState === 'error'
                          ? 'Failed to submit. Try again.'
                          : 'Submit Inquiry Request'}
                  </button>
                  <div className="h-8" />
                </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(26,32,44,0.7)' }}>
          <div className="bg-white rounded-[20px] shadow-2xl p-10 max-w-sm w-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#61A644,#1D9FDA)' }}
            >
              <i className="fa-solid fa-check text-white text-2xl animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Sent!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Thank you for your inquiry. Our team will get back to you shortly with a formal quote.
            </p>
            <div className="border-t border-gray-100 pt-4 text-center">
              <button
                onClick={() => setSuccessModalOpen(false)}
                className="text-[13px] font-semibold hover:underline"
                style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Required Modal — styled after "Not on Record" in employee-verification portal */}
      {prescriptionRequiredModalOpen && (
        <>
          <style>{`
            @keyframes slideUpRx{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .rx-modal-slide{animation:slideUpRx 0.32s cubic-bezier(.22,1,.36,1) forwards}
          `}</style>
          <div
            className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-opacity duration-200 ${prescriptionModalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => { setPrescriptionModalVisible(false); setTimeout(() => setPrescriptionRequiredModalOpen(false), 200); }}
          >
            <div
              className={`bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden rx-modal-slide transform transition-all duration-200 ${prescriptionModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => { setPrescriptionModalVisible(false); setTimeout(() => setPrescriptionRequiredModalOpen(false), 200); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>

              {/* Body */}
              <div className="px-8 pt-8 pb-5 text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#EF4444,#F59E0B)' }}
                  >
                    <i className="fa-solid fa-file-medical text-white text-xl"></i>
                  </div>
                </div>
                <h2 className="text-[19px] font-semibold text-gray-900 mb-2 leading-snug">Prescription Required</h2>
                <p className="text-[13px] text-red-600 font-medium mb-3 leading-relaxed">
                  A valid prescription is required before your inquiry can be submitted.
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  As a Patient / Caregiver, please attach your doctor-issued prescription (JPG, PNG, or PDF)
                  to ensure your medicine request complies with Philippine FDA regulations and can be
                  processed safely by our team.
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-8 py-3 text-center">
                <button
                  type="button"
                  onClick={() => { setPrescriptionModalVisible(false); setTimeout(() => setPrescriptionRequiredModalOpen(false), 200); }}
                  className="text-[13px] font-semibold hover:underline"
                  style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  I Understand, Upload Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ID Required Modal — Patient/Caregiver flow, mirrors order-medicines.tsx's ID-required prompt */}
      {idRequiredModalOpen && (
        <>
          <style>{`
            @keyframes slideUpId{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .id-modal-slide{animation:slideUpId 0.32s cubic-bezier(.22,1,.36,1) forwards}
          `}</style>
          <div
            className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-opacity duration-200 ${idModalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => { setIdModalVisible(false); setTimeout(() => setIdRequiredModalOpen(false), 200); }}
          >
            <div
              className={`bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden id-modal-slide transform transition-all duration-200 ${idModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => { setIdModalVisible(false); setTimeout(() => setIdRequiredModalOpen(false), 200); }}
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
                    <i className="fa-solid fa-id-card text-white text-xl"></i>
                  </div>
                </div>
                <h2 className="text-[19px] font-semibold text-gray-900 mb-2 leading-snug">Valid ID Required</h2>
                <p className="text-[13px] text-red-600 font-medium mb-3 leading-relaxed">
                  A valid ID of the patient is required before your inquiry can be submitted.
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Please upload a valid government-issued ID (JPG, PNG, or PDF) so we can confirm the
                  prescription is being dispensed to the right person.
                </p>
              </div>

              <div className="border-t border-gray-100 px-8 py-3 text-center">
                <button
                  type="button"
                  onClick={() => { setIdModalVisible(false); setTimeout(() => setIdRequiredModalOpen(false), 200); }}
                  className="text-[13px] font-semibold hover:underline"
                  style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  I Understand, Upload Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Uploaded ID Preview Modal — Patient/Caregiver flow */}
      {viewingFileUrl && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300"
          onClick={() => setViewingFileUrl(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setViewingFileUrl(null)}
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>
          <div
            className="max-w-[90vw] max-h-[90vh] overflow-hidden rounded-2xl bg-white p-4 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={viewingFileUrl}
              className="max-w-full max-h-[80vh] object-contain"
              alt="Uploaded ID"
            />
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImageOpen && product && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300"
          onClick={() => setZoomedImageOpen(false)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setZoomedImageOpen(false)}
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>
          <div
            className="max-w-[90vw] max-h-[90vh] overflow-hidden rounded-2xl bg-white p-4 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={getProductImage(product)}
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-300 hover:scale-150 cursor-zoom-in"
              alt={product.name}
              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = '/assets/no-image.png'; }}
            />
          </div>
        </div>
      )}

      <div id="footer-container" />
    </div>
  );
}
