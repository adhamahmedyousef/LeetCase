# LeetCase

Project handoff and decision record. Updated 2026-10-16, Africa/Cairo.
Read this file before continuing work; update it when behavior or status changes.

## Identity and scope

- Name: **LeetCase**, without a dash or brand suffix in Chrome's extension name.
- Brand: **By VoidHub**, linking to https://voidhub.co. No arrow beside VoidHub in README.
- Repository: https://github.com/adhamahmedyousef/LeetCase, branch `main`.
- Workspace: `C:/Users/j/OneDrive/Desktop/LeetCase`.
- License: MIT. Copyright (c) 2026 VoidHub. Keep the MIT permission notice intact.
- Open source; contributions through PRs. The owner reviews and decides what to merge.
- Independent of LeetCode, with no affiliation/endorsement or global novelty claim.
- Name availability needs checking before public marketing/store publication.
  The user reported a VS Code tool called LeetCase and a similar tool LeetParse;
  this is recorded context, not a fresh trademark/name search.

## Working agreement

Work in small stages: explain the change, implement it, test it, then wait for
the user's next stage. Do not build the entire roadmap in one pass.
GitHub push was explicitly authorized in this conversation; do not create another
repository, publish a store listing or deploy unrelated services without a request.

The current request applies the approved popup design C without a Connected row. The user says
the existing extension works well. The user selected the Code first popup direction. Python and JavaScript come later.

## Current behavior (source version 0.4.0)

- Chrome Manifest V3, no dependencies or build step, no background worker.
- A content script operates on `https://leetcode.com/problems/*` and the www alias.
- Only the example data immediately after **Input:** in the description changes.
  Output, Explanation, the statement, solution code and runnable testcases stay intact.
- Uses the selected editor language and parameter names/types from the visible
  C++ function declaration. Tracks language changes, SPA navigation and rerenders.
- Unsupported languages/types/layouts restore or preserve the original example.
- Input uses the original font and plain text layout, without a card/background.
- **Original** is a small button on the right of the Input row, as requested in
  the user's marked screenshot. It toggles between original and formatted data.
- No standalone Copy button. Double-click a declaration to copy that variable's
  complete declaration; Enter/Space also copy when the declaration has focus.
- Successful clipboard writes show **Copied**. Copy errors show retry feedback.
  The copied text contains only the declaration, without credits or page footer.
- Popup uses the approved dark Code first design: By VoidHub link, LeetCase title,
  LS placeholder monogram, illustrative code preview, Color Mode, About, GitHub
  and copyright. The user explicitly removed the entire Connected row.
- **Color Mode** defaults off, updates open tabs and persists across browser
  restarts through `chrome.storage.local`, key `leetcaseColorMode`.
- Colors use visible Monaco token colors when available; missing categories
  use a VS-style light/dark palette. Custom themes may use fallback colors.
- Only declared API permission: `storage`. No analytics, external requests,
  account data, browsing-history permission or saved solution/testcase content.

## Supported C++ types

| Type | Details |
| --- | --- |
| `int` | Signed 32-bit values; range/type checked |
| `long long` | Full signed 64-bit range, exact large-integer parsing, valid LLONG_MIN expression |
| `double`, `float` | Finite values; decimals/exponents, negative zero, valid literal suffixes; float overflow rejected |
| `bool` | JSON true/false, without silently converting 0/1 |
| `string` | Empty strings, Unicode, quotes, backslashes, controls and embedded NUL |
| `char` | One ASCII character, with proper C++ escaping |
| `vector<T>` | Recursive nesting of supported types; empty vectors and empty/ragged rows |

Examples: `vector<vector<int>>`, `vector<string>`, `vector<vector<char>>`,
`vector<bool>` and `vector<long long>`. `std::`, references and const qualifiers
in the bounded supported function signature are normalized for local declarations.

The parser follows structure and quotes; it does not globally replace brackets.
Strings containing NUL use a length-aware constructor so their data is not truncated.
Unsupported input rejects the whole example instead of producing a partial conversion.

## Files and boundaries

| File | Role |
| --- | --- |
| `extension/manifest.json` | Chrome entrypoints, version, match patterns and storage permission |
| `extension/core.js` | Literal parser, parameter reader, recursive typed C++ formatter |
| `extension/highlight.js` | Lossless tokens for generated C++ declarations |
| `extension/settings.js` | Shared persistent Color Mode preference and live notifications |
| `extension/leetcode-adapter.js` | Site selectors, visible code/language and Monaco palette reading |
| `extension/input-view.js` | Reversible Input-only rendering, Original and double-click copy |
| `extension/input-view.css` | Styles scoped to extension-owned nodes |
| `extension/content.js` | Filtered/debounced observation and reconciliation |
| `extension/popup.*` | Popup presentation, connection check and settings control |
| `tests/*.test.cjs` | Parser/formatter, highlight and settings tests |
| `tests/cpp-roundtrip.cjs` | Native C++20 compilation and independent value assertions |
| `tests/fixture.*` | Local DOM integration fixture, including expanded-input button |
| `docs/architecture.md` | Detailed architecture, limits and safety boundaries |
| `README.md`, `LICENSE`, `CONTRIBUTING.md` | Concise public description, MIT terms and PR policy |
| `dist/` | Ignored local ZIPs/screenshots, not tracked source |

