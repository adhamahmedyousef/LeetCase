# LeetCase architecture

The extension owns a presentation layer beside each **Input:** label in the
problem description. It never writes to the solution editor, runnable testcase
editor, React state, network requests, Output, or Explanation.

```text
LeetCode DOM → adapter → input assignments + editor signature → C++ formatter
                        ↓ validated result only
                    input view ← controller (language / route / DOM changes)
```

## Boundaries

| File | Responsibility |
| --- | --- |
| `core.js` | Pure assignment parser, bounded C++ parameter reader, type-checked formatter |
| `highlight.js` | Lossless syntax tokens for the supported generated declarations |
| `settings.js` | Local Color Mode preference shared by popup and content scripts |
| `leetcode-adapter.js` | All site-specific selectors; reads rendered language/code and exact input text nodes |
| `input-view.js` | Reversible input-only presentation, local toggle, data-only clipboard action |
| `input-view.css` | Styles scoped exclusively to extension-owned nodes |
| `content.js` | Debounced reconciliation, lifecycle, popup connection response |
| `popup.*` | Connection status, project information, links |

Classic scripts execute in manifest order in Chrome's isolated content-script
world. `LeetCase` is an internal namespace; no dependencies or page-world bridge.

## Safety and lifecycle

- Parse assignments using quote/depth tracking and a bounded JSON-literal reader,
  never `eval` or global bracket replacement. JSON string decoding uses `JSON.parse`;
  unsafe integer literals use `BigInt` to avoid JavaScript precision loss.
  Resolve types from a matching function declaration.
- Supported types: `int`, `long long`, `float`, `double`, `bool`, `string`, ASCII
  `char`, and recursive `vector<T>` of these types, including empty/ragged arrays.
  Validate values recursively against the declared type; do not infer vector types.
  Reject unsupported parameter types, pointers (including TreeNode/ListNode),
  null elements, ambiguous signatures and malformed input.
  A rejected example stays original in full; no partial conversion.
- Escape quotes, backslashes and controls as valid C++ literals. Fixed three-digit
  octal escapes cannot absorb following digits. Strings with embedded NUL use the
  length-aware `string(literal, utf8ByteLength)` constructor. Reject unpaired UTF-16
  surrogates and non-ASCII `char` values. Signed 64-bit bounds are enforced, with
  a standards-compliant expression for LLONG_MIN. Float/double values must be finite
  (float overflow is rejected); rendered literals include the appropriate suffix.
  Float values are rounded to binary32 before emitting a nine-significant-digit
  decimal, avoiding C++ literal rounding changing a midpoint value.
- Bound one input region to 200,000 UTF-16 code units, 32 value nesting levels and
  16 vector type nesting levels and 128 characters per numeric literal. Beyond
  these limits preserve the original.
- Read only the rendered Monaco lines. If the signature is not in those lines,
  preserve original examples. Full editor-model integration is deliberately deferred.
- Only support the observed `pre > strong Input:` + text + `strong Output:` shape.
  Markup changes fail closed. Future adapters can support other layouts explicitly.
- Move the original Text node into an extension-owned hidden wrapper, preserving
  its content and identity. Render validated declarations with `textContent`.
  Original mode shows the actual original node; cleanup unwraps it.
- Double-click copies only that variable's complete formatted declaration. Enter
  or Space on a focused declaration provides the same keyboard action. A live
  status reports Copied after clipboard success. Plain spans inherit the original
  input typography; Original is the only standalone control. Copy uses only data. It never copies the page,
  explanation, credits or footer, and bypasses LeetCode's page-copy handler.
- A body observer discovers relevant editor/description changes. It ignores
  extension-internal mutations, filters unrelated regions, and debounces updates.
  Reconciliation only mounts missing inputs or restores/reformats on context changes.
  A 750 ms pathname-only check catches SPA navigation without patching History.
- Language/route changes invalidate previous views; code edits only rebuild a
  view if its signature-derived declarations change. Unsupported languages
  restore the original input. No reload or whole-page replacement is used.
- Controls and styles live entirely inside the Input region. No runtime data is
  modified. Text can occupy more vertical space because declarations wrap.
- Original is a small button floated to the right of the Input row, without
  repositioning any LeetCode-owned ancestor or framing the input text.
- Color Mode defaults off. `chrome.storage.local` stores one boolean and propagates
  changes to already-open tabs. It persists across navigations and browser restarts.
  The only API permission is `storage`; no account data or browsing history is stored.
- Highlighting uses plain text spans and preserves the exact copy payload. Colors
  are sampled from rendered Monaco tokens for the available types/variables/numbers;
  unavailable colors use a VS-style light/dark palette. Custom themes with unseen
  token categories therefore use fallback colors for those categories. Theme class
  changes trigger a palette refresh. Disabling Color Mode restores inherited colors
  without rebuilding input nodes or resetting the Original toggle.

## Verification

Run `node --test`. Use `tests/fixture.html` through a local
HTTP server for DOM checks. The fixture reuses the live observed example markup
and the actual extension scripts; its Chrome storage/connection shim is test-only.
Chrome extension APIs, clipboard permissions and actual site integration still
require a loaded unpacked extension on LeetCode.

`node tests/cpp-roundtrip.cjs` compiles generated declarations with g++ C++20
and checks values independently, including IEEE bit patterns and UTF-8 bytes.
It requires g++ on PATH and creates/removes its own verified temporary directory.

Next adapters/formatters must preserve these boundaries. TreeNode/ListNode
builders, Python and JavaScript remain separate future work. The root
`LeetCase.md` holds the user requirements, current verification and backlog.
