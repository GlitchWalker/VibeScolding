# FireMonkey Userscript Development Guidelines

You are an expert JavaScript developer writing userscripts specifically for the **FireMonkey** extension on Firefox. The generated code must strictly adhere to Firefox's WebExtension sandboxing rules, FireMonkey's specific API implementations, strict ESLint standards, and optimal runtime performance constraints.

## 1. Directory Structure and Metadata Block Standards
*   **File Location:** Every userscript project file MUST be contained within the `./Userscripts` directory relative to the repository root.
*   **Metadata Parsing:** FireMonkey parses the userscript metadata block strictly. Every script MUST start with a valid header block containing `@name`, `@version`, `@match` (use instead of `@include`), and `@grant`.
*   **Update & Download URLs:** To match the repository distribution structure, you must explicitly construct the `@updateURL` and `@downloadURL` using the exact filename of the script appended to the base raw GitHub path.
    *   **Base URL Structure:** `https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/[filename].user.js`
    *   *Example:* For a script named `FilterVibes.user.js`, the tags must look exactly like this:
```javascript
        // @updateURL   [https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/FilterVibes.user.js](https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/FilterVibes.user.js)
        // @downloadURL [https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/FilterVibes.user.js](https://raw.githubusercontent.com/GlitchWalker/VibeScolding/refs/heads/main/UserScripts/FilterVibes.user.js)
        ```
*   **Permissions:** Request the exact `GM` APIs required in the `@grant` tags. If no APIs are required, specify `@grant none` to ensure the script runs in the correct, restricted sandbox context.

## 2. Interoperability Debugging Script
Every userscript MUST contain the latest version of the interoperability debugging script.
*   **Location:** The source for the latest version of this debug script is stored at `./Userscripts/interopdebug_shared.js`.
*   **Placement:** The debug script code must be placed exactly after the initial userscript metadata header block and before the main execution code begins.
*   **Updating Existing Scripts:** If modifying an existing script, check for older versions of the debug module. These are typically wrapped in variations of the following tags:
```javascript
    /* --- InteropDebug Module Start --- */
    ...
    /* --- InteropDebug Module End --- */
    ```
If you detect an existing block that differs from the current `interopdebug_shared.js` file, you MUST replace the entire block with the new version.

## 3. Performance & Efficiency Constraints (Firefox-Specific)
To prevent extension lag and reduce main-thread blocking on heavy pages, implement these specific execution rules:
*   **DOM Mutation Monitoring:** Avoid persistent `setInterval` loops for checking DOM changes. Use highly targeted `MutationObserver` instances instead. Always disconnect observers as soon as the target elements are successfully handled to prevent memory leaks.
*   **Debouncing and Throttling:** Any script attached to high-frequency events (e.g., `scroll`, `resize`, or rapid DOM mutations) must implement a lightweight debounce or throttle mechanism.
*   **Asynchronous Storage Operations:** When utilizing `GM.getValue` or `GM.setValue`, process them concurrently via `Promise.all()` where appropriate instead of chaining successive await statements, reducing synchronous blocking overhead.
*   **Memory Management:** Avoid retaining references to detached DOM nodes. Use `WeakMap` or `WeakSet` if you need to cache elements or match data structures against active page nodes temporarily.

## 4. API Compatibility
FireMonkey supports both Greasemonkey 3 (`GM_*` synchronous) and Greasemonkey 4 (`GM.*` asynchronous/Promises) APIs.
*   **Preference:** Default to standard GM4 Promise-based APIs (e.g., `GM.getValue`, `GM.setValue`, `GM.xmlHttpRequest`).
*   **Scope:** Do not assume Tampermonkey-specific APIs are natively present without checking. For CSS injection, prioritize standard DOM manipulation or FireMonkey's dedicated UserCSS features over `GM_addStyle`.

## 5. Firefox CSP and Xray Vision (Critical)
FireMonkey operates within Firefox's WebExtension constraints and does not relax a website's Content Security Policy (CSP).
*   **No Eval:** Never use `eval()` or construct functions from strings.
*   **Inline Restrictions:** If the target site has a strict CSP blocking inline scripts or styles, injecting raw strings into the DOM will fail. You must build elements programmatically via standard DOM APIs (`document.createElement`).
*   **Xray Vision:** Firefox strictly isolates page scripts from extension scripts. When interacting with the page's `window` object:
*   Read variables from the page context using `unsafeWindow`.
*   To share functions or objects from the script into the page context, you MUST use Firefox's `cloneInto()` or `exportFunction()` APIs. Standard assignment (`unsafeWindow.myVar = myObj`) will throw security permission errors.

## 6. Strict Linting & Modern JavaScript
FireMonkey uses ESLint for internal syntax checking.
*   **Strict Mode:** All scripts must operate in strict mode. Ensure all logic is strict-compliant.
*   **Variable Declaration:** Never use undeclared variables or `var`. Always use `const` or `let`.
*   **Globals:** Assume `GM`, `GM_`, `unsafeWindow`, `cloneInto`, and `exportFunction` are predefined globals. Do not redefine them.