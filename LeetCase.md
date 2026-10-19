# LeetCase

Project handoff and decision record. Updated 2026-10-19, Africa/Cairo.
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

The latest popup uses approved solid layout A, darkened to match VoidHub.
There is no Connected row or Saved confirmation when toggling settings.
Python now supports copyable assignments and Unique names. JavaScript and
TreeNode/ListNode builders remain future work.

## Current behavior (source version 0.5.1)

- Chrome Manifest V3, no dependencies or build step, no background worker.
- A content script operates on `https://leetcode.com/problems/*` and the www alias.
- Only the example data immediately after **Input:** in the description changes.
  Output, Explanation, the statement, solution code and runnable testcases stay intact.
- Uses the selected editor language and parameter names/types from the visible
  C++ or Java method declaration. Tracks language changes, SPA navigation and rerenders.
- Unsupported languages/types/layouts restore or preserve the original example.
- Input uses the original font and plain text layout, without a card/background.
- **Original** is a small button on the right of the Input row, as requested in
  the user's marked screenshot. It toggles between original and formatted data.
- No standalone Copy button. Double-click a declaration to copy that variable's
  complete declaration; Enter/Space also copy when the declaration has focus.
- Successful clipboard writes show **Copied**. Copy errors show retry feedback.
  The copied text contains only the declaration, without credits or page footer.
- Popup uses approved solid A with a VoidHub dark palette: By VoidHub link, LeetCase title,
  the user's supplied LS logo, Input formatting, Color Mode and Unique names switches, About,
  GitHub and copyright. The user explicitly removed the entire Connected row.
- Input formatting defaults on for existing installs. Turning it off restores
  the original LeetCode inputs in open tabs and prevents further formatting;
  turning it on reconciles current examples. The choice persists in
  `chrome.storage.local` under `leetcaseEnabled` and follows the user across tabs.
- **Color Mode** defaults off, updates open tabs and persists across browser
  restarts through `chrome.storage.local`, key `leetcaseColorMode`.
- Python/Python3 supports per-assignment copy and Unique names, even with Color
  Mode off. JSON boolean/null literals become True/False/None outside strings.
  Numeric source lexemes are preserved; JSON-only slash escapes and UTF-16 pairs
  are decoded/requoted correctly. Serialized node arrays remain ordinary lists,
  not constructed TreeNode/ListNode instances. Original restores exact source.
- Colors use visible Monaco token colors when available; missing categories
  use a VS-style light/dark palette. Custom themes may use fallback colors.
- Only declared API permission: `storage`. No analytics, external requests,
  account data, browsing-history permission or saved solution/testcase content.

## Local 0.5.1: Unique names and popup A (2026-10-19)

- User selected A, then requested VoidHub dark colors and no Saved confirmations.
  Applied compact spacing, #10151e background, teal switches and the LS logo.
  All preferences save silently; load/save errors remain visible.
- Optional **Unique names** defaults off, persisted independently under
  `leetcaseUniqueNames`. First example keeps its names; later examples use
  nums1/target1, nums2/target2, etc. Display and copy share the same declarations.
- C++ and Java bind the actual signature before structurally renaming identifiers.
  Literal strings, types and original data stay intact. Existing numeric
  parameter names are reserved to avoid collisions. Python uses the same maps.
- Numbering follows DOM example order, including unsupported examples, and
  reconciles after rerenders/removal.
- Passed: 40 Node tests, 61 browser layout checks, 29 lifecycle checks. Native
  round trips: Java 593 declarations / 4292 assertions; C++ 568 / 4171.
- Popup browser preview: toggled all three switches without Saved; reloaded and
  confirmed persistence. Screenshot: ignored `dist/popup-a-dark.png`. This
  preview uses an isolated storage shim, not the installed extension.
- Local Input fixture shows nums1 and target1 in example 2; double-click shows
  Copied. Browser-session clipboard reader returned empty, so exact system
  clipboard contents were not independently confirmed in this run.
