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
        if (document.getElementById('zap-ai-trigger')) return;

        // Styles for AI Assistant
        const styleId = 'getmeds-ai-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes zap-orb-float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    33%       { transform: translateY(-6px) scale(1.05); }
                    66%       { transform: translateY(3px) scale(0.96); }
                }
                @keyframes zap-orb-ring {
                    0%   { transform: scale(0.75); opacity: 0.7; }
                    100% { transform: scale(1.7);  opacity: 0; }
                }
                @keyframes zap-typing {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-4px); }
                }
                @keyframes zap-welcome-bounce {
                    0%, 100% { transform: translateY(0px); }
                    40%      { transform: translateY(-14px); }
                    60%      { transform: translateY(-7px); }
                }

                #zap-ai-trigger {
                    position: fixed !important;
                    bottom: 95px !important;
                    right: 30px !important;
                    width: 56px !important;
                    height: 56px !important;
                    background: linear-gradient(135deg, #61A644 0%, #1D9FDA 100%) !important;
                    border: none !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    z-index: 9999998 !important;
                    overflow: visible !important;
                    animation: zap-orb-float 3.5s ease-in-out infinite !important;
                    box-shadow: 0 6px 24px rgba(97,166,68,0.4), 0 10px 40px rgba(29,159,218,0.3) !important;
                }
                #zap-ai-trigger::before {
                    content: '' !important;
                    position: absolute !important;
                    inset: 0 !important;
                    border-radius: 50% !important;
                    background: linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 55%) !important;
                    pointer-events: none !important;
                }
                #zap-ai-trigger::after {
                    content: '' !important;
                    position: absolute !important;
                    inset: -7px !important;
                    border-radius: 50% !important;
                    border: 2px solid rgba(29,159,218,0.4) !important;
                    animation: zap-orb-ring 2.6s ease-out infinite !important;
                    pointer-events: none !important;
                }
                #zap-ai-trigger i { display: none !important; }

                #zap-chat-window {
                    position: fixed !important;
                    bottom: 30px !important;
                    right: 95px !important;
                    width: 500px !important;
                    height: 410px !important;
                    max-height: calc(100vh - 120px) !important;
                    max-width: calc(100vw - 100px) !important;
                    background:
                        radial-gradient(ellipse 75% 65% at 10% 10%, rgba(97,166,68,0.35) 0%, transparent 100%),
                        radial-gradient(ellipse 70% 60% at 92% 92%, rgba(29,159,218,0.38) 0%, transparent 100%),
                        #ffffff !important;
                    z-index: 9999997 !important;
                    border-radius: 22px !important;
                    overflow: hidden !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.07) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    opacity: 0 !important;
                    transform: translateY(18px) scale(0.95) !important;
                    visibility: hidden !important;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                    border: 1px solid rgba(0,0,0,0.06) !important;
                }
                #zap-chat-window.active {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) scale(1) !important;
                }

                #zap-messages {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 8px 18px 14px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10px !important;
                    scrollbar-width: none !important;
                    background: transparent !important;
                }
                #zap-messages::-webkit-scrollbar { display: none; }

                .zap-msg {
                    padding: 10px 14px !important;
                    border-radius: 16px !important;
                    font-size: 13.5px !important;
                    line-height: 1.55 !important;
                    max-width: 82% !important;
                    word-wrap: break-word !important;
                }
                .zap-msg.ai {
                    background: rgba(255,255,255,0.75) !important;
                    color: #1a1a1a !important;
                    align-self: flex-start !important;
                    border-bottom-left-radius: 4px !important;
                    backdrop-filter: blur(8px) !important;
                    box-shadow: 0 1px 6px rgba(0,0,0,0.08) !important;
                }
                .zap-msg.user {
                    background: linear-gradient(135deg, #61A644 0%, #1D9FDA 100%) !important;
                    color: #ffffff !important;
                    align-self: flex-end !important;
                    border-bottom-right-radius: 4px !important;
                }

                 .zap-resource-link {
                    text-decoration: none !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 6px 12px !important;
                    border-radius: 10px !important;
                    background: #f1f5f9 !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #1D9FDA !important;
                    font-size: 11.5px !important;
                    font-weight: 600 !important;
                    transition: all 0.2s ease !important;
                    max-width: 100% !important;
                    margin-top: 6px !important;
                    margin-right: 6px !important;
                }
                .zap-resource-link:hover {
                    background: #e2e8f0 !important;
                    color: #0f76a8 !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
                }

                .zap-dot {
                    display: inline-block;
                    width: 5px;
                    height: 5px;
                    background: #999;
                    border-radius: 50%;
                    margin: 0 2px;
                    animation: zap-typing 1s infinite ease-in-out;
                }
                .zap-dot:nth-child(2) { animation-delay: 0.2s; }
                .zap-dot:nth-child(3) { animation-delay: 0.4s; }

                .zap-msg.typing span {
                    transition: opacity 0.3s ease;
                }

                #zap-welcome-orb { display: none !important; }

                @keyframes zap-mic-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
                    70%  { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
                    100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
                }
                #zap-mic-btn.zap-listening {
                    background: #ef4444 !important;
                    color: #ffffff !important;
                    border-color: #ef4444 !important;
                    animation: zap-mic-pulse 1.2s ease-out infinite !important;
                }

                @media (max-width: 640px) {
                    #zap-ai-trigger {
                        bottom: 20px !important;
                        right: 20px !important;
                    }
                    #zap-chat-window {
                        bottom: 0 !important;
                        right: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        max-width: 100vw !important;
                        height: 88vh !important;
                        max-height: 88vh !important;
                        border-radius: 22px 22px 0 0 !important;
                        transform: translateY(100%) !important;
                        opacity: 1 !important;
                        transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1), visibility 0s 0.45s !important;
                    }
                    #zap-chat-window.active {
                        transform: translateY(0) !important;
                        visibility: visible !important;
                        transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1) !important;
                    }
                    #zap-welcome-orb {
                        display: flex !important;
                        animation: zap-welcome-bounce 1.5s ease-in-out infinite !important;
                    }
                    #zap-ai-trigger.zap-modal-open {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Trigger Button
        const btn = document.createElement('button');
        btn.id = 'zap-ai-trigger';
        btn.innerHTML = '<img src="/assets/chatbotimage.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;position:relative;z-index:2;clip-path:circle(31% at 50% 50%);" />';
        btn.title = 'Ask GetAssist';
        document.body.appendChild(btn);

        // Chat Window HTML
        const chatWindow = document.createElement('div');
        chatWindow.id = 'zap-chat-window';
        chatWindow.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#61A644,#1D9FDA);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;box-shadow:0 4px 14px rgba(29,159,218,0.3);overflow:hidden;">
                        <img src="/assets/chatbotimage.png" style="width:100%;height:100%;object-fit:cover;display:block;clip-path:circle(31% at 50% 50%);" />
                        <span style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,0.4) 0%,transparent 55%);pointer-events:none;"></span>
                    </div>
                    <span style="font-size:15px;font-weight:600;color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.1px;">GetAssist</span>
                </div>
                <button id="zap-close-win" style="background:rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.1);border-radius:50%;width:30px;height:30px;cursor:pointer;color:#555;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;transition:background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.13)'" onmouseout="this.style.background='rgba(0,0,0,0.07)'">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div id="zap-messages">
                <div id="zap-welcome" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:22px;">
                    <div id="zap-welcome-orb" style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#61A644,#1D9FDA);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 10px 30px rgba(29,159,218,0.35);overflow:hidden;">
                        <img src="/assets/chatbotimage.png" style="width:100%;height:100%;object-fit:cover;display:block;clip-path:circle(31% at 50% 50%);" />
                        <span style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,0.42) 0%,transparent 55%);pointer-events:none;"></span>
                    </div>
                    <p style="margin:0;font-size:18px;font-weight:600;color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;line-height:1.5;letter-spacing:-0.2px;">Hi! How can I help<br>you today?</p>
                </div>
            </div>

            <div style="padding:10px 12px 14px;flex-shrink:0;">
                <div style="background:#ffffff;border-radius:18px;padding:14px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
                    <input type="text" id="zap-input" placeholder="Ask me anything..." style="width:100%;background:transparent;border:none;outline:none;font-size:13.5px;color:#1a1a1a;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-sizing:border-box;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
                        <div style="display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;flex:1;margin-right:10px;">
                            <button style="white-space:nowrap;padding:5px 13px;border-radius:20px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555;font-size:11px;font-weight:500;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:background 0.15s;flex-shrink:0;" onclick="window.location.href='/product-range'" onmouseover="this.style.background='#e9eaec'" onmouseout="this.style.background='#f3f4f6'">Search Products</button>
                            <button style="white-space:nowrap;padding:5px 13px;border-radius:20px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555;font-size:11px;font-weight:500;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:background 0.15s;flex-shrink:0;" onclick="window.location.href='/order-medicines'" onmouseover="this.style.background='#e9eaec'" onmouseout="this.style.background='#f3f4f6'">Order Medicines</button>
                            <button style="white-space:nowrap;padding:5px 13px;border-radius:20px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555;font-size:11px;font-weight:500;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:background 0.15s;flex-shrink:0;" onclick="window.location.href='/contact-us'" onmouseover="this.style.background='#e9eaec'" onmouseout="this.style.background='#f3f4f6'">Contact Us</button>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                            <button id="zap-auto-toggle" title="Toggle Auto-Send" style="height:34px;padding:0 8px;background:#e5f7ed;border:1.5px solid #b7ebd0;color:#15803d;border-radius:17px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:10px;font-weight:600;transition:all 0.2s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;outline:none;">
                                <i id="zap-auto-icon" class="fa-solid fa-bolt" style="font-size:10px;"></i>
                                <span id="zap-auto-text">Auto</span>
                            </button>
                            <button id="zap-mic-btn" title="Speak your message" style="height:34px;width:34px;background:#f3f4f6;border:1.5px solid #e5e7eb;color:#666;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
                                <i class="fa-solid fa-microphone" style="font-size:12px;"></i>
                            </button>
                            <button id="zap-send-btn" style="height:34px;width:34px;background:linear-gradient(135deg,#61A644,#1D9FDA);color:#fff;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(29,159,218,0.4);transition:transform 0.15s,opacity 0.15s;" onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'" onmousedown="this.style.transform='scale(0.9)'" onmouseup="this.style.transform='scale(1)'">
                                <i class="fa-solid fa-arrow-up" style="font-size:13px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Logic
        const zapInput = chatWindow.querySelector('#zap-input');
        const zapMessages = chatWindow.querySelector('#zap-messages');
        const zapSend = chatWindow.querySelector('#zap-send-btn');

        const isMobile = () => window.innerWidth <= 640;

        btn.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) {
                zapInput.focus();
                if (isMobile()) btn.classList.add('zap-modal-open');
            } else {
                btn.classList.remove('zap-modal-open');
            }
        });

        chatWindow.querySelector('#zap-close-win').addEventListener('click', () => {
            chatWindow.classList.remove('active');
            btn.classList.remove('zap-modal-open');
        });

        function loadChatHistory() {
            const sid = getChatSessionId();
            const query = `*[_type == "chatSession" && sessionId == "${sid}"][0]{ messages }`;
            const projectId = document.querySelector('meta[name="getmeds-sanity-project-id"]')?.content || 's7ocz8zp';
            const dataset = document.querySelector('meta[name="getmeds-sanity-dataset"]')?.content || 'production';
            const apiVersion = document.querySelector('meta[name="getmeds-sanity-api-version"]')?.content || '2021-10-21';
            const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=` + encodeURIComponent(query);

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const messages = data?.result?.messages;
                    if (messages && Array.isArray(messages) && messages.length > 0) {
                        const welcome = chatWindow.querySelector('#zap-welcome');
                        if (welcome) welcome.remove();

                        messages.forEach(msg => {
                            if (msg.user) {
                                addMessage(msg.user, 'user');
                            }
                            if (msg.ai) {
                                let html = basicMarkdownToHtml(msg.ai);
                                if (msg.resources) {
                                    html += buildResourcesHtml(msg.resources);
                                }
                                addMessage(html, 'ai', { allowHtml: true });
                            }
                        });
                    }
                })
                .catch(err => console.warn('[Getmeds] Failed to load chat history:', err));
        }

        loadChatHistory();

        function getChatbotApiUrl() {
            const explicitUrl =
                window.GETMEDS_CHATBOT_API_URL ||
                document.body?.dataset?.chatbotApiUrl ||
                document.querySelector('meta[name="getmeds-chatbot-api"]')?.content;

            if (explicitUrl) return explicitUrl;

            // chatbot.py exposes router.post("/ask").
            // If your FastAPI app includes this router with a prefix,
            // set window.GETMEDS_CHATBOT_API_URL before loading components.js.
            //
            // Example:
            // window.GETMEDS_CHATBOT_API_URL = "http://localhost:8000/api/chatbot/ask";
            return `http://localhost:8000/api/chatbot/ask`;
        }

        function getChatSessionId() {
            const storageKey = 'getmeds_chat_session_id';
            let sessionId = localStorage.getItem(storageKey);

            if (!sessionId) {
                if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                    sessionId = window.crypto.randomUUID();
                } else {
                    sessionId = `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                }

                localStorage.setItem(storageKey, sessionId);
            }

            return sessionId;
        }

        function escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function buildResourcesHtml(resources) {
            if (!resources || !Array.isArray(resources) || resources.length === 0) return '';
            let html = '<div class="zap-resources mt-3 flex flex-wrap gap-2">';
            resources.forEach(res => {
                let iconClass = 'fa-link';
                if (res.type === 'product') iconClass = 'fa-pills';
                else if (res.type === 'service') iconClass = 'fa-stethoscope';
                else if (res.type === 'team') iconClass = 'fa-user-md';
                else if (res.type === 'category') iconClass = 'fa-folder-open';

                let url = res.url || '#';
                // Normalize legacy relative links
                if (!url.startsWith('/') && !url.startsWith('http') && url !== '#') {
                    if (url.startsWith('product-range.html')) {
                        url = '/product-range' + url.substring('product-range.html'.length);
                    } else if (url.startsWith('order-medicines.html')) {
                        url = '/order-medicines' + url.substring('order-medicines.html'.length);
                    } else if (url.startsWith('contact-us.html')) {
                        url = '/contact-us' + url.substring('contact-us.html'.length);
                    } else {
                        url = '/' + url;
                    }
                }

                // Map backend routes to actual clean URLs
                if (url.startsWith('/products/')) {
                    const slug = url.substring('/products/'.length);
                    url = '/product-range?product=' + slug;
                } else if (url.startsWith('/services')) {
                    url = '/services';
                } else if (url.startsWith('/team')) {
                    // Convert team member title to a slug: Mr. Naresh Bishnoi -> naresh-bishnoi
                    const slug = res.title
                        .toLowerCase()
                        .replace(/^(mr\.|ms\.|dr\.|prof\.)\s+/g, '')
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-');
                    url = '/about-us#' + slug;
                } else if (url.startsWith('/article-detail') || url.startsWith('/blog-detail')) {
                    url = '/' + url.substring(1); // e.g. /article-detail?id=0
                } else if (url.startsWith('/articles') || url.startsWith('/blog')) {
                    url = '/blog';
                } else if (url === '/faq') {
                    url = '/';
                } else if (url.startsWith('/')) {
                    url = '/' + url.substring(1);
                }

                html += `
                    <a href="${escapeHtml(url)}" class="zap-resource-link">
                        <i class="fa-solid ${iconClass}"></i>
                        <span class="truncate">${escapeHtml(res.title)}</span>
                    </a>
                `;
            });
            html += '</div>';
            return html;
        }

        function basicMarkdownToHtml(value) {
            return escapeHtml(value)
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\\n/g, '<br>')
                .replace(/\n/g, '<br>');
        }

        function normalizeChatbotResponse(data) {
            if (typeof data === 'string') return data;

            if (!data || typeof data !== 'object') {
                return "Sorry, I couldn't understand the chatbot response.";
            }

            // Supports common response shapes, including FastAPI/Pydantic models.
            const answer =
                data.answer ||
                data.response ||
                data.message ||
                data.reply ||
                data.text ||
                data.content;

            if (answer) return answer;

            if (data.data && typeof data.data === 'object') {
                return normalizeChatbotResponse(data.data);
            }

            return "Sorry, I couldn't find an answer for that yet.";
        }

        function addMessage(text, type, options = {}) {
            const msg = document.createElement('div');
            msg.className = `zap-msg ${type}`;

            if (options.allowHtml) {
                msg.innerHTML = text;
            } else {
                msg.textContent = text;
            }

            zapMessages.appendChild(msg);
            zapMessages.scrollTop = zapMessages.scrollHeight;
            return msg;
        }

        function showTyping() {
            const anticipationMessages = [
                "Let me look that up for you…",
                "Searching our records…",
                "Checking our product database…",
                "Finding the best answer for you…",
                "Just a moment, gathering details…",
                "Almost there, pulling up the info…",
                "Looking through our catalog…",
                "Getting everything ready for you…"
            ];

            const typing = document.createElement('div');
            typing.className = 'zap-msg ai typing';
            const randomMsg = anticipationMessages[Math.floor(Math.random() * anticipationMessages.length)];
            typing.innerHTML = `<span style="color:#888;font-style:italic;font-size:12.5px;">${randomMsg}</span>`;
            zapMessages.appendChild(typing);
            zapMessages.scrollTop = zapMessages.scrollHeight;

            // Cycle through messages every 3 seconds to keep it feeling alive
            let msgIndex = anticipationMessages.indexOf(randomMsg);
            typing._interval = setInterval(() => {
                msgIndex = (msgIndex + 1) % anticipationMessages.length;
                const span = typing.querySelector('span');
                if (span) {
                    span.style.opacity = '0';
                    setTimeout(() => {
                        span.textContent = anticipationMessages[msgIndex];
                        span.style.opacity = '1';
                    }, 300);
                }
            }, 3000);

            // Override remove to clean up the interval
            const originalRemove = typing.remove.bind(typing);
            typing.remove = () => {
                if (typing._interval) clearInterval(typing._interval);
                originalRemove();
            };

            return typing;
        }

        // ── Speech-to-Text state declaration (needs to be accessed by handleResponse) ──
        const zapMicBtn = chatWindow.querySelector('#zap-mic-btn');
        const zapAutoToggle = chatWindow.querySelector('#zap-auto-toggle');
        const zapAutoIcon = chatWindow.querySelector('#zap-auto-icon');
        const zapAutoText = chatWindow.querySelector('#zap-auto-text');

        let autoSendVoice = localStorage.getItem('zap-auto-send-voice') !== 'false';

        function updateAutoToggleUI() {
            if (!zapAutoToggle) return;
            if (autoSendVoice) {
                zapAutoToggle.style.background = '#e5f7ed';
                zapAutoToggle.style.borderColor = '#b7ebd0';
                zapAutoToggle.style.color = '#15803d';
                if (zapAutoIcon) zapAutoIcon.className = 'fa-solid fa-bolt';
                if (zapAutoText) zapAutoText.textContent = 'Auto';
                zapAutoToggle.title = 'Auto-send voice input: ON';
            } else {
                zapAutoToggle.style.background = '#f3f4f6';
                zapAutoToggle.style.borderColor = '#e5e7eb';
                zapAutoToggle.style.color = '#666';
                if (zapAutoIcon) zapAutoIcon.className = 'fa-solid fa-hand';
                if (zapAutoText) zapAutoText.textContent = 'Manual';
                zapAutoToggle.title = 'Auto-send voice input: OFF (Microphone keeps recording until manually stopped)';
            }
        }

        if (zapAutoToggle) {
            updateAutoToggleUI();
            zapAutoToggle.addEventListener('click', () => {
                autoSendVoice = !autoSendVoice;
                localStorage.setItem('zap-auto-send-voice', autoSendVoice);
                updateAutoToggleUI();
            });
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isListening = false;

        function extractPageText() {
            try {
                const mainElement = document.querySelector('main') ||
                    document.querySelector('#main') ||
                    document.querySelector('#root') ||
                    document.body;

                if (!mainElement) return '';

                const clone = mainElement.cloneNode(true);

                const excludeSelectors = [
                    'script', 'style', 'noscript', 'iframe', 'svg',
                    'nav', 'header', 'footer', '#navbar-container', '#footer-container',
                    '#zap-chat-window', '#zap-chat-toggle', '.chatbot', '.chat-window',
                    '#auth-modal-container', '.auth-modal', '[role="dialog"]', '.modal'
                ];

                excludeSelectors.forEach(selector => {
                    const elements = clone.querySelectorAll(selector);
                    elements.forEach(el => el.remove());
                });

                let text = '';
                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                tempContainer.style.top = '-9999px';
                tempContainer.style.width = '1px';
                tempContainer.style.height = '1px';
                tempContainer.style.overflow = 'hidden';

                document.body.appendChild(tempContainer);
                tempContainer.appendChild(clone);
                text = clone.innerText || clone.textContent || '';
                document.body.removeChild(tempContainer);

                text = text
                    .replace(/\s+/g, ' ')
                    .replace(/\n\s*\n+/g, '\n')
                    .trim();

                const charLimit = 3000;
                if (text.length > charLimit) {
                    text = text.substring(0, charLimit) + '... [text truncated]';
                }

                return text;
            } catch (e) {
                console.warn('[Getmeds] Failed to extract page text:', e);
                return '';
            }
        }

        async function handleResponse(query) {
            const typing = showTyping();
            zapSend.disabled = true;
            zapInput.disabled = true;

            // Stop voice input active listening if the request is starting
            if (recognition && isListening) {
                try { recognition.stop(); } catch (e) { }
            }

            if (SpeechRecognitionAPI && zapMicBtn) {
                zapMicBtn.disabled = true;
                zapMicBtn.style.opacity = '0.35';
                zapMicBtn.style.cursor = 'not-allowed';
            }

            if (zapAutoToggle) {
                zapAutoToggle.disabled = true;
                zapAutoToggle.style.opacity = '0.35';
                zapAutoToggle.style.cursor = 'not-allowed';
            }

            try {
                const res = await fetch(getChatbotApiUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        message: query,
                        session_id: getChatSessionId(),
                        page_context: extractPageText()
                    })
                });

                let payload = null;
                const contentType = res.headers.get('content-type') || '';

                if (contentType.includes('application/json')) {
                    payload = await res.json();
                } else {
                    payload = await res.text();
                }

                if (!res.ok) {
                    const detail =
                        payload?.detail ||
                        payload?.message ||
                        payload ||
                        `Chatbot API returned ${res.status}`;

                    throw new Error(detail);
                }

                const response = normalizeChatbotResponse(payload);
                typing.remove();

                let answerHtml = basicMarkdownToHtml(response);

                if (payload && typeof payload === 'object' && Array.isArray(payload.resources) && payload.resources.length > 0) {
                    answerHtml += buildResourcesHtml(payload.resources);
                }

                // Chatbot API content may include simple HTML links generated by the backend.
                // User messages are still rendered with textContent in addMessage().
                addMessage(answerHtml, 'ai', { allowHtml: true });
            } catch (err) {
                console.error('[Getmeds] Chatbot API error:', err);
                typing.remove();
                addMessage(
                    "Sorry, I couldn't connect to GetAssist right now. Please make sure the chatbot API is running and the frontend is using the correct /ask endpoint.",
                    'ai'
                );
            } finally {
                zapSend.disabled = false;
                zapInput.disabled = false;
                if (SpeechRecognitionAPI && zapMicBtn) {
                    zapMicBtn.disabled = false;
                    zapMicBtn.style.opacity = '1';
                    zapMicBtn.style.cursor = 'pointer';
                }
                if (zapAutoToggle) {
                    zapAutoToggle.disabled = false;
                    zapAutoToggle.style.opacity = '1';
                    zapAutoToggle.style.cursor = 'pointer';
                    updateAutoToggleUI();
                }
                zapInput.focus();
            }
        }

        const sendMessage = () => {
            if (zapInput.disabled) return; // Block sending if already waiting for response
            const val = zapInput.value.trim();
            if (!val) return;

            const welcome = chatWindow.querySelector('#zap-welcome');
            if (welcome) welcome.remove();

            addMessage(val, 'user');
            zapInput.value = '';
            handleResponse(val);
        };

        zapSend.addEventListener('click', sendMessage);

        zapInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') sendMessage();
        });

        // Listen for internal chips
        document.addEventListener('zapAsk', e => {
            if (zapInput.disabled) return; // Block triggering if already waiting for response
            const welcome = chatWindow.querySelector('#zap-welcome');
            if (welcome) welcome.remove();
            addMessage(e.detail, 'user');
            handleResponse(e.detail);
        });

        // ── Speech-to-Text Initialization ────────────────────────────
        if (SpeechRecognitionAPI && zapMicBtn) {
            recognition = new SpeechRecognitionAPI();
            recognition.continuous = true; // Use continuous to avoid browser cut-off on pauses
            recognition.interimResults = true;
            recognition.lang = 'fil-PH';

            let silenceTimeout = null;
            let countdownInterval = null;
            let secondsLeft = 5;

            function setMicBtnContent(content) {
                if (!zapMicBtn) return;
                if (typeof content === 'number') {
                    zapMicBtn.innerHTML = `<span style="font-size:13px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1;">${content}</span>`;
                } else {
                    zapMicBtn.innerHTML = `<i class="fa-solid fa-microphone" style="font-size:12px;"></i>`;
                }
            }

            function clearSilenceTimer() {
                if (silenceTimeout) clearTimeout(silenceTimeout);
                if (countdownInterval) clearInterval(countdownInterval);
                silenceTimeout = null;
                countdownInterval = null;
            }

            function resetSilenceTimer() {
                clearSilenceTimer();
                if (!autoSendVoice) {
                    setMicBtnContent('mic');
                    return;
                }

                secondsLeft = 5;
                setMicBtnContent('mic'); // Microphone icon when actively speaking
                zapInput.placeholder = 'Listening…';

                countdownInterval = setInterval(() => {
                    secondsLeft--;
                    if (secondsLeft > 0) {
                        zapInput.placeholder = `Listening (${secondsLeft}s)…`;
                        setMicBtnContent(secondsLeft); // Display countdown number (4, 3, 2, 1) on mic button
                    } else {
                        clearInterval(countdownInterval);
                    }
                }, 1000);

                silenceTimeout = setTimeout(() => {
                    if (isListening) {
                        recognition.stop();
                        setTimeout(() => sendMessage(), 300);
                    }
                }, 5000);
            }

            zapMicBtn.addEventListener('click', () => {
                if (zapInput.disabled) return; // Prevent mic input activation while API is loading
                if (isListening) {
                    recognition.stop();
                    if (autoSendVoice) {
                        setTimeout(() => sendMessage(), 300);
                    }
                } else {
                    window.speechSynthesis && window.speechSynthesis.cancel();
                    recognition.continuous = true;
                    try { recognition.start(); } catch (e) { }
                }
            });

            recognition.onstart = () => {
                isListening = true;
                zapMicBtn.classList.add('zap-listening');
                zapInput.placeholder = 'Listening…';
                zapInput.value = '';
                setMicBtnContent('mic');
                resetSilenceTimer();
            };

            recognition.onend = () => {
                isListening = false;
                zapMicBtn.classList.remove('zap-listening');
                zapInput.placeholder = 'Ask me anything...';
                setMicBtnContent('mic');
                clearSilenceTimer();
            };

            recognition.onresult = (e) => {
                const transcript = Array.from(e.results)
                    .map(r => r[0].transcript).join('');
                zapInput.value = transcript;

                if (autoSendVoice) {
                    resetSilenceTimer();
                }
            };

            recognition.onerror = () => {
                isListening = false;
                zapMicBtn.classList.remove('zap-listening');
                zapInput.placeholder = 'Ask me anything...';
                setMicBtnContent('mic');
                clearSilenceTimer();
            };
        } else if (zapMicBtn) {
            zapMicBtn.style.opacity = '0.35';
            zapMicBtn.style.cursor = 'not-allowed';
            zapMicBtn.title = 'Voice input not supported in this browser';
        }
    }

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
                    : `© ${currentYear} Getmeds. All rights reserved.`;
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

            // 7. Legal Links — always include Medical Disclaimer
            const footerLegal = document.getElementById('footer-legal-links');
            if (footerLegal && settings.legalLinks && Array.isArray(settings.legalLinks)) {
                if (!footerLegal.dataset.populated) {
                    footerLegal.innerHTML = '';
                    settings.legalLinks.forEach(link => {
                        if (!link || !link.label) return;
                        const a = document.createElement('a');
                        a.href = link.href || '#';
                        a.className = 'hover:text-white transition';
                        a.textContent = link.label;
                        if (link.openInNewTab) {
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                        }
                        footerLegal.appendChild(a);
                    });
                    // Always append Medical Disclaimer regardless of Sanity config
                    const disclaimerBtn = document.createElement('button');
                    disclaimerBtn.className = 'footer-link text-gray-500 hover:text-white bg-transparent border-none cursor-pointer text-xs p-0';
                    disclaimerBtn.textContent = 'Medical Disclaimer';
                    disclaimerBtn.addEventListener('click', function () {
                        var modal = document.getElementById('medical-disclaimer-modal');
                        if (modal) modal.classList.remove('hidden');
                    });
                    footerLegal.appendChild(disclaimerBtn);
                    footerLegal.dataset.populated = 'true';
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