Do not inject into React/Monaco private state or overwrite original input text.
The original input node (Text or example-io span) is retained in a hidden wrapper, revealed by Original and
unwrapped on cleanup. Use `textContent` for rendering, never raw input as HTML.

## Verification and current evidence

- User confirmed the extension works well after the Original/Color Mode release
  (0.2.1), following actual unpacked Chrome loading and page refresh.
- 0.3.0 type expansion: **16 Node tests passed**.
- Native Windows g++ C++20 `-pedantic-errors` verification passed:
  **168 generated declarations and 404 independent value assertions**.
  Includes all 128 ASCII characters, quote/backslash/control escapes, embedded NUL,
  Unicode UTF-8 bytes, signed 64-bit extrema and float/double bit patterns,
  including binary32 midpoint rounding regressions.
- Local browser integration exercised matrices, words, escaped text, char grids,
  bool, double and an integer above 2^53 together. Original data/runnable inputs
  stayed intact and double-click showed Copied with Color Mode enabled.
- This latest type expansion has not yet been user-confirmed on live LeetCode.
  Do not describe local fixtures/native compilation as live-site verification.
- Earlier local checks covered Original restoration, language changes, SPA
  navigation, example rerenders, empty arrays and no duplicate mounted views.
- Storage tests cover persistence across fresh contexts, open-tab notifications,
  failed writes and a setting change during the initial asynchronous read.

Commands: `node --test` and `node tests/cpp-roundtrip.cjs` (g++ on PATH).
For fixture testing, run `python -m http.server 8765 --bind 127.0.0.1` in the project
and open `http://127.0.0.1:8765/tests/fixture.html`. The fixture's Chrome/storage
shim is test-only and is not part of the shipped extension.

## Known limits and remaining work

1. Review the implemented Code first popup (0.4.0) after Chrome Reload. Await the
   next user-selected stage; preserve the agreed in-page interaction.
2. Verify 0.3.0 on several real LeetCode problems after extension Reload + page Refresh.
   The adapter supports legacy `pre` examples and modern `.example-block` paragraphs
   containing a plain `span.example-io`. Add other layouts only after observing them.
3. **TreeNode and ListNode remain unsupported.** Design explicit builders with
   LeetCode's serialization rules; never reinterpret their input arrays as vectors.
4. Python then JavaScript formatters and language-specific function signatures.
5. Bounded C++ signature reader is not a full parser. If the declaration is outside
   Monaco's rendered viewport, missing, overloaded/ambiguous or unsupported,
   preserve original input. Full model integration needs a separate design decision.
6. Maps/sets, objects, pointers, design-problem operations, optionals, arbitrary
   user-defined structures and non-ASCII char literals are not supported.
7. Input bounds: 200,000 UTF-16 code units, 32 value nesting levels and 16 vector
   type nesting levels, with 128 characters per numeric literal. Large/custom
   schemas outside these bounds stay original.
8. Broader real-theme/light-mode/narrow-pane/browser testing, including float
   boundary regressions and selector changes when LeetCode updates its DOM.
9. Public distribution polish: icons, versioned ZIP/release documentation and
   optional packaging automation. No store listing exists. Initial installation
   stays extract ZIP → chrome://extensions → Developer mode → Load unpacked.
10. Chrome Web Store later: recheck current developer fee, policies, name/branding
    and privacy disclosures before any requested store publication.

Updates are manual. Existing Chrome installs need **Reload** on the extension
card, then **Refresh** on the problem page. Browser automation cannot claim
`chrome://extensions` in this setup, so the user performs that reload step.

## 0.3.1: Integer to Roman and two-array follow-up

- User reported Integer to Roman showing no conversion:
  https://leetcode.com/problems/integer-to-roman/.
- Inspected the actual authenticated Chrome page. Language was C++, with visible
  `string intToRoman(int num)`. Its Input is inside
  `.example-block > p > strong` followed by `span.example-io`; Output is in a
  separate paragraph. The previous adapter only supported `pre` examples.
- Added strict detection of that observed paragraph layout. The renderer preserves
  the exact original span and its typography, allows multiple declaration lines,
  and leaves Output/Explanation nodes intact. Unknown nested markup or surrounding
  prose still fails closed. Original cleanup restores the original element identity.
