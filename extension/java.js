// Java signatures and literals. Pure transformations; no DOM or browser APIs.
(() => {
  "use strict";
  const primitives = new Set(["byte", "short", "int", "long", "float", "double", "boolean", "char"]);
  const boxed = { Byte: "byte", Short: "short", Integer: "int", Long: "long", Float: "float", Double: "double", Boolean: "boolean", Character: "char" };
  function parseType(source, depth = 0) {
    if (depth > 16) return null;
    const type = source.replace(/\s/g, "");
    if (type.endsWith("[]")) {
      const element = parseType(type.slice(0, -2), depth + 1);
      // Java forbids generic array creation. Do not emit List<Integer>[].
      return element && !element.generic && { kind: "array", element, name: `${element.name}[]`, reference: true };
    }
    const list = /^(?:java\.util\.)?List<(.+)>$/.exec(type);
    if (list) {
      const element = parseType(list[1], depth + 1);
      return element?.reference && { kind: "list", element, name: `java.util.List<${element.name}>`, reference: true, generic: true };
    }
    const simple = type.replace(/^java\.lang\./, "");
    if (primitives.has(simple) && simple === type) return { kind: simple, name: simple, reference: false };
    if (simple === "String") return { kind: "String", name: "String", reference: true };
    if (Object.hasOwn(boxed, simple)) return { kind: boxed[simple], name: simple, reference: true };
    return null;
  }
  function splitParameters(source) {
    let depth = 0, start = 0;
    const parts = [];
    for (let i = 0; i < source.length; i++) {
      if (source[i] === "<") depth++;
      if (source[i] === ">" && --depth < 0) return null;
      if (source[i] === "," && depth === 0) { parts.push(source.slice(start, i)); start = i + 1; }
    }
    if (depth) return null;
    parts.push(source.slice(start));
    return parts;
  }
  function parametersFor(code, inputs) {
    const clean = globalThis.LeetCase.core.signatureText(code);
    const candidates = [];
    // A return type is required, so constructors and control flow are excluded.
    // Supports LeetCode methods, multiline signatures, final parameters, array
    // brackets after either the type or name, and a bounded throws clause.
    const methods = /(?:^|[;{}])\s*(?:(?:public|protected|private|static|final|synchronized|strictfp)\s+)*([\w.<>?,\[\]\s]+?)\s+([A-Za-z_]\w*)\s*\(([^(){}]*)\)\s*(?:throws\s+[\w.,\s]+)?\{/g;
    for (const match of clean.matchAll(methods)) {
      const returnType = match[1].replace(/\s/g, "");
      if (/^(public|private|protected|static|final|new|return|throw|else)$/.test(returnType)) continue;
      if (!/^(?:[A-Za-z_]\w*\.)*[A-Za-z_]\w*(?:<[^{}()]+>)?(?:\[\])*$/.test(returnType)) continue;
      const parts = splitParameters(match[3]);
      const params = parts?.map(part => {
        const param = /^\s*(?:final\s+)?(.+?)\s+([A-Za-z_]\w*)\s*((?:\[\s*\]\s*)*)$/.exec(part);
        const type = param && parseType(param[1] + param[3]);
        return param ? { name: param[2], type: type ? type.name : (param[1] + param[3]).replace(/\s/g, "") } : null;
      });
      if (params?.length === inputs.length && params.every(Boolean) && new Set(params.map(p => p.name)).size === params.length && inputs.every(input => params.some(p => p.name === input.name))) {
        candidates.push(inputs.map(input => params.find(p => p.name === input.name)));
      }
    }
    return candidates.length === 1 ? candidates[0] : null;
  }
  function quote(value, character = false) {
    let result = character ? "'" : '"';
    // Java chars are UTF-16 code units. Escape surrogates explicitly so UTF-8
    // file/clipboard encoding cannot replace an unpaired surrogate.
    for (let i = 0; i < value.length; i++) {
      const char = value[i], code = value.charCodeAt(i);
      if (char === "\\") result += "\\\\";
      else if (char === '"') result += '\\"';
      else if (char === "'") result += character ? "\\'" : "'";
      else if (char === "\n") result += "\\n";
      else if (char === "\r") result += "\\r";
      else if (char === "\t") result += "\\t";
      else if (code < 32 || code === 127) result += "\\" + code.toString(8).padStart(3, "0");
      else if (code >= 0xd800 && code <= 0xdfff) result += "\\u" + code.toString(16).padStart(4, "0");
      else result += char;
    }
    return result + (character ? "'" : '"');
  }
  function literal(value, type) {
    if (value === null) return type.reference ? "null" : null;
    if (type.kind === "array" || type.kind === "list") {
      if (!Array.isArray(value)) return null;
      const elements = value.map(item => literal(item, type.element));
      if (elements.includes(null)) return null;
      if (type.kind === "array") return `{${elements.join(", ")}}`;
      // Fully qualified, mutable lists: copied declarations need no imports and
      // algorithms remain free to add/remove items, including empty lists.
      const values = elements.map(item => item === "null" ? `(${type.element.name}) null` : type.element.kind === "array" ? `new ${type.element.name} ${item}` : item);
      return `new java.util.ArrayList<${type.element.name}>(java.util.Arrays.<${type.element.name}>asList(${values.join(", ")}))`;
    }
    if (["byte", "short", "int", "long"].includes(type.kind)) {
      if (typeof value !== "bigint" && !(typeof value === "number" && Number.isSafeInteger(value))) return null;
      const number = BigInt(value);
      const [minimum, maximum] = { byte: [-128n, 127n], short: [-32768n, 32767n], int: [-2147483648n, 2147483647n], long: [-9223372036854775808n, 9223372036854775807n] }[type.kind];
      if (number < minimum || number > maximum) return null;
      // Explicit casts also work with boxed Byte/Short and generic list entries.
      return type.kind === "long" ? `${number}L` : type.kind === "byte" || type.kind === "short" ? `(${type.kind}) ${number}` : String(number);
    }
    if (type.kind === "float" || type.kind === "double") {
      if (typeof value !== "number" && typeof value !== "bigint") return null;
      const number = type.kind === "float" ? Math.fround(Number(value)) : Number(value);
      if (!Number.isFinite(number)) return null;
      let text = Object.is(number, -0) ? "-0.0" : String(type.kind === "float" ? Number(number.toPrecision(9)) : number);
      if (!/[.eE]/.test(text)) text += ".0";
      return text + (type.kind === "float" ? "f" : "");
    }
    if (type.kind === "boolean") return typeof value === "boolean" ? String(value) : null;
    if (type.kind === "char") return typeof value === "string" && value.length === 1 ? quote(value, true) : null;
    if (type.kind === "String") return typeof value === "string" ? quote(value) : null;
    return null;
  }
  function format(inputs, parameters) {
    if (!parameters || inputs.length !== parameters.length) return null;
    const lines = [];
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].name !== parameters[i].name) return null;
      const type = parseType(parameters[i].type);
      const value = type && literal(inputs[i].value, type);
      if (!type || value === null) return null;
      lines.push(`${type.name} ${inputs[i].name} = ${value};`);
    }
    return lines.join("\n");
  }
  globalThis.LeetCase.java = Object.freeze({ parametersFor, format });
})();
