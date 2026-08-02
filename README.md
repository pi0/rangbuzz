# 🎨 rangbuzz

[![NPM Version](https://badge.fury.io/js/rangbuzz.svg)](https://badge.fury.io/js/rangbuzz) ![NPM Downloads](https://img.shields.io/npm/dm/rangbuzz)

Lightweight JavaScript syntax highlighter, forked from [Speed Highlight JS](https://github.com/speed-highlight/core).

- **Tiny** <small>(~8kB min+gzip, every language included)</small>
- **Fast** <small>(outperforms Prism and highlight.js)</small>
- **Simple** <small>(zero dependencies, fully synchronous API, no stylesheet to load)</small>

## Quick Start 🚀

```bash
npx nypm i rangbuzz
```

Highlight a string, get self contained markup:

```js
import { codeToHtml } from "rangbuzz";

html = codeToHtml('console.log("hello")', { lang: "js" });
```

The colors of the theme are inlined as `style` attributes, so the result needs no stylesheet, no javascript and no hydration on the client. It works the same in node, in the browser, in a worker or in a template.

```js
import { codeToHtml } from "rangbuzz";
import { githubDark, githubLight } from "rangbuzz/themes";

// a specific theme, or a light/dark pair
codeToHtml(code, { lang: "js", theme: githubDark });
codeToHtml(code, { lang: "js", theme: { light: githubLight, dark: githubDark } });

// an inline `<code>` element instead of a block (a block is `multiline` when
// the code has a line break, `oneline` otherwise)
codeToHtml(code, { lang: "js", inline: true });

// no gutter
codeToHtml(code, { lang: "js", lineNumbers: false });
```

`highlightText(code, opt)` returns the content of the block only (the tokens and the line numbers), which is what you want when you already have the element.

Auto language detection:

```js
import { codeToHtml, detectLanguage } from "rangbuzz";

codeToHtml(code, { lang: detectLanguage(code) });
```

Every language is bundled and ready to use — there is nothing to preload, and every function returns its result directly rather than a promise. Unknown languages fall back to unhighlighted text rather than throwing. To bundle only what you use instead, reach for [`rangbuzz/core`](#core).

A custom language is passed to the call that needs it, rather than registered globally. Custom languages are looked up before the bundled ones, so they can also override a bundled language, and they apply to sub-languages too:

```js
import { codeToHtml } from "rangbuzz";

codeToHtml(code, { lang: "mine", languages: { mine: customLanguage } });
```

A language is an array of rules — `import * as mine from "./mine.js"` works as well, for a module with the rules as its default export.

---

### Tokens

`tokenize(code, opt)` is the layer everything else is built on. It returns the tokens themselves, so you can render them your own way — into JSX, into another markup, or into whatever your output format is:

```js
import { tokenize } from "rangbuzz";

tokenize("let a = 1", { lang: "js" });
// [
//   { text: "let", type: "kwd" },
//   { text: " a " },
//   { text: "=", type: "oper" },
//   { text: " " },
//   { text: "1", type: "num" }
// ]
```

It takes the same `lang` and `languages` options as the other entry points. Tokens come back in source order, are never empty, and their `text` is raw nothing is escaped so joining them gives the input back. Text that no rule matched has no `type`, and an unknown language or a broken grammar yields the whole code as a single untyped token rather than throwing.

The `type` is one of `deleted`, `err`, `var`, `section`, `kwd`, `class`, `cmnt`, `insert`, `type`, `func`, `bool`, `num`, `oper`, `str`, `esc` — the same keys a [theme](#themes-) assigns colors to. The one style a theme does not carry is the italic `cmnt` is rendered with in html, which is a convention of that output rather than theme data.

**A token may span line breaks.** A block comment, a template literal or a run of plain text is a single token however many lines it covers. So to render line by line, tokenize the whole code **once** and split the tokens — tokenizing each line on its own loses every construct that crosses a break, and does it silently:

```js
// ✗ each line tokenized in isolation
"const a = 1; /* multi\nline */".split("\n").map((line) => tokenize(line, { lang: "js" }));

// the second line comes back as [{ text: "line " }, { text: "*/", type: "oper" }]
// — the comment is gone, and `*/` was read as an operator

// ✓ tokenize once, then split the tokens
const lines = [[]];
for (const { text, type } of tokenize(code, { lang: "js" })) {
  text.split("\n").forEach((part, i) => {
    if (i) lines.push([]);
    if (part) lines.at(-1).push({ text: part, type });
  });
}
```

---

### Terminal

```js
import { printHighlight } from "rangbuzz";
import { atomDark } from "rangbuzz/themes";

printHighlight('console.log("hello")', { lang: "js", theme: atomDark });
```

Every theme works in the terminal, its colors are emitted as 24 bit escape sequences (a light/dark pair is read as its dark theme). `codeToAnsi` returns the string instead of printing it.

---

### Core

The main entry bundles every language and the two default themes, so a call needs nothing but the code. `rangbuzz/core` is the same API with **nothing bundled**: the languages and the theme are required options, so only what you hand it ends up in your bundle.

The bundled grammars live in `rangbuzz/languages`, each a named export of its own, so you pay for the ones you name and nothing else:

```js
import { codeToHtml } from "rangbuzz/core";
import { js, ts } from "rangbuzz/languages";
import { githubDark } from "rangbuzz/themes";

codeToHtml(code, { lang: "js", languages: { js, ts }, theme: githubDark });
```

The export names are the registry keys, so `{ js, ts }` is a complete registry already and a custom grammar sits next to them as `{ js, mine }`, exactly as it does on the main entry. `languages` is exported too, as the same object the main entry uses, for the rare case where you want every grammar through the core API.

`languages` is the whole registry the call resolves names against the language of the code itself, and every sub-language it reaches. Nothing is registered globally and nothing is loaded behind your back: `languages: {}` highlights nothing, and an unknown language degrades to plain text rather than throwing, here as everywhere else.

That last part is what to watch for, because **grammars delegate to other grammars**, and a name you did not pass leaves that region unhighlighted:

```js
import { js, js_template_literals, jsdoc, regex, todo } from "rangbuzz/languages";

// `js` on its own: the code is highlighted, but template literals and
// comments come back as plain text
tokenize(code, { lang: "js", languages: { js } });

// javascript, whole
tokenize(code, { lang: "js", languages: { js, jsdoc, js_template_literals, regex, todo } });
```

- **`todo`** is the one to remember: nearly every grammar routes its comments through it — that is what picks `TODO`/`FIXME` out of them, and what carries the comment color itself. Without it, comments are not highlighted at all.
- `js` and `ts` reach for `jsdoc`, `js_template_literals`, `regex` and `todo`; `html` for `css`, `js` and `todo`; `php` for `html`, `jsdoc` and `todo`; `c` for `asm`, `make` for `bash`.
- `md`, `http`, `vue`, `astro` and `svelte` pick their sub-language from the code itself (a fence language, an embedded block), so they highlight whatever you happened to pass and leave the rest plain.

The core entry exports the same functions as the main one — `codeToHtml`, `highlightText`, `tokenize`, `codeToAnsi`, `printHighlight` and `detectLanguage` and behaves identically otherwise. Bundled together, the core, the five javascript grammars above and a theme come to ~3.5kB min+gzip.

## Languages supported 🌐

| Name             | Support                                                         | Language detection |
| ---------------- | --------------------------------------------------------------- | ------------------ |
| asm              | comment, string, number, section, instruction                   | ✅                 |
| astro            | frontmatter, embedded ts/css, expressions, directives, ...      | ✅                 |
| bash             | comment, string, variable, path, keyword, function, ...         | ✅                 |
| c                | comment, string, number, include, keyword, class, ...           | ✅                 |
| c# (cs)          | comment, string, keyword, class, ...                            | ✅                 |
| c++ (cpp)        | raw strings, digit separators, ...                              | ✅                 |
| css              | comment, str, selector, units, function, ...                    | ✅                 |
| csv              | punctuation, ...                                                |                    |
| dart             | comment, string, keyword, class, ...                            | ✅                 |
| diff             | deleted, insert, keyword, section                               | ✅                 |
| docker           | instruction keyword, ...bash syntax                             | ✅                 |
| go               | comment, string, raw string, number, keyword, class, ...        | ✅                 |
| graphql          | comment, string, type, field, directive, variable, ...          | ✅                 |
| html             | doctype, embedded css/js, tag, attribute, ...                   | ✅                 |
| http             | keywork, string, punctuation, variable, version                 | ✅                 |
| ini              | comment, section, key, value, ...                               |                    |
| java             | comment, string, number, keyword, operator, class, ...          | ✅                 |
| javascript (js)  | basic syntax, regex, jsdoc, json, template literals             | ✅                 |
| jsdoc            | tag, type, param name                                           |                    |
| json             | string, number, bool, ...                                       |                    |
| kotlin (kt)      | comment, string, keyword, class, ...                            | ✅                 |
| less             | comment, string, variable, mixin, nesting, ...                  | ✅                 |
| log              | number, string, comment, errors                                 |                    |
| lua              | comment, string, keyword, boolean, number, function, ...        | ✅                 |
| makefile (make)  | comment, variable, target, .PHONY, ...bash in recipes           | ✅                 |
| markdown (md)    | heading, bold, italic, code fence, inline code, list, link, ... | ✅                 |
| perl (pl)        | comment, string, number, keyword, operator, function            | ✅                 |
| php              | comment, string, variable, keyword, ...                         | ✅                 |
| plain            | double-quoted string                                            |                    |
| powershell (ps1) | comment, string, variable, cmdlet, ...                          | ✅                 |
| python (py)      | comment, string, f-string, keyword, boolean, class, ...         | ✅                 |
| regex            | count, set, ...                                                 |                    |
| ruby (rb)        | comment, string, symbol, keyword, ...                           | ✅                 |
| rust (rs)        | comment, string, raw string, char, keyword, class, ...          | ✅                 |
| scss             | comment, string, variable, nesting, ...                         | ✅                 |
| sql              | number, string, function, ...                                   | ✅                 |
| svelte           | template, script, style, logic blocks, directives, ...          | ✅                 |
| swift            | comment, string, keyword, class, ...                            | ✅                 |
| toml             | comment, table, string, bool, variable                          |                    |
| typescript (ts)  | js syntax, ts keyword, types                                    | ✅                 |
| uri              | scheme, host, port, query, fragment, ...                        | ✅                 |
| vue              | template, script, style, directives, ...                        | ✅                 |
| xml              | comment, CDATA, tag, attribute, entity, ...                     | ✅                 |
| yaml             | comment, numbers, variable, string, bool                        |                    |

## Themes 🌈

A theme is plain data: a color per token type. The same object drives the inline styles and the terminal.

By default, code is highlighted with the **two bundled themes** — `default` for light and `dark` for dark — inlined as [`light-dark()`][light-dark] colors, so a code block follows the color scheme of the reader on its own. They are the only two themes the main entry pulls in.

Every other theme lives in `rangbuzz/themes`, and only ends up in your bundle if you import it:

```js
import { codeToHtml } from "rangbuzz";
import { githubDark } from "rangbuzz/themes";

codeToHtml(code, { lang: "js", theme: githubDark });
```

| Name               | Export             |
| ------------------ | ------------------ |
| default            | `defaultTheme`     |
| dark               | `dark`             |
| atom-dark          | `atomDark`         |
| github-dark        | `githubDark`       |
| github-dim         | `githubDim`        |
| github-light       | `githubLight`      |
| visual-studio-dark | `visualStudioDark` |

Each theme is a named export of its own. Writing a custom theme is just an object:

```js
codeToHtml(code, {
  lang: "js",
  theme: {
    name: "my-theme",
    scheme: "dark",
    bg: "#000",
    fg: "#fff",
    tokens: { kwd: "#f92672", str: "#e6db74", cmnt: "#75715e" /* … */ },
  },
});
```

[light-dark]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark

## License 📄

[MIT](./LICENSE)

This project is a fork of [Speed Highlight JS](https://github.com/speed-highlight/core) by [matubu](https://mathias.ninja) and contributors, which is dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). This fork is redistributed under MIT. See [LICENSE](./LICENSE) for details.
