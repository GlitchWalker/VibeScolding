// ==UserScript==
// @name         LocalCDN Font Route Enforcer (Mozilla Text)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Forces external font requests into LocalCDN hooks, prioritizing Mozilla Text.
// @author       Gemini
// @match        *://*/*
// @run-at       document-start
// @grant        GM_addStyle
// @downloadURL  https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/localcdnLocalFontEnforcer.js
// @updateURL    https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/localcdnLocalFontEnforcer.js

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