import React, { useState, useEffect, useRef } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { getApiUrl } from '../lib/api';
import { setPageMeta } from '../lib/seo';
import { validateFiles, ALLOWED_FILE_TYPES_ACCEPT } from '../lib/fileUpload';


export default function OrderMedicines() {
  useEffect(() => {
    setPageMeta({
      title: 'Order Medicines',
      description: 'A simple 3-step process designed for your convenience.',
      path: '/order-medicines.html',
    });
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalSlides = 3;

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const ageDropdownRef = useRef<HTMLDivElement>(null);
  const [phoneCountry, setPhoneCountry] = useState({ code: '+63', flag: '🇵🇭', name: 'Philippines', mask: '### ### ####' });
  const [phoneSearch, setPhoneSearch] = useState('');

  const PHONE_COUNTRIES = [
    { code: '+63', flag: '🇵🇭', name: 'Philippines', mask: '### ### ####' },
    { code: '+61', flag: '🇦🇺', name: 'Australia', mask: '### ### ###' },
    { code: '+880', flag: '🇧🇩', name: 'Bangladesh', mask: '####-######' },
    { code: '+855', flag: '🇰🇭', name: 'Cambodia', mask: '## ### ###' },
    { code: '+86', flag: '🇨🇳', name: 'China', mask: '### #### ####' },
    { code: '+852', flag: '🇭🇰', name: 'Hong Kong', mask: '#### ####' },
    { code: '+91', flag: '🇮🇳', name: 'India', mask: '##### #####' },
    { code: '+62', flag: '🇮🇩', name: 'Indonesia', mask: '###-####-####' },
    { code: '+81', flag: '🇯🇵', name: 'Japan', mask: '##-####-####' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea', mask: '##-####-####' },
    { code: '+856', flag: '🇱🇦', name: 'Laos', mask: '## ### ###' },
    { code: '+60', flag: '🇲🇾', name: 'Malaysia', mask: '##-#### ####' },
    { code: '+960', flag: '🇲🇻', name: 'Maldives', mask: '###-####' },
    { code: '+976', flag: '🇲🇳', name: 'Mongolia', mask: '#### ####' },
    { code: '+95', flag: '🇲🇲', name: 'Myanmar', mask: '## ### ####' },
    { code: '+977', flag: '🇳🇵', name: 'Nepal', mask: '##-###-####' },
    { code: '+64', flag: '🇳🇿', name: 'New Zealand', mask: '### ### ####' },
    { code: '+92', flag: '🇵🇰', name: 'Pakistan', mask: '###-#######' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore', mask: '#### ####' },
    { code: '+94', flag: '🇱🇰', name: 'Sri Lanka', mask: '## ### ####' },
    { code: '+886', flag: '🇹🇼', name: 'Taiwan', mask: '#### ######' },
    { code: '+66', flag: '🇹🇭', name: 'Thailand', mask: '##-####-####' },
    { code: '+84', flag: '🇻🇳', name: 'Vietnam', mask: '### ### ####' },
    { code: '+973', flag: '🇧🇭', name: 'Bahrain', mask: '#### ####' },
    { code: '+964', flag: '🇮🇶', name: 'Iraq', mask: '### ### ####' },
    { code: '+972', flag: '🇮🇱', name: 'Israel', mask: '##-###-####' },
    { code: '+962', flag: '🇯🇴', name: 'Jordan', mask: '## #### ####' },
    { code: '+965', flag: '🇰🇼', name: 'Kuwait', mask: '#### ####' },
    { code: '+961', flag: '🇱🇧', name: 'Lebanon', mask: '## ### ###' },
    { code: '+968', flag: '🇴🇲', name: 'Oman', mask: '#### ####' },
    { code: '+974', flag: '🇶🇦', name: 'Qatar', mask: '#### ####' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', mask: '## ### ####' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey', mask: '### ### ####' },
    { code: '+971', flag: '🇦🇪', name: 'UAE', mask: '## ### ####' },
    { code: '+967', flag: '🇾🇪', name: 'Yemen', mask: '### ### ###' },
    { code: '+355', flag: '🇦🇱', name: 'Albania', mask: '## ### ####' },
    { code: '+43', flag: '🇦🇹', name: 'Austria', mask: '### #######' },
    { code: '+32', flag: '🇧🇪', name: 'Belgium', mask: '### ## ## ##' },
    { code: '+387', flag: '🇧🇦', name: 'Bosnia', mask: '## ###-###' },
    { code: '+359', flag: '🇧🇬', name: 'Bulgaria', mask: '## ### ####' },
    { code: '+385', flag: '🇭🇷', name: 'Croatia', mask: '## ### ####' },
    { code: '+357', flag: '🇨🇾', name: 'Cyprus', mask: '## ######' },
    { code: '+420', flag: '🇨🇿', name: 'Czech Republic', mask: '### ### ###' },
    { code: '+45', flag: '🇩🇰', name: 'Denmark', mask: '## ## ## ##' },
    { code: '+372', flag: '🇪🇪', name: 'Estonia', mask: '#### ####' },
    { code: '+358', flag: '🇫🇮', name: 'Finland', mask: '## ### ####' },
    { code: '+33', flag: '🇫🇷', name: 'France', mask: '## ## ## ## ##' },
    { code: '+49', flag: '🇩🇪', name: 'Germany', mask: '#### #######' },
    { code: '+30', flag: '🇬🇷', name: 'Greece', mask: '### ### ####' },
    { code: '+36', flag: '🇭🇺', name: 'Hungary', mask: '## ### ####' },
    { code: '+354', flag: '🇮🇸', name: 'Iceland', mask: '### ####' },
    { code: '+353', flag: '🇮🇪', name: 'Ireland', mask: '## ### ####' },
    { code: '+39', flag: '🇮🇹', name: 'Italy', mask: '### ### ####' },
    { code: '+371', flag: '🇱🇻', name: 'Latvia', mask: '## ### ###' },
    { code: '+370', flag: '🇱🇹', name: 'Lithuania', mask: '### #####' },
    { code: '+352', flag: '🇱🇺', name: 'Luxembourg', mask: '### ### ###' },
    { code: '+356', flag: '🇲🇹', name: 'Malta', mask: '#### ####' },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands', mask: '## ### ####' },
    { code: '+47', flag: '🇳🇴', name: 'Norway', mask: '### ## ###' },
    { code: '+48', flag: '🇵🇱', name: 'Poland', mask: '### ### ###' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal', mask: '### ### ###' },
    { code: '+40', flag: '🇷🇴', name: 'Romania', mask: '### ### ###' },
    { code: '+7', flag: '🇷🇺', name: 'Russia', mask: '### ###-##-##' },
    { code: '+381', flag: '🇷🇸', name: 'Serbia', mask: '## ### ####' },
    { code: '+421', flag: '🇸🇰', name: 'Slovakia', mask: '### ### ###' },
    { code: '+386', flag: '🇸🇮', name: 'Slovenia', mask: '## ### ###' },
    { code: '+34', flag: '🇪🇸', name: 'Spain', mask: '### ### ###' },
    { code: '+46', flag: '🇸🇪', name: 'Sweden', mask: '##-### ## ##' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland', mask: '## ### ## ##' },
    { code: '+380', flag: '🇺🇦', name: 'Ukraine', mask: '## ### ## ##' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom', mask: '#### ######' },
    { code: '+1', flag: '🇺🇸', name: 'USA / Canada', mask: '(###) ###-####' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina', mask: '## ####-####' },
    { code: '+591', flag: '🇧🇴', name: 'Bolivia', mask: '#### ####' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil', mask: '(##) #####-####' },
    { code: '+56', flag: '🇨🇱', name: 'Chile', mask: '## #### ####' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia', mask: '### ### ####' },
    { code: '+506', flag: '🇨🇷', name: 'Costa Rica', mask: '#### ####' },
    { code: '+53', flag: '🇨🇺', name: 'Cuba', mask: '## ###-####' },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador', mask: '## ### ####' },
    { code: '+503', flag: '🇸🇻', name: 'El Salvador', mask: '#### ####' },
    { code: '+502', flag: '🇬🇹', name: 'Guatemala', mask: '#### ####' },
    { code: '+504', flag: '🇭🇳', name: 'Honduras', mask: '#### ####' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico', mask: '## #### ####' },
    { code: '+505', flag: '🇳🇮', name: 'Nicaragua', mask: '#### ####' },
    { code: '+507', flag: '🇵🇦', name: 'Panama', mask: '#### ####' },
    { code: '+595', flag: '🇵🇾', name: 'Paraguay', mask: '### ### ###' },
    { code: '+51', flag: '🇵🇪', name: 'Peru', mask: '### ### ###' },
    { code: '+1787', flag: '🇵🇷', name: 'Puerto Rico', mask: '###-####' },
    { code: '+598', flag: '🇺🇾', name: 'Uruguay', mask: '## ### ####' },
    { code: '+58', flag: '🇻🇪', name: 'Venezuela', mask: '###-#######' },
    { code: '+213', flag: '🇩🇿', name: 'Algeria', mask: '### ## ## ##' },
    { code: '+244', flag: '🇦🇴', name: 'Angola', mask: '### ### ###' },
    { code: '+229', flag: '🇧🇯', name: 'Benin', mask: '## ## ## ##' },
    { code: '+267', flag: '🇧🇼', name: 'Botswana', mask: '## ### ###' },
    { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', mask: '## ## ## ##' },
    { code: '+237', flag: '🇨🇲', name: 'Cameroon', mask: '#### ####' },
    { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", mask: '## ## ## ##' },
    { code: '+20', flag: '🇪🇬', name: 'Egypt', mask: '### ### ####' },
    { code: '+251', flag: '🇪🇹', name: 'Ethiopia', mask: '## ### ####' },
    { code: '+233', flag: '🇬🇭', name: 'Ghana', mask: '## ### ####' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya', mask: '### ######' },
    { code: '+261', flag: '🇲🇬', name: 'Madagascar', mask: '## ## ### ##' },
    { code: '+265', flag: '🇲🇼', name: 'Malawi', mask: '#### ####' },
    { code: '+223', flag: '🇲🇱', name: 'Mali', mask: '## ## ## ##' },
    { code: '+212', flag: '🇲🇦', name: 'Morocco', mask: '###-######' },
    { code: '+258', flag: '🇲🇿', name: 'Mozambique', mask: '## ### ####' },
    { code: '+264', flag: '🇳🇦', name: 'Namibia', mask: '## ### ####' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria', mask: '### ### ####' },
    { code: '+250', flag: '🇷🇼', name: 'Rwanda', mask: '### ### ###' },
    { code: '+221', flag: '🇸🇳', name: 'Senegal', mask: '## ### ## ##' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa', mask: '## ### ####' },
    { code: '+249', flag: '🇸🇩', name: 'Sudan', mask: '## ### ####' },
    { code: '+255', flag: '🇹🇿', name: 'Tanzania', mask: '### ### ###' },
    { code: '+216', flag: '🇹🇳', name: 'Tunisia', mask: '## ### ###' },
    { code: '+256', flag: '🇺🇬', name: 'Uganda', mask: '### ######' },
    { code: '+260', flag: '🇿🇲', name: 'Zambia', mask: '## #######' },
    { code: '+263', flag: '🇿🇼', name: 'Zimbabwe', mask: '## ### ####' },
  ];

  const applyMask = (raw: string, mask: string) => {
    const digits = raw.replace(/\D/g, '');
    let result = '';
    let di = 0;
    for (let i = 0; i < mask.length && di < digits.length; i++) {
      if (mask[i] === '#') { result += digits[di++]; }
      else { result += mask[i]; }
    }
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursorPos = e.target.selectionStart ?? raw.length;
    const digitsBeforeCursor = raw.slice(0, cursorPos).replace(/\D/g, '').length;
    const formatted = applyMask(raw, phoneCountry.mask);
    setFormData(prev => ({ ...prev, phone: formatted }));
    requestAnimationFrame(() => {
      const el = phoneInputRef.current;
      if (!el) return;
      let count = 0;
      let newPos = formatted.length;
      if (digitsBeforeCursor === 0) {
        newPos = 0;
      } else {
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            count++;
            if (count === digitsBeforeCursor) { newPos = i + 1; break; }
          }
        }
      }
      el.setSelectionRange(newPos, newPos);
    });
  };

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [validationSubmitted, setValidationSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    age: '',
    dob: '',
    address: '',
    contactName: '',
    contactRelationship: '',
    terms: false,
    privacyConsent: false
  });
  const [patientIdFile, setPatientIdFile] = useState<File | null>(null);
  const [contactSameAsPatient, setContactSameAsPatient] = useState(false);

  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { valid, errors } = validateFiles([e.target.files[0]]);
      if (errors.length > 0) alert(errors.join('\n'));
      if (valid.length > 0) setPatientIdFile(valid[0]);
      e.target.value = '';
    }
  };
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [idRequiredModalOpen, setIdRequiredModalOpen] = useState(false);
  const [idModalVisible, setIdModalVisible] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdFile) {
      setIdRequiredModalOpen(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setIdModalVisible(true)));
      return;
    }
    if (!formData.patientName || !formData.email || !formData.phone || !formData.age || !formData.address) {
      alert('Please fill in all required fields.');
      return;
    }
    const expectedPhoneDigits = (phoneCountry.mask.match(/#/g) || []).length;
    if (formData.phone.replace(/\D/g, '').length !== expectedPhoneDigits) {
      alert('Please enter a valid phone number.');
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
    setSubmitState('sending');

    const filesData: { name: string; type: string; base64: string; category: 'id' | 'prescription' }[] = [];
    for (const file of uploadedFiles) {
      try {
        const base64 = await fileToBase64(file);
        filesData.push({ name: file.name, type: file.type, base64, category: 'prescription' });
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }
    try {
      const base64 = await fileToBase64(patientIdFile);
      filesData.push({ name: patientIdFile.name, type: patientIdFile.type, base64, category: 'id' });
    } catch (err) {
      console.error('Error processing file:', patientIdFile.name, err);
    }

    const contactInfo = contactSameAsPatient
      ? 'Same as patient'
      : `${formData.contactName}${formData.contactRelationship ? ` (${formData.contactRelationship})` : ''}`;

    try {
      const payload = {
        inquiryType: 'Order Medicine',
        fullName: formData.patientName,
        email: formData.email,
        phone: `${phoneCountry.code} ${formData.phone}`,
        message: `Medicine Order Request. DOB: ${formData.dob}, Age: ${formData.age}, Address: ${formData.address}, Contact Person: ${contactInfo}`,
        additionalData: {
          dob: formData.dob,
          age: formData.age,
          address: formData.address,
          contactSameAsPatient,
          contactName: formData.contactName,
          contactRelationship: formData.contactRelationship,
          privacyPolicyConsent: formData.privacyConsent
        },
        files: filesData
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Order submission failed.');

      setSubmitState('sent');
      setValidationSubmitted(true);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  // Slider auto-advance (kept for state compatibility)
  useEffect(() => {
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => { if (slideIntervalRef.current) clearInterval(slideIntervalRef.current); };
  }, []);

  // Clear upload timers on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
      if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);
    };
  }, []);

  const goToSlide = (index: number) => {
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    setCurrentSlide(index);
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
  };

  const openUploadModal = () => {
    setModalOpen(true);
    setProgress(0);
    let prog = 0;
    uploadIntervalRef.current = setInterval(() => {
      prog += Math.floor(Math.random() * 15) + 5;
      if (prog >= 100) {
        prog = 100;
        if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
        uploadTimeoutRef.current = setTimeout(() => {
          setUploadComplete(true);
          closeUploadModal();
        }, 500);
      }
      setProgress(prog);
    }, 400);
  };

  const closeUploadModal = () => {
    setModalOpen(false);
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);
    uploadTimeoutRef.current = setTimeout(() => setProgress(0), 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { valid, errors } = validateFiles(Array.from(e.target.files));
      if (errors.length > 0) alert(errors.join('\n'));
      if (valid.length > 0) {
        setUploadedFiles(prev => [...prev, ...valid]);
        openUploadModal();
      }
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!phoneCountryOpen) return;
    const close = () => setPhoneCountryOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [phoneCountryOpen]);

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
    const caObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as Element).classList.add('ca-in');
          caObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.ca-anim').forEach(el => caObserver.observe(el));
    return () => caObserver.disconnect();
  }, []);

  // Suppress unused warning — goToSlide kept for potential external use
  void goToSlide;
  void currentSlide;

  const GUIDE_ITEMS = [
    "Patient's full name",
    "Medicine name, dosage, and quantity",
    "Prescribing physician's name and PRC license number",
    "Clinic/hospital address and physician's signature",
    "Valid date",
  ];

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">
      <style>{`
        @media (max-width: 767px) {
          html { scroll-behavior: smooth; }
        }

        .ca-anim{opacity:0}
        .ca-anim.ca-in{animation-fill-mode:both}
        .ca-up.ca-in{animation:caFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .ca-left.ca-in{animation:caFadeLeft 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .ca-right.ca-in{animation:caFadeRight 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .ca-zoom.ca-in{animation:caZoomIn 0.6s cubic-bezier(0.22,1,0.36,1) both}
        .ca-fade.ca-in{animation:caFadeIn 0.7s ease both}
        .ca-d1.ca-in{animation-delay:0.1s}.ca-d2.ca-in{animation-delay:0.2s}
        .ca-d3.ca-in{animation-delay:0.3s}.ca-d4.ca-in{animation-delay:0.4s}
        .ca-d5.ca-in{animation-delay:0.5s}.ca-d6.ca-in{animation-delay:0.6s}
        @keyframes caFadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes caFadeLeft{from{opacity:0;transform:translateX(-44px)}to{opacity:1;transform:translateX(0)}}
        @keyframes caFadeRight{from{opacity:0;transform:translateX(44px)}to{opacity:1;transform:translateX(0)}}
        @keyframes caZoomIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes caFadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="overflow-x-hidden">

        {/* ── Hero + Step Cards ── */}
        <section className="w-full px-4 md:px-6 pt-5 pb-4">
          <div
            className="relative rounded-[20px] overflow-hidden px-8 md:px-14 pt-12"
            style={{ background: 'linear-gradient(135deg, #3aaf5c 0%, #1ab8c4 45%, #1a99d6 100%)' }}
          >
            {/* Decorative glassy circles */}
            <div className="absolute pointer-events-none" style={{ width: 160, height: 160, borderRadius: '50%', bottom: '-55px', left: '28%', background: 'radial-gradient(circle at 40% 35%, rgba(100,240,200,0.55), rgba(30,180,210,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
            <div className="absolute pointer-events-none" style={{ width: 130, height: 130, borderRadius: '50%', bottom: '-42px', left: '45%', background: 'radial-gradient(circle at 38% 30%, rgba(120,100,240,0.55), rgba(60,80,220,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.20)' }} />
            <div className="absolute pointer-events-none hidden md:block" style={{ width: 180, height: 180, borderRadius: '50%', bottom: '-70px', right: '8%', background: 'radial-gradient(circle at 42% 38%, rgba(130,230,230,0.45), rgba(60,190,210,0.22))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
            <div className="absolute pointer-events-none hidden md:block" style={{ width: 90, height: 90, borderRadius: '50%', bottom: '-20px', left: '18%', background: 'radial-gradient(circle at 35% 30%, rgba(160,240,120,0.60), rgba(40,210,130,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
            <div className="absolute pointer-events-none hidden md:block" style={{ width: 52, height: 52, borderRadius: '50%', top: '10px', right: '28%', background: 'radial-gradient(circle at 35% 30%, rgba(170,110,240,0.70), rgba(100,60,210,0.45))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
            <div className="absolute pointer-events-none hidden md:block" style={{ width: 85, height: 85, borderRadius: '50%', top: '-15px', right: '38%', background: 'radial-gradient(circle at 38% 32%, rgba(80,220,210,0.55), rgba(30,170,200,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />

            <div className="relative z-10">
              <h1 className="ca-anim ca-up text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight mb-1">
                How to order with prescription
              </h1>
              <p className="ca-anim ca-up ca-d2 text-white/75 text-[12px] sm:text-[13px] mt-1 font-medium mb-10">
                A simple 3-step process designed for your convenience.
              </p>

              {/* Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-10">
                {[
                  {
                    icon: 'fa-cloud-arrow-up',
                    label: '1. Upload',
                    desc: 'Upload your valid prescription and contact details.'
                  },
                  {
                    icon: 'fa-phone-volume',
                    label: '2. We reach out',
                    desc: 'Our pharmacists contact you to verify your order.'
                  },
                  {
                    icon: 'fa-circle-check',
                    label: '3. Receive Your Order',
                    desc: 'Get your order confirmed and delivered.'
                  }
                ].map((step, i) => (
                  <div key={i} className={`ca-anim ca-zoom ${['ca-d1', 'ca-d3', 'ca-d5'][i]} bg-white/10 backdrop-blur-sm rounded-[15px] border border-white/20 p-4 md:p-6 flex flex-row items-center md:flex-col md:items-center text-left md:text-center cursor-default`}>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 mr-4 md:mr-0 md:mb-4">
                      <i className={`fa-solid ${step.icon} text-white text-lg md:text-xl`}></i>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold text-[14px] md:text-[15px] mb-1 md:mb-3">{step.label}</h3>
                      <p className="text-white/80 md:text-white text-[12px] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

            {/* Guide + Upload layout — guide shown first so users are instructed before uploading */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

              {/* LEFT: Guide for Valid Prescription */}
              <div className="lg:col-span-2 ca-anim ca-left bg-white rounded-[15px] border border-gray-100 p-8 shadow-sm">
                <h2 className="text-[17px] font-semibold text-dark mb-1">Guide for a valid prescription</h2>
                <p className="text-gray-400 text-[12px] mb-6">Please ensure the document includes:</p>
                <ul className="space-y-3.5">
                  {GUIDE_ITEMS.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check text-[9px] text-green-600"></i>
                      </div>
                      <span className="text-[13px] font-semibold text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] text-gray-400 mt-5 leading-relaxed">
                  All details must be clear and legible for verification.
                </p>
              </div>

              {/* RIGHT: Upload Prescription Card */}
              <div className="lg:col-span-3 ca-anim ca-left ca-d2 bg-white rounded-[15px] border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center text-white shadow-md"
                    style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}>
                    <i className="fa-solid fa-file-prescription text-base"></i>
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-dark tracking-tight">Upload prescription</h2>
                    <p className="text-gray-400 text-[11px] mt-0.5">Accepted formats: JPEG, PNG, PDF</p>
                  </div>
                </div>

                {/* Upload Zone */}
                <label className="group cursor-pointer block mb-3">
                  <input type="file" multiple accept={ALLOWED_FILE_TYPES_ACCEPT} className="hidden" onChange={handleFileChange} />
                  <div className="border-2 border-dashed border-gray-200 rounded-[15px] p-5 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/40 group-hover:bg-blue-50/20">
                    <div className="text-gray-300 group-hover:text-primary transition-colors duration-200 mb-3">
                      <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
                    </div>
                    <p className="text-[13px] text-gray-400 mb-3">Click to browse — multiple files allowed</p>
                    <span className="inline-block bg-dark group-hover:bg-primary text-white text-[13px] font-semibold px-5 py-2 rounded-[10px] transition-colors duration-200">
                      Browse files
                    </span>
                  </div>
                </label>

                {/* File Preview */}
                <div className="border border-gray-100 rounded-[15px] bg-gray-50/50 overflow-hidden" style={{ minHeight: '90px' }}>
                  {uploadedFiles.length > 0 ? (
                    <div className="p-3 grid grid-cols-3 gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="relative group/thumb">
                          {file.type.startsWith('image/') ? (
                            <button type="button" onClick={() => setViewingFileUrl(URL.createObjectURL(file))}
                              className="w-full aspect-square rounded-[10px] overflow-hidden border border-gray-100 bg-white block">
                              <img src={URL.createObjectURL(file)} alt={file.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                            </button>
                          ) : (
                            <div className="w-full aspect-square rounded-[10px] border border-gray-100 bg-white flex flex-col items-center justify-center gap-1 px-1">
                              <i className="fa-solid fa-file-pdf text-red-400 text-xl"></i>
                              <span className="text-[9px] text-gray-400 text-center truncate w-full px-1 leading-tight">{file.name}</span>
                            </div>
                          )}
                          <button type="button"
                            onClick={() => {
                              const updated = uploadedFiles.filter((_, i) => i !== idx);
                              setUploadedFiles(updated);
                              if (updated.length === 0) setUploadComplete(false);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition opacity-0 group-hover/thumb:opacity-100">
                            <i className="fa-solid fa-xmark text-[9px]"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4 py-6 h-full">
                      <i className="fa-regular fa-images text-3xl text-gray-200 mb-2"></i>
                      <span className="text-gray-300 text-[11px]">Uploaded files appear here</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start gap-3 p-3 bg-gray-50 rounded-[12px]">
                  <i className="fa-solid fa-circle-info text-gray-400 mt-0.5 text-sm flex-shrink-0"></i>
                  <p className="text-[12px] text-gray-500 leading-relaxed">Always upload a clean, legible copy for faster verification.</p>
                </div>
              </div>

            </div>

            {/* ── Customer Validation Form ── */}
            <div className="ca-anim ca-up bg-white rounded-[15px] border border-gray-100 p-8 md:p-12 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Customer Information</h2>
                <p className="text-gray-400 text-[13px]">Please provide accurate information so our pharmacists can process your order.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient full name + Upload valid ID — side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">Patient Full Name</label>
                    <input type="text" placeholder="Full name as shown on the prescription"
                      required
                      value={formData.patientName}
                      onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                  </div>

                  {/* Upload valid ID of the patient */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">Upload valid ID of the patient</label>
                    <p className="text-[12px] text-gray-400 leading-relaxed">
                      Upload a valid government-issued ID of the patient. This helps us process your order faster and ensures the prescription is dispensed to the right person.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      {!patientIdFile ? (
                        <label className="cursor-pointer inline-flex items-center gap-2 hover:opacity-90 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[10px] transition"
                          style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}>
                          <input type="file" accept={ALLOWED_FILE_TYPES_ACCEPT} className="hidden" onChange={handlePatientIdChange} />
                          <i className="fa-solid fa-upload text-[11px]"></i>
                          Upload File
                        </label>
                      ) : (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-[10px] pl-1.5 pr-3 py-1.5">
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
                      <span className="text-[11px] text-gray-400">Accepted formats: JPG, PNG, PDF</span>
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="border border-gray-100 rounded-[15px] p-6 bg-gray-50/40 space-y-4">
                  <h3 className="text-[15px] font-semibold text-gray-800">Contact Person</h3>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox"
                      checked={contactSameAsPatient}
                      onChange={e => setContactSameAsPatient(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded-md border-gray-200 text-success focus:ring-success cursor-pointer" />
                    <span>
                      <span className="block text-[13px] font-semibold text-gray-700">Same as patient details</span>
                      <span className="block text-[12px] text-gray-400 mt-0.5">Check this box if the patient is the one placing the order and receiving delivery.</span>
                    </span>
                  </label>

                  {!contactSameAsPatient && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-gray-700">Contact Person's Full Name</label>
                        <input type="text" placeholder="Person we should contact"
                          required={!contactSameAsPatient}
                          value={formData.contactName}
                          onChange={e => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                          className="w-full bg-white border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-gray-700">Relationship to Patient</label>
                        <select
                          value={formData.contactRelationship}
                          onChange={e => setFormData(prev => ({ ...prev, contactRelationship: e.target.value }))}
                          className="w-full bg-white border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition">
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

                {/* Remaining fields — Email/Age, Phone/Delivery address */}


                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">Contact & Delivery</h2>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">Email Address</label>
                    <input type="email" placeholder="example@domain.com"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                  </div>

                  {/* Age — right of Email, same size as the other fields */}
                  <div className="space-y-2" ref={ageDropdownRef}>
                    <label className="text-[14px] font-semibold text-gray-700">Age</label>
                    <div className="relative">
                      <button type="button"
                        onClick={() => setAgeDropdownOpen(o => !o)}
                        className="w-full flex items-center justify-between bg-gray-50 rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer">
                        <span className={formData.age ? 'text-gray-700' : 'text-gray-300'}>{formData.age || 'Age'}</span>
                        <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                      </button>
                      {ageDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-[12px] shadow-xl border border-gray-100 z-[60] overflow-hidden">
                          <div className="max-h-48 overflow-y-auto">
                            {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                              <button key={age} type="button"
                                onClick={() => { setFormData(prev => ({ ...prev, age: String(age) })); setAgeDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition ${formData.age === String(age) ? 'bg-green-50 text-[#61A644] font-semibold' : 'text-gray-700'}`}>
                                {age}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone number — under Email */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">Phone Number</label>
                    <div className="relative flex items-center bg-gray-50 rounded-[15px] overflow-visible focus-within:ring-2 focus-within:ring-primary/20 transition">
                      <button type="button" onClick={() => setPhoneCountryOpen(o => !o)}
                        className="flex items-center gap-1.5 pl-4 pr-2 py-3.5 shrink-0 border-r border-gray-200 text-[13px] text-gray-700 hover:bg-gray-100 rounded-l-[15px] transition">
                        <span>{phoneCountry.flag}</span>
                        <span className="font-semibold text-gray-600">{phoneCountry.code}</span>
                        <i className="fa-solid fa-chevron-down text-[9px] text-gray-400"></i>
                      </button>
                      <input ref={phoneInputRef} type="tel" required
                        placeholder={(() => { const d = '9123456789'; let i = 0; return phoneCountry.mask.replace(/#/g, () => d[i++ % d.length]); })()}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="flex-1 min-w-0 bg-transparent px-4 py-3.5 text-[13px] text-gray-700 outline-none placeholder-gray-300" />
                      {phoneCountryOpen && (
                        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-[12px] shadow-xl border border-gray-100 z-[60] overflow-hidden" onClick={e => e.stopPropagation()}>
                          <div className="p-2 border-b border-gray-100">
                            <input autoFocus type="text" placeholder="Search country..."
                              value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)}
                              className="w-full px-3 py-2 text-[12px] bg-gray-50 rounded-[8px] outline-none placeholder-gray-300 text-gray-700" />
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {PHONE_COUNTRIES.filter(c =>
                              c.name.toLowerCase().includes(phoneSearch.toLowerCase()) || c.code.includes(phoneSearch)
                            ).map(c => (
                              <button key={c.code + c.name} type="button"
                                onClick={() => { setPhoneCountry(c); setPhoneCountryOpen(false); setPhoneSearch(''); setFormData(prev => ({ ...prev, phone: '' })); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition text-[13px] ${phoneCountry.code === c.code && phoneCountry.name === c.name ? 'bg-green-50 text-[#61A644] font-semibold' : 'text-gray-700'}`}>
                                <span className="text-base">{c.flag}</span>
                                <span className="flex-1">{c.name}</span>
                                <span className="text-gray-400 text-[12px]">{c.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery address — under Age */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">Delivery Address</label>
                    <input type="text" placeholder="Complete address for courier delivery"
                      required
                      value={formData.address}
                      onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-[15px] px-6 py-3.5 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition placeholder-gray-300" />
                  </div>
                </div>

                {/* After-submit note */}
                <div className="flex items-start gap-2 text-[12px] text-gray-400 pt-2">
                  <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
                  <span>Our pharmacists will contact you on the mobile number provided.</span>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-[15px] font-semibold text-gray-800 mb-3">Declarations and Consent</h3>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-3 max-w-xl">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="terms"
                          checked={formData.terms}
                          onChange={e => setFormData(prev => ({ ...prev, terms: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 rounded-md border-gray-200 text-success focus:ring-success cursor-pointer" />
                        <label htmlFor="terms" className="text-[12px] text-gray-500 cursor-pointer">
                          I confirm that the information provided is accurate and that the prescription submitted is valid.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="privacyConsent"
                          checked={formData.privacyConsent}
                          onChange={e => setFormData(prev => ({ ...prev, privacyConsent: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 rounded-md border-gray-200 text-success focus:ring-success cursor-pointer" />
                        <label htmlFor="privacyConsent" className="text-[12px] text-gray-500 cursor-pointer">
                          I have read and understood the{' '}
                          <button type="button"
                            onClick={(e) => { e.preventDefault(); document.getElementById('privacy-policy-modal')?.classList.remove('hidden'); }}
                            className="text-primary font-semibold hover:underline">
                            Privacy Policy
                          </button>
                          {' '}and consent to the collection, use, and processing of my personal and sensitive personal information for the purpose of verifying, processing, dispensing, and delivering my order.
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button type="button"
                        onClick={() => {
                          setFormData({ patientName: '', email: '', phone: '', age: '', dob: '', address: '', contactName: '', contactRelationship: '', terms: false, privacyConsent: false });
                          setUploadedFiles([]);
                          setUploadComplete(false);
                          setPatientIdFile(null);
                          setContactSameAsPatient(false);
                        }}
                        className="shadow-none px-5 py-2 rounded-[15px] text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition">
                        Cancel
                      </button>
                      <button type="submit" disabled={submitState === 'sending'}
                        className="shadow-none hover:opacity-90 text-white font-bold py-2 px-6 rounded-[15px] text-[13px] transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)' }}>
                        {submitState === 'sending' ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Medical Disclaimer */}
              <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-[15px] flex items-start gap-3">
                <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <span className="font-bold">Medical Disclaimer: </span>
                  Getmeds dispenses prescription medicines only upon receipt of a valid prescription from a licensed physician. This service does not replace professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for any medical concerns.
                </p>
              </div>
            </div>

            {/* ── Support & Trust ── */}
            <div className="ca-anim ca-up">

              {/* Top row — shorter details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                {/* Need Assistance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Need Assistance?</p>
                  <p className="text-[15px] font-semibold mb-4"
                    style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Chat with our pharmacist
                  </p>
                  <div className="mt-auto space-y-3">
                    <a href="tel:+639190769105" className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-dark text-xs group-hover:bg-primary group-hover:text-white transition shadow-sm flex-shrink-0">
                        <i className="fa-solid fa-phone"></i>
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-400 font-medium">Customer Support</p>
                        <p className="text-[15px] font-semibold text-dark">+639190769105</p>
                      </div>
                    </a>
                    <a href="mailto:[EMAIL_ADDRESS]" className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-dark text-xs group-hover:bg-primary group-hover:text-white transition shadow-sm flex-shrink-0">
                        <i className="fa-solid fa-envelope"></i>
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-400 font-medium">Email Address</p>
                        <p className="text-[15px] font-semibold text-dark">info@getmeds.ph</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Secure Prescription Storage */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm mb-4">
                    <i className="fa-solid fa-lock text-lg"></i>
                  </div>
                  <h3 className="text-[15px] font-semibold text-dark mb-1">Secure prescription storage</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">All uploads are encrypted and handled with strict confidentiality.</p>
                </div>

                {/* Patient Privacy Commitment */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm mb-4">
                    <i className="fa-solid fa-shield-halved text-lg"></i>
                  </div>
                  <h3 className="text-[15px] font-semibold text-dark mb-1">Patient Privacy Commitment</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    Personal and prescription information is handled with care, in line with Philippine Data Privacy Act principles.
                  </p>
                </div>
              </div>

              {/* Bottom row — longest details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Licensed Pharmacy Operations */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-[12px] bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                    <i className="fa-solid fa-certificate text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-dark mb-1">Licensed Pharmacy Operations</h3>
                    <p className="text-[13px] font-semibold text-gray-500 leading-relaxed">FDA Philippines Licensed</p>
                    <p className="text-[13px] text-gray-400 leading-relaxed">Operating under valid Food and Drug Administration of the Philippines licenses as a wholesaler, distributor, and retail pharmacy.</p>
                  </div>
                </div>

                {/* Pharmacist-Verified Dispensing */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-[12px] bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                    <i className="fa-solid fa-user-doctor text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-dark mb-1">Pharmacist-Verified Dispensing</h3>
                    <p className="text-[13px] text-gray-400 leading-relaxed">
                      All medications reviewed and dispensed under the supervision of PRC-licensed Filipino pharmacists, in accordance with the Philippine Pharmacy Act (RA 10918).
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Upload Modal ── */}
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: modalOpen ? 1 : 0, pointerEvents: modalOpen ? 'all' : 'none' }}
        >
          <div
            className="bg-[#1A1C1E] w-full max-w-[340px] rounded-[15px] p-8 text-center shadow-2xl relative transform transition-transform duration-300"
            style={{ transform: modalOpen ? 'scale(1)' : 'scale(0.95)' }}
          >
            <button onClick={closeUploadModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            <div className="w-16 h-16 bg-[#5E5CE6]/20 text-[#5E5CE6] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-file-arrow-up text-3xl"></i>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Just a moment...</h3>
            <p className="text-gray-400 text-[12px] leading-relaxed mb-8 px-4">
              Your file is uploading. Please wait a few moments.
            </p>
            <div className="mb-8">
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                <div className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(to right,#61A644,#1D9FDA)' }} />
              </div>
              <div className="text-[#5E5CE6] text-sm font-bold">{progress}%</div>
            </div>
            <button onClick={closeUploadModal}
              className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-[12px] text-[13px] transition">
              Cancel
            </button>
          </div>
        </div>

        <div id="footer-container" />

      </div>

      {/* ── Order Success Modal ── */}
      {successModalOpen && (
        <>
          <style>{`@keyframes checkBounce{0%{transform:scale(0);opacity:0}55%{transform:scale(1.06);opacity:1}75%{transform:scale(0.97)}100%{transform:scale(1);opacity:1}}.check-bounce{animation:checkBounce 0.8s ease-out forwards}`}</style>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={() => { setSuccessModalOpen(false); window.location.reload(); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>

              <div className="px-10 pt-12 pb-8 text-center">
                {/* Illustration */}
                <div className="flex justify-center mb-7">
                  <div className="check-bounce w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#61A644,#1D9FDA)' }}>
                    <i className="fa-solid fa-check text-white text-xl"></i>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-[19px] font-semibold text-gray-900 mb-4 leading-snug">
                  Thank you for your order.
                </h2>

                {/* Message */}
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  We will contact you shortly to confirm your order details. For urgent concerns, please call{' '}
                  <a href="tel:+639190769105" className="text-[#1D9FDA] font-semibold hover:underline">
                    +63 919 076 9105
                  </a>.
                </p>
              </div>

              {/* Divider + footer */}
              <div className="border-t border-gray-100 px-10 py-4 text-center">
                <button
                  onClick={() => { setSuccessModalOpen(false); window.location.reload(); }}
                  className="text-[13px] font-semibold hover:underline"
                  style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Valid ID Required Modal — styled after the Prescription Required modal on product-detail */}
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
              {/* Close button */}
              <button
                type="button"
                onClick={() => { setIdModalVisible(false); setTimeout(() => setIdRequiredModalOpen(false), 200); }}
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
                    <i className="fa-solid fa-id-card text-white text-xl"></i>
                  </div>
                </div>
                <h2 className="text-[19px] font-semibold text-gray-900 mb-2 leading-snug">Valid ID Required</h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Please upload a valid government-issued ID (JPG, PNG, or PDF) of the patient to help us
                  process your order faster and ensure the prescription is dispensed to the right person.
                </p>
              </div>

              {/* Footer */}
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

      {/* Image Lightbox */}
      {viewingFileUrl && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setViewingFileUrl(null)}>
          <img src={viewingFileUrl} alt="Prescription preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setViewingFileUrl(null)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      )}

    </div>
  );
}