- Live LeetCode verification after extension Reload remains pending.
  Push is explicitly authorized as `Python & Java nums`. Latest published
  release is now v0.5.1, published on the user's subsequent request.

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
| `extension/java.js` | Java method signatures, Java literals, arrays and mutable typed lists |
| `extension/highlight.js` | Lossless tokens for generated C++ declarations |
| `extension/settings.js` | Shared persistent enabled and Color Mode preferences with live notifications |
| `extension/leetcode-adapter.js` | Site selectors, visible code/language and Monaco palette reading |
| `extension/input-view.js` | Reversible Input-only rendering, Original and double-click copy |
| `extension/input-view.css` | Styles scoped to extension-owned nodes |
| `extension/content.js` | Filtered/debounced observation and reconciliation |
| `extension/popup.*` | Popup presentation, persistent controls and links |
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

Commands: `node --test`, `node tests/cpp-roundtrip.cjs` (g++ on PATH), and
`node tests/java-roundtrip.cjs` (JDK on PATH).
For fixture testing, run `python -m http.server 8765 --bind 127.0.0.1` in the project
and open `http://127.0.0.1:8765/tests/fixture.html`. The fixture's Chrome/storage
shim is test-only and is not part of the shipped extension.

## Known limits and remaining work

1. Reload the unpacked extension and refresh LeetCode to verify 0.5.1 live.
   Continue in small stages and preserve the agreed in-page behavior.
2. Verify 0.5.1 on several real LeetCode problems after extension Reload + page Refresh.
   The adapter supports legacy `pre` examples and modern `.example-block` paragraphs
   containing a plain `span.example-io`. Add other layouts only after observing them.
3. **TreeNode and ListNode remain unsupported.** Design explicit builders with
   LeetCode's serialization rules; never reinterpret their input arrays as vectors.
4. JavaScript and TreeNode/ListNode builders remain future work. Python
   copyable assignments are implemented in 0.5.1.
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
9. No Chrome Web Store listing exists. Initial installation stays extract ZIP →
   chrome://extensions → Developer mode → Load unpacked.
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
  VoidHub logo found in PVP2/branding/voidhub-logo-crops. System fonts only; no
  remote assets.
- Color Mode retains the exact existing chrome.storage.local key and persistence.
  The illustrative code preview follows the saved preference. Open tabs still
  receive preference changes through the existing settings module. No data reset.
- About retains C++ support scope, MIT, open-source PR policy and independence
  from LeetCode. GitHub and By VoidHub remain real links. Copyright is unchanged.
- Typography-only LS monogram is a placeholder, not a finished Chrome icon.
  The user explicitly requested **LS**, even though the product is LeetCase;
  do not silently replace it with LC. No final image icon has been installed.
- The Git repository previously included popup concept mockups and an icon prompt.
  These were design-only exploration files and have been removed from the cleaned
  project tree; the selected popup and user-supplied logo are in `extension/`.
- Visual QA uses the actual popup source generated into ignored dist/ via
  `node tests/create-popup-preview.cjs`, with an isolated preview storage shim.
  Preview storage has its own prefix and cannot change the installed extension.
- Verification: all 19 existing Node tests passed. Local browser verified the
  Color Mode switch, colored/uncolored preview, saved state after reopening,
  About contents, and absence of Connected. Real Chrome popup review after
  Reload is still pending; do not claim that review was performed.
- Initial A/B/C previews were exploration artifacts and are not part of the
  maintained project files.

## 0.4.1: user-supplied LS logo

- Replaced the typographic LS placeholder in the popup with the exact logo image
  supplied by the user. The copied `extension/icons/leetcase.png` has the same
  SHA256 as the source attachment; no artwork edits were made.
- Registered that high-resolution PNG as the extension/action icon and popup
  header image. Manifest sizes 16, 32, 48 and 128 currently reference this same
  1024×1024 source image, which Chrome scales for each use.
- Kept popup design C, Color Mode persistence, and the absence of Connected.
- Bumped the extension and popup display version to 0.4.1. Regenerated the local
  popup preview and confirmed the logo loads, Color Mode remains visible, and
  Connected is absent. Real Chrome extension Reload is still required to see
  the new toolbar icon and popup in the installed unpacked extension.
