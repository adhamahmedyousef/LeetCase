(() => {
  "use strict";
  const records = new Set();
  let colorMode = false;
  let colors = {};
  function applyStyle(host) {
    host.dataset.leetcaseColorMode = String(colorMode);
    for (const [kind, color] of Object.entries(colors)) host.style.setProperty(`--leetcase-${kind}`, color);
  }
  function setAppearance(enabled, palette) {
    colorMode = enabled;
    colors = palette;
    for (const record of records) applyStyle(record.host);
  }
  function restore(record) {
    record.dispose();
    record.host.remove();
    if (record.original.parentNode) record.original.replaceWith(...record.original.childNodes);
    records.delete(record);
  }
  function clear() { for (const record of records) restore(record); }
  function mount(node, formatted, language = "C++") {
    const paragraphLayout = node.nodeType === Node.ELEMENT_NODE;
    // The font shorthand can serialize to an empty string when the site's
    // advanced font settings cannot be represented by that shorthand.
    const originalTypography = paragraphLayout ? getComputedStyle(node) : null;
    const fontProperties = ["font-family", "font-size", "font-weight", "font-style", "font-stretch", "font-variant", "font-feature-settings", "font-variation-settings", "line-height", "letter-spacing", "word-spacing", "white-space"];
    const typography = originalTypography ? fontProperties.map(property => [property, originalTypography.getPropertyValue(property)]) : [];
    const original = document.createElement("span");
    original.dataset.leetcaseOriginal = "";
    node.replaceWith(original);
    original.append(node); // Keep the exact original input node; never overwrite it.
    original.hidden = true;

    const host = document.createElement("span");
    host.dataset.leetcaseView = "";
    if (paragraphLayout) {
      host.dataset.leetcaseLayout = "paragraph";
      for (const [property, value] of typography) {
        if (value) host.style.setProperty(property, value);
      }
    }
    applyStyle(host);
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
    function retain() {
      const record = {
        original, host, source: node.textContent, formatted,
        dispose() { disposed = true; clearTimeout(feedbackTimer); },
      };
      records.add(record);
      return record;
    }
    formatted.split("\n").forEach((declaration, index) => {
      if (index) code.append(document.createTextNode("\n"));
      const value = document.createElement("span");
      value.className = "leetcase-declaration";
      for (const token of globalThis.LeetCase.highlight.tokenize(declaration)) {
        const span = document.createElement("span");
        span.className = `leetcase-token-${token.kind}`;
        span.textContent = token.text;
        value.append(span);
      }
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
      toggle.title = showOriginal ? `Show ${language} format` : "Show original input";
      if (showOriginal) original.before(host);
      else original.after(host);
      newline.textContent = showOriginal ? "" : "\n";
    });
    const prefix = document.createTextNode(" ");
    const newline = document.createTextNode("\n");
    // A float anchors the control at the pre's right edge on the Input row.
    // It does not require changing styles on any LeetCode-owned ancestor.
    host.append(toggle, prefix, code, feedback, newline);
    original.after(host);
    return retain();
  }
  globalThis.LeetCase.view = Object.freeze({ mount, restore, clear, records, setAppearance });
})();
