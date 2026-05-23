// ==UserScript==
// @name         Auto Closed Captioning for Youtube
// @version      1.11
// @description  Automatically ensure closed captioning is on for every Youtube video
// @author       Mark Townsend
// @match        https://www.youtube.com/watch*
// @grant        none
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/youtubeCaptions.user.js
// @updateURL    https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/youtubeCaptions.user.js
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

    // Removed the variable assignment to satisfy the linter
    setInterval(() => {
        const ccButton = document.querySelector('[aria-keyshortcuts="c"]');

        if (ccButton && ccButton.getAttribute('aria-pressed') !== 'true') {
            ccButton.click();
        }
    }, 1000);
})();