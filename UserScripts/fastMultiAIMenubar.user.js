// ==UserScript==
// @name        Fast Multi-AI Menubar
// @match       https://gemini.google.com/*
// @match       https://chatgpt.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @version     4.15
// @description InteropDebug active, Trusted Types compliant, Offset Ghost-Click, Namespace removed.
// @downloadURL https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/fastMultiAIMenubar.user.js
// @updateURL   https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/fastMultiAIMenubar.user.js
// ==/UserScript==

/* --- Hardened InteropDebug Module v2.0 Start --- */
const InteropDebug = true; // Set to false to disable globally for this script

(function(debugEnabled) {
    if (!debugEnabled) { return; }

    const SCRIPT_NAME = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.name : 'Universal Userscript';

    // Hardened safe logging utility avoiding string injection sinks
    const log = (msg, level = 'INFO') => {
        console.log(`[InteropDebug][${SCRIPT_NAME}][${level}]`, msg);
    };

    try {
        // Secure context allocation for Trusted Types environments
        const rootContext = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

        // Initialize or hook registry safely without overwriting sealed properties
        if (!rootContext.__INTEROP_DEBUG_REGISTRY__) {
            Object.defineProperty(rootContext, '__INTEROP_DEBUG_REGISTRY__', {
                value: [],
                writable: true,
                configurable: true,
                enumerable: false
            });
        }

        // Register the active signature securely using immutable entries
        rootContext.__INTEROP_DEBUG_REGISTRY__.push(Object.freeze({
            name: SCRIPT_NAME,
            timestamp: Date.now(),
            location: window.location.hostname
        }));

        // Passive monitoring loop to catch script execution cross-talk safely
        let knownScriptCount = 0;
        const checkRegistry = () => {
            const currentScripts = rootContext.__INTEROP_DEBUG_REGISTRY__ || [];
            if (currentScripts.length !== knownScriptCount) {
                knownScriptCount = currentScripts.length;
                const siblings = currentScripts.filter(s => s.name !== SCRIPT_NAME && s.location === window.location.hostname);
                if (siblings.length > 0) {
                    log(`Co-existing active debug modules detected: ${siblings.map(s => s.name).join(', ')}`);
                }
            }
        };
        checkRegistry();
        setInterval(checkRegistry, 4000);

        // Expose diagnostic API safely using defineProperty to protect against host site poisoning
        if (!rootContext.InteropDebugActions) {
            Object.defineProperty(rootContext, 'InteropDebugActions', {
                value: Object.create(null),
                writable: false,
                configurable: true
            });
        }

        // Bind secure action utilities directly to the hardened object layout
        rootContext.InteropDebugActions[`scan_${SCRIPT_NAME}.replace(/\\s+/g, '_')}`] = () => {
            log("Executing framework conflict assessment...");
            const scripts = document.getElementsByTagName('script');
            log(`Host environment active script tags: ${scripts.length}`);
        };

        rootContext.InteropDebugActions[`perf_${SCRIPT_NAME}.replace(/\\s+/g, '_')}`] = () => {
            // Protected precision handling for fingerprint-shielded layout engines
            const runtime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            log(`Initialization delta marker: ${runtime.toFixed(2)}ms`);
        };

        log("Initialization successful. Ecosystem monitoring active.");

    } catch (securityError) {
        // Fallback pipeline if the browser context is entirely locked down by ETP / Trusted Types
        console.warn(`[InteropDebug][${SCRIPT_NAME}][WARN] Strict context isolation detected. Engaging local containment logging.`, securityError.message);

        // Still provide the performance marker locally even if context sharing is blocked
        const localRuntime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        console.log(`[InteropDebug][${SCRIPT_NAME}][LOCAL_INFO] Local loop initialized at ${localRuntime.toFixed(2)}ms`);
    }
})(InteropDebug);
/* --- Hardened InteropDebug Module v2.0 End --- */

