import React, { useEffect, useState, useRef } from 'react';

interface Product {
  name: string;
  category: string;
  price: number;
  img?: string;
}

const oncologyProducts: Product[] = [
  { name: "Cytarabine 100 MG / 5 ML", category: "Acute Myeloid Leukemia", price: 1850.00 },
  { name: "Idarubicin 5 MG VIAL", category: "Acute Myeloid Leukemia", price: 4200.00 },
  { name: "Imatinib (as Mesilate) 100 MG", category: "Chronic Myeloid Leukemia", price: 3200.00 },
  { name: "Hydroxyurea 500 MG", category: "Chronic Myeloid Leukemia", price: 1200.00 },
  { name: "Cytarabine 500 MG VIAL", category: "Acute Lymphocytic Leukemia", price: 2800.00 },
  { name: "Vincristine 1 MG / 1 ML", category: "Acute Lymphocytic Leukemia", price: 1500.00 },
  { name: "Bendamustine (as Hydrochloride) 100 MG", category: "Chronic Lymphocytic Leukemia", price: 12500.00 },
  { name: "Cytarabine 1 G VIAL", category: "Hodgkin/Non-Hodgkin's Lymphoma", price: 3500.00 },
  { name: "Methotrexate 50 MG / 2 ML", category: "Hodgkin/Non-Hodgkin's Lymphoma", price: 1650.00 },
  { name: "Vincristine 2 MG VIAL", category: "Hodgkin/Non-Hodgkin's Lymphoma", price: 2100.00 },
  { name: "Cyclophosphamide (as monohydrate) 500 MG", category: "Hodgkin/Non-Hodgkin's Lymphoma", price: 2800.00 },
  { name: "Bendamustine (as Hydrochloride) 25 MG", category: "Hodgkin/Non-Hodgkin's Lymphoma", price: 5600.00 },
  { name: "Bortezomib 3.5 MG VIAL", category: "Mantle Cell Lymphoma", price: 18500.00 },
  { name: "Cytarabine 100 MG", category: "Chronic Myelocytic Leukemia", price: 1850.00 },
  { name: "Cytarabine 100 MG / 5 ML (Meningeal)", category: "Meningeal Leukemia", price: 1950.00 },
  { name: "Imatinib (as Mesilate) 400 MG", category: "Acute Lymphoblastic Leukemia", price: 6800.00 },
  { name: "Idarubicin 10 MG VIAL", category: "Acute Lymphoblastic Leukemia", price: 7500.00 },
  { name: "Methotrexate 2.5 MG", category: "Acute Lymphoblastic Leukemia", price: 850.00 },
  { name: "Idarubicin 5 MG (Promyelocytic)", category: "Acute Promyelocytic Leukemia", price: 4200.00 },
  { name: "Hydroxyurea 500 MG (Sickle Cell)", category: "Sickle Cell Anemia", price: 1200.00 },
  { name: "Folic Acid", category: "Folate Deficiency Anemia", price: 350.00 },
  { name: "Ferrous Sulfate", category: "Iron Deficiency Anemia", price: 420.00 },
  { name: "Paclitaxel 100 MG / 16.7 ML", category: "Breast Cancer", price: 2150.00 },
  { name: "Docetaxel (as Trihydrate) 20 MG / 0.5 ML", category: "Breast Cancer", price: 1850.00 },
  { name: "Gemcitabine (as Hydrochloride) 1 G VIAL", category: "Breast Cancer", price: 3200.00 },
  { name: "Capecitabine 500 MG", category: "Breast Cancer", price: 1150.00 },
  { name: "Letrozole 2.5 MG", category: "Breast Cancer", price: 8900.00 },
  { name: "Anastrozole 1 MG", category: "Breast Cancer", price: 4200.00 },
  { name: "Cyclophosphamide (as monohydrate) 500 MG VIAL", category: "Breast Cancer", price: 2800.00 },
  { name: "Docetaxel RTU 20 MG / 2 ML", category: "Breast Cancer", price: 1950.00 },
  { name: "Methotrexate 50 MG / 2 ML", category: "Breast Cancer", price: 1500.00 },
  { name: "Lapatinib 250 MG", category: "Breast Cancer", price: 12500.00 },
  { name: "Paclitaxel 100 MG / 16.7 ML", category: "Ovarian Cancer", price: 2150.00 },
  { name: "Carboplatin 150 MG / 15 ML", category: "Ovarian Cancer", price: 3500.00 },
  { name: "Gemcitabine (as Hydrochloride) 1 G VIAL", category: "Ovarian Cancer", price: 3200.00 },
  { name: "Cyclophosphamide (as monohydrate) 500 MG VIAL", category: "Ovarian Cancer", price: 2800.00 },
  { name: "Paclitaxel 100 MG / 16.7 ML", category: "Non-Small Cell Lung Cancer", price: 2150.00 },
  { name: "Docetaxel (as Trihydrate) 20 MG / 0.5 ML", category: "Non-Small Cell Lung Cancer", price: 1850.00 },
  { name: "Gemcitabine (as Hydrochloride) 1 G VIAL", category: "Non-Small Cell Lung Cancer", price: 3200.00 },
  { name: "Pemetrexed (as Disodium Heptahydrate) 500 MG", category: "Non-Small Cell Lung Cancer", price: 4500.00 },
  { name: "Docetaxel RTU 20 MG / 2 ML", category: "Non-Small Cell Lung Cancer", price: 1950.00 },
  { name: "Docetaxel (as Trihydrate) 20 MG / 0.5 ML", category: "Prostate Cancer", price: 1850.00 },
  { name: "Abiraterone Acetate 250 MG", category: "Prostate Cancer", price: 15000.00 },
  { name: "Docetaxel RTU 20 MG / 2 ML", category: "Prostate Cancer", price: 1950.00 },
  { name: "Oxaliplatin 100 MG / 20 ML", category: "Colorectal Cancer", price: 5200.00 },
  { name: "Capecitabine 500 MG", category: "Colorectal Cancer", price: 1150.00 },
  { name: "Fluorouracil 500 MG / 10 ML", category: "Colorectal Cancer", price: 850.00 },
  { name: "Gemcitabine (as Hydrochloride) 1 G VIAL", category: "Pancreatic Cancer", price: 3200.00 },
  { name: "Fluorouracil 500 MG / 10 ML", category: "Pancreatic Cancer", price: 850.00 },
  { name: "Docetaxel (as Trihydrate) 20 MG / 0.5 ML", category: "Gastric Cancer", price: 1850.00 },
  { name: "Capecitabine 500 MG", category: "Gastric Cancer", price: 1150.00 },
  { name: "Fluorouracil 500 MG / 10 ML", category: "Gastric Cancer", price: 850.00 },
  { name: "Docetaxel RTU 20 MG / 2 ML", category: "Gastric Cancer", price: 1950.00 },
  { name: "Hydroxyurea 500 MG", category: "Head and Neck Cancer", price: 1200.00 },
  { name: "Pemetrexed (as Disodium Heptahydrate) 500 MG", category: "Malignant Pleural Mesothelioma", price: 4500.00 },
  { name: "Bleomycin (as Sulfate) 15 UNITS", category: "Malignant Pleural Effusion", price: 3800.00 },
  { name: "Imatinib (as Mesilate) 400 MG", category: "Gastrointestinal Stromal Tumors", price: 3200.00 },
  { name: "Cytarabine 100 MG / 16.7 ML INJECTION", category: "All", price: 1840.00, img: "assets/CYTAGET.png" },
  { name: "Docetaxel 50 MG", category: "All", price: 560.00, img: "assets/docetaxel.png" },
  { name: "Capecitabine 300 MCG / 1 ML INJECTION", category: "All", price: 1150.00, img: "assets/capecitabine.png" },
  { name: "Letrozole 250 MG / 5 ML PF SYRINGE", category: "All", price: 8900.00, img: "assets/letrozole.png" },
  { name: "Temozolomide 100 MG Caps", category: "All", price: 12450.00, img: "assets/temozolomide.png" },
  { name: "Folic Acid", category: "All", price: 350.00 },
  { name: "Ferrous Sulfate", category: "All", price: 420.00 },
  { name: "Amikacin (as sulfate)", category: "Respiratory Infections", price: 850.00 },
  { name: "Cefoxitin (as Sodium)", category: "Respiratory Infections", price: 920.00 },
  { name: "Cefazolin (as Sodium)", category: "Respiratory Infections", price: 780.00 },
  { name: "Vancomycin (as Hydrochloride)", category: "Respiratory Infections", price: 1500.00 },
  { name: "Cefoxitin (as Sodium)", category: "Urinary Tract Infections", price: 920.00 },
  { name: "Cefazolin (as Sodium)", category: "Urinary Tract Infections", price: 780.00 },
  { name: "Cefazolin (as Sodium)", category: "Skin and Soft Tissue Infections", price: 780.00 },
  { name: "Cefazolin (as Sodium)", category: "Bone and Joint Infections", price: 780.00 },
  { name: "Cefoxitin (as Sodium)", category: "Gynecological infections", price: 920.00 },
  { name: "Cefoxitin (as Sodium)", category: "Intra-abdominal infections", price: 920.00 },
  { name: "Polymyxin B", category: "Bloodstream infections", price: 2100.00 },
  { name: "Polymyxin B", category: "Ocular or topical infections", price: 2100.00 },
  { name: "Danazol", category: "Endometriosis", price: 1850.00 },
  { name: "Danazol", category: "Fibrocystic Breast Disease", price: 1850.00 },
  { name: "Finasteride", category: "Benign Prostatic Hyperplasia", price: 1200.00 },
  { name: "Bortezomib", category: "Multiple Myeloma", price: 18500.00 },
  { name: "Zoledronic Acid (as Monohydrate)", category: "Multiple Myeloma", price: 8500.00 },
  { name: "Zoledronic Acid (as Monohydrate)", category: "Glucocorticoid-Induced Osteoporosis", price: 8500.00 },
  { name: "Amiodarone Hydrochloride", category: "Arrhythmia management", price: 950.00 },
  { name: "Amlodipine", category: "Hypertension/Angina", price: 450.00 },
  { name: "Temozolomide", category: "Glioblastoma Multiforme", price: 12450.00 },
  { name: "Loratadine", category: "Seasonal Allergic Rhinitis", price: 350.00 },
  { name: "Cetirizine Hydrochloride", category: "Seasonal Allergic Rhinitis", price: 380.00 },
  { name: "Sevelamer Carbonate", category: "chronic kidney disease", price: 4200.00 },
  { name: "Tramadol", category: "Chronic Pain Management", price: 650.00 },
  { name: "Dexamethasone", category: "Inflammatory & Rheumatic Disorders", price: 450.00 },
  { name: "Iodine (as Iohexol)", category: "Radiologic imaging enhancement", price: 3200.00 },
];

