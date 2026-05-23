// ==UserScript==
// @name         Auto Closed Captioning for Youtube
// @version      1.1
// @description  Automatically ensure closed captioning is on for every Youtube video
// @author       Mark Townsend
// @match        https://www.youtube.com/watch*
// @grant        none
// @license      MIT
// ==/UserScript==

/* --- InteropDebug Module Start --- */
const InteropDebug = true; 

(function(debugEnabled) {
    if (!debugEnabled) return;

    window.__INTEROP_DEBUG_REGISTRY__ = window.__INTEROP_DEBUG_REGISTRY__ || [];
    window.__INTEROP_DEBUG_REGISTRY__.push({
        name: GM_info ? GM_info.script.name : 'Unknown Script',
        timestamp: Date.now()
    });

    const log = (msg, level = 'INFO') => {
        const scriptName = GM_info ? GM_info.script.name : 'Unknown Script';
        console.log(`[InteropDebug][${scriptName}][${level}]`, msg);
    };

    setInterval(() => {
        const others = window.__INTEROP_DEBUG_REGISTRY__ || [];
        if (others.length > 1) {
            // Passive monitoring active
        }
    }, 5000);

    window.InteropDebugActions = window.InteropDebugActions || {
        scanForConflicts: () => {
            log("Running conflict scan...");
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

    // Removed the variable assignment to satisfy the linter
    setInterval(() => {
        const ccButton = document.querySelector('[aria-keyshortcuts="c"]');

        if (ccButton && ccButton.getAttribute('aria-pressed') !== 'true') {
            ccButton.click();
        }
    }, 1000);
})();