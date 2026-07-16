import React, { useEffect, useState, useRef } from 'react';
import { useProducts, useCategories, useImageMapper } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';
import type { Product as SanityProduct, Category } from '../types/sanity';
import { injectHTML } from '../lib/injectHTML';
import { getApiUrl } from '../lib/api';
import { setPageMeta } from '../lib/seo';
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

  const [zoomedImageOpen, setZoomedImageOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '', age: '' });
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const ageDropdownRef = useRef<HTMLDivElement>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [userType, setUserType] = useState<string>('');
  const [userTypeConfirmed, setUserTypeConfirmed] = useState(false);
  const [prescriptionRequiredModalOpen, setPrescriptionRequiredModalOpen] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);

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

  const getSubcategorySlug = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const specials: Record<string, string> = {
      'non-small-cell-lung-cancer': 'lung-cancer',
      'acute-myeloid-leukemia': 'aml',
      'chronic-myeloid-leukemia': 'cml',
      'hodgkin-non-hodgkins-lymphoma': 'lymphoma',
      'hodgkin-non-hodgkin-s-lymphoma': 'lymphoma',
      'sickle-cell-anemia': 'sickle-cell',
      'respiratory-infections': 'respiratory',
      'urinary-tract-infections': 'uti',
      'skin-and-soft-tissue-infections': 'skin-infections',
      'bone-and-joint-infections': 'bone-infections',
      'fibrocystic-breast-disease': 'fibrocystic',
      'arrhythmia-management': 'arrhythmia',
      'hypertension-angina': 'hypertension',
      'hypertension-and-angina': 'hypertension',
      'seasonal-allergic-rhinitis': 'allergic-rhinitis',
      'chronic-kidney-disease': 'kidney-disease',
      'chronic-pain': 'pain',
      'inflammatory-disorders': 'rheumatology',
      'inflammatory-and-rheumatic-disorders': 'rheumatology'
    };
    return specials[slug] || slug;
  };

  const CANCER_CATEGORY_NAMES = [
    'oncology',
    'neuro-oncology',
    'oncology / hematology',
    'oncology/hematology',
    'cancer'
  ];
  const CANCER_BRAND_EXCEPTIONS = ['zoloGet'.toLowerCase()];
  const isCancerProduct = (p: ProductWithCategory | null) => {
    if (!p) return false;
    const catName = (p.category?.category || '').toLowerCase().trim();
    const excelCat = (p.excelCategory || '').toLowerCase().trim();
    
    const catParts = catName.split('/').map(s => s.trim()).filter(Boolean);
    const excelParts = excelCat.split('/').map(s => s.trim()).filter(Boolean);
    
    if (catParts.some(part => CANCER_CATEGORY_NAMES.includes(part))) return true;
    if (excelParts.some(part => CANCER_CATEGORY_NAMES.includes(part))) return true;
    
    return CANCER_BRAND_EXCEPTIONS.includes((p.brandName || '').toLowerCase().trim());
  };

  const getProductSubcategories = (p: ProductWithCategory) => {
    if (!p.subCategory) return [];
    const parts = p.subCategory.split('/').map(s => s.trim().replace(/,$/, '')).filter(Boolean);
    const catDoc = categoriesData?.find(c => c._id === p.category?._id || (c.category && p.category?.category && c.category === p.category?.category));
    const masterSubcategories = catDoc?.subcategory || [];
    if (masterSubcategories.length === 0) return parts;
    return parts.map(part => {
      const matched = masterSubcategories.find(m => m && typeof m === 'string' && m.toLowerCase() === part.toLowerCase());
      return matched || part;
    });
  };

  const getCategorizationDisplay = (p: ProductWithCategory) => {
    const subcats = getProductSubcategories(p);

    // Check if the URL provides context from where the user clicked
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get('category');

      if (categoryFromUrl) {
        // Find a case-insensitive match among the product's subcategories
        const matched = subcats.find(s => s.toLowerCase() === categoryFromUrl.toLowerCase());
        if (matched) return matched;
      }
    }

    if (subcats.length === 0) {
      return p.category?.category || 'General';
    }
    return subcats[0] || 'General';
  };

  useEffect(() => {
    if (!productsLoading && productsData) {
      let productSlug = '';

      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if ((pathParts[0] === 'cancer-medicines' || pathParts[0] === 'cancer-medicine' || pathParts[0] === 'product-range') && pathParts.length === 2) {
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

      // Generate slug in format brandname-molecule-dosage-strength
      const getProductSlug = (p: ProductWithCategory) => {
        const brand = (p.brandName || '').toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, '-');
        const molecule = (p.genericName || '').toLowerCase().trim()
          .replace(/\s*\(as\s+[^)]+\)/gi, '')
          .replace(/[^a-z0-9]+/g, '-');
        const form = (p.form || '').toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, '-');
        const strength = (p.strength || '').toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, '-');
        const parts = [brand, molecule, strength, form].filter(Boolean).join('-');
        return parts.replace(/-+/g, '-').replace(/(^-|-$)/g, '');
      };

      const found = productsData.find(
        p => getProductSlug(p) === productSlug.toLowerCase() ||
          p.slug?.current?.toLowerCase() === productSlug.toLowerCase() ||
          p.brandName?.toLowerCase() === productSlug.toLowerCase() ||
          decodeURIComponent(productSlug).toLowerCase() === (p.brandName || '').toLowerCase()
      );
      if (found) {
        setProduct(found);
        const displayName = found.brandName && found.genericName && found.brandName !== found.genericName
          ? `${found.brandName} (${found.genericName})`
          : found.name || found.brandName || 'Product Details';
        const description = found.indications
          ? found.indications.slice(0, 160)
          : found.description
            ? found.description.slice(0, 160)
            : `${displayName} — available through Getmeds Philippines. Quality pharmaceutical product for healthcare needs.`;
        const prettySlug = getProductSlug(found) || found.slug?.current || '';
        const prettyPath = isCancerProduct(found)
          ? `/cancer-medicine/${prettySlug}`
          : `/product-range/${prettySlug}`;
        const imgUrl = found.image ? urlFor(found.image).width(1200).url() : undefined;
        setPageMeta({
          title: displayName,
          description,
          path: prettyPath,
          image: imgUrl,
          type: 'product',
        });
      } else {
        setNotFound(true);
      }
    }
  }, [productsLoading, productsData, categoriesData]);

  const backUrl = isCancerProduct(product) ? '/cancer-medicines' : '/product-range';


  const getProductImage = (p: ProductWithCategory, size?: number) => {
    if (p.image && p.image.asset) {
      try {
        if (size) return urlFor(p.image).width(size).height(size).url();
        return urlFor(p.image).url();
      } catch (err) {
        console.error('Error generating image URL:', err);
      }
    }

    return 'assets/no-image.png';
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
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
    // Block submission for patients without a prescription
    if (userType === 'patient' && uploadedFiles.length === 0) {
      setPrescriptionRequiredModalOpen(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setPrescriptionModalVisible(true)));
      return;
    }
    setSubmitState('sending');
    const filesData: { name: string; type: string; base64: string }[] = [];
    for (const file of uploadedFiles) {
      try {
        const base64 = await fileToBase64(file);
        filesData.push({ name: file.name, type: file.type, base64 });
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }

    try {
      const payload = {
        inquiryType: 'Product Inquiry',
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        additionalData: {
          productName: product?.brandName || product?.name || '',
          age: formData.age
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
      setFormData({ name: '', phone: '', email: '', message: '', age: '' });
      setUploadedFiles([]);
      setSuccessModalOpen(true);
      setTimeout(() => setSubmitState('idle'), 300);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  if (product) {
    console.log("DEBUG [product-detail]: product object before rendering:", product);
    console.log("DEBUG [product-detail]: description field type/value:", typeof product.description, Array.isArray(product.description) ? "array/portable-text" : "not array", product.description);
    console.log("DEBUG [product-detail]: indications field type/value:", typeof product.indications, Array.isArray(product.indications) ? "array/portable-text" : "not array", product.indications);
    console.log("DEBUG [product-detail]: dosageAdministration field type/value:", typeof product.dosageAdministration, Array.isArray(product.dosageAdministration) ? "array/portable-text" : "not array", product.dosageAdministration);
  }

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
                <a
                  href="/cancer-medicines"
                  className="text-gray-400 hover:text-primary transition-colors font-medium"
                >
                  Cancer Medicines
                </a>
              </li>
              {product && (
                <>
                  <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[9px]" /></li>
                  <li>
                    <a
                      href={`/cancer-medicines/${encodeURIComponent(getSubcategorySlug(getCategorizationDisplay(product)))}`}
                      className="text-gray-400 hover:text-primary transition-colors font-medium max-w-[120px] truncate inline-block align-bottom"
                    >
                      {getCategorizationDisplay(product)}
                    </a>
                  </li>
                  <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[9px]" /></li>
                  <li className="font-semibold text-gray-700 max-w-[160px] truncate">
                    {product.brandName || product.name || 'Product Details'}
                  </li>
                </>
              )}
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
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                      {product.brandName && product.genericName && product.brandName !== product.genericName
                        ? `${product.brandName} (${product.genericName})`
                        : product.name || product.brandName || product.genericName || 'Product Details'}
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
                                onError={(e) => { (e.target as HTMLImageElement).src = 'assets/no-image.png'; }}
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
                  <div className="border-b border-gray-100 mb-5">
                    <span className="inline-block pb-3 text-[13px] font-semibold" style={{ color: '#0D99FF', borderBottom: '2px solid #0D99FF' }}>Description</span>
                  </div>
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
                </div>

                {/* Also used for */}
                {(() => {
                  const allSubcats = getProductSubcategories(product);
                  const primarySubcat = getCategorizationDisplay(product);
                  const otherSubcats = allSubcats.filter(s => s !== primarySubcat);
                  if (otherSubcats.length === 0) return null;
                  return (
                    <div className="mt-4 px-5 pb-5">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Also used for</p>
                      <div className="flex flex-wrap gap-2">
                        {otherSubcats.map((sub, idx) => (
                          <a
                            key={idx}
                            href={`/cancer-medicines/${encodeURIComponent(getSubcategorySlug(sub))}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-blue-100 bg-blue-50 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                          >
                            <i className="fa-solid fa-arrow-right-to-bracket text-[9px]" />
                            {sub}
                          </a>
                        ))}
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
                    <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-primary border border-blue-100">
                      <i className="fa-solid fa-user-tag text-[9px]" />
                      {USER_TYPE_LABELS[userType]}
                    </span>
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
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Target Product</label>
                    <input
                      type="text"
                      readOnly
                      value={product.name || ''}
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
                  {userType === 'patient' && (
                  <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-2">Upload Prescription (Required)</label>
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf"
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
                  )}
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
              onError={(e) => { (e.target as HTMLImageElement).src = 'assets/no-image.png'; }}
            />
          </div>
        </div>
      )}

      <div id="footer-container" />
    </div>
  );
}