const ITEMS_PER_PAGE = 12;

interface SubItem {
  label: string;
  isHeader?: boolean;
}

interface SidebarCategory {
  name: string;
  subItems: SubItem[];
}

const categoryIcons: Record<string, string> = {
  'Oncology / Hematology': 'fa-ribbon',
  'Hematology / Obstetrician / Gynecology': 'fa-heart',
  'Anti-Infectives': 'fa-shield-virus',
  'Endocrinology': 'fa-syringe',
  'Orthopedic': 'fa-bone',
  'Cardiology': 'fa-heart-pulse',
  'Neuro-Oncology': 'fa-brain',
  'Respiratory / Allergy': 'fa-lungs',
  'Nephrology / Renal': 'fa-droplet',
  'Pain Management': 'fa-pills',
  'Rheumatology': 'fa-person-walking',
  'Radiology': 'fa-x-ray',
};

const sidebarCategories: SidebarCategory[] = [
  {
    name: 'Oncology / Hematology',
    subItems: [
      { label: 'Breast Cancer' },
      { label: 'Ovarian Cancer' },
      { label: 'Non-Small Cell Lung Cancer' },
      { label: 'Prostate Cancer' },
      { label: 'Colorectal Cancer' },
      { label: 'Pancreatic Cancer' },
      { label: 'Gastric Cancer' },
      { label: 'Head and Neck Cancer' },
      { label: 'Malignant Pleural Mesothelioma' },
      { label: 'Malignant Pleural Effusion' },
      { label: 'Gastrointestinal Stromal Tumors' },
      { label: 'Hematology Range', isHeader: true },
      { label: 'Acute Myeloid Leukemia' },
      { label: 'Chronic Myeloid Leukemia' },
      { label: 'Acute Lymphocytic Leukemia' },
      { label: 'Chronic Lymphocytic Leukemia' },
      { label: "Hodgkin/Non-Hodgkin's Lymphoma" },
      { label: 'Mantle Cell Lymphoma' },
      { label: 'Chronic Myelocytic Leukemia' },
      { label: 'Meningeal Leukemia' },
      { label: 'Acute Lymphoblastic Leukemia' },
      { label: 'Acute Promyelocytic Leukemia' },
      { label: 'Sickle Cell Anemia' },
    ],
  },
  {
    name: 'Hematology / Obstetrician / Gynecology',
    subItems: [
      { label: 'Folate Deficiency Anemia' },
      { label: 'Iron Deficiency Anemia' },
    ],
  },
  {
    name: 'Anti-Infectives',
    subItems: [
      { label: 'Respiratory Infections' },
      { label: 'Urinary Tract Infections' },
      { label: 'Skin and Soft Tissue Infections' },
      { label: 'Bone and Joint Infections' },
      { label: 'Gynecological infections' },
      { label: 'Intra-abdominal infections' },
      { label: 'Bloodstream infections' },
      { label: 'Ocular or topical infections' },
    ],
  },
  {
    name: 'Endocrinology',
    subItems: [
      { label: 'Endometriosis' },
      { label: 'Fibrocystic Breast Disease' },
      { label: 'Benign Prostatic Hyperplasia' },
    ],
  },
  {
    name: 'Orthopedic',
    subItems: [
      { label: 'Multiple Myeloma' },
      { label: 'Glucocorticoid-Induced Osteoporosis' },
    ],
  },
  {
    name: 'Cardiology',
    subItems: [
      { label: 'Arrhythmia management' },
      { label: 'Hypertension/Angina' },
    ],
  },
  {
    name: 'Neuro-Oncology',
    subItems: [
      { label: 'Glioblastoma Multiforme' },
    ],
  },
  {
    name: 'Respiratory / Allergy',
    subItems: [
      { label: 'Seasonal Allergic Rhinitis' },
    ],
  },
  {
    name: 'Nephrology / Renal',
    subItems: [
      { label: 'chronic kidney disease' },
    ],
  },
  {
    name: 'Pain Management',
    subItems: [
      { label: 'Chronic Pain Management' },
    ],
  },
  {
    name: 'Rheumatology',
    subItems: [
      { label: 'Inflammatory & Rheumatic Disorders' },
    ],
  },
  {
    name: 'Radiology',
    subItems: [
      { label: 'Radiologic imaging enhancement' },
    ],
  },
];

