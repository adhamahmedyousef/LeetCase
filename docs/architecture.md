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
| `leetcode-adapter.js` | All site-specific selectors; reads rendered language/code and exact input text nodes |
| `input-view.js` | Reversible input-only presentation, local toggle, data-only clipboard action |
| `input-view.css` | Styles scoped exclusively to extension-owned nodes |
| `content.js` | Debounced reconciliation, lifecycle, popup connection response |
| `popup.*` | Connection status, project information, links |

Classic scripts execute in manifest order in Chrome's isolated content-script
world. `LeetCase` is an internal namespace; no dependencies or page-world bridge.

## Safety and lifecycle

- Parse assignments using quote/depth tracking and `JSON.parse`, never `eval` or
  global bracket replacement. Resolve types from a matching function declaration.
- This stage accepts only signed 32-bit `int` and `vector<int>`, including `[]`.
  Reject nested arrays, floating point, strings, unsupported parameter types,
  pointers (including TreeNode/ListNode), ambiguous signatures and malformed input.
  A rejected example stays original in full; no partial conversion.
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

## Verification

Run `node --test tests/core.test.cjs`. Use `tests/fixture.html` through a local
HTTP server for DOM checks. The fixture reuses the live observed example markup
and the actual extension scripts; its Chrome connection shim is test-only.
Chrome extension APIs, clipboard permissions and actual site integration still
require a loaded unpacked extension on LeetCode.

Next adapters/formatters must preserve these boundaries. Nested values,
TreeNode/ListNode builders, Python and JavaScript remain separate future work.
