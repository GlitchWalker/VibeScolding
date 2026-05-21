// ==UserScript==
// @name        Fast Multi-AI Menubar
// @match       https://gemini.google.com/*
// @match       https://chatgpt.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @version     4.5
// @description Persistent dark menubar with dynamic collapsible mobile link layout. Includes saving full conversations to a database, and the ability to copy these entire conversations into a new chat with appropriate formatting for the "destination" AI to understand it.
// @downloadURL  https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/fastMultiAIMenubar.js
// @updateURL    https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/fastMultiAIMenubar.js
// ==/UserScript==

/* --- InteropDebug Module Start --- */
const InteropDebug = true; // Set to false to disable

(function(debugEnabled) {
    if (!debugEnabled) return;

    // Register this script as "in debug mode" on the global window object
    window.__INTEROP_DEBUG_REGISTRY__ = window.__INTEROP_DEBUG_REGISTRY__ || [];
    window.__INTEROP_DEBUG_REGISTRY__.push({
        name: GM_info.script.name,
        timestamp: Date.now()
    });

    const log = (msg, level = 'INFO') => {
        console.log(`[InteropDebug][${GM_info.script.name}][${level}]`, msg);
    };

    // Monitor for other scripts in debug mode
    setInterval(() => {
        const others = window.__INTEROP_DEBUG_REGISTRY__ || [];
        if (others.length > 1) {
            // Optional: Log if multiple scripts are fighting for the same DOM nodes
        }
    }, 5000);

    // Expose methods to the window for cross-script interaction
    window.InteropDebugActions = {
        scanForConflicts: () => {
            log("Running conflict scan...");
            // Example: Check for known DOM overhead issues
            const scripts = document.querySelectorAll('script');
            log(`Current page has ${scripts.length} script tags.`);
        },
        reportPerformance: () => {
            const perf = performance.now();
            log(`Script initialized at ${perf.toFixed(2)}ms`);
        }
    };

    log("Active. Monitoring for other InteropDebug scripts.");
})(InteropDebug);
/* --- InteropDebug Module End --- */