- Verified the real Median of Two Sorted Arrays page:
  https://leetcode.com/problems/median-of-two-sorted-arrays/.
  It initially opened in Python3; selecting C++ produced both nums1 and nums2
  declarations for both examples using the already-supported legacy layout.
  Python is still intentionally unsupported; never imply arrays convert in Python.
- Parameter binding now matches by name rather than relying on example order.
  Reversed arrays are supported; unknown/duplicate parameter names are rejected.
- Latest verification: 18 Node tests passed; 18 browser DOM layout checks passed;
  native C++ verification still passed (168 declarations / 404 value assertions).
  DOM checks cover both layouts, two arrays, an empty array, duplicate detection,
  original node identity, typography, line breaks and unchanged Output/Explanation.
- Browser DOM suite: serve the project and open `/tests/dom-regressions.html`.
  This uses observed markup locally; it is not a claim that the updated adapter
  has already run on the real Integer to Roman page.
- User said they will Reload/Refresh and report back, and explicitly asked to end
  this turn. Live Integer to Roman verification is pending their next message.
  Do not continue popup redesign or broader work before that follow-up.

## 0.3.2: paragraph fonts and string-array report

- User reported a different font in Valid Parentheses and unchanged examples in
  Longest Common Prefix, supplying screenshots of both.
- Inspected the real Longest Common Prefix tab: it was set to **Python3**.
  Selecting C++ immediately converted both examples to `vector<string>` using
  the existing implementation. String-array support had not regressed.
  Python formatting remains future work; do not convert Python pages into C++.
- Opened Valid Parentheses in Chrome and reproduced the paragraph renderer.
  Its generated host had no font declaration, despite the previous shorthand
  assignment. Replaced `getComputedStyle(node).font` copying with individual
  font family/size/weight/style/stretch/variant/features/variation, line height,
  letter spacing and word spacing properties. Computed shorthand serialization
  can be empty for advanced font settings; individual properties avoid that loss.
- Syntax token spans explicitly inherit the captured typography. This prevents
  type/string coloring spans from using a different family, size or weight.
- Popup connection response now includes the selected language. When Python3 or
  another unsupported language is selected, it says formatting supports C++ only.
  No popup redesign was performed.
- Verification: 19 Node tests passed and 28 browser DOM checks passed. Added the
  two real Longest Common Prefix cases and property-by-property typography checks
  on the generated host and every syntax token, including advanced font settings.
- New font behavior is locally browser-tested; live post-Reload verification is
  still needed. The real C++ string-array conversion was verified on LeetCode.
- Next step remains the user-reviewed popup redesign, after current fixes are
  reviewed. Keep pending Python/JavaScript and TreeNode/ListNode work separate.

## 0.4.0: approved VoidHub popup design C

- Prepared three local directions: Quiet dark (A), Clean light (B), Code first (C).
  The user chose C, then explicitly asked to remove the Connected item entirely.
- Implemented C in the real popup HTML/CSS/JS, without a Connected row or Check
  again button. Popup no longer queries active tabs or sends connection pings.
  The content script's existing diagnostic responder remains internal.
- Charcoal background, white text and teal accent, grounded in the user's actual
  VoidHub logo found in PVP2/branding/voidhub-logo-crops. Reference asset is saved
  at docs/design/assets/voidhub-reference.png. System fonts only; no remote assets.
- Color Mode retains the exact existing chrome.storage.local key and persistence.
  The illustrative code preview follows the saved preference. Open tabs still
  receive preference changes through the existing settings module. No data reset.
- About retains C++ support scope, MIT, open-source PR policy and independence
  from LeetCode. GitHub and By VoidHub remain real links. Copyright is unchanged.
- Typography-only LS monogram is a placeholder, not a finished Chrome icon.
  The user explicitly requested **LS**, even though the product is LeetCase;
  do not silently replace it with LC. No final image icon has been installed.
- Complete copyable Gemini/ChatGPT icon prompt: docs/design/icon-prompt.md.
  Attach docs/design/assets/voidhub-reference.png when using it. Prompt asks for
  white geometric LS on charcoal, a teal underline and small-size legibility,
  without LeetCode marks, gradients, mockup scenes or extra text.
- Visual QA uses the actual popup source generated into ignored dist/ via
  `node tests/create-popup-preview.cjs`, with an isolated preview storage shim.
  Preview storage has its own prefix and cannot change the installed extension.
- Verification: all 19 existing Node tests passed. Local browser verified the
  Color Mode switch, colored/uncolored preview, saved state after reopening,
  About contents, and absence of Connected. Real Chrome popup review after
  Reload is still pending; do not claim that review was performed.
- Initial A/B/C previews are retained in docs/design for reference. The actual
  extension source, not those initial concepts, is the current approved design.