- Included the logo in the versioned 0.4.1 ZIP for local installation.

## 0.4.2: persistent Input formatting switch (local, not released)

- The user selected design D from four popup options: a compact teal-rail status
  strip immediately above the code preview. The Color Mode switch remains separate.
- Added a persistent Input formatting switch. It defaults on, saves to
  `chrome.storage.local`, and updates already-open LeetCode tabs. Off restores
  original Input nodes; on resumes formatting for supported C++ examples.
- Popup shows the current On/Off state and saved/error feedback. Version is
  bumped to 0.4.2. The popup preview shim supplies the backward-compatible default.
- Updated the public README and architecture notes. The actual Chrome extension
  needs Reload plus a LeetCode page Refresh for the user to try the switch.
- This local change has not been tested in Chrome or published. Do not push or
  create a release until the user reviews the behavior.

## 0.5.0: C++ audit and Java support (initial local implementation)

- User requested a C++ gap review followed by Java using the selected editor
  language and the actual Java method signature, preserving the existing UX.
- Audited C++ support: recursive vectors (including multiple arrays and empty/ragged
  rows), strings/escaping, ASCII chars, bool, int/long long and finite float/double
  are already supported. Native C++20 regression still passes 168 declarations
  and 404 independent assertions. This does not mean all C++ types are supported.
- C++ gaps remain: TreeNode/ListNode builders; maps/sets/pairs/custom structures;
  pointers/C arrays; unsigned/platform-dependent long/size_t and non-ASCII char.
  The signature reader is bounded, is not a full C++ parser, and depends on
  rendered Monaco lines. Unknown DOM layouts and design/operation problems remain
  original. These are recorded backlog, not features silently added in this stage.
- Fixed a shared signature-reading issue: comments and quoted string/char contents
  (including C++ raw strings and Java text blocks) are masked before matching,
  so a signature-looking string does not authorize a conversion.
- Inspected the actual Java template on LeetCode Two Sum in a separate Chrome tab:
  `class Solution { public int[] twoSum(int[] nums, int target) { } }`.
  Consulted Java Language Specification chapters 3, 8 and 10 for method/array
  syntax, literals, UTF-16 chars and escaping:
  https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html
  https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
  https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html
- Added pure `extension/java.js`, loaded after core in the MV3 manifest. Shared
  core dispatch selects C++ or Java; controller/view retain Input-only rendering,
  original node identity, double-click/keyboard copy, Original and both persistent
  preferences. Original's tooltip uses the current language, not hardcoded C++.
- Java signatures: optional public/private/protected/static/final modifiers,
  multiline parameters, final parameter modifier, brackets before/after parameter
  names, bounded throws clauses. Bind by exact name, even in reversed input order;
  missing/ambiguous/unsupported signatures preserve the original example.
- Java values: byte/short/int/long (checked bounds and long L suffix), float/double
  (finite values, binary32 rounding, signed zero), boolean, String, one UTF-16-unit
  char, boxed primitives, recursive arrays and typed List<T> of supported reference
  types. Empty/ragged arrays and multiple inputs are supported. Reference nulls
  work; primitive nulls fail. Strings preserve controls, NUL, quotes, backslashes,
  Unicode and surrogate units. Supplementary characters use String, not one char.
- Typed lists use fully qualified mutable ArrayList/Arrays constructors, including
  nested lists and array elements, so no import is required. A null list element
  is explicitly cast to its element type to avoid Java varargs interpreting a
  single null as the entire argument array. Generic arrays remain unsupported.
- TreeNode, ListNode, Node, maps, wildcard/type-variable generics, annotations,
  varargs and custom constructors are not supported in Java. No node array is
  reinterpreted as a normal array. Python and JavaScript remain future stages.
- Extended syntax colors and Monaco palette sampling to Java primitive/boxed
  types, String, lists, new/null and L literals. Popup About and concise README
  now mention both languages. Popup's illustrative preview remains C++.
- Corrected an existing settings-test mock after the prior enabled-switch change:
  initial loading reads two keys, so both pending reads must resolve. Added a
  persistence/tab-notification check showing enabled changes preserve Color Mode.
