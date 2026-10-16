// Pure transformations. No DOM, browser APIs, eval, or inferred parameter types.
(() => {
  "use strict";
  function parseInput(source) {
    const parts = [];
    let start = 0, depth = 0, quoted = false, escaped = false;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') quoted = false;
      } else if (char === '"') quoted = true;
      else if (char === "[") depth++;
      else if (char === "]") { if (--depth < 0) return null; }
      else if (char === "," && depth === 0) { parts.push(source.slice(start, i)); start = i + 1; }
    }
    if (quoted || depth) return null;
    parts.push(source.slice(start));
    const names = new Set();
    try {
      return parts.map(part => {
        const match = /^\s*([A-Za-z_]\w*)\s*=\s*([\s\S]+?)\s*$/.exec(part);
        if (!match || names.has(match[1])) throw new Error("Invalid assignment");
        names.add(match[1]);
        return { name: match[1], value: JSON.parse(match[2]) };
      });
    } catch { return null; }
  }

  function parametersFor(code, inputs) {
    // Deliberately bounded declaration reader, not a general C++ parser.
    const clean = code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
    const candidates = [];
    for (const match of clean.matchAll(/\b([A-Za-z_]\w*)\s*\(([^(){}]*)\)\s*(?:const\s*)?\{/g)) {
      const params = match[2].split(",").map(part => {
        const param = /^\s*(.*?)\s*\b([A-Za-z_]\w*)\s*$/.exec(part);
        return param ? { name: param[2], type: param[1].replace(/\bconst\b/g, "").replace(/std::/g, "").replace(/[&\s]/g, "") } : null;
      });
      if (params.length === inputs.length && params.every((p, i) => p?.name === inputs[i].name)) candidates.push(params);
    }
    return candidates.length === 1 ? candidates[0] : null;
  }

  const isInt = value => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
  function formatCpp(inputs, parameters) {
    if (!parameters || parameters.length !== inputs.length) return null;
    const lines = [];
    for (let i = 0; i < inputs.length; i++) {
      const { name, value } = inputs[i];
      const parameter = parameters[i];
      if (parameter.name !== name) return null;
      if (parameter.type === "int" && isInt(value)) lines.push(`int ${name} = ${value};`);
      else if (parameter.type === "vector<int>" && Array.isArray(value) && value.every(isInt)) lines.push(`vector<int> ${name} = {${value.join(", ")}};`);
      else return null;
    }
    return lines.join("\n");
  }
  globalThis.LeetCase = { core: Object.freeze({ parseInput, parametersFor, formatCpp }) };
})();
