/* --- Hardened InteropDebug Module v2.0 Start --- */
const InteropDebug = true; // Set to false to disable globally for this script

(function(debugEnabled) {
    if (!debugEnabled) { return; }

    const SCRIPT_NAME = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.name : 'Universal Userscript';

    const log = (msg, level = 'INFO') => {
        console.log(`[InteropDebug][${SCRIPT_NAME}][${level}]`, msg);
    };

    try {
        const rootContext = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

        if (!rootContext.__INTEROP_DEBUG_REGISTRY__) {
            Object.defineProperty(rootContext, '__INTEROP_DEBUG_REGISTRY__', {
                value: [],
                writable: true,
                configurable: true,
                enumerable: false
            });
        }

        rootContext.__INTEROP_DEBUG_REGISTRY__.push(Object.freeze({
            name: SCRIPT_NAME,
            timestamp: Date.now(),
            location: window.location.hostname
        }));

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

        if (!rootContext.InteropDebugActions) {
            Object.defineProperty(rootContext, 'InteropDebugActions', {
                value: Object.create(null),
                writable: false,
                configurable: true
            });
        }

        rootContext.InteropDebugActions[`scan_${SCRIPT_NAME}.replace(/\\s+/g, '_')}`] = () => {
            log("Executing framework conflict assessment...");
            const scripts = document.getElementsByTagName('script');
            log(`Host environment active script tags: ${scripts.length}`);
        };

        rootContext.InteropDebugActions[`perf_${SCRIPT_NAME}.replace(/\\s+/g, '_')}`] = () => {
            const runtime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            log(`Initialization delta marker: ${runtime.toFixed(2)}ms`);
        };

        log("Initialization successful. Ecosystem monitoring active.");

    } catch (securityError) {
        console.warn(`[InteropDebug][${SCRIPT_NAME}][WARN] Strict context isolation detected. Engaging local containment logging.`, securityError.message);
        const localRuntime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        console.log(`[InteropDebug][${SCRIPT_NAME}][LOCAL_INFO] Local loop initialized at ${localRuntime.toFixed(2)}ms`);
    }
})(InteropDebug);
/* --- Hardened InteropDebug Module v2.0 End --- */