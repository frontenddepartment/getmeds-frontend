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


            // Cookie consent banner, and analytics that only run after a yes.
            // First, so the question is on screen as early as possible.
            loadConsentManager();

            // Set Favicon dynamically
            injectFavicon();
            fetchAndApplyLogo();
            fetchAndApplyFooterSettings();

            // Inject Scroll and AI
            injectScrollToTop();
            injectAIAssistant();
            injectChatLinks();

            // Watchdogs to ensure they stay in DOM
            setInterval(() => {
                injectScrollToTop();
                injectAIAssistant();
                injectChatLinks();
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

    function loadConsentManager() {
        if (document.getElementById('gm-consent-script')) return;
        const script = document.createElement('script');
        script.id = 'gm-consent-script';
        script.src = '/components/analytics-consent.js';
        document.head.appendChild(script);
    }

    function isInstalledApp() {
        try {
            return (window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true) && window.innerWidth <= 1024;
        } catch (e) {
            return false; // treat an unreadable display-mode as "website"
        }
    }

    // Where each direct-message button goes. Kept in one place so changing a number or the
    // page name never means hunting through markup. wa.me wants bare digits; Viber wants the
    // plus, percent-encoded, or it looks the number up in the wrong country.
    const CHAT_LINKS = [
        {
            id: 'whatsapp',
            label: 'Chat with us on WhatsApp',
            href: 'https://wa.me/639190769105',
            background: '#25D366',
            path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'
        },
        {
            id: 'viber',
            label: 'Chat with us on Viber',
            href: 'viber://chat?number=%2B639190769105',
            background: '#7360F2',
            path: 'M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z'
        },
        {
            id: 'messenger',
            label: 'Chat with us on Messenger',
            href: 'https://m.me/getmedsphilippines',
            background: 'linear-gradient(180deg, #00B2FF 0%, #006AFF 100%)',
            path: 'M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z'
        }
    ];

    // WhatsApp, Viber and Messenger buttons in a column above the back-to-top button. The logos
    // are inline SVG rather than Font Awesome because not every page loads the icon font.
    function injectChatLinks() {
        if (!document.body || document.getElementById('gm-chat-links')) return;

        // The installed app loads no Tawk bubble for these to sit beside, and its tab bar
        // owns that corner.
        if (isInstalledApp()) return;

        const styleId = 'getmeds-chat-links-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            // Stacked above #scroll-to-top, which is 50px at right 30px / bottom 100px (44px at
            // right 20px / bottom 110px on a phone). The column starts 12px above it and shares
            // its centre line; these offsets have to move if that button does.
            style.textContent = `
                #gm-chat-links {
                    position: fixed;
                    right: 31px;
                    bottom: 162px;
                    z-index: 9999998;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }
                #gm-chat-links.gm-chat-links--hidden {
                    opacity: 0;
                    visibility: hidden;
                }
                #gm-chat-links a {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                #gm-chat-links a:hover {
                    transform: translateY(-3px) scale(1.06);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
                }
                #gm-chat-links svg {
                    width: 26px;
                    height: 26px;
                    fill: #fff;
                }
                @media (max-width: 640px) {
                    #gm-chat-links {
                        right: 20px;
                        bottom: 164px;
                        gap: 8px;
                    }
                    #gm-chat-links a {
                        width: 44px;
                        height: 44px;
                    }
                    #gm-chat-links svg {
                        width: 24px;
                        height: 24px;
                    }
                    /* The cookie banner spans the full width on a phone and Tawk is hidden
                       while it is up (analytics-consent.js), so these step aside with it. */
                    body:has(.gmc-banner) #gm-chat-links {
                        display: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const row = document.createElement('div');
        row.id = 'gm-chat-links';
        row.innerHTML = CHAT_LINKS.map(function (link) {
            // viber:// hands off to the app, so it has no tab to open.
            const newTab = link.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '';
            return '<a href="' + link.href + '"' + newTab + ' data-chat-link="' + link.id + '"' +
                ' aria-label="' + link.label + '" title="' + link.label + '" style="background:' + link.background + '">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + link.path + '"/></svg></a>';
        }).join('');
        document.body.appendChild(row);

        // Tawk's open chat window covers this corner, so the row hides while it is open.
        // Any handler already on the hook is kept and called first.
        const tawk = window.Tawk_API = window.Tawk_API || {};
        const hook = function (name, hidden) {
            const previous = tawk[name];
            tawk[name] = function () {
                if (typeof previous === 'function') previous.apply(this, arguments);
                row.classList.toggle('gm-chat-links--hidden', hidden);
            };
        };
        hook('onChatMaximized', true);
        hook('onChatMinimized', false);
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

        // The installed app does not load Tawk at all. Repositioning it was not
        // enough: it owns an iframe it styles inline, it re-asserts that styling
        // as its own state changes, and the app already has a Contact button in
        // that corner. Not injecting it is the only way it cannot collide.
        if (isInstalledApp()) {
            // Anything that used to open the chat goes to the contact form instead,
            // so those buttons are never dead.
            window.openGetmedsChat = function () { window.location.href = '/contact-us'; };
            return;
        }

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
                        { label: 'Return & Refund Policy', slug: 'return-and-refund-policy' },
                        // Not a policy, but it lives in this row. It has no policiesDisclaimers
                        // doc, so it always renders as a plain link to the HTML sitemap page.
                        { label: 'Sitemap', slug: 'sitemap' }
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
                    bottom: 100px !important;
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
                        bottom: 110px !important;
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