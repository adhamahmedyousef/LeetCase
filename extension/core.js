// Pure transformations. No DOM, browser APIs, eval, or inferred parameter types.
(() => {
  "use strict";
  // JSON-compatible literals with exact large integers. No executable expressions.
  function parseLiteral(source) {
    let position = 0;
    function read(depth = 0) {
      if (depth > 32) throw new Error("Input nesting limit");
      while (/\s/.test(source[position] ?? "") && position < source.length) position++;
      if (source[position] === '"') {
        const start = position++;
        let escaped = false;
        while (position < source.length) {
          const char = source[position++];
          if (escaped) escaped = false;
          else if (char === "\\") escaped = true;
          else if (char === '"') return JSON.parse(source.slice(start, position));
        }
        throw new Error("Unclosed string");
      }
      if (source[position] === "[") {
        position++;
        const values = [];
        while (/\s/.test(source[position] ?? "") && position < source.length) position++;
        if (source[position] === "]") { position++; return values; }
        while (true) {
          values.push(read(depth + 1));
          while (/\s/.test(source[position] ?? "") && position < source.length) position++;
          if (source[position] === "]") { position++; return values; }
          if (source[position++] !== ",") throw new Error("Invalid array");
        }
      }
      for (const [word, value] of [["true", true], ["false", false], ["null", null]]) {
        if (source.startsWith(word, position)) { position += word.length; return value; }
      }
      const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(position));
      if (!match || match[0].length > 128) throw new Error("Invalid number");
      position += match[0].length;
      const number = Number(match[0]);
      return !/[.eE]/.test(match[0]) && !Number.isSafeInteger(number) ? BigInt(match[0]) : number;
    }
    const value = read();
    if (source.slice(position).trim()) throw new Error("Trailing input");
    return value;
  }

  function parseInput(source) {
    if (typeof source !== "string" || source.length > 200000) return null;
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
        return { name: match[1], value: parseLiteral(match[2]) };
      });
    } catch { return null; }
  }

  function signatureText(code) {
    // Hide comments and literal contents before looking for declarations.
    // A signature-looking string must never be mistaken for a real method.
    return code.replace(/R"([^\s()\\]{0,16})\([\s\S]*?\)\1"|"""[\s\S]*?"""|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, match => match.replace(/[^\n]/g, " "));
  }
  function parametersFor(code, inputs) {
    // Deliberately bounded declaration reader, not a general C++ parser.
    const clean = signatureText(code);
    const candidates = [];
    for (const match of clean.matchAll(/\b([A-Za-z_]\w*)\s*\(([^(){}]*)\)\s*(?:const\s*)?\{/g)) {
      const params = match[2].split(",").map(part => {
        const param = /^\s*(.*?)\s*\b([A-Za-z_]\w*)\s*$/.exec(part);
        return param ? { name: param[2], type: param[1].replace(/\bconst\b/g, "").replace(/std::/g, "").replace(/[&\s]/g, "") } : null;
      });
      if (params.length === inputs.length && params.every(Boolean) && new Set(params.map(p => p.name)).size === params.length && inputs.every(input => params.some(p => p.name === input.name))) {
        candidates.push(inputs.map(input => params.find(p => p.name === input.name)));
      }
    }
    return candidates.length === 1 ? candidates[0] : null;
  }

  function parseType(type, depth = 0) {
    if (depth > 16) return null;
    if (type.startsWith("vector<") && type.endsWith(">")) {
      const element = parseType(type.slice(7, -1), depth + 1);
      return element && { kind: "vector", element, name: `vector<${element.name}>` };
    }
    const aliases = { int: "int", longlong: "long long", longlongint: "long long", double: "double", float: "float", bool: "bool", string: "string", char: "char" };
    return Object.hasOwn(aliases, type) ? { kind: aliases[type], name: aliases[type] } : null;
  }
  function quote(value, character = false) {
    let result = character ? "'" : '"';
    for (const char of value) {
      const code = char.codePointAt(0);
      if (code >= 0xd800 && code <= 0xdfff) return null; // Unpaired UTF-16 surrogate.
      if (char === "\\") result += "\\\\";
      else if (char === '"') result += '\\"';
      else if (char === "'") result += character ? "\\'" : "'";
      else if (char === "\n") result += "\\n";
      else if (char === "\r") result += "\\r";
      else if (char === "\t") result += "\\t";
      else if (code < 32 || code === 127) result += "\\" + code.toString(8).padStart(3, "0");
      else result += char;
    }
    return result + (character ? "'" : '"');
  }
  function literal(value, type) {
    switch (type.kind) {
      case "vector": {
        if (!Array.isArray(value)) return null;
        const elements = value.map(item => literal(item, type.element));
        return elements.includes(null) ? null : `{${elements.join(", ")}}`;
      }
      case "int":
        return typeof value === "number" && Number.isInteger(value) && value >= -2147483648 && value <= 2147483647 ? String(value) : null;
      case "long long": {
        if (typeof value !== "bigint" && !(typeof value === "number" && Number.isSafeInteger(value))) return null;
        const integer = BigInt(value);
        if (integer < -9223372036854775808n || integer > 9223372036854775807n) return null;
        return integer === -9223372036854775808n ? "(-9223372036854775807LL - 1)" : `${integer}LL`;
      }
      case "double":
      case "float": {
        if (typeof value !== "number" && typeof value !== "bigint") return null;
        const number = type.kind === "float" ? Math.fround(Number(value)) : Number(value);
        if (!Number.isFinite(number)) return null;
        // Nine significant digits round-trip binary32, avoiding a decimal near
        // a midpoint changing value when C++ rounds a literal directly to float.
        const decimal = type.kind === "float" ? Number(number.toPrecision(9)) : number;
        let text = Object.is(number, -0) ? "-0.0" : String(decimal);
        if (!/[.eE]/.test(text)) text += ".0";
        return text + (type.kind === "float" ? "f" : "");
      }
      case "bool": return typeof value === "boolean" ? String(value) : null;
      case "char": return typeof value === "string" && value.length === 1 && value.charCodeAt(0) < 128 ? quote(value, true) : null;
      case "string": {
        if (typeof value !== "string") return null;
        const quoted = quote(value);
        if (quoted === null) return null;
        // A char* constructor would truncate embedded NUL bytes.
        return value.includes("\0") ? `string(${quoted}, ${new TextEncoder().encode(value).length})` : quoted;
      }
      default: return null;
    }
  }
  function formatCpp(inputs, parameters) {
    if (!parameters || parameters.length !== inputs.length) return null;
    const lines = [];
    for (let i = 0; i < inputs.length; i++) {
      const { name, value } = inputs[i];
      const parameter = parameters[i];
      if (parameter.name !== name) return null;
      const type = parseType(parameter.type);
      const rendered = type && literal(value, type);
      if (rendered === null || !type) return null;
      lines.push(`${type.name} ${name} = ${rendered};`);
    }
    return lines.join("\n");
  }
  function exampleNames(sources) {
    const inputs = sources.map(parseInput);
    const reserved = new Set(inputs.flatMap(items => items?.map(item => item.name) ?? []));
    const used = new Set();
    return inputs.map((items, index) => new Map((items ?? []).map(({ name }) => {
      let suffix = index;
      let candidate = index ? name + suffix : name;
      // Preserve real names such as nums1, and avoid collisions across examples.
      while (used.has(candidate) || (candidate !== name && reserved.has(candidate))) candidate = name + ++suffix;
      used.add(candidate);
      return [name, candidate];
    })));
  }
  function formatPython(source, names) {
    const inputs = parseInput(source);
    if (!inputs) return null;
    const keywords = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield __debug__".split(" "));
    // Keep numeric lexemes intact (including arbitrary precision integers), and
    // split assignments only outside quoted strings and nested arrays.
    const parts = [];
    let start = 0, depth = 0, quoted = false, escaped = false;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '\"') quoted = false;
      } else if (char === '\"') quoted = true;
      else if (char === "[") depth++;
      else if (char === "]") depth--;
      else if (char === "," && depth === 0) { parts.push(source.slice(start, i)); start = i + 1; }
    }
    parts.push(source.slice(start));
    const used = new Set();
    const lines = inputs.map((input, index) => {
      const name = names?.get(input.name) ?? input.name;
      if (!/^[A-Za-z_]\w*$/.test(name) || keywords.has(name) || used.has(name)) return null;
      used.add(name);
      const raw = parts[index].slice(parts[index].indexOf("=") + 1).trim();
      // JSON strings need decoding/requoting: \/ and UTF-16 surrogate pairs
      // do not have the same source-level meaning in Python.
      const value = raw.replace(/"(?:\\[\s\S]|[^"\\])*"|\b(?:true|false|null)\b/g, token =>
        token[0] === '"' ? JSON.stringify(JSON.parse(token)) : ({ true: "True", false: "False", null: "None" })[token]);
      return `${name} = ${value}`;
    });
    return lines.includes(null) ? null : lines.join("\n");
  }
  function format(language, source, code, names) {
    if (language === "Python" || language === "Python3") return formatPython(source, names);
    const inputs = parseInput(source);
    if (!inputs) return null;
    const formatter = language === "C++" ? { parametersFor, format: formatCpp } : language === "Java" ? globalThis.LeetCase.java : null;
    if (!formatter) return null;
    const parameters = formatter.parametersFor(code, inputs);
    if (!parameters) return null;
    // Bind with original signature names first; rename identifiers structurally,
    // never replace text in string literals or values.
    const renamed = inputs.map(input => ({ ...input, name: names?.get(input.name) ?? input.name }));
    if (renamed.some(input => !/^[A-Za-z_]\w*$/.test(input.name)) || new Set(renamed.map(input => input.name)).size !== renamed.length) return null;
    return formatter.format(renamed, parameters.map((parameter, i) => ({ ...parameter, name: renamed[i].name })));
  }
  globalThis.LeetCase = { core: Object.freeze({ parseInput, parametersFor, formatCpp, signatureText, format, exampleNames }) };
})();
