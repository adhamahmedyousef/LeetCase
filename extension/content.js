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
    if (!settings.enabled) {
      view.clear();
      return;
    }
    if (!["C++", "Java", "Python", "Python3"].includes(language) || !/^\/problems\/[^/]+(?:\/|$)/.test(location.pathname)) return;
    // Merge mounted and untouched inputs in document order. Mutation order and
    // the Set's insertion order must not change example numbering.
    const nodes = [...view.records].map(record => record.original.firstChild).concat(adapter.inputNodes())
      .filter(node => node?.isConnected)
      .sort((a, b) => a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    const sourcesInOrder = nodes.map(node => node.textContent);
    const names = settings.uniqueNames ? core.exampleNames(sourcesInOrder) : [];
    const formattedByNode = new Map(nodes.map((node, index) => [node,
      core.format(language, node.textContent, code, names[index]),
    ]));
    for (const record of view.records) {
      // Body edits that keep the same signature must not reset the input view.
      if (formattedByNode.get(record.original.firstChild) !== record.formatted) view.restore(record);
    }
    for (const node of adapter.inputNodes()) {
      const formatted = formattedByNode.get(node);
      if (typeof formatted === "string") view.mount(node, formatted, language);
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
  settings.subscribeEnabled(schedule);
  settings.subscribeUniqueNames(schedule);
  settings.ready.then(schedule).catch(schedule);
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "LEETCASE_PING") sendResponse({
      type: "LEETCASE_PONG",
      version: chrome.runtime.getManifest().version,
      language: adapter.editorState().language,
      isProblemPage: /^\/problems\/[^/]+(?:\/|$)/.test(location.pathname),
    });
  });
})();
