(() => {
  "use strict";
  const { core, adapter, view, settings } = globalThis.LeetCase;
  let snapshot = "";
  let pending;

  function reconcile() {
    const sources = [...view.records].map(record => record.source).concat(adapter.inputNodes().map(node => node.textContent));
    const parameterNames = sources.flatMap(source => core.parseInput(source)?.map(input => input.name) ?? []);
    view.setAppearance(settings.colorMode, adapter.editorColors(parameterNames));
    const { language, code } = adapter.editorState();
    const key = JSON.stringify([location.pathname, language]);
    if (key !== snapshot) {
      view.clear();
      snapshot = key;
    }
    for (const record of view.records) {
      if (!record.host.isConnected || !record.original.isConnected) {
        view.clear();
        break;
      }
    }
    if (language !== "C++" || !/^\/problems\/[^/]+(?:\/|$)/.test(location.pathname)) return;
    function format(source) {
      const input = core.parseInput(source);
      return input ? core.formatCpp(input, core.parametersFor(code, input)) : null;
    }
    for (const record of view.records) {
      // Body edits that keep the same signature must not reset the input view.
      if (format(record.source) !== record.formatted) view.restore(record);
    }
    for (const node of adapter.inputNodes()) {
      const formatted = format(node.textContent);
      if (formatted !== null) view.mount(node, formatted);
    }
  }
  function schedule() {
    clearTimeout(pending);
    pending = setTimeout(reconcile, 100);
  }
  const relevantSelector = `#editor, ${adapter.descriptionSelector}`;
  const observer = new MutationObserver(mutations => {
    const relevant = mutations.some(mutation => {
      const target = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
      if (target?.closest("[data-leetcase-view], [data-leetcase-original]")) return false;
      if (target?.closest(relevantSelector)) return true;
      return [...mutation.addedNodes, ...mutation.removedNodes].some(node =>
        node.nodeType === Node.ELEMENT_NODE && (node.matches(relevantSelector) || node.querySelector(relevantSelector)));
    });
    if (relevant) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
  // SPA navigation need not emit popstate. Poll only the pathname, never page data.
  let pathname = location.pathname;
  setInterval(() => {
    if (pathname !== location.pathname) { pathname = location.pathname; schedule(); }
  }, 750);
  addEventListener("popstate", schedule);
  settings.subscribe(schedule);
  settings.ready.catch(() => { /* Keep the default uncolored view if storage is unavailable. */ });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "LEETCASE_PING") sendResponse({
      type: "LEETCASE_PONG",
      version: chrome.runtime.getManifest().version,
      isProblemPage: /^\/problems\/[^/]+(?:\/|$)/.test(location.pathname),
    });
  });
  reconcile();
})();
