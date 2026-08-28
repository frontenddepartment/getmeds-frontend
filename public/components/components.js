(function () {
    function executeScripts(container) {
        const scripts = Array.from(container.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });
    }

    function loadComponent(placeholderId, componentPath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            return;
        }

        const rootPath = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + componentPath;
        const noCachePath = rootPath + '?v=' + new Date().getTime();

        fetch(noCachePath)
            .then(function (res) {
                if (!res.ok) throw new Error('Could not load ' + componentPath);
                return res.text();
            })
            .then(function (html) {
                const parent = placeholder.parentNode;
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // 1. Prepare scripts
                const scripts = Array.from(temp.querySelectorAll('script'));

                // 2. Insert all nodes except scripts into DOM
                while (temp.firstChild) {
                    const node = temp.firstChild;
                    if (node.tagName === 'SCRIPT') {
                        temp.removeChild(node);
                    } else {
                        parent.insertBefore(node, placeholder);
                    }
                }

                // 3. Remove placeholder
                parent.removeChild(placeholder);

                // 4. Manually execute the scripts we saved
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript);
                });

            })
            .catch(function (err) {
                console.warn(`[Getmeds] Failed to load ${componentPath}:`, err);
            });
    }

    function init() {
        if (window.getmeds_inited_hardened) return;
        window.getmeds_inited_hardened = true;

        try {


            // Set Favicon dynamically
            injectFavicon();
            fetchAndApplyLogo();
            fetchAndApplyFooterSettings();

            // Inject Scroll and AI
            injectScrollToTop();
            injectAIAssistant();

            // Watchdogs to ensure they stay in DOM
            setInterval(() => {
                injectScrollToTop();
                injectAIAssistant();
            }, 3000);

            loadComponent('navbar-placeholder', 'components/navbar.html');
            loadComponent('footer-placeholder', 'components/footer.html');

            // Load Auth Modals
            const authContainer = document.createElement('div');
            authContainer.id = 'auth-modal-container';
            document.body.appendChild(authContainer);

            fetch('/components/auth_modals.html?v=' + new Date().getTime())
                .then(res => res.text())
                .then(html => {
                    authContainer.innerHTML = html;
                    executeScripts(authContainer);
                })
                .catch(err => console.warn('[Getmeds] Auth Modal failed:', err));

        } catch (e) {
            console.error('[Getmeds] Loader Initialization Error:', e);
        }
    }

    function injectAIAssistant() {
        if (!document.body) return;

        // Remove any legacy custom chatbot button
        const legacyBtn = document.getElementById('zap-ai-trigger');
        if (legacyBtn) legacyBtn.remove();

        // Retrieve Tawk Property ID & Widget ID from meta tags, global window vars, or default settings
        const propertyId = window.TAWK_PROPERTY_ID ||
                           document.querySelector('meta[name="tawk-property-id"]')?.content ||
                           '6a8f969fb56df5344af1f3a0';
        const widgetId = window.TAWK_WIDGET_ID ||
                         document.querySelector('meta[name="tawk-widget-id"]')?.content ||
                         '1k134u1kt';

        // Initialize standard Tawk_API global object
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Global helper for opening Tawk chat from any page element or click handler
        window.openGetmedsChat = function () {
            if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
                window.Tawk_API.maximize();
            } else if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
                window.Tawk_API.toggle();
            } else if (window.Tawk_API && typeof window.Tawk_API.popup === 'function') {
                window.Tawk_API.popup();
            }
        };

        // Inject Tawk.to Script SDK
        if (!document.getElementById('tawk-script-sdk')) {
            (function () {
                const s1 = document.createElement("script");
                s1.id = 'tawk-script-sdk';
                const s0 = document.getElementsByTagName("script")[0];
                s1.async = true;
                s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
                s1.charset = 'UTF-8';
                s1.setAttribute('crossorigin', '*');
                if (s0 && s0.parentNode) {
                    s0.parentNode.insertBefore(s1, s0);
                } else {
                    document.head.appendChild(s1);
                }
            })();
        }
    }
    window.injectAIAssistant = injectAIAssistant;

    function fetchAndApplyLogo() {
        const query = '*[_type == "siteSettings" && _id == "global-site-settings"][0]{ "logoUrl": logo.src.asset->url }';
        const projectId = document.querySelector('meta[name="getmeds-sanity-project-id"]')?.content || 's7ocz8zp';
        const dataset = document.querySelector('meta[name="getmeds-sanity-dataset"]')?.content || 'production';
        const apiVersion = document.querySelector('meta[name="getmeds-sanity-api-version"]')?.content || '2021-10-21';
        const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=` + encodeURIComponent(query);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const logoUrl = data?.result?.logoUrl;
                if (logoUrl) {
                    setupLogoObserver(logoUrl);
                }
            })
            .catch(err => console.warn('[Getmeds] Failed to fetch dynamic logo:', err));
    }

    function setupLogoObserver(logoUrl) {
        if (!logoUrl) return;

        const apply = () => {
            document.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src') || '';
                const alt = img.getAttribute('alt') || '';
                if (
                    src.includes('getmedslogo.png') ||
                    src.includes('getmedslogo') ||
                    alt.toLowerCase().includes('getmeds logo') ||
                    alt.toLowerCase() === 'logo'
                ) {
                    if (img.src !== logoUrl) {
                        img.src = logoUrl;
                    }
                }
            });
            // Update favicon
            let link = document.querySelector("link[rel~='icon']");
            if (link && link.href !== logoUrl) {
                link.href = logoUrl;
            }
        };

        apply();

        const observer = new MutationObserver(apply);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const sanityQueryCache = new Map();
    function fetchSanityData(query) {
        if (sanityQueryCache.has(query)) {
            return Promise.resolve(sanityQueryCache.get(query));
        }
        const projectId = document.querySelector('meta[name="getmeds-sanity-project-id"]')?.content || 's7ocz8zp';
        const dataset = document.querySelector('meta[name="getmeds-sanity-dataset"]')?.content || 'production';
        const apiVersion = document.querySelector('meta[name="getmeds-sanity-api-version"]')?.content || '2021-10-21';
        const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=` + encodeURIComponent(query);

        return fetch(url)
            .then(res => res.json())
            .then(data => {
                const result = data?.result;
                sanityQueryCache.set(query, result);
                return result;
            })
            .catch(err => {
                console.warn('[Getmeds] Sanity query failed:', err);
                return null;
            });
    }

    function fetchAndApplyFooterSettings() {
        const projectId = document.querySelector('meta[name="getmeds-sanity-project-id"]')?.content || 's7ocz8zp';
        const dataset = document.querySelector('meta[name="getmeds-sanity-dataset"]')?.content || 'production';
        const apiVersion = document.querySelector('meta[name="getmeds-sanity-api-version"]')?.content || '2021-10-21';

        const query = '*[_type == "siteSettings" && _id == "global-site-settings"][0]{ ..., topBar{ ..., socials[]-> }, contactGroups }';
        const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=` + encodeURIComponent(query);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const settings = data?.result;
                if (settings) {
                    setupFooterObserver(settings, projectId, dataset, apiVersion);
                }
            })
            .catch(err => console.warn('[Getmeds] Failed to fetch dynamic footer settings:', err));
    }

    function setupFooterObserver(settings, projectId, dataset, apiVersion) {
        const escapeHtml = (value) => {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const applySettings = () => {
            // 1. Logo
            const footerLogo = document.getElementById('footer-logo');
            if (footerLogo && settings.logo?.src?.asset?._ref) {
                const ref = settings.logo.src.asset._ref;
                const parts = ref.split('-');
                if (parts.length >= 4) {
                    const id = parts[1];
                    const dims = parts[2];
                    const ext = parts[3];
                    const url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${ext}`;
                    if (footerLogo.src !== url) {
                        footerLogo.src = url;
                    }
                }
                if (settings.logo.alt && footerLogo.alt !== settings.logo.alt) {
                    footerLogo.alt = settings.logo.alt;
                }
            }

            // 2. Contact Groups → Footer Contact List
            // Priority: use contactGroups where showInFooter===true; fallback to first group; then legacy contactInfo
            const normalizeToArray = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') return [val];
                return [];
            };

            // Determine which groups to show in footer
            let footerGroups = [];
            if (settings.contactGroups && Array.isArray(settings.contactGroups) && settings.contactGroups.length > 0) {
                footerGroups = settings.contactGroups.filter(g => g.showInFooter);
                if (footerGroups.length === 0) footerGroups = [settings.contactGroups[0]]; // default to first
            }

            // Legacy fallback
            const legacyAddresses = normalizeToArray(settings.contactInfo?.address);
            const legacyPhones = normalizeToArray(settings.contactInfo?.phone);
            const legacyEmails = normalizeToArray(settings.contactInfo?.email);

            const footerContactList = document.getElementById('footer-contact-list');
            if (footerContactList && !footerContactList.dataset.populated) {
                let html = '';

                if (footerGroups.length > 0) {
                    // Render from contactGroups
                    footerGroups.forEach(group => {
                        const addrs = normalizeToArray(group.addresses);
                        const phones = normalizeToArray(group.phones);
                        const emails = normalizeToArray(group.emails);

                        if (addrs.length === 0 && phones.length === 0 && emails.length === 0) return;

                        addrs.forEach(addr => {
                            html += `
                                <li class="flex items-start space-x-3">
                                    <i class="fa-solid fa-location-dot mt-1 text-primary shrink-0"></i>
                                    <span>${escapeHtml(addr)}</span>
                                </li>
                            `;
                        });
                        phones.forEach(ph => {
                            const cleanPhone = ph.replace(/[^+\d]/g, '');
                            html += `
                                <li class="flex items-center space-x-3">
                                    <i class="fa-solid fa-phone text-primary shrink-0"></i>
                                    <a href="tel:${escapeHtml(cleanPhone)}" class="hover:text-primary transition">${escapeHtml(ph)}</a>
                                </li>
                            `;
                        });
                        emails.forEach(em => {
                            html += `
                                <li class="flex items-center space-x-3">
                                    <i class="fa-solid fa-envelope text-primary shrink-0"></i>
                                    <a href="mailto:${escapeHtml(em)}" class="hover:text-primary transition">${escapeHtml(em)}</a>
                                </li>
                            `;
                        });
                    });
                } else {
                    // Render from legacy contactInfo
                    legacyAddresses.forEach(addr => {
                        html += `<li class="flex items-start space-x-3"><i class="fa-solid fa-location-dot mt-1 text-primary shrink-0"></i><span>${escapeHtml(addr)}</span></li>`;
                    });
                    legacyPhones.forEach(ph => {
                        const cleanPhone = ph.replace(/[^+\d]/g, '');
                        html += `<li class="flex items-center space-x-3"><i class="fa-solid fa-phone text-primary shrink-0"></i><a href="tel:${escapeHtml(cleanPhone)}" class="hover:text-primary transition">${escapeHtml(ph)}</a></li>`;
                    });
                    legacyEmails.forEach(em => {
                        html += `<li class="flex items-center space-x-3"><i class="fa-solid fa-envelope text-primary shrink-0"></i><a href="mailto:${escapeHtml(em)}" class="hover:text-primary transition">${escapeHtml(em)}</a></li>`;
                    });
                }

                if (html) {
                    footerContactList.innerHTML = html;
                    footerContactList.dataset.populated = 'true';
                }
            }

            // 2b. Top bar phone — use group where showInTopBar===true, else first group
            const topBarEl = document.getElementById('topbar-phone');
            if (topBarEl && settings.contactGroups && Array.isArray(settings.contactGroups)) {
                const topBarGroup = settings.contactGroups.find(g => g.showInTopBar) || settings.contactGroups[0];
                const topPhone = normalizeToArray(topBarGroup?.phones)[0];
                if (topPhone && topBarEl.textContent !== topPhone) {
                    topBarEl.textContent = topPhone;
                    const link = topBarEl.closest('a');
                    if (link) link.href = `tel:${topPhone.replace(/[^+\d]/g, '')}`;
                }
            }

            // 5. Copyright — always use the current year
            const footerCopyright = document.getElementById('footer-copyright');
            if (footerCopyright) {
                const currentYear = new Date().getFullYear().toString();
                const base = settings.copyright
                    ? settings.copyright.replace(/Getmeds/g, 'Getmeds').replace(/\b\d{4}\b/, currentYear)
                    : `© ${currentYear} Getmeds Philippines, Inc. All rights reserved.`;
                if (footerCopyright.textContent.trim() !== base.trim()) {
                    footerCopyright.textContent = base;
                }
            }

            // 6. Socials
            const footerSocials = document.getElementById('footer-socials');
            if (footerSocials && settings.topBar?.socials && Array.isArray(settings.topBar.socials)) {
                if (!footerSocials.dataset.populated) {
                    footerSocials.innerHTML = '';
                    settings.topBar.socials.forEach(socialRef => {
                        if (!socialRef || !socialRef.platform || !socialRef.href) return;

                        let iconClass = 'fa-link';
                        if (socialRef.icon) {
                            if (socialRef.icon.startsWith('fa-')) {
                                iconClass = socialRef.icon;
                            } else {
                                iconClass = `fa-brands fa-${socialRef.icon}`;
                            }
                        } else {
                            if (socialRef.platform === 'facebook') iconClass = 'fa-brands fa-facebook-f';
                            else if (socialRef.platform === 'twitter' || socialRef.platform === 'x') iconClass = 'fa-brands fa-x-twitter';
                            else if (socialRef.platform === 'instagram') iconClass = 'fa-brands fa-instagram';
                            else if (socialRef.platform === 'linkedin') iconClass = 'fa-brands fa-linkedin-in';
                            else if (socialRef.platform === 'youtube') iconClass = 'fa-brands fa-youtube';
                            else if (socialRef.platform === 'tiktok') iconClass = 'fa-brands fa-tiktok';
                        }

                        if (iconClass === 'fa-facebook') iconClass = 'fa-brands fa-facebook-f';
                        if (iconClass === 'fa-twitter') iconClass = 'fa-brands fa-twitter';
                        if (iconClass === 'fa-linkedin') iconClass = 'fa-brands fa-linkedin-in';

                        if (!iconClass.includes(' ')) {
                            if (iconClass.startsWith('fa-')) {
                                iconClass = `fa-brands ${iconClass}`;
                            }
                        }

                        const a = document.createElement('a');
                        a.href = socialRef.href;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.className = 'h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition';
                        a.innerHTML = `<i class="${iconClass}"></i>`;
                        footerSocials.appendChild(a);
                    });
                    footerSocials.dataset.populated = 'true';
                }
            }

            // 7. Legal Links & Policies & Disclaimers
            const footerLegal = document.getElementById('footer-legal-links');
            if (footerLegal) {
                if (!footerLegal.dataset.populated) {
                    footerLegal.dataset.populated = 'true';
                    footerLegal.innerHTML = '';

                    const defaultPolicies = [
                        { label: 'Privacy Policy', slug: 'privacy-policy' },
                        { label: 'Terms of Service', slug: 'terms-of-service' },
                        { label: 'Medical Disclaimer', slug: 'medical-disclaimer' },
                        { label: 'Prescription Policy', slug: 'prescription-policy' },
                        { label: 'Shipping & Delivery Policy', slug: 'shipping-and-delivery-policy' },
                        { label: 'Return & Refund Policy', slug: 'return-and-refund-policy' }
                    ];

                    const policyQuery = `*[_type == "policiesDisclaimers"]{ title, "slug": slug.current, displayMode, contentHtml }`;
                    fetchSanityData(policyQuery).then(policies => {
                        const policyMap = {};
                        if (Array.isArray(policies)) {
                            policies.forEach(p => {
                                if (p && p.slug) policyMap[p.slug] = p;
                            });
                        }

                        footerLegal.innerHTML = '';
                        defaultPolicies.forEach(({ label, slug }) => {
                            const item = policyMap[slug];
                            const displayMode = (item && item.displayMode) ? item.displayMode : 'dedicatedPage';
                            const pageHref = `/${slug}`;

                            if (displayMode === 'modal') {
                                const btn = document.createElement('button');
                                btn.type = 'button';
                                btn.className = 'footer-link text-gray-500 hover:text-white bg-transparent border-none cursor-pointer text-xs p-0';
                                btn.textContent = item?.title || label;
                                btn.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    if (window.openDynamicPolicyModal) {
                                        window.openDynamicPolicyModal(item?.title || label, item?.contentHtml || '<p>No content available.</p>');
                                    }
                                });
                                footerLegal.appendChild(btn);
                            } else {
                                const a = document.createElement('a');
                                a.href = pageHref;
                                a.className = 'footer-link text-gray-500 hover:text-white text-xs p-0';
                                a.textContent = item?.title || label;
                                footerLegal.appendChild(a);
                            }
                        });
                    }).catch(() => {
                        footerLegal.innerHTML = '';
                        defaultPolicies.forEach(({ label, slug }) => {
                            const a = document.createElement('a');
                            a.href = `/${slug}`;
                            a.className = 'footer-link text-gray-500 hover:text-white text-xs p-0';
                            a.textContent = label;
                            footerLegal.appendChild(a);
                        });
                    });
                }
            }
        };

        applySettings();

        const observer = new MutationObserver(applySettings);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function injectFavicon() {
        // Find or create favicon link
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        // Always force the Getmeds logo
        link.href = '/assets/getmedslogo.png';

    }

    function injectScrollToTop() {
        if (!document.body) return;

        if (document.getElementById('scroll-to-top')) {
            // Ensure it has highest z-index if already exists
            const existing = document.getElementById('scroll-to-top');
            if (existing.style.zIndex !== '9999999') {
                existing.style.setProperty('z-index', '9999999', 'important');
            }
            return;
        }

        const styleId = 'getmeds-scroll-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #scroll-to-top {
                    position: fixed !important;
                    bottom: 30px !important;
                    right: 30px !important;
                    width: 50px !important;
                    height: 50px !important;
                    background: linear-gradient(135deg, #61A644 0%, #1D9FDA 100%) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 15px !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
                    z-index: 9999999 !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease !important;
                    transform: translateY(12px) !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                #scroll-to-top.show {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) !important;
                }
                #scroll-to-top:hover {
                    transform: translateY(-5px) scale(1.08) !important;
                    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.3) !important;
                    filter: brightness(1.1) !important;
                }
                #scroll-to-top:active {
                    transform: scale(0.95) !important;
                }
                @media (max-width: 640px) {
                    #scroll-to-top {
                        bottom: 90px !important;
                        right: 20px !important;
                        width: 44px !important;
                        height: 44px !important;
                        border-radius: 12px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const btn = document.createElement('button');
        btn.id = 'scroll-to-top';
        btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        btn.title = 'Back to Top';
        document.body.appendChild(btn);

        const THRESHOLD = 300;

        // Check if any scrollable context has scrolled past threshold
        function checkScrolled() {
            if (window.scrollY > THRESHOLD) {
                btn.classList.add('show');
                return;
            }
            // Also check overflow-y-auto divs (React inner scroll containers)
            var scrolled = false;
            document.querySelectorAll('*').forEach(function (el) {
                if (el === btn) return;
                var style = window.getComputedStyle(el);
                var overflow = style.overflowY;
                if ((overflow === 'auto' || overflow === 'scroll') && el.scrollTop > THRESHOLD) {
                    scrolled = true;
                }
            });
            if (scrolled) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        }

        // Capture phase catches scroll on ANY element (including React content divs)
        document.addEventListener('scroll', checkScrolled, true);
        window.addEventListener('scroll', checkScrolled);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Also reset any inner scroll containers
            document.querySelectorAll('*').forEach(function (el) {
                if (el === btn) return;
                var style = window.getComputedStyle(el);
                var overflow = style.overflowY;
                if ((overflow === 'auto' || overflow === 'scroll') && el.scrollTop > 0) {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });


    }

    // Run loader
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Safety fallback
    window.addEventListener('load', init);
})();