- Verification on 2026-10-18: 28 Node tests; 193 generated Java declarations
  compiled with javac 25 (`-Xlint:all -Werror`) and executed with 452 independent
  assertions; 168 C++20 declarations / 404 assertions; JS syntax and diff checks.
- Local Chrome: 33 DOM/typography checks and 14 controller lifecycle checks pass.
  Covers C++ ↔ Java, unsupported languages/types, Original, Color Mode, enable/off,
  SPA routes and example replacement, unchanged Output and runnable input.
  Manual fixture checks confirmed Java syntax colors and clipboard output:
  `String[] words = {"hello", "world"};` via keyboard, and
  `long total = 9007199254740993L;` via double-click, with Copied feedback.
- Browser fixture URLs: `/tests/dom-regressions.html`,
  `/tests/controller-regressions.html`, `/tests/fixture.html` (Java input types).
  Java native check: `node tests/java-roundtrip.cjs` (JDK on PATH).
- Live LeetCode check confirmed its Java signature only. Updated extension
  injection has not been verified on the live site; user must Reload LeetCase in
  chrome://extensions, Refresh the problem and select Java. No push/release in this
  stage; retain the existing 0.4.2 work and await user review before publishing.

## 0.5.0 published: Java and Python colors (2026-10-18)

- User confirmed Java works on live LeetCode and explicitly authorized Push and
  a new Release. This supersedes the earlier local-only publication hold.
- Added Python/Python3 color-only rendering: preserve the exact original text,
  whitespace and typography; no signature needed, value conversion, declarations,
  extra controls or clipboard override. JSON true/false/null remain unchanged.
  Color Mode and the master switch both control this view, retaining preferences.
- README, popup About, manifest description and architecture explain C++/Java
  declarations versus Python colors only. Version 0.5.0. No permission expansion.
- Expanded deterministic native-value corpus: matrices, ragged/empty vectors and
  arrays, Unicode/control/NUL strings, 64-bit integers and mutable nested Java
  lists. Native assertions independently check content, sizes, bits and mutability.
- Current verification passed: 34 Node tests, including 600 lossless lexer cases
  and 200 generated parameter-name/order combinations for both C++ and Java;
  593 Java declarations / 4,292 assertions; 568 C++20 declarations / 4,171
  assertions; 61 local Chrome layout checks and 21 lifecycle checks.
- C++'s expanded generated program exceeded the old 60-second compilation budget
  with -O2. Narrowed its includes and used -O0 for this literal/value verification;
  compilation and all runtime assertions passed. This is not a performance claim.
  Java checks use javac -Xlint:all -Werror, chunked methods to respect JVM limits.
- New regression coverage checks malformed inputs, bounds/depth, comments/quoted
  fake signatures, reference nulls, controls/escaping, typography/node identity,
  Python no-op text preservation, Color Mode/master switch toggles, language and
  route changes, rerenders, and unchanged Output/Explanation/runnable data.
- Live Java works per the user's confirmation. New Python coloring is verified
  in local Chrome fixtures; no claim of a live-site Python reload test yet.
- `python scripts/package_release.py` creates a deterministic ZIP from current
  extension source plus LICENSE, verifies all manifest references and version,
  permissions, archive-root layout, exact file bytes and absence of test/docs.
- Published release: https://github.com/adhamahmedyousef/LeetCase/releases/tag/v0.5.0
  (regular release, not a draft/prerelease). Source commit and remote tag:
  `194f43cbbe2ab36f8b0204e95b78b2d1678491a1`.
- Asset: `leetcase-0.5.0.zip`, 146,380 bytes, 14 files at archive root/relative
  icon paths, including MIT LICENSE. SHA-256:
  `38bd5aef2a83dcbc6a5f529da22dbcc066ad83093db8d14b3b3cee96d7888710`.
- Verified GitHub's uploaded asset size/digest/state, release publication and
  remote main/tag SHA. Downloaded the public versioned ZIP link independently;
  its hash, archive integrity and manifest 0.5.0 matched the tested local package.
