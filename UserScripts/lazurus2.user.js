// ==UserScript==
// @name         Lazarus Text Recovery (Cross-Platform)
// @version      1.1.0
// @description  Automatically saves form text inputs to prevent data loss. Optimized for Desktop & Mobile Firefox.
// @author       Peer Developer
// @match        http://*/*
// @match        https://*/*
// @exclude      https://*.barclays.co.uk/*
// @exclude      https://*.barclays.com/*
// @exclude      https://*.lloydsbank.com/*
// @exclude      https://*.hsbc.co.uk/*
// @exclude      https://*.natwest.com/*
// @exclude      https://*.santander.co.uk/*
// @exclude      https://*.nationwide.co.uk/*
// @exclude      https://*.rbs.co.uk/*
// @exclude      https://*.halifax-online.co.uk/*
// @exclude      https://*.halifax.co.uk/*
// @exclude      https://*.tsb.co.uk/*
// @exclude      https://*.monzo.com/*
// @exclude      https://*.starlingbank.com/*
// @exclude      https://*.co-operativebank.co.uk/*
// @grant        GM.setValue
// @grant        GM.getValue
// @run-at       document-end
// ==/UserScript==

/* --- Hardened InteropDebug Module v2.0 (Universal Global Pattern) --- */
(function() {
    'use strict';

    const InteropDebug = true;
    const SCRIPT_NAME = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.name : 'Universal Userscript';
    const noop = () => {};

    // 1. Define the object directly on the global window immediately
    window.Logger = !InteropDebug ?
        { log: noop, warn: noop, error: noop, trace: noop, time: noop, timeEnd: noop } :
        {
            log: (...args) => console.log(`[InteropDebug][${SCRIPT_NAME}][INFO]`, ...args),
            warn: (...args) => console.warn(`[InteropDebug][${SCRIPT_NAME}][WARN]`, ...args),
            error: (...args) => console.error(`[InteropDebug][${SCRIPT_NAME}][ERROR]`, ...args),
            trace: (...args) => console.trace(`[InteropDebug][${SCRIPT_NAME}][TRACE]`, ...args),
            time: (label) => console.time(`[InteropDebug][${SCRIPT_NAME}] ${label}`),
            timeEnd: (label) => console.timeEnd(`[InteropDebug][${SCRIPT_NAME}] ${label}`)
        };

    try {
        const rootContext = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

        if (!rootContext.__INTEROP_DEBUG_REGISTRY__) {
            Object.defineProperty(rootContext, '__INTEROP_DEBUG_REGISTRY__', {
                value: [], writable: true, configurable: true, enumerable: false
            });
        }
        rootContext.__INTEROP_DEBUG_REGISTRY__.push(Object.freeze({
            name: SCRIPT_NAME, timestamp: Date.now(), location: window.location.hostname
        }));

        let knownScriptCount = 0;
        const checkRegistry = () => {
            const currentScripts = rootContext.__INTEROP_DEBUG_REGISTRY__ || [];
            if (currentScripts.length !== knownScriptCount) {
                knownScriptCount = currentScripts.length;
                const siblings = currentScripts.filter(s => s.name !== SCRIPT_NAME && s.location === window.location.hostname);
                if (siblings.length > 0) {
                    window.Logger.log(`Co-existing active debug modules: ${siblings.map(s => s.name).join(', ')}`);
                }
            }
        };
        checkRegistry();
        setInterval(checkRegistry, 4000);

        if (!rootContext.InteropDebugActions) {
            Object.defineProperty(rootContext, 'InteropDebugActions', {
                value: Object.create(null), writable: false, configurable: true
            });
        }

        rootContext.InteropDebugActions[`scan_${SCRIPT_NAME.replace(/\s+/g, '_')}`] = () => {
            window.Logger.log(`Active script tags: ${document.getElementsByTagName('script').length}`);
        };
    } catch (e) {
        window.Logger.warn(`Isolation error: ${e.message}`);
    }
})();
/* --- End Universal Global Pattern --- */

