import React, { useEffect, useState } from 'react';

const articleData = [
  {
    id: 0,
    category: 'Launch',
    readTime: '3 mins read',
    date: 'Thursday, May 22, 2025',
    time: '09:00 AM',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1200',
    title: 'Getmeds Expands Oncology Portfolio with Next-Gen Targeted Therapies',
    intro: 'In a significant step forward for Filipino cancer patients, Getmeds announces the addition of cutting-edge targeted therapy options to its oncology portfolio. These next-generation treatments represent a new era of precision medicine, offering hope to patients who previously had limited access to innovative first-line and second-line oncology treatments nationwide.',
    sections: [
      {
        heading: 'Overview of the Expansion',
        body: 'Getmeds has officially expanded its pharmaceutical portfolio to include several next-generation targeted therapies across multiple oncology indications. This strategic expansion positions Getmeds as a key provider of advanced cancer treatments in the Philippine market, bridging the gap between global pharmaceutical innovation and local patient access.',
      },
      {
        heading: 'New Therapies Added',
        body: 'The newly added therapies target specific molecular markers associated with breast cancer, non-small cell lung cancer, colorectal cancer, and chronic myeloid leukemia. These medicines work by blocking specific pathways that allow cancer cells to grow and spread, resulting in more effective treatment with fewer systemic side effects compared to traditional chemotherapy.',
        bullets: [
          'Targeted EGFR inhibitors for lung cancer',
          'HER2-directed agents for breast cancer',
          'BCR-ABL inhibitors for CML',
          'VEGF pathway blockers for colorectal cancer',
        ],
      },
      {
        heading: 'Benefits for Filipino Patients',
        body: 'Filipino cancer patients stand to benefit immensely from these additions. Access to targeted therapies has historically been limited due to cost and availability barriers. Getmeds is committed to making these treatments accessible through its patient assistance programs and partnerships with healthcare institutions across the country.',
      },
      {
        heading: 'Availability and Access',
        body: "These new therapies are now available through Getmeds' distribution network, covering major hospitals, oncology centers, and specialty pharmacies in Metro Manila and key regional hubs. Getmeds is also working with the Philippine FDA to ensure full regulatory compliance and smooth procurement processes for institutional buyers.",
      },
      {
        heading: 'Patient Support Programs',
        body: "Recognizing that access goes beyond availability, Getmeds' Patient Assistance Program (PAP) provides financial support mechanisms for eligible patients. In partnership with DSWD and PCSO, patients can apply for subsidized or free access to select therapies based on medical and financial criteria.",
      },
      {
        heading: 'Looking Ahead',
        body: 'Getmeds plans to continue expanding its oncology portfolio throughout 2025 and beyond, with several new molecules currently under regulatory review. The company remains committed to its mission of advancing healthcare access in the Philippines through compassionate, innovative solutions.',
      },
    ],
  },
  {
    id: 1,
    category: 'Event',
    readTime: '5 mins read',
    date: 'Thursday, May 22, 2025',
    time: '10:30 AM',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    title: 'Getmeds at the Philippine Oncology & Pharmacy Summit',
    intro: 'Our team joined oncologists, hospital pharmacists, and healthcare professionals across the Philippines at the annual Philippine Oncology & Pharmacy Summit. The event brought together key stakeholders to discuss expanding access to innovative and essential medicines for Filipino patients, with Getmeds playing a central role in shaping the conversation.',
    sections: [
      {
        heading: 'Event Overview',
        body: 'The Philippine Oncology & Pharmacy Summit is the country\'s premier gathering for oncology and pharmacy professionals. This year\'s summit focused on the theme "Access, Innovation, and Compassion" — values that align closely with Getmeds\' core mission. Over 500 delegates attended from hospitals, government agencies, and the pharmaceutical industry.',
      },
      {
        heading: 'Key Topics Discussed',
        body: 'The summit covered a wide range of pressing topics in Philippine healthcare, including the challenge of medicine access for indigent patients, the regulatory landscape for biologics and biosimilars, and the role of digital health in improving medication adherence and patient outcomes.',
        bullets: [
          'Medicine access and affordability in the Philippines',
          'Regulatory updates from the Philippine FDA',
          'Biosimilars and their role in expanding access',
          'Digital health tools for oncology management',
        ],
      },
      {
        heading: "Getmeds' Presentation",
        body: "Getmeds delivered a featured presentation titled 'Bridging the Last Mile: How Compassionate Access Programs Are Changing Oncology in the Philippines.' The presentation highlighted Getmeds' Patient Assistance Program outcomes and showcased real patient stories that demonstrate the tangible impact of accessible oncology care.",
      },
      {
        heading: 'Industry Insights and Discussions',
        body: 'Panel discussions yielded valuable insights into the future of oncology in the Philippines. Experts agreed that multi-sector collaboration — between government, industry, and healthcare providers — is essential to sustainably improving patient outcomes. Getmeds participated actively in these discussions, sharing its experience as a compassionate access provider.',
      },
      {
        heading: 'Partnerships Formed',
        body: 'The summit served as a platform for forging new partnerships. Getmeds signed memoranda of agreement with two regional hospital networks and one community pharmacy chain, expanding its distribution footprint for specialty medicines into areas previously underserved.',
      },
      {
        heading: "What's Next",
        body: 'Following the summit, Getmeds will be rolling out a new continuing education program for pharmacy professionals focused on oncology drug management and patient counseling. Details will be announced through the Getmeds professional network in the coming weeks.',
      },
    ],
  },
  {
    id: 2,
    category: 'CSR',
    readTime: '4 mins read',
    date: 'Thursday, May 22, 2025',
    time: '02:00 PM',
    img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200',
    title: 'Getmeds Donates Essential Medicines to Indigent Communities',
    intro: 'As part of our United Nations Global Compact commitment and corporate social responsibility mandate, Getmeds partnered with local government units in Metro Manila to provide free essential medicines to underserved patients. This initiative reflects our belief that access to healthcare is a fundamental right, not a privilege.',
    sections: [
      {
        heading: 'Program Overview',
        body: "Getmeds' community medicine donation program is a flagship CSR initiative designed to address the healthcare gap experienced by indigent communities in urban and rural areas. In partnership with barangay health centers and LGUs across Metro Manila, the program distributes essential medicines to patients who cannot afford them through regular channels.",
      },
      {
        heading: 'Communities Served',
        body: 'This latest donation drive covered ten barangays across five cities in Metro Manila, reaching over 1,200 patients. The communities were selected based on a needs assessment conducted in coordination with local health officers, prioritizing areas with the highest concentration of patients with chronic conditions and limited access to healthcare facilities.',
        bullets: [
          'Tondo, Manila — 320 patients reached',
          'Payatas, Quezon City — 280 patients reached',
          'Baseco, Port Area — 210 patients reached',
          'Bagong Silang, Caloocan — 240 patients reached',
          'Barrio Luz, Makati — 150 patients reached',
        ],
      },
      {
        heading: 'Medicines Donated',
        body: 'The donation package included a curated selection of essential medicines covering the most prevalent conditions in the target communities. Anti-infectives, analgesics, antihypertensives, and vitamins were among the primary categories included, alongside select oncology support medications for patients undergoing treatment.',
      },
      {
        heading: 'Partnership Details',
        body: 'Getmeds worked closely with the City Health Offices of Manila, Quezon City, Caloocan, and Makati to coordinate the logistics of medicine distribution. Community health workers facilitated patient verification and medicine dispensing, ensuring that donations reached the most vulnerable individuals.',
      },
      {
        heading: 'Impact Assessment',
        body: "A post-distribution survey conducted one month after the initiative found that 94% of recipients reported improved access to their needed medications, and 87% noted a positive change in their health status. These outcomes reinforce Getmeds' commitment to evidence-based, impact-driven CSR programming.",
      },
      {
        heading: 'Future Plans',
        body: 'Getmeds will expand this initiative to include five additional cities in Luzon in the second half of 2025, with plans to extend to Visayas and Mindanao by 2026. We are also exploring partnerships with international NGOs to supplement our donated medicine supply for the most critical therapeutic categories.',
      },
    ],
  },
];

