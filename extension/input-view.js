(() => {
  "use strict";
  const records = new Set();
  function restore(record) {
    record.dispose();
    record.host.remove();
    if (record.original.parentNode) record.original.replaceWith(...record.original.childNodes);
    records.delete(record);
  }
  function clear() { for (const record of records) restore(record); }
  function mount(node, formatted) {
    const original = document.createElement("span");
    original.dataset.leetcaseOriginal = "";
    node.replaceWith(original);
    original.append(node); // Keep the exact original Text node; never overwrite it.
    original.hidden = true;

    const host = document.createElement("span");
    host.dataset.leetcaseView = "";
    const code = document.createElement("span");
    code.className = "leetcase-code";
    const feedback = document.createElement("span");
    feedback.className = "leetcase-feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    let feedbackTimer;
    let disposed = false;
    async function copyDeclaration(declaration) {
      try {
        await navigator.clipboard.writeText(declaration);
        if (disposed) return;
        feedback.textContent = "Copied";
      } catch {
        if (disposed) return;
        feedback.textContent = "Copy failed. Try again.";
      }
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => { feedback.textContent = ""; }, 1500);
    }
    formatted.split("\n").forEach((declaration, index) => {
      if (index) code.append(document.createTextNode("\n"));
      const value = document.createElement("span");
      value.className = "leetcase-declaration";
      value.textContent = declaration;
      value.tabIndex = 0;
      value.setAttribute("role", "button");
      value.setAttribute("aria-label", `Copy ${declaration}`);
      value.title = "Double-click to copy. Keyboard: Enter or Space.";
      value.addEventListener("dblclick", () => copyDeclaration(declaration));
      value.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          copyDeclaration(declaration);
        }
      });
      code.append(value);
    });
    const toggle = document.createElement("button");
    toggle.className = "leetcase-original-toggle";
    toggle.type = "button";
    toggle.textContent = "Original";
    toggle.setAttribute("aria-pressed", "false");
    toggle.title = "Show original input";
    toggle.addEventListener("click", () => {
      const showOriginal = original.hidden;
      original.hidden = !showOriginal;
      code.hidden = showOriginal;
      feedback.textContent = "";
      toggle.setAttribute("aria-pressed", String(showOriginal));
      toggle.title = showOriginal ? "Show C++ format" : "Show original input";
      if (showOriginal) original.before(host);
      else original.after(host);
      newline.textContent = showOriginal ? "" : "\n";
    });
    const prefix = document.createTextNode(" ");
    const newline = document.createTextNode("\n");
    host.append(prefix, code, toggle, feedback, newline);
    original.after(host);
    const record = {
      original, host, source: node.textContent, formatted,
      dispose() { disposed = true; clearTimeout(feedbackTimer); },
    };
    records.add(record);
    return record;
  }
  globalThis.LeetCase.view = Object.freeze({ mount, restore, clear, records });
})();
