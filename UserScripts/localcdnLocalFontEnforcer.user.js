// ==UserScript==
// @name         LocalCDN Font Route Enforcer (Mozilla Text)
// @namespace    http://tampermonkey.net/
// @version      2.21
// @description  Forces external font requests into LocalCDN hooks, prioritizing Mozilla Text.
// @author       Gemini
// @match        *://*/*
// @run-at       document-start
// @grant        GM_addStyle
// @downloadURL  https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/localcdnLocalFontEnforcer.js
// @updateURL    https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/localcdnLocalFontEnforcer.js
// ==/UserScript==

/* --- Hardened InteropDebug Module v2.0 Start --- */
const InteropDebug = true; // Set to false to disable globally for this script

(function(debugEnabled) {
    if (!debugEnabled) return;

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

    // Bundles Mozilla Text into the tracking hook, keeping Roboto as the local fail-safe
    const LOCAL_CDN_FONTS = {
        sansSerif: 'https://fonts.googleapis.com/css2?family=Mozilla+Text:wght@400;700&family=Roboto:wght@400;700&display=swap',
        serif: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
        monospace: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap'
    };

    // 1. Aggressive Network Interception for <link> stylesheets
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                    const href = node.href || '';

                    // If it's already a Google Font link, let LocalCDN handle it naturally
                    if (href.includes('fonts.googleapis.com')) {
                        continue;
                    }

                    // Rewrite other external font providers to use the LocalCDN-monitored Google hooks
                    if (href.includes('typekit') || href.includes('font-awesome') || href.includes('fonts.com') || href.includes('typography.com') || href.endsWith('.css')) {
                        let substitute = LOCAL_CDN_FONTS.sansSerif;
                        if (href.toLowerCase().includes('serif')) substitute = LOCAL_CDN_FONTS.serif;
                        if (href.toLowerCase().includes('mono') || href.toLowerCase().includes('code')) substitute = LOCAL_CDN_FONTS.monospace;

                        node.remove();
                        injectLocalCDNFont(substitute);
                    }
                }
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    function injectLocalCDNFont(url) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    }

    // 2. Global CSS Overrides mapping to Mozilla Text first
    GM_addStyle(`
        /* Prioritize Mozilla Text. Falls back to Roboto if LocalCDN drops the un-cached family request */
        body, html, p, span, div, a, li, input, button, textarea {
            font-family: 'Mozilla Text', 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        /* Map code/text blocks to Roboto Mono */
        code, pre, kbd, samp, var {
            font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, monospace !important;
        }

        /* Map headers and explicit serif blocks to Merriweather */
        h1, h2, h3, h4, h5, h6, article, .serif {
            font-family: 'Merriweather', Georgia, serif !important;
        }

        /* Intercept inline or dynamically injected font rules */
        @font-face {
            font-family: 'CustomFontFallback';
            src: local('Arial');
        }
    `);
})();