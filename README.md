# rangbuzz

[![NPM Version](https://badge.fury.io/js/rangbuzz.svg)](https://badge.fury.io/js/rangbuzz) ![NPM Downloads](https://img.shields.io/npm/dm/rangbuzz)

A JavaScript syntax highlighter for the web and the terminal

- **Tiny** <small>(~2kB core, ~1kB per language)</small>
- **Fast** <small>(outperforms Prism and highlight.js)</small>
- **Simple** <small>(zero dependencies)</small>

## Simple setup 🚀

### Web

Style/theme (in the header of your html file):

```html
<link rel="stylesheet" href="/path/dist/themes/default.css" />
```

In the body of your html file:

```html
<div class="shj-lang-[code-language]">[code]</div>
or
<code class="shj-lang-[code-language]">[inline code]</code>
```

Highlight the code (in your javascript):

```js
import { highlightAll } from "/path/dist/index.mjs";
highlightAll();
```

Auto language detection

```js
import { highlightElement } from "../dist/index.mjs";
import { detectLanguage } from "../dist/detect.mjs";

elm.textContent = code;
highlightElement(elm, detectLanguage(code));
```

Load custom language

```js
import { loadLanguage } from "../dist/index.mjs";

loadLanguage("language-name", customLanguage);
```

Preload a bundled language

```js
import { loadLanguage } from "rangbuzz";
import * as js from "rangbuzz/languages/js";

loadLanguage("js", js);
```

---

#### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/rangbuzz/dist/themes/default.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pi0/rangbuzz/dist/themes/default.css" />
```

```js
import ... from 'https://unpkg.com/rangbuzz/dist/index.mjs';
import ... from 'https://cdn.jsdelivr.net/gh/pi0/rangbuzz/dist/index.mjs';
```

---

### Deno

Use the npm specifier

```js
import { setTheme, printHighlight } from "npm:rangbuzz/terminal";

await setTheme("[theme-name]");
printHighlight('console.log("hello")', "js");
```

---

### Node

Use the [npm package](https://www.npmjs.com/package/rangbuzz)

```bash
npm i rangbuzz
```

```js
import { setTheme, printHighlight } from "rangbuzz/terminal";

setTheme("[theme-name]");
printHighlight('console.log("hello")', "js");
```

## Migrating from prism

rangbuzz is a lighter and faster version of prism that share a similar API

### Style

Remove the prism stylesheet in the head of your html file
Clone this repository or use a cdn to load our stylesheet

```diff
<head>
-  <link href="themes/prism.css" rel="stylesheet" />
+  <link rel="stylesheet" href="https://unpkg.com/rangbuzz/dist/themes/default.css">
</head>
```

### Script

For the script part remove the prism.js script and replace it by a import and a call to `highlightAll`

```diff
<body>
-  <script src="prism.js"></script>
+<script>
+  import { highlightAll } from 'https://unpkg.com/rangbuzz/dist/index.mjs';
+  highlightAll();
+</script>
</body>
```

If you want to highlight only a specific element you can use the `highlightElement` function instead

### Code block

For the code blocks replace the `<pre><code>` by only one `<div>`
And use `shj-lang-` prefix instead of `language-` for the class property

```diff
-<pre><code class="language-css">p { color: red }</code></pre>
+<div class="shj-lang-css">p { color: red }</div>
```

And for inline code block you just have to change the class property

```diff
-<code class="language-css">p { color: red }</code>
+<code class="shj-lang-css">p { color: red }</code>
```

## Languages supported 🌐

| Name       | Class name          | Support                                             | Language detection |
| ---------- | ------------------- | --------------------------------------------------- | ------------------ |
| asm        | shj-lang-asm        |                                                     | ✅                 |
| bash       | shj-lang-bash       |                                                     | ✅                 |
| brainfuck  | shj-lang-bf         | increment, operator, print, comment                 | ❌                 |
| c          | shj-lang-c          |                                                     | ✅                 |
| css        | shj-lang-css        | comment, str, selector, units, function, ...        | ✅                 |
| csv        | shj-lang-csv        | punctuation, ...                                    | ❌                 |
| diff       | shj-lang-diff       |                                                     | ✅                 |
| docker     | shj-lang-docker     |                                                     | ✅                 |
| git        | shj-lang-git        | comment, insert, deleted, string, ...               | ❌                 |
| go         | shj-lang-go         |                                                     | ✅                 |
| html       | shj-lang-html       |                                                     | ✅                 |
| http       | shj-lang-http       | keywork, string, punctuation, variable, version     | ✅                 |
| ini        | shj-lang-ini        |                                                     | ❌                 |
| java       | shj-lang-java       |                                                     | ✅                 |
| javascipt  | shj-lang-js         | basic syntax, regex, jsdoc, json, template literals | ✅                 |
| jsdoc      | shj-lang-jsdoc      |                                                     | ❌                 |
| json       | shj-lang-json       | string, number, bool, ...                           | ❌                 |
| leanpub-md | shj-lang-leanpub-md |                                                     | ❌                 |
| log        | shj-lang-log        | number, string, comment, errors                     | ❌                 |
| lua        | shj-lang-lua        |                                                     | ✅                 |
| makefile   | shj-lang-make       |                                                     | ✅                 |
| markdown   | shj-lang-md         |                                                     | ✅                 |
| perl       | shj-lang-pl         |                                                     | ✅                 |
| plain      | shj-lang-plain      |                                                     | ❌                 |
| python     | shj-lang-py         |                                                     | ✅                 |
| regex      | shj-lang-regex      | count, set, ...                                     | ❌                 |
| rust       | shj-lang-rs         |                                                     | ✅                 |
| sql        | shj-lang-sql        | number, string, function, ...                       | ✅                 |
| todo       | shj-lang-todo       |                                                     | ❌                 |
| toml       | shj-lang-toml       | comment, table, string, bool, variable              | ❌                 |
| typescript | shj-lang-ts         | js syntax, ts keyword, types                        | ✅                 |
| uri        | shj-lang-uri        |                                                     | ✅                 |
| xml        | shj-lang-xml        |                                                     | ✅                 |
| yaml       | shj-lang-yaml       | comment, numbers, variable, string, bool            | ❌                 |

## Themes 🌈

A modern theme by default

| Name               | Terminal | Web |
| ------------------ | -------- | --- |
| default            | ✅       | ✅  |
| github-dark        | ❌       | ✅  |
| github-light       | ❌       | ✅  |
| github-dim         | ❌       | ✅  |
| atom-dark          | ✅       | ✅  |
| visual-studio-dark | ❌       | ✅  |

## License 📄

[MIT](./LICENSE)

This project is a fork of [Speed Highlight JS](https://github.com/speed-highlight/core)
by [matubu](https://mathias.ninja) and contributors, which is dedicated to the public
domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). This fork is redistributed under MIT. See [LICENSE](./LICENSE) for details.
