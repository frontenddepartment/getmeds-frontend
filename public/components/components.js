(function () {
    console.log('[GetMEDS] Global Component Loader v3 active');

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

                console.log(`[GetMEDS] Successfully loaded and executed ${componentPath}`);
            })
            .catch(function (err) {
                console.warn(`[GetMEDS] Failed to load ${componentPath}:`, err);
            });
    }

    function init() {
        if (window.getmeds_inited_hardened) return;
        window.getmeds_inited_hardened = true;

        try {
            console.log('[GetMEDS] Initializing UI components (Hardened)...');

            // Set Favicon dynamically
            injectFavicon();

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

            fetch('components/auth_modals.html?v=' + new Date().getTime())
                .then(res => res.text())
                .then(html => {
                    authContainer.innerHTML = html;
                    executeScripts(authContainer);
                })
                .catch(err => console.warn('[GetMEDS] Auth Modal failed:', err));

        } catch (e) {
            console.error('[GetMEDS] Loader Initialization Error:', e);
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
                    padding: 5px 11px !important;
                    border-radius: 10px !important;
                    background: rgba(255,255,255,0.15) !important;
                    border: 1px solid rgba(255,255,255,0.25) !important;
                    color: #ffffff !important;
                    font-size: 11px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                    max-width: 100% !important;
                }
                .zap-resource-link:hover {
                    background: rgba(255,255,255,0.25) !important;
                    transform: translateY(-1px) !important;
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
        btn.innerHTML = '<span style="width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.88);box-shadow:0 0 10px rgba(255,255,255,0.7),0 0 20px rgba(255,255,255,0.35);position:relative;z-index:2;display:block;"></span>';
        btn.title = 'Ask GetAssist';
        document.body.appendChild(btn);

        // Chat Window HTML
        const chatWindow = document.createElement('div');
        chatWindow.id = 'zap-chat-window';
        chatWindow.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#61A644,#1D9FDA);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;box-shadow:0 4px 14px rgba(29,159,218,0.3);">
                        <span style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.88);box-shadow:0 0 8px rgba(255,255,255,0.6);display:block;position:relative;z-index:1;"></span>
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
                    <div id="zap-welcome-orb" style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#61A644,#1D9FDA);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 10px 30px rgba(29,159,218,0.35);">
                        <span style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.88);box-shadow:0 0 14px rgba(255,255,255,0.65);display:block;position:relative;z-index:1;"></span>
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
                            <button style="white-space:nowrap;padding:5px 13px;border-radius:20px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555;font-size:11px;font-weight:500;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:background 0.15s;flex-shrink:0;" onclick="document.dispatchEvent(new CustomEvent('zapAsk',{detail:'How to inquire?'}))" onmouseover="this.style.background='#e9eaec'" onmouseout="this.style.background='#f3f4f6'">How to inquire?</button>
                            <button style="white-space:nowrap;padding:5px 13px;border-radius:20px;background:#f3f4f6;border:1px solid #e5e7eb;color:#555;font-size:11px;font-weight:500;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:background 0.15s;flex-shrink:0;" onclick="document.dispatchEvent(new CustomEvent('zapAsk',{detail:'Search products'}))" onmouseover="this.style.background='#e9eaec'" onmouseout="this.style.background='#f3f4f6'">Search products</button>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
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

        function basicMarkdownToHtml(value) {
            return escapeHtml(value)
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
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
            const typing = document.createElement('div');
            typing.className = 'zap-msg ai typing';
            typing.innerHTML = '<span class="zap-dot"></span><span class="zap-dot"></span><span class="zap-dot"></span>';
            zapMessages.appendChild(typing);
            zapMessages.scrollTop = zapMessages.scrollHeight;
            return typing;
        }

        async function handleResponse(query) {
            const typing = showTyping();
            zapSend.disabled = true;
            zapInput.disabled = true;

            try {
                const res = await fetch(getChatbotApiUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        message: query,
                        session_id: getChatSessionId()
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
                    answerHtml += '<div class="zap-resources mt-3 flex flex-wrap gap-2">';
                    payload.resources.forEach(res => {
                        let iconClass = 'fa-link';
                        if (res.type === 'product') iconClass = 'fa-pills';
                        else if (res.type === 'service') iconClass = 'fa-stethoscope';
                        else if (res.type === 'team') iconClass = 'fa-user-md';

                        let url = res.url || '#';
                        // Map backend routes to actual local HTML files
                        if (url.startsWith('/products/')) {
                            url = 'product-details.html';
                        } else if (url.startsWith('/services')) {
                            url = 'services.html';
                        } else if (url.startsWith('/team')) {
                            url = 'about-us.html';
                        } else if (url === '/faq') {
                            url = 'index.html'; // Fallback
                        } else if (url.startsWith('/')) {
                            url = url.substring(1) + '.html';
                        }

                        answerHtml += `
                            <a href="${escapeHtml(url)}" class="zap-resource-link">
                                <i class="fa-solid ${iconClass}"></i>
                                <span class="truncate">${escapeHtml(res.title)}</span>
                            </a>
                        `;
                    });
                    answerHtml += '</div>';
                }

                // Chatbot API content may include simple HTML links generated by the backend.
                // User messages are still rendered with textContent in addMessage().
                addMessage(answerHtml, 'ai', { allowHtml: true });
            } catch (err) {
                console.error('[GetMEDS] Chatbot API error:', err);
                typing.remove();
                addMessage(
                    "Sorry, I couldn't connect to GetAssist right now. Please make sure the chatbot API is running and the frontend is using the correct /ask endpoint.",
                    'ai'
                );
            } finally {
                zapSend.disabled = false;
                zapInput.disabled = false;
                zapInput.focus();
            }
        }

        const sendMessage = () => {
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
            const welcome = chatWindow.querySelector('#zap-welcome');
            if (welcome) welcome.remove();
            addMessage(e.detail, 'user');
            handleResponse(e.detail);
        });

        // ── Speech-to-Text ────────────────────────────────────────────
        const zapMicBtn = chatWindow.querySelector('#zap-mic-btn');
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognitionAPI && zapMicBtn) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            let isListening = false;

            zapMicBtn.addEventListener('click', () => {
                if (isListening) {
                    recognition.stop();
                } else {
                    window.speechSynthesis && window.speechSynthesis.cancel();
                    try { recognition.start(); } catch(e) {}
                }
            });

            recognition.onstart = () => {
                isListening = true;
                zapMicBtn.classList.add('zap-listening');
                zapInput.placeholder = 'Listening…';
                zapInput.value = '';
            };

            recognition.onend = () => {
                isListening = false;
                zapMicBtn.classList.remove('zap-listening');
                zapInput.placeholder = 'Ask me anything...';
            };

            recognition.onresult = (e) => {
                const transcript = Array.from(e.results)
                    .map(r => r[0].transcript).join('');
                zapInput.value = transcript;
                if (e.results[e.results.length - 1].isFinal) {
                    recognition.stop();
                    setTimeout(() => sendMessage(), 300);
                }
            };

            recognition.onerror = () => {
                isListening = false;
                zapMicBtn.classList.remove('zap-listening');
                zapInput.placeholder = 'Ask me anything...';
            };
        } else if (zapMicBtn) {
            zapMicBtn.style.opacity = '0.35';
            zapMicBtn.style.cursor = 'not-allowed';
            zapMicBtn.title = 'Voice input not supported in this browser';
        }
    }

    function injectFavicon() {
        // Find or create favicon link
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        // Always force the GetMEDS logo
        link.href = 'assets/getmedslogo.png';
        console.log('[GetMEDS] Favicon standardized');
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

        console.log('[GetMEDS] Scroll-to-top button injected and secured');
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