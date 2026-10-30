'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useProducts, useCategories, useImageMapper } from '@/lib/useSanity';
import { urlFor } from '@/lib/sanity';
import type { Product as SanityProduct, Category } from '@/types/sanity';
import { getApiUrl } from '@/lib/api';
import { submitInquiry } from '@/lib/offlineInquiry';
import { Turnstile, useTurnstile } from '@/lib/turnstile';
import { loadDetails } from '@/lib/accountStore';
import { setPageMeta, injectJsonLd, truncateAtWord, ogImageForFolder, ORGANIZATION_ID } from '@/lib/seo';
import { validateFiles, ALLOWED_FILE_TYPES_ACCEPT } from '@/lib/fileUpload';
import AlertModal from '@/lib/AlertModal';
import { PortableText } from '@portabletext/react';
import { usePageReady } from '@/lib/handoff';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight, Plus, Search, ShieldCheck, Truck, UserPlus } from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';
import { contact } from '@/lib/data';
import { FDA_VERIFICATION_URL, ORDER_STEPS, productCrumbs, productOrderFaqs, productSearchDescription, productSearchName, productSearchTitle } from '@/lib/productFaq';
import './ProductDetailClient.css';

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

// Props are informational only: like the original, the product is resolved from
// window.location (path segment, then ?product=).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProductDetailClient(_props: { categorySlug?: string; productSlug?: string } = {}) {
  const { getImage } = useImageMapper('product-range');
  const { data: productsDataRaw, loading: productsLoading } = useProducts();
  const productsData = productsDataRaw as ProductWithCategory[] | null;
  const { data: categoriesData } = useCategories();
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [notFound, setNotFound] = useState(false);
  // Swaps out the prerendered copy of this product once the live one (or not-found) is drawn.
  usePageReady(!productsLoading && (product !== null || notFound));

  const [zoomedImageOpen, setZoomedImageOpen] = useState(false);
  // product-page FAQ accordion: first answer open, one at a time
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', message: '', age: '',
    address: '', contactName: '', contactRelationship: '', terms: false, privacyConsent: false
  });
  /**
   * Autofill from the account, matching the request list and the order form.
   * Fills only still-empty fields, and runs once — see the note in cart.tsx.
   */
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    loadDetails().then((d) => {
      if (!d) return;
      setFormData((f) => ({
        ...f,
        name: f.name || d.name || '',
        email: f.email || d.email || '',
        phone: f.phone || d.phone || '',
        age: f.age || d.age || '',
        address: f.address || d.address || '',
        contactName: f.contactName || d.contactName || '',
        contactRelationship: f.contactRelationship || d.contactRelationship || '',
      }));
    });
  }, []);

  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const ageDropdownRef = useRef<HTMLDivElement>(null);
  const [userTypeMenuOpen, setUserTypeMenuOpen] = useState(false);
  const userTypeMenuRef = useRef<HTMLDivElement>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  // One handle for both form variants: they are the two arms of a ternary, so
  // only ever one is mounted and the ref attaches to whichever that is.
  const turnstile = useTurnstile();
  const [userType, setUserType] = useState<string>('');
  const [userTypeConfirmed, setUserTypeConfirmed] = useState(false);
  const [prescriptionRequiredModalOpen, setPrescriptionRequiredModalOpen] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  // Patient/Caregiver flow only — mirrors the Customer Information form on order-medicines.tsx
  const [patientIdFile, setPatientIdFile] = useState<File | null>(null);
  const [contactSameAsPatient, setContactSameAsPatient] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title?: string; message: string | string[] } | null>(null);
  const showAlert = (message: string | string[], title?: string) => setAlertModal({ title, message });
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [idRequiredModalOpen, setIdRequiredModalOpen] = useState(false);
  const [idModalVisible, setIdModalVisible] = useState(false);

  // The order-medicines audience wording, singularised and joined with a slash:
  // that page names whole groups and reads as a list ("Patients & Families"),
  // while this one asks one person to pick which of two things they are.
  // Keys stay as they were — they are what reaches the sheet's userType column.
  // The inquiry types and form stay folded away until the visitor presses Order Now
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Short description under the price: three lines, "…" expands the rest. Overflow is measured so the
  // "…" only appears when there really is more text.
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryOverflows, setSummaryOverflows] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || summaryOpen) return;
    const measure = () => setSummaryOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [product, summaryOpen, inquiryOpen]);

  const USER_TYPE_LABELS: Record<string, string> = {
    patient:  'Patient / Family',
    doctor:   'Doctor / Healthcare Professional',
    pharmacy: 'Distributor / Pharmacy',
    hospital: 'Hospital / Institution',
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ut = params.get('userType');
    if (ut) {
      setUserType(ut);
      setUserTypeConfirmed(true);
      setInquiryOpen(true);
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

  // The same trail as { name, url } crumbs. Single source for both the visible breadcrumb
  // below and the BreadcrumbList JSON-LD, so the two cannot drift — Google requires the
  // marked-up trail to match the one the visitor can actually see.
  // Product Range › {Category} › {Product}: the prototype's trail, built by the same helper as the
  // server copy (src/lib/productFaq.ts) so the visible crumbs and both JSON-LD blocks always match.
  const getBreadcrumbTrail = (p: ProductWithCategory): Array<{ name: string; url: string | null }> =>
    productCrumbs({
      breadcrumb: p.breadcrumb,
      category: getBreadcrumbParts(p).filter((part) => part.toLowerCase() !== 'home')[0] || p.category?.category,
      categoryFolder: p.categoryFolder,
      brandName: p.brandName,
      name: p.name,
      strength: p.strength,
      isRx: p.prescription?.toUpperCase() === 'RX',
    });

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
        // productPageUrl from the sheet has no protocol (e.g. "getmeds.ph/cancer-medicines/..."),
        // so the leading domain segment has to be stripped even without an "https://" to match.
        const prettyPath = found.productPageUrl
          ? '/' + found.productPageUrl.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '')
          : `/${found.categoryFolder || 'product-range'}/${found.slug?.current || ''}`;

        // Canonicalize any other URL this product is reachable from — the legacy singular
        // "/cancer-medicine/<slug>" alias, the "/product-detail?product=<slug>" fallback, etc. —
        // to its one real Category-Folder URL. This is a live, data-driven redirect off the
        // product's own resolved productPageUrl, not a guessed/hardcoded slug mapping, so it
        // self-corrects for every legacy URL automatically without needing to know it in advance.
        if (prettyPath && window.location.pathname !== prettyPath) {
          // Drop the "product" query param specifically — it's just the lookup fallback's own
          // input mechanism, redundant once the real slug is already in the path — but keep any
          // other real param (e.g. "?userType=doctor") intact on the canonical URL.
          const carryOverParams = new URLSearchParams(window.location.search);
          carryOverParams.delete('product');
          const query = carryOverParams.toString();
          window.location.replace(prettyPath + (query ? `?${query}` : ''));
          return;
        }

        setProduct(found);
        const displayName = found.brandName && found.genericName && found.brandName !== found.genericName
          ? `${found.brandName} (${found.genericName})`
          : found.name || found.brandName || 'Product Details';
        // Google title/description follow the prototype's search format (src/lib/productFaq.ts), the
        // same text the server copy carries, so hydration never rewrites them to something else.
        const searchInput = { displayName, brandName: found.brandName, genericName: found.genericName, strength: found.strength, form: found.form, isRx: found.prescription?.toUpperCase() === 'RX' };
        const description = productSearchDescription(searchInput);
        const imgUrl = found.image ? urlFor(found.image).width(1200).url() : undefined;
        setPageMeta({
          title: productSearchTitle(searchInput),
          plainTitle: true,
          description: truncateAtWord(description, 160),
          path: prettyPath,
          // The category's share card, not the pack shot: medicine photography beside our paid
          // campaigns is what Meta flags, and matches what scripts/prerender-slugs.cjs serves.
          image: ogImageForFolder(found.categoryFolder),
          type: 'product',
        });
        // Kept field-for-field in step with the block scripts/prerender-slugs.cjs bakes in
        // under this same id — this overwrites that one on hydration, so anything missing
        // here is silently dropped from the rendered page's structured data.
        const isBranded = Boolean(found.brandName && found.genericName && found.brandName !== found.genericName);
        injectJsonLd('jsonld-drug', {
          '@type': 'Drug',
          name: displayName,
          ...(isBranded ? { alternateName: String(found.brandName).trim() } : {}),
          ...(found.genericName ? { nonProprietaryName: found.genericName, activeIngredient: found.genericName } : {}),
          // Only true for a row carrying a brand distinct from its generic name — a plain
          // generic has no proprietary name to claim.
          isProprietary: isBranded,
          ...(found.strength && found.form ? { dosageForm: `${found.form}, ${found.strength}` } : { dosageForm: found.form || found.strength }),
          description: truncateAtWord(description, 160),
          url: `${window.location.origin}${prettyPath}`,
          ...(imgUrl ? { image: imgUrl } : {}),
          legalStatus: 'Prescription only medicine (Rx), Philippines',
          prescriptionStatus: 'PrescriptionOnly',
          // Getmeds is the importer and distributor, never assumed to be the maker: omitted
          // unless the sheet's Manufacturer column is filled in for this SKU.
          ...(found.manufacturer ? { manufacturer: { '@type': 'Organization', name: String(found.manufacturer).trim() } } : {}),
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${window.location.origin}${prettyPath}`,
            publisher: { '@id': ORGANIZATION_ID },
          },
        });
        // Mirrors the BreadcrumbList baked in by scripts/prerender-slugs.cjs under this
        // same id, built from the trail the page actually renders. The final crumb carries
        // no "item" — it is the page the visitor is already on.
        const trail = getBreadcrumbTrail(found);
        const crumbs = [{ name: 'Home', url: '/' }, ...trail];
        if (crumbs.length > 1) {
          injectJsonLd('jsonld-breadcrumb', {
            '@type': 'BreadcrumbList',
            itemListElement: crumbs.map((crumb, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: crumb.name,
              ...(crumb.url && i < crumbs.length - 1 ? { item: `${window.location.origin}${crumb.url}` } : {}),
            })),
          });
        }
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
      if (errors.length > 0) showAlert(errors, 'Invalid File');
      setUploadedFiles(valid);
    }
  };

  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { valid, errors } = validateFiles([e.target.files[0]]);
      if (errors.length > 0) showAlert(errors, 'Invalid File');
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
        showAlert('Please fill in all required fields.');
        return;
      }
      if (!contactSameAsPatient && !formData.contactName) {
        showAlert("Please provide the contact person's full name.");
        return;
      }
      if (!formData.terms) {
        showAlert('Please confirm that all provided information is authentic.');
        return;
      }
      if (!formData.privacyConsent) {
        showAlert('Please consent to the Privacy Policy to proceed.');
        return;
      }
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (formData.phone && (phoneDigits.length < 7 || phoneDigits.length > 15)) {
      showAlert('Please enter a valid phone number.');
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
            turnstileToken: turnstile.token,
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
            turnstileToken: turnstile.token,
            files: filesData
          };

      // returnPath is left to default to the current URL: this form lives on a
      // per-product page, so "come back and finish it" must mean this product.
      const submission = await submitInquiry(payload, { endpoint: getApiUrl() });
      // Tokens are single-use, so the solved widget is replaced whatever the outcome.
      turnstile.reset();
      if (submission.status === 'failed') throw new Error(submission.error);

      setSubmitState('sent');
      resetForm();
      submission.status === 'sent' && setSuccessModalOpen(true);
      setTimeout(() => setSubmitState('idle'), 300);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  // (Next.js port) The layout's navbar is sticky across the whole page here, where the
  // original's scrolled away inside its own container — measured so the sticky breadcrumb
  // bar parks just below it instead of disappearing underneath it.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nav = document.getElementById('global-nav-wrapper');
    const apply = () => {
      if (!rootRef.current) return;
      const sticky = nav && getComputedStyle(nav).position === 'sticky';
      rootRef.current.style.setProperty('--pd-nav-h', `${nav && sticky ? nav.offsetHeight : 0}px`);
    };
    apply();
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(apply);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={rootRef} style={{ fontFamily: "'Poppins', sans-serif" }} className="product-detail-root flex flex-col bg-white text-slate-800 antialiased">
      <div className="flex-1">

        {/* Breadcrumb (sits under the floating navbar) */}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 pb-5 pt-28 md:px-10 md:pt-32">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[14px]">
              <li>
                <a href="/" className="text-primary transition-colors hover:text-primary-deep">
                  Home
                </a>
              </li>
              {product && (() => {
                // "Home > Category > Condition > Product" — precomputed in the
                // sheet (Breadcrumb (auto)); only "Home" is replaced above since
                // it should link to "/" instead of being plain text. The trail is
                // built by getBreadcrumbTrail so this and the BreadcrumbList JSON-LD
                // always render the same crumbs.
                const trail = getBreadcrumbTrail(product);
                return trail.map(({ name, url }, idx) => {
                  const isLast = idx === trail.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      <li aria-hidden className="text-slate-400"><ChevronRight className="h-3.5 w-3.5" /></li>
                      <li className={isLast ? 'font-semibold text-[#0B2E5E]' : ''}>
                        {url ? (
                          <a href={url} className="text-primary transition-colors hover:text-primary-deep">
                            {name}
                          </a>
                        ) : (
                          name
                        )}
                      </li>
                    </React.Fragment>
                  );
                });
              })()}
              {!product && productsLoading && (
                // placeholder crumbs while the product loads
                <li aria-hidden className="flex items-center gap-1.5 motion-safe:animate-pulse">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="h-3.5 w-16 rounded-full bg-slate-100" />
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="h-3.5 w-24 rounded-full bg-slate-100" />
                </li>
              )}
              {!product && !productsLoading && (
                <>
                  <li aria-hidden className="text-slate-400"><ChevronRight className="h-3.5 w-3.5" /></li>
                  <li className="font-semibold text-[#0B2E5E]">Product Details</li>
                </>
              )}
            </ol>
          </nav>
          <button
            className="hidden items-center gap-1.5 text-sm text-slate-500 transition hover:text-primary sm:flex"
            onClick={() => {
              if (typeof (window as any).openGetmedsChat === 'function') {
                (window as any).openGetmedsChat();
              } else if ((window as any).Tawk_API && typeof (window as any).Tawk_API.maximize === 'function') {
                (window as any).Tawk_API.maximize();
              }
            }}
          >
            <i className="fa-regular fa-circle-question" />
            <span>Do you need help?</span>
          </button>
        </div>

        {/* Loading skeleton: the same shape as the finished page below (photo + trust icons | order box),
            so nothing jumps when the product arrives */}
        {productsLoading && (
          <div role="status" aria-live="polite" className="mx-auto w-full max-w-7xl px-5 pb-20 md:px-10">
            <span className="sr-only">Loading product details…</span>
            <div aria-hidden className="grid grid-cols-1 gap-10 motion-safe:animate-pulse lg:grid-cols-[1.05fr_1fr] lg:gap-16 [&>*]:min-w-0">
              <div>
                <div className="aspect-square rounded-3xl bg-slate-100" />
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-100" />
                      <div className="h-3 w-24 max-w-full rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:pt-2">
                <div className="h-4 w-20 rounded-full bg-slate-100" />
                <div className="mt-5 h-11 w-3/4 rounded-xl bg-slate-200/80" />
                <div className="mt-3 h-5 w-1/2 rounded-full bg-slate-100" />
                <div className="mt-5 h-4 w-5/6 rounded-full bg-slate-100" />
                <div className="mt-7 h-7 w-40 rounded-lg bg-slate-200/80" />
                <div className="mt-2.5 h-4 w-56 max-w-full rounded-full bg-slate-100" />
                <div className="mt-6 space-y-2.5">
                  <div className="h-3.5 w-full rounded-full bg-slate-100" />
                  <div className="h-3.5 w-full rounded-full bg-slate-100" />
                  <div className="h-3.5 w-2/3 rounded-full bg-slate-100" />
                </div>
                <div className="my-7 h-px bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-100" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[28, 36, 28].map((w, i) => (
                    <div key={i} className="h-11 max-w-[30%] rounded-lg bg-slate-100" style={{ width: `${w * 4}px` }} />
                  ))}
                </div>
                <div className="mt-6 h-14 rounded-xl bg-slate-200/80" />
                <div className="mt-3 h-14 rounded-xl ring-2 ring-inset ring-slate-200" />
                <div className="mt-5 h-4 w-64 max-w-full rounded-full bg-slate-100" />
                <div className="mt-8 border-t border-slate-200">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex h-[62px] items-center justify-between border-b border-slate-200">
                      <div className="h-3 w-40 rounded-full bg-slate-100" />
                      <div className="h-3.5 w-3.5 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
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

        {/* Product detail content: details card left, inquiry card right */}
        {!productsLoading && product && (() => {
          const displayName = getProductDisplayName(product);
          const isRx = product.prescription?.toUpperCase() === 'RX';
          const inStock = product.availability !== false;
          const resolvedImageUrl = getProductImage(product);
          const hasImage = Boolean(resolvedImageUrl && !resolvedImageUrl.endsWith('no-image.png'));
          const indications = product.indications || (product as any).indication;
          const dosage = product.dosageAdministration || (product as any).dosageAndAdministration;
          const storage = product.storageCondition;
          const conditions = getProductSubcategories(product);
          const primaryCondition = getCategorizationDisplay(product);
          const orderedConditions = [primaryCondition, ...conditions.filter((c) => c !== primaryCondition)].filter((c) => conditions.includes(c));
          const conditionHref = (sub: string) => {
            const slug = product.conditionSlugsByName?.[sub]?.conditionSlug || sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return `/${product.categoryFolder || 'cancer-medicines'}/${slug}`;
          };
          // Other strengths of the same product group (e.g. every PacliGet vial size), each its own page
          const productHref = (p: ProductWithCategory) =>
            p.productPageUrl
              ? '/' + p.productPageUrl.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '')
              : `/${p.categoryFolder || 'product-range'}/${p.slug?.current || ''}`;
          const strengthValue = (p: ProductWithCategory) => parseFloat(String(p.strength || '').replace(/,/g, '').match(/[\d.]+/)?.[0] || '0');
          const variants = product.productGroup
            ? (productsData || [])
                .filter((p) => p.productGroup === product.productGroup && p.strength && p.slug?.current)
                .filter((p, i, all) => all.findIndex((q) => q.slug?.current === p.slug?.current) === i)
                .sort((a, b) => strengthValue(a) - strengthValue(b))
            : [];
          const genericLabel = productSearchName({ genericName: product.genericName, displayName });
          const faqs = productOrderFaqs({
            displayName,
            brandName: product.brandName,
            genericName: product.genericName,
            strengths: variants.length > 1 ? variants.map((v) => String(v.strength).split(/\\n|\n/)[0]) : [],
            isRx: true,
          });
          const specs: Array<[string, React.ReactNode]> = [];
          if (product.strength) specs.push(['Strength', formatFieldWithLineBreaks(product.strength)]);
          if (product.form) specs.push(['Form', formatFieldWithLineBreaks(product.form)]);
          if (product.packaging) specs.push(['Packaging', product.packaging]);

          const brand = product.brandName || product.name || displayName;
          const generic = product.brandName && product.genericName && product.brandName !== product.genericName ? product.genericName : '';
          const orderLabel = `Order ${displayName} online in the Philippines`;
          const whatsappHref = `${contact.whatsapp}?text=${encodeURIComponent(`Hi Getmeds, I would like to order ${displayName}. I have a prescription.`)}`;
          // Bring the order box back into view (it sits at the top of the page) and let the inquiry rise in
          const showOrderBox = () =>
            requestAnimationFrame(() => {
              const box = document.getElementById('gm-order-box');
              if (box && box.getBoundingClientRect().top < 90) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          const openInquiry = () => {
            setInquiryOpen(true);
            showOrderBox();
          };
          const closeInquiry = () => {
            setInquiryOpen(false);
            showOrderBox();
          };
          const summary = String(product.description || indications || '').replace(/\\n|\n/g, ' ').trim();
          const trust = [
            { Icon: ShieldCheck, label: 'FDA Philippines-licensed' },
            { Icon: BadgeCheck, label: 'Pharmacist-verified' },
            { Icon: Truck, label: 'Nationwide delivery' },
          ];
          const sections: Array<{ title: string; body: React.ReactNode }> = [];
          if (product.description || indications) {
            sections.push({
              title: 'Description',
              body: (
                <div className="space-y-4">
                  {product.description && <div>{renderRichContent(product.description)}</div>}
                  {indications && (
                    <div>
                      <h3 className="mb-1 text-[14px] font-semibold text-black">Indications</h3>
                      <div>{renderRichContent(indications)}</div>
                    </div>
                  )}
                </div>
              ),
            });
          }
          if (dosage) sections.push({ title: 'Dosage & Administration', body: renderRichContent(dosage) });
          if (storage) sections.push({ title: 'Storage', body: renderRichContent(storage) });
          if (isRx) {
            sections.push({
              title: 'Prescription Requirement',
              body: (
                <p>
                  This medicine is prescription-only (Rx). A valid prescription from a licensed
                  healthcare professional is required for purchase and dispensing, as regulated by
                  FDA Philippines under RA 9711. Product registrations can be checked with the{' '}
                  <a href={FDA_VERIFICATION_URL} target="_blank" rel="noopener" className="font-medium text-primary underline underline-offset-2 hover:text-primary-deep">
                    Food and Drug Administration Philippines
                  </a>.
                </p>
              ),
            });
          }
          if (specs.length || product.innovator) {
            sections.push({
              title: 'Product Details',
              body: (
                <dl className="grid gap-4 sm:grid-cols-2">
                  {specs.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[13px] text-slate-500">{label}</dt>
                      <dd className="mt-0.5 font-medium text-[#0B2E5E]">{value}</dd>
                    </div>
                  ))}
                  {product.innovator && (
                    <div>
                      <dt className="text-[13px] text-slate-500">Innovator</dt>
                      <dd className="mt-0.5 font-medium text-[#0B2E5E]">{product.innovator}</dd>
                    </div>
                  )}
                </dl>
              ),
            });
          }

          return (
          <div className="mx-auto w-full max-w-7xl px-5 pb-10 md:px-10">
            {/* product pages: the footer sits close under the how-to-order / FAQ block (the style unmounts with the page) */}
            <style>{'footer{margin-top:0!important}'}</style>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">

              {/* Gallery: one large photo with zoom, then what ordering here guarantees.
                  Sticky on lg+ so it stays beside the order box while the inquiry panel is open. */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div
                  onClick={hasImage ? () => setZoomedImageOpen(true) : undefined}
                  className={`group/zoom relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-[#f3f6f9] ${hasImage ? 'cursor-zoom-in' : ''}`}
                >
                  {hasImage ? (
                    <img
                      src={resolvedImageUrl}
                      className="h-full w-full object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover/zoom:scale-105 md:p-12"
                      alt={`${displayName}${product.form ? ` ${product.form}` : ''} by Getmeds Philippines`}
                      onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = '/assets/no-image.png'; }}
                    />
                  ) : (
                    <span className="text-sm text-slate-500">Product photo</span>
                  )}
                  {hasImage && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setZoomedImageOpen(true); }}
                      aria-label={`Zoom image of ${displayName}`}
                      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0B2E5E] shadow-[0_6px_16px_-8px_rgba(7,59,87,0.45)] transition hover:bg-primary hover:text-white"
                    >
                      <Search className="h-4.5 w-4.5" aria-hidden />
                    </button>
                  )}
                </div>
                <ul className="mt-8 grid grid-cols-3 gap-4 text-center">
                  {trust.map(({ Icon, label }) => (
                    <li key={label} className="flex flex-col items-center gap-2.5">
                      <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} aria-hidden />
                      <span className="text-[13px] text-slate-600">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order box. "Order Now" swaps its product details for the inquiry types, which rise into
                  place; "Back to product details" swaps back. The details stay in the page (only hidden), and
                  the page always loads with them showing, so search engines read the full product. */}
              <div id="gm-order-box" className="scroll-mt-28 lg:pt-2">
                {inquiryOpen && (
                  <div className="gm-rise">
                    <button
                      type="button"
                      onClick={closeInquiry}
                      className="group/back inline-flex items-center gap-2.5 rounded-full text-[14px] font-medium text-primary transition hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover/back:-translate-x-0.5 group-hover/back:bg-primary group-hover/back:text-white">
                        <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden />
                      </span>
                      Back to product details
                    </button>
                    <p className="font-display mt-4 text-[22px] font-semibold leading-tight text-[#0B2E5E]">
                      {brand}
                      {isRx && <span className="ml-1 align-super font-serif text-[0.55em] font-bold italic text-[#c0262d]" aria-label="Prescription required">Rx</span>}
                    </p>
                    {product.strength && <p className="mt-1 text-[14.5px] text-slate-600">{String(product.strength).split(/\\n|\n/)[0]}{product.form ? ` · ${String(product.form).split(/\\n|\n/)[0]}` : ''}</p>}

                    <div id="gm-inquiry" className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-[0_18px_40px_-28px_rgba(7,59,87,0.5)] sm:p-6">
                  <div className="mb-6">
                    <h2 className="font-display text-[26px] font-semibold leading-tight text-[#0B2E5E]">Send inquiry</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">Submit your details to get a formal quote for this product.</p>
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
                      <p className="mb-3 text-[15px] font-semibold text-[#0B2E5E]">Inquiry type:</p>
                      <div className="mb-5 space-y-3">
                        {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setUserType(value)}
                            aria-pressed={userType === value}
                            className={`flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left text-[15.5px] font-semibold transition ${userType === value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-[#0B2E5E] hover:border-primary/50'}`}
                          >
                            <UserPlus className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
                            {label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={!userType}
                        onClick={() => setUserTypeConfirmed(true)}
                        className="w-full rounded-xl bg-primary py-4 text-[16px] font-semibold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:bg-slate-400"
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
                            style={{ background: '#1D9FDA' }}>
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

                    <Turnstile turnstile={turnstile} />

                    <button
                      type="submit"
                      disabled={submitState === 'sending' || submitState === 'sent' || (turnstile.enabled && !turnstile.token)}
                      className="w-full text-white font-bold py-3 rounded-xl transition-all duration-500 transform active:scale-[0.98] mt-6 mb-4 text-[13px]"
                      style={submitState === 'sent'
                        ? { background: '#61A644' }
                        : { background: '#1D9FDA' }}
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
                    <Turnstile turnstile={turnstile} />

                    <button
                      type="submit"
                      disabled={submitState === 'sending' || submitState === 'sent' || (turnstile.enabled && !turnstile.token)}
                      className="w-full text-white font-bold py-3 rounded-xl transition-all duration-500 transform active:scale-[0.98] mt-6 mb-8 text-[13px]"
                      style={submitState === 'sent'
                        ? { background: '#61A644' }
                        : { background: '#1D9FDA' }}
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

                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex h-14 w-full items-center justify-center gap-2.5 rounded-full border-2 border-primary text-[15px] font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-primary/5"
                    >
                      <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                      Order via WhatsApp
                    </a>
                  </div>
                )}

                <div hidden={inquiryOpen} className={inquiryOpen ? '' : 'gm-rise'}>
                <div className="flex flex-wrap items-center gap-2.5">
                  {inStock && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2f7a23]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> In stock
                    </span>
                  )}
                </div>

                <h1 className="font-display mt-3 text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.08] tracking-tight text-[#0B2E5E]">
                  {brand}
                  {/* Rx mark, set like an exponent after the name. Screen readers hear "Prescription required";
                      the hover/focus label is drawn by CSS from data-tip, so the H1 text stays "DoseGet-20 Rx …". */}
                  {isRx && (
                    <>
                      {' '}
                      <span
                        role="img"
                        aria-label="Prescription required"
                        tabIndex={0}
                        data-tip="Prescription required"
                        className="relative inline-block cursor-help align-super font-serif text-[0.4em] font-bold italic leading-none tracking-normal text-[#c0262d] outline-none
                          after:pointer-events-none after:absolute after:left-full after:top-1/2 after:z-10 after:ml-2.5 after:-translate-y-1/2 after:translate-x-1 after:whitespace-nowrap after:rounded-md after:bg-[#0B2E5E] after:px-2.5 after:py-1.5 after:font-sans after:text-[12.5px] after:font-medium after:not-italic after:text-white after:opacity-0 after:shadow-lg after:transition after:duration-200 after:content-[attr(data-tip)]
                          hover:after:translate-x-0 hover:after:opacity-100 focus-visible:after:translate-x-0 focus-visible:after:opacity-100 focus-visible:underline focus-visible:decoration-2
                          max-sm:after:left-auto max-sm:after:right-0 max-sm:after:top-full max-sm:after:ml-0 max-sm:after:mt-2 max-sm:after:translate-y-0"
                      >
                        Rx
                      </span>
                    </>
                  )}
                  {generic ? ' ' : ''}
                  {generic && <span className="mt-1.5 block text-[clamp(0.95rem,1.3vw,1.1rem)] font-medium tracking-normal text-slate-500">{generic}</span>}
                </h1>

                {orderedConditions.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-slate-500">
                    <span>Used for</span>
                    {orderedConditions.map((sub, i) => (
                      <React.Fragment key={sub}>
                        <a href={conditionHref(sub)} className="font-medium text-primary transition hover:text-primary-deep">{sub}</a>
                        {i < orderedConditions.length - 1 && <span aria-hidden>&middot;</span>}
                      </React.Fragment>
                    ))}
                  </p>
                )}

                {/* Strength and form take the price spot: no online price for prescription medicines */}
                {(product.strength || product.form) && (
                  <div className="mt-5">
                    {product.strength && (
                      <p className="font-display text-[20px] font-semibold leading-tight text-[#0B2E5E]">{formatFieldWithLineBreaks(product.strength)}</p>
                    )}
                    {product.form && <p className="mt-1 text-[14px] text-slate-600">{formatFieldWithLineBreaks(product.form)}</p>}
                  </div>
                )}
                <p className="mt-2 text-[12.5px] text-slate-500">Price on request: our pharmacist sends a formal quote.</p>

                {/* Full text is always in the HTML (only clipped visually), so search engines read all of it;
                    the "…" at the end of line 3 expands it in place. */}
                {summary && (
                  <div className="relative mt-5">
                    <p
                      id="gm-summary"
                      ref={summaryRef}
                      className={`text-[14px] leading-relaxed text-slate-600 ${summaryOpen ? '' : 'max-h-[4.875em] overflow-hidden'}`}
                    >
                      {summary}
                      {summaryOpen && summaryOverflows && (
                        <button
                          type="button"
                          onClick={() => setSummaryOpen(false)}
                          aria-controls="gm-summary"
                          aria-expanded
                          className="ml-1.5 rounded text-[14px] font-medium text-primary transition hover:text-primary-deep"
                        >
                          Show less
                        </button>
                      )}
                    </p>
                    {!summaryOpen && summaryOverflows && (
                      <button
                        type="button"
                        onClick={() => setSummaryOpen(true)}
                        aria-controls="gm-summary"
                        aria-expanded={false}
                        aria-label="Show the full description"
                        title="Show the full description"
                        className="absolute bottom-0 right-0 flex items-center bg-gradient-to-r from-transparent via-white via-35% to-white pl-10 text-[15px] leading-relaxed"
                      >
                        <span className="rounded-full bg-primary/10 px-2.5 text-[18px] font-bold leading-[1.45] tracking-wider text-primary transition hover:bg-primary hover:text-white">…</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="my-7 h-px bg-slate-200" />

                {variants.length > 1 && (
                  <div className="mb-6">
                    <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#0B2E5E]">Strength</h2>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const current = v.slug?.current === product.slug?.current;
                        const label = String(v.strength).split(/\\n|\n/)[0];
                        return (
                          <li key={v.slug?.current}>
                            {current ? (
                              <span aria-current="page" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white">{label}</span>
                            ) : (
                              <a
                                href={productHref(v)}
                                title={`${getProductDisplayName(v)} ${label}`}
                                className="inline-flex rounded-full px-5 py-2.5 text-[14px] font-medium text-[#0B2E5E] ring-1 ring-slate-300 transition hover:text-primary hover:ring-primary"
                              >
                                {label}
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={openInquiry}
                    aria-expanded={inquiryOpen}
                    aria-controls="gm-order-box"
                    title={orderLabel}
                    className="group flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary text-[15px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-primary-deep"
                  >
                    Order Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full border-2 border-primary text-[15px] font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-primary/5"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                    Order via WhatsApp
                  </a>
                </div>
                <p className="mt-5 flex items-center gap-2.5 text-[14px] text-slate-600">
                  <Truck className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
                  Delivery across Luzon, Visayas and Mindanao
                </p>

                {/* Details as accordions; every panel stays in the page for search engines */}
                {sections.length > 0 && (
                  <div data-nosnippet className="mt-8 border-t border-slate-200">
                    {sections.map((sec, i) => (
                      <details key={sec.title} open={i === 0} className="group border-b border-slate-200">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                          <h2 className="text-[16px] font-semibold text-black">{sec.title}</h2>
                          <Plus className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                        </summary>
                        <div className="pb-6 text-[15px] leading-relaxed text-slate-600">{sec.body}</div>
                      </details>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* How to order + ordering FAQs (same wording as the server copy and its FAQPage data) */}
            <section aria-labelledby="order-heading" className="mt-16 grid gap-8 rounded-3xl bg-[#f6f9fb] p-6 md:mt-20 md:p-10 lg:grid-cols-[1fr_1.35fr] lg:gap-12">
              <div>
                <h2 id="order-heading" className="font-display text-[clamp(1.4rem,2.2vw,1.8rem)] font-semibold leading-tight text-[#0B2E5E]">
                  How to order {genericLabel} in the Philippines
                </h2>
                <ol className="mt-6 space-y-5">
                  {ORDER_STEPS.map(([title, text], i) => (
                    <li key={title} className="flex gap-4">
                      <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-semibold text-white">{i + 1}</span>
                      <span>
                        <span className="block text-[15.5px] font-semibold text-[#0B2E5E]">{title}</span>
                        <span className="mt-0.5 block text-[14.5px] text-slate-600">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={openInquiry}
                  className="mt-7 inline-flex items-center rounded-full bg-primary px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-primary-deep"
                >
                  Send an inquiry for {product.brandName || genericLabel}
                </button>
              </div>
              <div>
                <h2 className="font-display text-[clamp(1.4rem,2.2vw,1.8rem)] font-semibold leading-tight text-[#0B2E5E]">
                  Frequently asked questions
                </h2>
                <div className="mt-4 border-t border-slate-200">
                  {/* smooth accordion: the answer's row animates 0fr -> 1fr; answers stay in the DOM */}
                  {faqs.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div key={faq.q} className="border-b border-slate-200">
                        <h3>
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={`pd-faq-${i}`}
                            onClick={() => setOpenFaq(isOpen ? null : i)}
                            className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15.5px] font-semibold text-[#0B2E5E]"
                          >
                            {faq.q}
                            <Plus className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} aria-hidden />
                          </button>
                        </h3>
                        <div
                          id={`pd-faq-${i}`}
                          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                          <div className="overflow-hidden">
                            <p className="pb-5 text-[15px] leading-relaxed text-slate-600">{faq.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
          );
        })()}
      </div>



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

      <AlertModal
        open={!!alertModal}
        onClose={() => setAlertModal(null)}
        title={alertModal?.title}
        message={alertModal?.message ?? ''}
      />
    </div>
  );
}