(async () => {
  'use strict';
  // --- Configuration constants ---
  const STORAGE_KEY = 'lazarus_memories';
  const MAX_STORAGE_LIMIT = 12;
  const DISPLAY_LIMIT = 10;

  let isUiOpen = false;
  let tableBodyContainer = null;

  /**
   * Evaluates elements to safely exclude fields collecting sensitive information.
   * @param {HTMLInputElement|HTMLTextAreaElement} el
   * @returns {boolean}
   */
  function isSensitiveElement(el) {
    const sensitiveTypes = ['password', 'hidden', 'email', 'tel', 'number'];
    if (sensitiveTypes.includes(el.type)) {
      return true;
    }

    const attributesToInspect = [
      el.name,
      el.id,
      el.getAttribute('autocomplete'),
      el.getAttribute('placeholder'),
      el.className
    ].filter(Boolean).map(val => val.toLowerCase());

    const sensitiveKeywords = [
      'pass', 'user', 'login', 'auth', 'cvv', 'card', 'pin',
      'ssn', 'address', 'phone', 'mail', 'secret', 'token',
      'credit', 'billing', 'shipping', 'zip', 'postcode', 'captcha'
    ];

    return attributesToInspect.some(attr =>
      sensitiveKeywords.some(keyword => attr.includes(keyword))
    );
  }

  /**
   * Gathers non-empty, non-sensitive input data from the current active viewport context.
   * @returns {string}
   */
  function extractPageTextData() {
    const targetElements = Array.from(document.querySelectorAll('input[type="text"], textarea'));
    const fieldEntries = [];

    for (const input of targetElements) {
      if (!isSensitiveElement(input) && input.value.trim().length > 0) {
        const identifier = input.placeholder || input.name || input.id || 'Field';
        fieldEntries.push(`[${identifier}]: ${input.value}`);
      }
    }
    return fieldEntries.join('\n');
  }

  /**
   * Commits the current text snapshot to the localized extension sandbox storage environment.
   */
  async function persistSnapshot() {
    const combinedText = extractPageTextData();
    if (!combinedText) {
      return;
    }

    const currentURL = window.location.href;
    const currentTitle = document.title || currentURL;

    let memories = await GM.getValue(STORAGE_KEY, []);
    if (!Array.isArray(memories)) {
      memories = [];
    }

    // Filter out historical entries matching the current URL path to prevent duplication
    memories = memories.filter(item => item.url !== currentURL);

    // Add fresh layout data context to index zero position
    memories.unshift({
      url: currentURL,
      title: currentTitle,
      text: combinedText,
      timestamp: Date.now()
    });

    // Enforce strict upper bound allocations
    if (memories.length > MAX_STORAGE_LIMIT) {
      memories = memories.slice(0, MAX_STORAGE_LIMIT);
    }

    await GM.setValue(STORAGE_KEY, memories);

    // Instantly sync layout elements if viewport layer is operational
    if (isUiOpen && tableBodyContainer) {
      renderTableContent(tableBodyContainer);
    }
  }

  /**
   * Dynamically constructs table contents within the Shadow DOM context.
   * @param {HTMLElement} container
   */
  async function renderTableContent(container) {
    const memories = await GM.getValue(STORAGE_KEY, []);

    if (!Array.isArray(memories) || memories.length === 0) {
      container.innerHTML = '<div class="lazarus-empty">No active recovery checkpoints.</div>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'lazarus-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Source Page</th>
          <th class="lazarus-hide-mobile">Captured Text</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    const visualSet = memories.slice(0, DISPLAY_LIMIT);

    visualSet.forEach(entry => {
      const tr = document.createElement('tr');

      // Origin Metadata Column
      const tdMeta = document.createElement('td');
      const divTitle = document.createElement('div');
      divTitle.className = 'lazarus-text-truncate font-weight-bold';
      divTitle.textContent = entry.title;
      divTitle.title = entry.title;

      const divUrl = document.createElement('div');
      divUrl.className = 'lazarus-text-truncate lazarus-subtext';
      divUrl.textContent = entry.url;
      divUrl.title = entry.url;

      tdMeta.appendChild(divTitle);
      tdMeta.appendChild(divUrl);

      // Data Preview Context (Responsive Hidden Class Added)
      const tdSnippet = document.createElement('td');
      tdSnippet.className = 'lazarus-hide-mobile';
      const divSnippet = document.createElement('div');
      divSnippet.className = 'lazarus-text-truncate';
      divSnippet.textContent = entry.text.replace(/\s+/g, ' ');
      divSnippet.title = entry.text;
      tdSnippet.appendChild(divSnippet);

      // Action Row Execution Controls
      const tdActions = document.createElement('td');
      tdActions.className = 'lazarus-actions-cell';

      const btnCopy = document.createElement('button');
      btnCopy.className = 'lazarus-btn lazarus-btn-copy';
      btnCopy.textContent = 'Copy';
      btnCopy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(entry.text);
          btnCopy.textContent = 'Copied';
          btnCopy.style.backgroundColor = '#d1fae5';
          setTimeout(() => {
            btnCopy.textContent = 'Copy';
            btnCopy.style.backgroundColor = '';
          }, 1200);
        } catch (err) {
          console.error('Lazarus Clipboard interaction failed:', err);
        }
      });

      const btnDelete = document.createElement('button');
      btnDelete.className = 'lazarus-btn lazarus-btn-delete';
      btnDelete.textContent = 'Delete';
      btnDelete.addEventListener('click', async () => {
        let items = await GM.getValue(STORAGE_KEY, []);
        if (Array.isArray(items)) {
          items = items.filter(m => m.url !== entry.url);
          await GM.setValue(STORAGE_KEY, items);
          renderTableContent(container);
        }
      });

      tdActions.appendChild(btnCopy);
      tdActions.appendChild(btnDelete);

      tr.appendChild(tdMeta);
      tr.appendChild(tdSnippet);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });

    container.innerHTML = '';
    container.appendChild(table);
  }

  /**
   * Initializes the interface canvas layer using an encapsulated closed Shadow Root.
   */
  function initializeUserInterface() {
    const shadowHost = document.createElement('div');
    shadowHost.id = 'lazarus-recovery-ui-root';
    document.body.appendChild(shadowHost);

    const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

    const styles = document.createElement('style');
    styles.textContent = `
      .lazarus-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        background-color: #2563eb;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        z-index: 2147483647;
        border: none;
        outline: none;
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s;
        user-select: none;
        touch-action: manipulation;
      }
      .lazarus-fab:hover {
        background-color: #1d4ed8;
        transform: scale(1.06);
      }
      .lazarus-panel {
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 540px;
        max-width: calc(100vw - 48px);
        max-height: 75vh;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
        z-index: 2147483647;
        display: none;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }
      .lazarus-panel.visible {
        display: flex;
      }
      .lazarus-header {
        padding: 14px 18px;
        background-color: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        font-size: 14px;
        color: #111827;
      }
      .lazarus-view-wrapper {
        overflow-y: auto;
        flex-grow: 1;
        background-color: #ffffff;
        -webkit-overflow-scrolling: touch;
      }
      .lazarus-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        table-layout: fixed;
      }
      .lazarus-table th {
        background-color: #f3f4f6;
        padding: 10px 14px;
        color: #4b5563;
        font-weight: 500;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }
      .lazarus-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: top;
        color: #374151;
      }
      .lazarus-text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .font-weight-bold { font-weight: 600; color: #111827; }
      .lazarus-subtext { font-size: 11px; color: #6b7280; margin-top: 2px; }
      .lazarus-actions-cell { display: flex; gap: 6px; }
      .lazarus-btn {
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        background-color: #ffffff;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        touch-action: manipulation;
        transition: background-color 0.1s;
      }
      .lazarus-btn-copy { color: #2563eb; border-color: #bbf7d0; }
      .lazarus-btn-copy:hover { background-color: #f0fdf4; }
      .lazarus-btn-delete { color: #dc2626; border-color: #fecaca; }
      .lazarus-btn-delete:hover { background-color: #fef2f2; }
      .lazarus-empty {
        padding: 40px;
        text-align: center;
        color: #6b7280;
        font-size: 13px;
      }

      /* Mobile Optimization Layer */
      @media (max-width: 600px) {
        .lazarus-panel {
          right: 12px;
          bottom: 76px;
          max-width: calc(100vw - 24px);
          max-height: 65vh;
        }
        .lazarus-fab {
          right: 16px;
          bottom: 16px;
          width: 44px;
          height: 44px;
          font-size: 22px;
        }
        .lazarus-hide-mobile {
          display: none !important;
        }
        .lazarus-table td {
          padding: 10px 8px;
        }
        .lazarus-actions-cell {
          flex-direction: column;
          gap: 4px;
        }
        .lazarus-btn {
          padding: 5px 6px;
          font-size: 11px;
          text-align: center;
        }
      }
    `;
    shadowRoot.appendChild(styles);

    // Floating Action Button Construct
    const fabButton = document.createElement('button');
    fabButton.className = 'lazarus-fab';
    fabButton.innerHTML = '&#8734;';
    shadowRoot.appendChild(fabButton);

    // Interface Panel Setup
    const uiPanel = document.createElement('div');
    uiPanel.className = 'lazarus-panel';

    const header = document.createElement('div');
    header.className = 'lazarus-header';
    header.textContent = 'Lazarus Recovery Module';
    uiPanel.appendChild(header);

    tableBodyContainer = document.createElement('div');
    tableBodyContainer.className = 'lazarus-view-wrapper';
    uiPanel.appendChild(tableBodyContainer);

    shadowRoot.appendChild(uiPanel);

    // Toggle Panel Trigger
    fabButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      isUiOpen = !isUiOpen;
      uiPanel.classList.toggle('visible', isUiOpen);
      if (isUiOpen) {
        await renderTableContent(tableBodyContainer);
      }
    });
  }

  // --- Native Event Interception Pipeline ---
  document.addEventListener('input', (event) => {
    const targetElement = event.target;
    if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
      if (isSensitiveElement(targetElement)) {
        return;
      }
      persistSnapshot();
    }
  }, { capture: true, passive: true });

  initializeUserInterface();
})();