(() => {
  "use strict";
  const descriptionSelector = "[data-track-load='description_content']";
  function editorState() {
    const editor = document.getElementById("editor");
    return {
      language: editor?.querySelector("button[aria-haspopup='dialog']")?.textContent.trim() ?? "",
      // Read rendered editor lines only; never reach into Monaco/React private state.
      code: [...(editor?.querySelectorAll(".view-lines .view-line") ?? [])].map(line => line.textContent).join("\n").replace(/\u00a0/g, " "),
    };
  }
  function inputNodes() {
    const nodes = [];
    for (const label of document.querySelectorAll(`${descriptionSelector} pre > strong`)) {
      if (label.textContent.trim() !== "Input:") continue;
      const value = label.nextSibling;
      // Only the observed plain-text example layout is supported in this stage.
      if (value?.nodeType !== Node.TEXT_NODE || !value.textContent.trim()) continue;
      const next = value.nextSibling;
      if (next?.nodeType !== Node.ELEMENT_NODE || next.tagName !== "STRONG" || next.textContent.trim() !== "Output:") continue;
      nodes.push(value);
    }
    // Newer descriptions put each field in a separate paragraph.
    for (const label of document.querySelectorAll(`${descriptionSelector} .example-block > p > strong`)) {
      if (label.textContent.trim() !== "Input:") continue;
      const row = label.parentElement;
      const value = label.nextElementSibling;
      const output = row.nextElementSibling;
      if (!value?.matches("span.example-io") || value.children.length || !value.textContent.trim()) continue;
      if (row.children.length !== 2 || row.firstElementChild !== label) continue;
      // All other row text must be whitespace; never consume unrelated prose.
      if ([...row.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) continue;
      if (output?.tagName !== "P" || output.firstElementChild?.tagName !== "STRONG" || output.firstElementChild.textContent.trim() !== "Output:") continue;
      nodes.push(value);
    }
    return nodes;
  }
  function editorColors(parameterNames = []) {
    const editor = document.getElementById("editor");
    const light = editor?.querySelector(".monaco-editor.vs:not(.vs-dark)");
    const colors = light
      ? { keyword: "#0000ff", type: "#267f99", number: "#098658", variable: "#001080", string: "#a31515" }
      : { keyword: "#569cd6", type: "#4ec9b0", number: "#b5cea8", variable: "#9cdcfe", string: "#ce9178" };
    const sampled = new Set();
    for (const token of editor?.querySelectorAll(".view-lines .view-line span[class*='mtk']") ?? []) {
      const text = token.textContent.trim();
      const kind = /^["']/.test(text) ? "string" : /\b(byte|short|int|long|double|float|bool|boolean|char|true|false|null|new|True|False|None)\b/.test(text) ? "keyword" : /\b(vector|string|String|Byte|Short|Integer|Long|Float|Double|Boolean|Character|List|ArrayList|Arrays)\b/.test(text) ? "type" :
        /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?(?:LL|L|f)?$/i.test(text) ? "number" : parameterNames.includes(text) ? "variable" : null;
      if (kind && !sampled.has(kind)) {
        colors[kind] = getComputedStyle(token).color;
        sampled.add(kind);
      }
    }
    return colors;
  }
  globalThis.LeetCase.adapter = Object.freeze({ editorState, inputNodes, editorColors, descriptionSelector });
})();