(function() {
  'use strict';

  let _cachedChats = null;

  const getChatMetadata = () => {
    const host = window.location.hostname;
    let title = 'Untitled Chat';
    let lastMessageDate = new Date().toLocaleString();

    if (host.indexOf('gemini.google') !== -1) {
      const active = document.querySelector('gmat-list-item[selected="true"] .text-content, .v-list-item--active .v-list-item-title, [aria-current="page"]');
      if (active) {
        title = active.innerText.trim();
      }
      const time = document.querySelector('message-info-time, time:last-of-type');
      if (time) {
        lastMessageDate = time.innerText.trim();
      }
    } else if (host.indexOf('chatgpt.com') !== -1) {
      const active = document.querySelector('li:has(a[href*="/c/"]) a.bg-token-sidebar-surface-bg, [data-active="true"] .truncate');
      if (active) {
        title = active.innerText.trim();
      }
      const time = document.querySelector('[data-testid="author-turn"] time, .text-xs.text-token-text-tertiary:last-of-type');
      if (time) {
        lastMessageDate = time.innerText.trim();
      }
    }
    return {
      title: title,
      lastMessageDate: lastMessageDate
    };
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
      setTimeout(() => {
        btn.textContent = '💾 Save';
      }, 2000);
    } catch (e) {
      btn.textContent = '❌ Error';
    }
  };

  const showLoadMenu = () => {
    if (document.getElementById('chat-load-modal')) {
      return;
    }
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
    closeBtn.onclick = () => {
      modal.remove();
    };
    fragment.appendChild(closeBtn);
    modal.appendChild(fragment);
    document.body.appendChild(modal);
  };

  const injectHardenedStyles = () => {
    if (!document.getElementById('fast-chat-font')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'fast-chat-font';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
    }

    if (document.getElementById('fast-chat-global-styles')) {
      return;
    }
    const style = document.createElement('style');
    style.id = 'fast-chat-global-styles';
    style.textContent = `
            body { margin-top: 45px !important; }
            header:not(#fast-chat-menubar), nav, .v-navigation-drawer, .fixed, [style*="position: fixed"] { top: 45px !important; }
            .side-bar, #sidebar, [class*="sidebar"] { top: 45px !important; height: calc(100vh - 45px) !important; }

            #fast-chat-menubar { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 45px !important; background: #1a1a1a !important; display: flex !important; align-items: center !important; padding: 0 20px !important; z-index: 2147483647 !important; border-bottom: 1px solid #333 !important; font-family: "Montserrat", sans-serif !important; box-sizing: border-box !important; }
            #fast-chat-nav-container { display: flex !important; gap: 20px !important; flex-grow: 1 !important; align-items: center !important; }

            .fc-nav-link { color: #888 !important; text-decoration: none !important; font-size: 15px !important; font-weight: 400 !important; transition: color 0.2s !important; letter-spacing: 0.5px !important; font-family: "Montserrat", sans-serif !important; }
            .fc-nav-link:hover { color: #ccc !important; }

            #fast-chat-menubar[data-platform="gemini"] a[href*="gemini.google.com"] { color: #16a34a !important; font-weight: 700 !important; }
            #fast-chat-menubar[data-platform="chatgpt"] a[href*="chatgpt.com"] { color: #ffffff !important; font-weight: 700 !important; }

            #fast-chat-action-btn { font-family: "Montserrat", sans-serif !important; padding: 6px 14px !important; background: #333 !important; color: #fff !important; border: 1px solid #555 !important; border-radius: 4px !important; cursor: pointer !important; font-size: 13px !important; font-weight: 600 !important; transition: background 0.2s !important; }
            #fast-chat-action-btn:hover { background: #444 !important; }

            #fast-chat-menu-toggle { display: none !important; background: transparent !important; border: none !important; color: #ccc !important; font-size: 22px !important; cursor: pointer !important; line-height: 1 !important; padding: 0 10px 0 0 !important; font-family: "Montserrat", sans-serif !important; }

            @media (max-width: 768px) {
                #fast-chat-menu-toggle { display: block !important; }
                #fast-chat-nav-container { display: none !important; flex-direction: column !important; position: absolute !important; top: 45px !important; left: 0 !important; width: 100% !important; background: #1a1a1a !important; border-bottom: 1px solid #333 !important; padding: 15px 20px !important; box-sizing: border-box !important; gap: 15px !important; align-items: flex-start !important; }
                #fast-chat-nav-container.fc-menu-open { display: flex !important; }
            }
        `;
    document.head.appendChild(style);
  };

  const initMenubar = () => {
    if (document.getElementById('fast-chat-menubar')) {
      return;
    }

    injectHardenedStyles();

    const menubar = document.createElement('header');
    menubar.id = 'fast-chat-menubar';

    const currentHost = window.location.hostname;
    const platformMode = (currentHost.indexOf('gemini.google') !== -1) ? 'gemini' : 'chatgpt';
    menubar.setAttribute('data-platform', platformMode);

    // Collapsible Hamburger Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'fast-chat-menu-toggle';
    toggleBtn.textContent = '☰';
    toggleBtn.onclick = () => {
      const nav = document.getElementById('fast-chat-nav-container');
      if (nav) {
        nav.classList.toggle('fc-menu-open');
      }
    };
    menubar.appendChild(toggleBtn);

    const nav = document.createElement('nav');
    nav.id = 'fast-chat-nav-container';

    const links = [{
        name: 'Gemini',
        url: 'https://gemini.google.com/'
      },
      {
        name: 'ChatGPT',
        url: 'https://chatgpt.com/'
      }
    ];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const a = document.createElement('a');
      a.textContent = link.name;
      a.setAttribute('href', link.url);
      a.className = 'fc-nav-link';
      nav.appendChild(a);
    }

    const actionBtn = document.createElement('button');
    actionBtn.id = 'fast-chat-action-btn';

    const updateButton = () => {
      const exists = isExistingChat();
      actionBtn.textContent = exists ? '💾 Save' : '📂 Load';
      actionBtn.onclick = exists ? () => {
        saveChat(actionBtn);
      } : () => {
        showLoadMenu();
      };
    };

    updateButton();
    menubar.appendChild(nav);
    menubar.appendChild(actionBtn);
    document.body.prepend(menubar);
  };

  const observer = new MutationObserver(() => initMenubar());
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  initMenubar();
})();