(function() {
    'use strict';

    let _cachedChats = null;

    const getChatMetadata = () => {
        const host = window.location.hostname;
        let title = 'Untitled Chat';
        let lastMessageDate = new Date().toLocaleString();

        if (host.indexOf('gemini.google') !== -1) {
            const active = document.querySelector('gmat-list-item[selected="true"] .text-content, .v-list-item--active .v-list-item-title, [aria-current="page"]');
            if (active) { title = active.innerText.trim(); }
            const time = document.querySelector('message-info-time, time:last-of-type');
            if (time) { lastMessageDate = time.innerText.trim(); }
        } else if (host.indexOf('chatgpt.com') !== -1) {
            const active = document.querySelector('li:has(a[href*="/c/"]) a.bg-token-sidebar-surface-bg, [data-active="true"] .truncate');
            if (active) { title = active.innerText.trim(); }
            const time = document.querySelector('[data-testid="author-turn"] time, .text-xs.text-token-text-tertiary:last-of-type');
            if (time) { lastMessageDate = time.innerText.trim(); }
        }
        return { title: title, lastMessageDate: lastMessageDate };
    };

    const isExistingChat = () => {
        const host = window.location.hostname;
        if (host.indexOf('gemini') !== -1) {
            return document.querySelectorAll('user-query, model-response').length > 0;
        }
        if (host.indexOf('chatgpt') !== -1) {
            return document.querySelectorAll('[data-message-author-role]').length > 0;
        }
        return false;
    };

    const extractChatToMarkdown = () => {
        const meta = getChatMetadata();
        const host = window.location.hostname;
        const output = ['# ' + meta.title, '*Last Message: ' + meta.lastMessageDate + '*', ''];

        let elements = [];
        const isGemini = host.indexOf('gemini') !== -1;

        if (isGemini) {
            elements = document.querySelectorAll('user-query, model-response');
        } else {
            elements = document.querySelectorAll('[data-message-author-role]');
        }

        for (const el of elements) {
            const isUser = isGemini ? (el.tagName === 'USER-QUERY') : (el.getAttribute('data-message-author-role') === 'user');
            const role = isUser ? '**User**' : (isGemini ? '**Gemini**' : '**ChatGPT**');
            output.push(role + ':\n' + el.innerText + '\n\n---\n');
        }
        return output.join('\n');
    };

    const saveChat = (btn) => {
        try {
            const chats = JSON.parse(GM_getValue('saved_chats', '[]'));
            const meta = getChatMetadata();
            chats.push({
                id: Date.now().toString(),
                title: meta.title,
                lastMessageDate: meta.lastMessageDate,
                domain: window.location.hostname,
                content: extractChatToMarkdown()
            });
            GM_setValue('saved_chats', JSON.stringify(chats));
            _cachedChats = null;
            btn.textContent = '✅ Saved';
            setTimeout(() => { btn.textContent = '💾 Save'; }, 2000);
        } catch (e) {
            btn.textContent = '❌ Error';
        }
    };

    const showLoadMenu = () => {
        if (document.getElementById('chat-load-modal')) { return; }
        const chats = _cachedChats || JSON.parse(GM_getValue('saved_chats', '[]'));
        _cachedChats = chats;

        const modal = document.createElement('div');
        modal.id = 'chat-load-modal';
        modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:#181818;color:#eee;padding:20px;border-radius:12px;z-index:2147483647;width:450px;max-height:80vh;display:flex;flex-direction:column;contain:content;border:1px solid #333;box-shadow:0 20px 40px rgba(0,0,0,0.8);font-family:"Montserrat", sans-serif;';

        const fragment = document.createDocumentFragment();
        const header = document.createElement('h3');
        header.textContent = 'Saved Chats';
        header.style.margin = '0 0 15px 0';
        fragment.appendChild(header);

        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'overflow-y:auto;flex-grow:1;margin-bottom:10px;';

        const reversedChats = chats.slice().reverse();
        reversedChats.forEach((chat) => {
            const item = document.createElement('div');
            item.style.cssText = 'padding:10px;background:#222;border-radius:6px;margin-bottom:8px;font-size:13px;';
            const titleDiv = document.createElement('strong');
            titleDiv.textContent = chat.title;
            const metaDiv = document.createElement('div');
            metaDiv.style.cssText = 'font-size:11px;color:#888;';
            metaDiv.textContent = chat.lastMessageDate;
            item.appendChild(titleDiv);
            item.appendChild(metaDiv);

            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:5px;margin-top:8px;';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.style.cssText = 'padding:4px 10px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;cursor:pointer;font-family:"Montserrat", sans-serif;font-size:11px;';
            copyBtn.onclick = () => {
                const prompt = 'I am providing a transcript from ' + chat.domain + '. Title: ' + chat.title + '.\n\n' + chat.content + '\n\nResume conversation.';
                navigator.clipboard.writeText(prompt);
                copyBtn.textContent = 'Done!';
            };

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.style.cssText = 'padding:4px 10px;background:#422;color:#fff;border:1px solid #522;border-radius:3px;cursor:pointer;font-family:"Montserrat", sans-serif;font-size:11px;';
            delBtn.onclick = () => {
                if (confirm('Delete?')) {
                    const filtered = _cachedChats.filter((x) => x.id !== chat.id);
                    GM_setValue('saved_chats', JSON.stringify(filtered));
                    _cachedChats = filtered;
                    modal.remove();
                    showLoadMenu();
                }
            };
            btnRow.appendChild(copyBtn);
            btnRow.appendChild(delBtn);
            item.appendChild(btnRow);
            listContainer.appendChild(item);
        });

        fragment.appendChild(listContainer);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = 'padding:6px 14px;background:#333;color:#fff;border:1px solid #555;border-radius:4px;cursor:pointer;font-family:"Montserrat", sans-serif;font-size:13px;font-weight:600;';
        closeBtn.onclick = () => { modal.remove(); };
        fragment.appendChild(closeBtn);
        modal.appendChild(fragment);
        document.body.appendChild(modal);
    };

    // --- Stabilized Ghost Click Engine ---
    const passThroughClick = (e) => {
        const menubar = document.getElementById('fast-chat-menubar');
        if (!menubar) { return; }
        const oldVis = menubar.style.visibility;
        menubar.style.visibility = 'hidden';
        
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        if (targetElement) { targetElement.click(); }
        menubar.style.visibility = oldVis;
    };

    // --- Dynamic Context Label Refresher ---
    const updateContextualLabels = () => {
        const btnIncognito = document.getElementById('fc-native-incognito');
        if (!btnIncognito) { return; }

        const isChatActive = isExistingChat();
        const iconSpan = btnIncognito.querySelector('.fc-icon');
        const textSpan = btnIncognito.querySelector('.fc-text');

        if (isChatActive) {
            if (iconSpan && iconSpan.textContent !== '⋮') { iconSpan.textContent = '⋮'; }
            if (textSpan && textSpan.textContent !== '') { textSpan.textContent = ''; }
            btnIncognito.style.padding = '0 !important';
            btnIncognito.style.width = '32px !important';
        } else {
            if (iconSpan && iconSpan.textContent !== '💬') { iconSpan.textContent = '💬'; }
            if (textSpan && textSpan.textContent !== 'Incognito') { textSpan.textContent = 'Incognito'; }
            btnIncognito.style.padding = '0 8px !important';
            btnIncognito.style.width = 'auto !important';
        }
    };

    const toggleMenubarVisibility = () => {
        const menubar = document.getElementById('fast-chat-menubar');
        if (!menubar) { return; }
        
        const isHidden = menubar.classList.toggle('fc-retracted');
        const centerToggleBtn = document.getElementById('fc-center-toggle-btn');
        
        if (centerToggleBtn) {
            centerToggleBtn.textContent = isHidden ? '▼ Show' : '▲ Hide';
        }
    };

    const injectHardenedStyles = () => {
        if (!document.getElementById('fast-chat-font')) {
            const fontLink = document.createElement('link');
            fontLink.id = 'fast-chat-font';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }

        if (document.getElementById('fast-chat-global-styles')) { return; }
        const style = document.createElement('style');
        style.id = 'fast-chat-global-styles';
        style.textContent = `
            #fast-chat-menubar { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 45px !important; background: #1a1a1a !important; display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0 15px !important; z-index: 2147483647 !important; border-bottom: 1px solid #333 !important; font-family: "Montserrat", sans-serif !important; box-sizing: border-box !important; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; transform: translateY(0); }
            #fast-chat-menubar.fc-retracted { transform: translateY(-45px) !important; }
            .fc-left-group { display: flex !important; align-items: center !important; gap: 15px !important; width: 40% !important; }
            
            /* --- Dead-Center Toggle Positioning Engine --- */
            .fc-center-container { position: absolute !important; left: 50% !important; top: 0 !important; transform: translateX(-50%) !important; height: 45px !important; display: flex !important; align-items: center !important; justify-content: center !important; pointer-events: none !important; z-index: 2147483648 !important; }
            .fc-center-btn { font-family: "Montserrat", sans-serif !important; font-size: 11px !important; font-weight: 700 !important; color: #888 !important; background: #222 !important; border: 1px solid #333 !important; border-radius: 0 0 6px 6px !important; height: 26px !important; padding: 0 14px !important; cursor: pointer !important; pointer-events: auto !important; transition: background 0.15s, color 0.15s, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important; letter-spacing: 0.3px !important; align-self: flex-start !important; border-top: none !important; }
            .fc-center-btn:hover { background: #333 !important; color: #fff !important; border-color: #444 !important; }
            #fast-chat-menubar.fc-retracted .fc-center-btn { transform: translateY(45px) !important; background: #1a1a1a !important; border: 1px solid #333 !important; border-top: none !important; }

            .fc-native-trigger { display: none !important; align-items: center !important; justify-content: center !important; background: transparent !important; color: #ccc !important; border: 1px solid transparent !important; border-radius: 4px !important; cursor: pointer !important; font-size: 18px !important; width: 32px !important; height: 32px !important; flex-shrink: 0 !important; transition: background 0.2s !important; padding: 0 !important; }
            .fc-native-trigger:hover { background: #333 !important; border-color: #555 !important; color: #fff !important; }
            #fast-chat-menubar[data-platform="gemini"] .fc-gemini-only { display: flex !important; }
            #fc-native-incognito { display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 14px !important; gap: 4px !important; transition: all 0.15s ease-in-out !important; }
            .fc-desktop-nav { display: flex !important; gap: 20px !important; align-items: center !important; }
            .fc-nav-link { color: #888 !important; text-decoration: none !important; font-size: 15px !important; font-weight: 400 !important; transition: color 0.2s !important; letter-spacing: 0.5px !important; font-family: "Montserrat", sans-serif !important; }
            .fc-nav-link:hover { color: #ccc !important; }
            #fast-chat-menubar[data-platform="gemini"] a[href*="gemini.google.com"] { color: #16a34a !important; font-weight: 700 !important; }
            #fast-chat-menubar[data-platform="chatgpt"] a[href*="chatgpt.com"] { color: #ffffff !important; font-weight: 700 !important; }
            .fc-mobile-nav { display: none !important; position: relative !important; }
            #fc-mobile-dropdown-btn { background: transparent !important; color: #fff !important; border: none !important; font-family: "Montserrat", sans-serif !important; font-size: 16px !important; font-weight: 700 !important; cursor: pointer !important; display: flex !important; align-items: center !important; gap: 6px !important; padding: 0 !important; }
            #fast-chat-menubar[data-platform="gemini"] #fc-mobile-dropdown-btn { color: #16a34a !important; }
            .fc-mobile-content { display: none !important; position: absolute !important; top: 100% !important; left: -10px !important; margin-top: 15px !important; background: #1a1a1a !important; border: 1px solid #333 !important; border-radius: 6px !important; flex-direction: column !important; min-width: 140px !important; overflow: hidden !important; box-shadow: 0 8px 16px rgba(0,0,0,0.7) !important; z-index: 2147483648 !important; }
            .fc-mobile-content.fc-show { display: flex !important; }
            .fc-mobile-content a { padding: 12px 16px !important; color: #ccc !important; text-decoration: none !important; font-size: 14px !important; font-weight: 500 !important; border-bottom: 1px solid #222 !important; }
            .fc-mobile-content a:hover { background: #333 !important; color: #fff !important; }
            .fc-action-group { display: flex !important; gap: 10px !important; align-items: center !important; justify-content: flex-end !important; width: 40% !important; flex-shrink: 0 !important; }
            .fc-action-btn { font-family: "Montserrat", sans-serif !important; padding: 6px 12px !important; background: #333 !important; color: #fff !important; border: 1px solid #555 !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important; font-weight: 600 !important; transition: background 0.2s, opacity 0.2s !important; white-space: nowrap !important; }
            .fc-action-btn:hover:not(:disabled) { background: #444 !important; }
            .fc-action-btn:disabled { opacity: 0.3 !important; cursor: not-allowed !important; background: #111 !important; border-color: #333 !important; color: #777 !important; }
            @media (max-width: 768px) {
                .fc-desktop-nav { display: none !important; }
                .fc-mobile-nav { display: block !important; }
                .fc-action-btn { padding: 6px 8px !important; font-size: 11px !important; }
                #fc-native-incognito .fc-text { display: none !important; }
                .fc-left-group, .fc-action-group { width: auto !important; }
            }
        `;
        document.documentElement.appendChild(style);
    };

    const initMenubar = () => {
        if (document.getElementById('fast-chat-menubar')) { return; }
        injectHardenedStyles();
        const menubar = document.createElement('header');
        menubar.id = 'fast-chat-menubar';
        const currentHost = window.location.hostname;
        const platformMode = (currentHost.indexOf('gemini.google') !== -1) ? 'gemini' : 'chatgpt';
        const platformName = platformMode === 'gemini' ? 'Gemini' : 'ChatGPT';
        menubar.setAttribute('data-platform', platformMode);
        const leftGroup = document.createElement('div');
        leftGroup.className = 'fc-left-group';
        const btnHamburger = document.createElement('button');
        btnHamburger.id = 'fc-native-hamburger';
        btnHamburger.className = 'fc-native-trigger fc-gemini-only';
        btnHamburger.textContent = '☰';
        btnHamburger.onclick = passThroughClick;
        leftGroup.appendChild(btnHamburger);
        const desktopNav = document.createElement('nav');
        desktopNav.className = 'fc-desktop-nav';
        [{name:'Gemini',url:'https://gemini.google.com/'},{name:'ChatGPT',url:'https://chatgpt.com/'}].forEach(l => {
            const a = document.createElement('a');
            a.textContent = l.name;
            a.setAttribute('href', l.url);
            a.className = 'fc-nav-link';
            desktopNav.appendChild(a);
        });
        leftGroup.appendChild(desktopNav);
        const mobileNav = document.createElement('div');
        mobileNav.className = 'fc-mobile-nav';
        const mobileBtn = document.createElement('button');
        mobileBtn.id = 'fc-mobile-dropdown-btn';
        mobileBtn.textContent = `${platformName} ▼`;
        mobileBtn.onclick = (e) => { e.stopPropagation(); document.getElementById('fc-mobile-dropdown-content')?.classList.toggle('fc-show'); };
        const mobileContent = document.createElement('div');
        mobileContent.id = 'fc-mobile-dropdown-content';
        mobileContent.className = 'fc-mobile-content';
        [{name:'Gemini',url:'https://gemini.google.com/'},{name:'ChatGPT',url:'https://chatgpt.com/'}].forEach(l => {
            const a = document.createElement('a');
            a.textContent = l.name;
            a.setAttribute('href', l.url);
            mobileContent.appendChild(a);
        });
        mobileNav.appendChild(mobileBtn);
        mobileNav.appendChild(mobileContent);
        leftGroup.appendChild(mobileNav);
        document.addEventListener('click', () => document.getElementById('fc-mobile-dropdown-content')?.classList.remove('fc-show'));
        
        // --- Structural Layout Middle-Bar Toggle Handle Node ---
        const centerContainer = document.createElement('div');
        centerContainer.className = 'fc-center-container';
        const centerToggleBtn = document.createElement('button');
        centerToggleBtn.id = 'fc-center-toggle-btn';
        centerToggleBtn.className = 'fc-center-btn';
        centerToggleBtn.textContent = '▲ Hide';
        centerToggleBtn.onclick = (e) => { e.stopPropagation(); toggleMenubarVisibility(); };
        centerContainer.appendChild(centerToggleBtn);
        
        const actionGroup = document.createElement('div');
        actionGroup.className = 'fc-action-group';
        const btnCoding = document.createElement('button');
        btnCoding.className = 'fc-action-btn';
        btnCoding.textContent = '💻 Do coding';
        btnCoding.onclick = () => {
            const p = "You are an expert software developer and system architect. Please adhere strictly to coding best practices, secure architecture, and optimal performance. Deliver complete, fully-functional code implementations without using placeholders or omitting logic. Await the specifications below.\n\nLanguage: \nProject: \n\n";
            navigator.clipboard.writeText(p);
            btnCoding.textContent = '✅ Copied';
            setTimeout(() => btnCoding.textContent = '💻 Do coding', 2000);
        };
        const btnSave = document.createElement('button');
        btnSave.id = 'fast-chat-btn-save';
        btnSave.className = 'fc-action-btn';
        btnSave.textContent = '💾 Save';
        const btnLoad = document.createElement('button');
        btnLoad.className = 'fc-action-btn';
        btnLoad.textContent = '📂 Load';
        btnLoad.onclick = () => showLoadMenu();
        const btnIncognito = document.createElement('button');
        btnIncognito.id = 'fc-native-incognito';
        btnIncognito.className = 'fc-native-trigger fc-gemini-only';
        const incIcon = document.createElement('span'); incIcon.className = 'fc-icon'; incIcon.textContent = '💬';
        const incText = document.createElement('span'); incText.className = 'fc-text'; incText.textContent = 'Incognito';
        btnIncognito.appendChild(incIcon); btnIncognito.appendChild(incText);
        btnIncognito.onclick = passThroughClick;
        actionGroup.appendChild(btnCoding); actionGroup.appendChild(btnSave); actionGroup.appendChild(btnLoad); actionGroup.appendChild(btnIncognito);
        
        menubar.appendChild(leftGroup);
        menubar.appendChild(centerContainer); // Inject context layer inside document segment layout safely
        menubar.appendChild(actionGroup);
        document.documentElement.appendChild(menubar);
    };

    const observer = new MutationObserver(() => {
        initMenubar();
        updateContextualLabels();
        const btnSave = document.getElementById('fast-chat-btn-save');
        if (btnSave) {
            const exists = isExistingChat();
            btnSave.disabled = !exists;
            btnSave.onclick = exists ? () => saveChat(btnSave) : null;
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    initMenubar();
    updateContextualLabels();
})();