export default function ArticleDetail() {
  const [article, setArticle] = useState<typeof articleData[0] | null>(null);
  const [activeSection, setActiveSection] = useState(0);

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

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id') || '0', 10);
    const found = articleData.find(a => a.id === id) || articleData[0];
    setArticle(found);
    document.title = `${found.title} — GetMEDS`;

    // Scroll spy
    const handleScroll = () => {
      const headings = document.querySelectorAll('[data-section]');
      let current = 0;
      headings.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = i;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (idx: number) => {
    const el = document.querySelector(`[data-section="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(160deg, #eef4ff 0%, #f8faff 40%, #ffffff 100%)' }} className="min-h-screen relative">

      {/* Glassy sphere background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-18%', right: '-8%',
          width: '52vw', height: '52vw', maxWidth: '680px', maxHeight: '680px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.35) 0%, rgba(210,228,255,0.18) 38%, rgba(130,175,255,0.08) 65%, transparent 100%)',
          boxShadow: 'inset -22px -22px 60px rgba(100,145,255,0.06), 0 0 90px rgba(100,145,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', top: '18%', right: '7%',
          width: '18vw', height: '18vw', maxWidth: '240px', maxHeight: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(185,215,255,0.28) 0%, rgba(80,145,255,0.15) 48%, rgba(50,105,255,0.06) 75%, transparent 100%)',
          boxShadow: 'inset -10px -10px 28px rgba(30,85,255,0.08), 0 0 45px rgba(60,125,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', top: '42%', left: '-3%',
          width: '9vw', height: '9vw', maxWidth: '120px', maxHeight: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(140,175,255,0.25) 0%, rgba(70,125,255,0.14) 52%, rgba(40,95,255,0.05) 78%, transparent 100%)',
          boxShadow: 'inset -5px -5px 14px rgba(30,80,255,0.06), 0 0 28px rgba(60,120,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12%', left: '8%',
          width: '32vw', height: '32vw', maxWidth: '420px', maxHeight: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.22) 0%, rgba(205,222,255,0.14) 42%, rgba(120,162,255,0.06) 70%, transparent 100%)',
          boxShadow: 'inset -14px -14px 40px rgba(80,120,255,0.05), 0 0 65px rgba(80,120,255,0.03)',
        }} />
      </div>

      {/* Navbar — always in DOM so useEffect fetch can inject it */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {article && <>
      {/* Back button */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2 relative z-10">
        <a
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <i className="fa-solid fa-chevron-left text-[10px]"></i>
          Back
        </a>
      </div>

      {/* Article header */}
      <div className="max-w-3xl mx-auto px-4 text-center py-4 relative z-10">
        {/* Category badge */}
        <span
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(97,166,68,.12), rgba(29,159,218,.12))',
            border: '1px solid rgba(29,159,218,.2)',
            color: '#1D9FDA',
          }}
        >
          {article.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">
          {article.title}
        </h1>

        {/* Date + time */}
        <p className="text-xs text-gray-400">
          {article.date} &nbsp;•&nbsp; {article.time}
        </p>
      </div>

      {/* Hero image */}
      <div className="max-w-5xl mx-auto px-4 mt-6 mb-10 relative z-10">
        <img
          src={article.img}
          alt={article.title}
          className="w-full rounded-2xl object-cover"
          style={{ height: '340px' }}
        />
      </div>

      {/* Two-column content */}
      <div className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
        <div className="flex gap-10">

          {/* Left sidebar: TOC + Share */}
          <aside className="hidden md:flex flex-col gap-6 w-48 flex-shrink-0 sticky top-8 self-start">

            {/* Table of contents */}
            <div>
              <nav className="flex flex-col gap-2">
                {article.sections.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className="text-left text-xs leading-snug transition-colors"
                    style={{
                      color: activeSection === i ? '#1D9FDA' : '#9ca3af',
                      borderLeft: activeSection === i ? '2px solid #1D9FDA' : '2px solid transparent',
                      paddingLeft: '8px',
                    }}
                  >
                    {s.heading}
                  </button>
                ))}
              </nav>
            </div>

            {/* Share Article */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3">Share Article</p>
              <div className="flex gap-2">
                {/* Instagram */}
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                  <i className="fa-brands fa-instagram"></i>
                </a>
                {/* LinkedIn */}
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: '#0077b5' }}>
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                {/* TikTok */}
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: '#010101' }}>
                  <i className="fa-brands fa-tiktok"></i>
                </a>
              </div>
            </div>
          </aside>

          {/* Right: Article content */}
          <article className="flex-1 min-w-0">

            {/* Intro paragraph */}
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {article.intro}
            </p>

            {/* Sections */}
            {article.sections.map((s, i) => (
              <div key={i} data-section={i} className="mb-8 scroll-mt-8">
                <h2 className="text-base font-bold text-gray-900 mb-3">{s.heading}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{s.body}</p>
                {s.bullets && (
                  <ul className="space-y-1 text-sm text-gray-500 mt-2">
                    {s.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1D9FDA' }}></span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

          </article>
        </div>
      </div>
      </>}

      {/* Footer — always in DOM so useEffect fetch can inject it */}
      <div id="footer-container" />

    </div>
  );
}
