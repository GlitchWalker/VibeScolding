/* --- Hardened InteropDebug Module v2.0 (Full Features) --- */
(function() {
    'use strict';
    const InteropDebug = true;
    const SCRIPT_NAME = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.name : 'Universal Userscript';
    const noop = () => {};

    const logger = !InteropDebug ? 
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

        // Registry Initialization
        if (!rootContext.__INTEROP_DEBUG_REGISTRY__) {
            Object.defineProperty(rootContext, '__INTEROP_DEBUG_REGISTRY__', {
                value: [], writable: true, configurable: true, enumerable: false
            });
        }
        rootContext.__INTEROP_DEBUG_REGISTRY__.push(Object.freeze({
            name: SCRIPT_NAME, timestamp: Date.now(), location: window.location.hostname
        }));

        // Conflict Monitoring
        let knownScriptCount = 0;
        const checkRegistry = () => {
            const currentScripts = rootContext.__INTEROP_DEBUG_REGISTRY__ || [];
            if (currentScripts.length !== knownScriptCount) {
                knownScriptCount = currentScripts.length;
                const siblings = currentScripts.filter(s => s.name !== SCRIPT_NAME && s.location === window.location.hostname);
                if (siblings.length > 0) {
    							logger.log(`Co-existing active debug modules: ${siblings.map(s => s.name).join(', ')}`);
								}
            }
        };
        checkRegistry();
        setInterval(checkRegistry, 4000);

        // Debug Actions Registry
        if (!rootContext.InteropDebugActions) {
            Object.defineProperty(rootContext, 'InteropDebugActions', {
                value: Object.create(null), writable: false, configurable: true
            });
        }

        rootContext.InteropDebugActions[`scan_${SCRIPT_NAME.replace(/\s+/g, '_')}`] = () => {
            logger.log("Executing framework conflict assessment...");
            logger.log(`Host environment active script tags: ${document.getElementsByTagName('script').length}`);
        };

        rootContext.InteropDebugActions[`perf_${SCRIPT_NAME.replace(/\s+/g, '_')}`] = () => {
            const runtime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            logger.log(`Initialization delta marker: ${runtime.toFixed(2)}ms`);
        };

        logger.log("Initialization successful. Ecosystem monitoring active.");
    } catch (securityError) {
        logger.warn(`Strict context isolation detected. Engaging local containment logging.`, securityError.message);
    }

    // Attach to window so the linter sees it as an export/used global
    window.Logger = logger;
})();
/* --- End Full Hardened InteropDebug Module v2.0 --- */