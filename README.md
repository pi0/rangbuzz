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

The colors of the theme are inlined as `style` attributes, so the result needs
no stylesheet, no javascript and no hydration on the client. It works the same
in node, in the browser, in a worker or in a template.

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

`highlightText(code, opt)` returns the content of the block only (the tokens
and the line numbers), which is what you want when you already have the
element.

Auto language detection:

```js
import { codeToHtml, detectLanguage } from "rangbuzz";

codeToHtml(code, { lang: detectLanguage(code) });
```

Every language is bundled and ready to use — there is nothing to preload, and
every function returns its result directly rather than a promise. Unknown
languages fall back to unhighlighted text rather than throwing.

Load a custom language:

```js
import { loadLanguage } from "rangbuzz";

loadLanguage("language-name", customLanguage);
```

---

### Terminal

```js
import { printHighlight } from "rangbuzz";
import { atomDark } from "rangbuzz/themes";

printHighlight('console.log("hello")', { lang: "js", theme: atomDark });
```

Every theme works in the terminal, its colors are emitted as 24 bit escape
sequences (a light/dark pair is read as its dark theme). `codeToAnsi` returns
the string instead of printing it.

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

A theme is plain data: a color per token type. The same object drives the
inline styles and the terminal.

By default, code is highlighted with the **two bundled themes** — `default` for
light and `dark` for dark — inlined as [`light-dark()`][light-dark] colors, so a
code block follows the color scheme of the reader on its own. They are the only
two themes the main entry pulls in.

Every other theme lives in `rangbuzz/themes`, and only ends up in your bundle if
you import it:

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

`themes` maps every name to its theme, and `defaultThemes` (from `rangbuzz`) is
the default pair. Writing a custom theme is just an object:

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

This project is a fork of [Speed Highlight JS](https://github.com/speed-highlight/core)
by [matubu](https://mathias.ninja) and contributors, which is dedicated to the public
domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). This fork is redistributed under MIT. See [LICENSE](./LICENSE) for details.