- Popup preview verified both switches save independently and survive reopening;
  About correctly distinguishes C++/Java formatting from Python colors only.
- Manual update: replace installed extension files, Reload in chrome://extensions,
  then Refresh LeetCode. New Python behavior still awaits user confirmation on
  the actual site after that update; local fixtures are not live-site evidence.

## Repository cleanup and release

- Removed the abandoned A/B/C popup comparison page, its isolated demo script,
  the separate icon-generation prompt, and the unused VoidHub reference crop.
  Kept architecture docs, tests, contributing guide, MIT license, and this
  project handoff because they directly support development, use, or review.
- Removed the outdated preview wording from the README and GitHub About
  description. The About description now says: “Open-source Chrome extension
  that formats and copies LeetCode testcases for C++ by VoidHub.”
- Published the first GitHub Release, `v0.4.1`, at
  https://github.com/adhamahmedyousef/LeetCase/releases/tag/v0.4.1.
  This regular release adds the final user-provided logo and keeps the tested
  C++ behavior. It attaches `leetcase-0.4.1.zip`, containing only files from
  `extension/` at the archive root, ready for **Load unpacked** after extraction.
- Release asset SHA-256:
  `3c8cb0a9c97c3c0ea03e3d196a6d3fc20b060da67edfd9e6f4ec308683e42d45`.
- Verified before publication: 19 Node tests; native C++ compilation of 168
  generated declarations and 404 independent value assertions; ZIP root and
  manifest version 0.4.1.


## 0.5.1 Python copy and repository cleanup (2026-10-19)

- Requested commit: `Python & Java nums`, including the approved solid dark A
  popup and persisted Unique names for C++, Java and Python.
- Python now shares double-click / Enter / Space copy and Original toggle.
  Supported LeetCode JSON-style inputs become Python assignments; strings keep
  contents, booleans/null use Python spelling, large integer/decimal lexemes
  retain their exact source digits. No need for an editor method signature.
- Native verification: 816 Python programs / 2448 value/name assertions;
  Java 593 declarations / 4292 assertions; C++ 568 / 4171. Node suite: 41 tests.
- Browser verification passed: 61 layout checks and 34 lifecycle checks.
- Browser fixtures cover both layouts, Python colors off/on, Original restoration,
  numbering multiple variables and copying the numbered assignment. Clipboard
  payload is verified with a test-only clipboard writer, not a live OS read.
- Removed abandoned four-option popup generator. Runtime, meaningful regression
  tests, release packaging, MIT, contributing guide and project docs are retained.
  ZIPs, previews and screenshots remain ignored in dist and are not pushed.
- README, manifest and popup About now describe Python copying correctly.
- Release v0.5.1 was subsequently requested and published (see below). Users
  must Reload the unpacked extension and Refresh LeetCode. Live-site test pending.


## Published 0.5.1 (2026-10-19)

- User explicitly requested a new release and an English announcement draft.
- Regular latest release: https://github.com/adhamahmedyousef/LeetCase/releases/tag/v0.5.1
- Tag and source commit: `4afe968d7b04c3e947e6df48b51ea7e30574c699`
  (`Python & Java nums`). No runtime changes after the tested source commit.
- ZIP: `leetcase-0.5.1.zip`, 147612 bytes, 14 entries including MIT LICENSE.
  SHA-256: `c535e36aea310cf5f927fdb1f8737af87b88ff23a1cb3fe9dcd01638831eefd2`.
- Verified GitHub published/non-draft state, uploaded asset size/digest, remote
  tag SHA, and independently downloaded versioned public ZIP. Archive integrity,
  manifest version and exact SHA-256 match the tested package.
- Release notes include manual install/update steps, local verification counts,
  supported-type scope and pending live-site Reload verification.
- Announcement draft: ignored `dist/leetcase-0.5.1-post.md`; thanks Aashita
  Narayanpur via her supplied profile link for requesting Java. Notification
  behavior of @ mentions is unconfirmed. New video URL is a visible placeholder.
- No social post sent or published; user will record/upload the new video.
