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
    return nodes;
  }
  globalThis.LeetCase.adapter = Object.freeze({ editorState, inputNodes, descriptionSelector });
})();