export default function ProductRange() {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; price: string; img: string; category: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'usage' | 'precautions'>('description');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [searchHistoryCleared, setSearchHistoryCleared] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFlyoutCat, setActiveFlyoutCat] = useState<SidebarCategory | null>(null);
  const [flyoutVisible, setFlyoutVisible] = useState(false);

  const openFlyout = (cat: SidebarCategory) => {
    if (activeFlyoutCat?.name === cat.name && flyoutVisible) {
      setFlyoutVisible(false);
      setTimeout(() => setActiveFlyoutCat(null), 450);
      return;
    }
    setFlyoutVisible(false);
    setActiveFlyoutCat(cat);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyoutVisible(true);
      });
    });
  };

  const closeFlyout = () => {
    setFlyoutVisible(false);
    setTimeout(() => setActiveFlyoutCat(null), 450);
  };

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html')
        .then(r => r.text())
        .then(html => { navContainer.innerHTML = html; });
    }
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html')
        .then(r => r.text())
        .then(html => { footerContainer.innerHTML = html; });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('search');
    if (query) setSearchTerm(query);

    const handleClick = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const getFiltered = (category: string) =>
    oncologyProducts.filter(p =>
      category === 'All' ||
      p.category === category ||
      ((category === 'Oncology' || category === 'Oncology / Hematology') && p.category !== 'All')
    );

  const categoryFiltered = getFiltered(currentCategory);
  const searchFiltered = searchTerm
    ? categoryFiltered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : categoryFiltered;

  const sorted = [...searchFiltered].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleCat = (name: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectCategory = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  const openModal = (name: string, price: string, img: string, category: string) => {
    setSelectedProduct({ name, price, img, category });
    setActiveTab('description');
    setFormData({ name: '', phone: '', email: '', message: '' });
    setUploadedFiles([]);
    setSubmitState('idle');
    setModalOpen(true);
    setTimeout(() => setModalVisible(true), 10);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalOpen(false), 300);
    document.body.style.overflow = 'auto';
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
    setSubmitState('sending');
    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
    const filesData: { name: string; type: string; base64: string }[] = [];
    for (const file of uploadedFiles) {
      try {
        const base64 = await fileToBase64(file);
        filesData.push({ name: file.name, type: file.type, base64 });
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }
    const payload = { productName: selectedProduct?.name, ...formData, files: filesData };
    try {
      if (!SCRIPT_URL || SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setSubmitState('sent');
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

  const getPageRange = (current: number, total: number): (number | string)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1); pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      pages.push(current - 1); pages.push(current); pages.push(current + 1);
      pages.push('...'); pages.push(total);
    }
    return pages;
  };

  const scrollToTable = () => {
    if (tableRef.current) tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isCatParentActive = (cat: SidebarCategory) =>
    cat.subItems.some(s => !s.isHeader && s.label === currentCategory);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased flex flex-col h-screen overflow-hidden">
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .sidebar-scroll::-webkit-scrollbar-button { display: none; }
      `}</style>

      {/* NAVBAR — full width, sits above everything */}
      <div id="navbar-container" className="shrink-0 z-[50]" />

      {/* BODY ROW — sidebar + content, fills remaining height */}
      <div className="flex flex-1 min-h-0 relative">

      {/* ── FULL-HEIGHT SIDEBAR ── */}
      <aside
        className="shrink-0 overflow-y-auto z-40 hidden lg:flex flex-col bg-white border-r border-gray-100 sidebar-scroll relative"
        style={{ width: sidebarOpen ? '256px' : '0px', minWidth: 0, transition: 'width 0.3s ease', overflow: sidebarOpen ? 'auto' : 'hidden' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 whitespace-nowrap flex items-center justify-between">
          <p className="text-[15px] font-semibold text-gray-500">Categories</p>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            title="Collapse sidebar"
          >
            <i className="fa-solid fa-chevron-left text-[15px] text-gray-500" />
          </button>
        </div>
        <nav className="px-3 py-3 space-y-0.5">
          <button
            onClick={() => selectCategory('All')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-200"
            style={currentCategory === 'All' && !flyoutVisible
              ? { background: 'linear-gradient(to right, #61A644, #1D9FDA)', color: '#fff' }
              : { color: '#374151' }}
          >
            <span>All Products</span>
          </button>
          {sidebarCategories.map(cat => (
            <button
              key={cat.name}
              onClick={() => openFlyout(cat)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-200 hover:bg-gray-50"
              style={(flyoutVisible ? activeFlyoutCat?.name === cat.name : isCatParentActive(cat))
                ? { background: 'linear-gradient(to right, #61A644, #1D9FDA)', color: '#fff' }
                : { color: '#374151' }}
            >
              <span className="text-left leading-snug">{cat.name.replace(/\s*\/\s*/g, ' - ')}</span>
              <i className={`fa-solid fa-chevron-right text-[9px] shrink-0 ${(flyoutVisible ? activeFlyoutCat?.name === cat.name : isCatParentActive(cat)) ? 'text-white/70' : 'text-gray-400'}`} />
            </button>
          ))}
        </nav>
      </aside>

      {/* ── FLYOUT BACKDROP ── */}
      {activeFlyoutCat && (
        <div
          className="absolute inset-0 z-20"
          style={{
            backdropFilter: flyoutVisible ? 'blur(4px)' : 'blur(0px)',
            background: flyoutVisible ? 'rgba(0,0,0,0.08)' : 'transparent',
            transition: 'backdrop-filter 0.4s ease, background 0.4s ease',
          }}
          onClick={closeFlyout}
        />
      )}

      {/* ── FLYOUT SUBCATEGORY PANEL ── */}
      {activeFlyoutCat && (
        <div
          className="absolute z-30 bg-white shadow-2xl flex flex-col sidebar-scroll overflow-y-auto"
          style={{
            left: (sidebarOpen ? 256 : 0) + 12,
            top: '12px',
            bottom: '12px',
            width: '250px',
            borderRadius: '15px',
            transform: flyoutVisible ? 'translateX(0)' : 'translateX(-48px)',
            opacity: flyoutVisible ? 1 : 0,
            transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease',
          }}
        >
          {/* Flyout header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <p className="font-semibold text-gray-800 text-[13px] leading-snug">{activeFlyoutCat.name.replace(/\s*\/\s*/g, ' - ')}</p>
            <button onClick={closeFlyout} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <i className="fa-solid fa-xmark text-gray-500 text-[16px]" />
            </button>
          </div>
          {/* Sub-items */}
          <div className="px-2 py-2 space-y-0.5">
            {activeFlyoutCat.subItems.filter(s => !s.isHeader).map((sub, si) => (
              <button
                key={si}
                onClick={() => { selectCategory(sub.label); closeFlyout(); }}
                className="w-full text-left px-3 py-2.5 rounded-[8px] text-[13.5px] transition-all duration-150 hover:bg-gray-50"
                style={currentCategory === sub.label
                  ? { color: '#1D9FDA', fontWeight: 700, background: '#EFF8FF' }
                  : { color: '#6B7280' }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT COLUMN ── */}
      <div className="flex-1 min-w-0 overflow-y-auto" style={{ transition: 'all 0.3s ease' }}>

      {/* Hero Banner */}
      <section className="w-full px-4 md:px-6 pt-5 pb-4">
        <div
          className="relative rounded-[15px] overflow-hidden flex items-center px-8 md:px-12"
          style={{ background: 'linear-gradient(120deg, #3aaf5c 0%, #1a99d6 100%)', minHeight: '130px' }}
        >
          {/* Glowing blob */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />

          {/* Stacked card shapes — right side, overlapping like reference */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none" style={{ width: '220px', height: '90px' }}>
            {[
              { right: '160px', rotate: '-14deg', opacity: 0.35 },
              { right: '110px', rotate: '-7deg',  opacity: 0.50 },
              { right: '58px',  rotate: '-1deg',  opacity: 0.65 },
              { right: '0px',   rotate:  '6deg',  opacity: 0.45 },
            ].map((s, i) => (
              <div
                key={i}
                className="absolute w-16 h-[86px] rounded-2xl"
                style={{
                  right: s.right,
                  top: '50%',
                  transform: `translateY(-50%) rotate(${s.rotate})`,
                  background: `rgba(255,255,255,${s.opacity})`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </div>

          {/* Sidebar toggle — expand button when closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <i className="fa-solid fa-chevron-right text-[13px] text-white" />
            </button>
          )}

          {/* Text */}
          <div className={`relative z-10 transition-all duration-300 ${!sidebarOpen ? 'pl-8' : ''}`}>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
              GetMEDS Products
            </h1>
            <p className="text-white/75 text-[13px] mt-1 font-medium">Comprehensive catalog of pharmaceutical solutions.</p>
            <p className="text-white/60 text-[12px] font-medium">Browse categories and send inquiries directly.</p>
          </div>
        </div>
      </section>

        {/* ── PRODUCTS ── */}
        <section className="px-4 sm:px-6 lg:px-8 mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
                {currentCategory === 'All' ? 'All Products' : currentCategory}{' '}
                <span className="text-gray-400 font-normal text-sm ml-2">({sorted.length} Items)</span>
              </h2>

              {/* Search Bar */}
              <div className="relative w-full max-w-md mx-4" ref={searchWrapperRef}>
                <div className="bg-white rounded-full py-1 px-1.5 border border-gray-200 flex items-center">
                  <div className="relative flex-grow flex items-center ml-3">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 text-[13px]" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full bg-transparent border-none pl-2.5 pr-2 py-1.5 text-[13px] text-gray-700 outline-none placeholder-gray-400"
                    />
                  </div>
                  <button className="h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors duration-300 flex-shrink-0 active:scale-95 group">
                    <i className="fa-solid fa-sliders text-[10px] group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h4 className="text-[12px] font-medium text-gray-500">Recent Searches</h4>
                      <button
                        onClick={() => setSearchHistoryCleared(true)}
                        className="text-[11px] font-bold text-primary hover:text-blue-700 transition"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1 mb-4">
                      {!searchHistoryCleared ? (
                        <div className="flex items-center justify-between p-2 hover:bg-blue-50/50 rounded-xl cursor-pointer group transition">
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left text-gray-300 text-[11px]" />
                            <span className="text-[13px] text-gray-600 font-medium">Oncology Medicines</span>
                          </div>
                          <i className="fa-solid fa-xmark text-gray-300 hover:text-red-500 text-[10px] transition opacity-0 group-hover:opacity-100" />
                        </div>
                      ) : (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                          <i className="fa-solid fa-ghost text-gray-300 text-2xl mb-3 block" />
                          <p className="text-xs font-semibold text-gray-400">No search history found</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h4 className="text-[12px] font-medium text-gray-500">Suggested</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-3 p-2 hover:bg-blue-50/50 rounded-xl cursor-pointer transition group">
                        <div className="w-10 h-10 bg-white border border-gray-100 p-1.5 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="assets/CYTAGET.png" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300" alt="Cytarabine" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-gray-800">Cytarabine</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">₱ 1,840.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[13px] text-gray-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="appearance-none bg-white border border-blue-200 hover:border-primary rounded-full pl-4 pr-8 py-1.5 text-[13px] font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                  >
                    <option>Popularity</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div ref={tableRef} className="overflow-x-auto bg-white rounded-[10px] border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Product</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Category</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Price</th>
                    <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((p, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                            <img
                              src={p.img || 'assets/no-image.png'}
                              alt={p.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=PHARMA'; }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className="text-[14px] font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
                              onClick={() => openModal(p.name, formatPrice(p.price), p.img || 'assets/no-image.png', p.category)}
                            >
                              {p.name}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Available: <span className="text-success font-bold">In Stock</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{p.category}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-gray-900">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openModal(p.name, formatPrice(p.price), p.img || 'assets/no-image.png', p.category)}
                          className="bg-primary hover:bg-blue-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <i className="fa-solid fa-paper-plane text-[10px]" />
                          Send Inquiry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => { if (currentPage > 1) { setCurrentPage(p => p - 1); scrollToTable(); } }}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer select-none ${currentPage === 1 ? 'border border-gray-100 text-gray-300 cursor-not-allowed' : 'border border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}
                >
                  <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                {getPageRange(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={i} className="text-gray-400 px-1 flex items-center">...</span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => { setCurrentPage(p as number); scrollToTable(); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer select-none ${p === currentPage ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => { if (currentPage < totalPages) { setCurrentPage(p => p + 1); scrollToTable(); } }}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer select-none ${currentPage === totalPages ? 'border border-gray-100 text-gray-300 cursor-not-allowed' : 'border border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}
                >
                  <i className="fa-solid fa-chevron-right text-xs" />
                </button>
              </div>
            )}
        </section>

        <div id="footer-container" />
      </div>
      </div>{/* end body row */}

      {/* Inquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"
            style={{ background: 'rgba(26,32,44,0.6)' }}
            onClick={closeModal}
          />
          <div
            className={`relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[15px] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 ${modalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-4">
                <img src="assets/getmedslogo.png" alt="GetMEDS Logo" className="h-6 w-auto object-contain" />
                <h3 className="text-base font-semibold text-gray-800 border-l border-gray-200 pl-4">
                  Product Details & Inquiry
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <button className="hidden sm:flex items-center text-gray-500 hover:text-primary transition text-sm space-x-1.5">
                  <i className="fa-regular fa-circle-question" />
                  <span>Do you need help?</span>
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800 transition border border-gray-200 hover:border-gray-300 rounded-full w-8 h-8 flex items-center justify-center bg-white shadow-sm hover:shadow"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-0 flex flex-col lg:flex-row bg-white">

              {/* Left Column: Product Info */}
              <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="flex flex-col-reverse md:flex-row gap-8 mb-8">
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="flex flex-nowrap whitespace-nowrap items-center gap-3 mb-3 text-sm text-gray-600">
                      <span className="flex items-center font-medium" style={{ color: '#61A644' }}>
                        <i className="fa-solid fa-check mr-1.5" /> In stock
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="capitalize font-medium" style={{ color: '#0D99FF' }}>
                        {selectedProduct?.category}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                      {selectedProduct?.name}
                    </h1>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      An antimetabolite chemotherapy drug used principally in the treatment of cancers of white blood cells such as acute myeloid leukemia (AML) and non-Hodgkin lymphoma.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-[200px] aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-[15px] border border-gray-100 text-gray-300 group transition hover:bg-gray-100/50">
                      <i className="fa-regular fa-image text-4xl mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium uppercase tracking-wider">Product Image</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[15px] border border-gray-100 p-5 mt-auto">
                  <div className="flex overflow-x-auto border-b border-gray-100 mb-5 gap-6">
                    {(['description', 'usage', 'precautions'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className="pb-3 text-[13px] whitespace-nowrap transition-colors"
                        style={activeTab === tab
                          ? { color: '#0D99FF', borderBottom: '2px solid #0D99FF', fontWeight: 600 }
                          : { color: '#6B7280', fontWeight: 500 }}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="text-[13px] text-gray-600 leading-relaxed max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'description' && (
                      <div>
                        <p>
                          Cytarabine belongs to a general group of medicines known as antimetabolites. It is used to treat some types of cancer of the blood (leukemia). Cytarabine works by interfering with the growth of cancer cells, which are eventually destroyed by the body.
                        </p>
                        <ul className="list-disc pl-5 mt-3 space-y-1">
                          <li>Effective in acutely inducing remission.</li>
                          <li>High concentration formulation.</li>
                        </ul>
                      </div>
                    )}
                    {activeTab === 'usage' && (
                      <div>
                        <p>This drug is administered by a healthcare professional in a clinical or hospital setting. The dosage and schedule will be determined by your doctor.</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                          <p className="text-[12px] text-yellow-700 font-medium">Never attempt to self-administer unless explicitly instructed.</p>
                        </div>
                      </div>
                    )}
                    {activeTab === 'precautions' && (
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Tell your doctor if you have ever had an unusual or allergic reaction to cytarabine.</li>
                        <li>Inform your doctor if you have liver or kidney disease.</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry Form */}
              <div className="lg:w-1/2 bg-white p-6 lg:p-8 pb-10">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900">Send Inquiry</h4>
                  <p className="text-xs text-gray-500 mt-1">Submit your details to get a formal quote for this product.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Target Product</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedProduct?.name || ''}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none cursor-default"
                      style={{ color: '#0D99FF' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+63 900 000 0000"
                      value={formData.phone}
                      onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Email Address</label>
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
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Message</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us more about your requirements..."
                      value={formData.message}
                      onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Upload Prescription (Optional)</label>
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
                  <button
                    type="submit"
                    disabled={submitState === 'sending' || submitState === 'sent'}
                    className="w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-500 transform active:scale-[0.98] mt-6 mb-8 text-[13px]"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
