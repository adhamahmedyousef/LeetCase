# LeetCase

### By [VoidHub](https://voidhub.co)

An open-source Chrome extension for displaying and copying LeetCode testcases in
your editor's language, while preserving the original test data. Supports C++
and Java, with syntax coloring for Python examples.

Formats supported testcase values using the selected editor language and method
signature. Supports C++ scalars and nested vectors, plus Java scalars, strings,
arrays and typed lists. Use **Original** to switch views, or double-click a declaration
to copy it. Optional **Color Mode** adds IDE-style syntax colors and remembers
your choice. For Python/Python3, Color Mode only colors the original Input text;
it does not rewrite values or generate Python code. Turn the extension's input
presentation on or off from the popup. JavaScript is planned. Independent of
LeetCode; not affiliated with or endorsed by it.

## Install

1. Download and extract the extension ZIP from [Releases](https://github.com/adhamahmedyousef/LeetCase/releases), or clone this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the extracted release folder, or the `extension` folder from a clone.
4. Open a LeetCode problem, refresh the page, then click **LeetCase** in the Extensions menu.

For manual updates, replace the files, reload the extension, and refresh the problem page.

## Open source

Have an improvement? [Open a pull request](https://github.com/adhamahmedyousef/LeetCase/pulls).
The maintainer reviews contributions and chooses what to merge.

© 2026 VoidHub. Released under the [MIT License](LICENSE).

[Project status and next steps](LeetCase.md)
