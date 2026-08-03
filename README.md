# 🎨 rangi

🎨 A tiny syntax highlighter

Rangi is a fork of [Speed Highlight JS](https://github.com/speed-highlight/core).

- **Tiny** <small>(**~12.5kB** min+gzip with every language and the default themes bundled, **~1.5kB** for `codeToHtml` from [`rangi/core`](#core))</small>
- **Fast** <small>(outperforms other highlighters in our benchmarks)</small>
- **Simple** <small>(zero dependencies, fully synchronous, no stylesheet to load, and no global registry)</small>
- **Complete** <small>(**44 languages**, 7 themes, language detection, terminal output, and raw tokens for custom rendering)</small>

### Quick Start 🚀

```bash
npx nypm i rangi
```

Highlight a string and get self-contained HTML:

```js
import { codeToHtml } from "rangi";

html = codeToHtml('console.log("hello")', { lang: "js" });
```

Theme colors are inlined as `style` attributes, so the result needs no stylesheet, client-side JavaScript, or hydration. It works the same whether you use it in Node.js, a browser, a worker, or a template.

```js
import { codeToHtml } from "rangi";
import { githubDark, githubLight } from "rangi/themes";

// Use a specific theme or a light/dark pair
codeToHtml(code, { lang: "js", theme: githubDark });
codeToHtml(code, { lang: "js", theme: { light: githubLight, dark: githubDark } });

// Return an inline `<code>` element instead of a block (blocks are `multiline`
// when the code contains a line break and `oneline` otherwise)
codeToHtml(code, { lang: "js", inline: true });

// Hide the line-number gutter
codeToHtml(code, { lang: "js", lineNumbers: false });
```

`highlightText(code, opt)` returns only the contents of the block: its tokens and line numbers. Use it when you already have a wrapper element.

Detect the language automatically:

```js
import { codeToHtml, detectLanguage } from "rangi";

codeToHtml(code, { lang: detectLanguage(code) });
```

Every language is bundled and ready to use, with nothing to preload. All functions return their results directly instead of promises. Unknown languages fall back to plain text rather than throwing an error. To bundle only the languages you use, choose [`rangi/core`](#core).

Pass a custom language directly to the call that needs it instead of registering it globally. Custom languages take precedence over bundled languages, so they can override them and are also available to sub-languages:

```js
import { codeToHtml } from "rangi";

codeToHtml(code, { lang: "mine", languages: { custom: customLanguage } });
```

A language is an array of rules. If those rules are a module's default export, `import * as mine from "./mine.js"` works too.

## Terminal

Highlight a file from the command line:

```bash
npx rangi src/index.ts
```

```js
import { printHighlight } from "rangi";
import { atomDark } from "rangi/themes";

printHighlight('console.log("hello")', { lang: "js", theme: atomDark });
```

Every theme works in the terminal, where its colors are emitted as 24-bit escape sequences. For a light/dark pair, the terminal uses the dark theme. `codeToAnsi` returns the highlighted string instead of printing it.

## Core

The main entry point bundles every language and both default themes, so they are ready to use. `rangi/core` provides the same API with **nothing bundled**. Its `languages` and `theme` options are required, so your bundle includes only what you provide.

Each bundled grammar is available as a named export from `rangi/languages`, so your bundle includes only the ones you import:

```js
import { codeToHtml } from "rangi/core";
import { js, ts } from "rangi/languages";
import { githubDark } from "rangi/themes";

codeToHtml(code, { lang: "js", languages: { js, ts }, theme: githubDark });
```

Export names match their language keys, so you can pass `{ js, ts }` directly as the `languages` option. Add a custom grammar alongside them as `{ js, custom }`, just as you would with the main entry point. If you need every grammar through the core API, import the full `languages` object used by the main entry point.

The highlighter uses the grammars provided in `languages` for both the selected language and any sub-languages it needs. Nothing is registered globally or loaded implicitly: `languages: {}` applies no highlighting, and unknown languages fall back to plain text instead of throwing an error.

Keep in mind that **grammars can delegate to other grammars**. If you omit a required grammar, its region remains unhighlighted:

```js
import { js, js_template_literals, jsdoc, regex, todo } from "rangi/languages";

// `js` on its own: the code is highlighted, but template literals and
// comments come back as plain text
tokenize(code, { lang: "js", languages: { js } });

// Complete JavaScript highlighting
tokenize(code, { lang: "js", languages: { js, jsdoc, js_template_literals, regex, todo } });
```

The core entry exports the same functions as the main entry.

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
| docker           | instruction keyword, embedded bash syntax                       | ✅                 |
| go               | comment, string, raw string, number, keyword, class, ...        | ✅                 |
| graphql          | comment, string, type, field, directive, variable, ...          | ✅                 |
| html             | doctype, embedded css/js, tag, attribute, ...                   | ✅                 |
| http             | keyword, string, punctuation, variable, version                 | ✅                 |
| ini              | comment, section, key, value, ...                               |                    |
| java             | comment, string, number, keyword, operator, class, ...          | ✅                 |
| javascript (js)  | basic syntax, regex, jsdoc, json, template literals             | ✅                 |
| jsdoc            | tag, type, param name                                           |                    |
| json             | string, number, bool, ...                                       |                    |
| kotlin (kt)      | comment, string, keyword, class, ...                            | ✅                 |
| less             | comment, string, variable, mixin, nesting, ...                  | ✅                 |
| log              | number, string, comment, errors                                 |                    |
| lua              | comment, string, keyword, boolean, number, function, ...        | ✅                 |
| makefile (make)  | comment, variable, target, .PHONY, embedded bash in recipes     | ✅                 |
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

A theme is a plain object that assigns a color to each token type. The same object powers both inline styles and terminal output.

By default, rangi uses its **two bundled themes**: `default` for light mode and `dark` for dark mode. Their colors are inlined with [`light-dark()`][light-dark], so each code block automatically follows the reader's color scheme. These are the only themes included by the main entry point.

All other themes are available from `rangi/themes` and are included in your bundle only when you import them:

```js
import { codeToHtml } from "rangi";
import { githubDark } from "rangi/themes";

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

Each theme is a named export. A custom theme is simply an object:

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

## Tokenizer

`tokenize(code, opt)` is the foundation of the other APIs. It returns raw tokens, giving you full control over how to render them—as JSX, other markup, or any format you need:

```js
import { tokenize } from "rangi";

tokenize("let a = 1", { lang: "js" });
// [
//   { text: "let", type: "kwd" },
//   { text: " a " },
//   { text: "=", type: "oper" },
//   { text: " " },
//   { text: "1", type: "num" }
// ]
```

It accepts the same `lang` and `languages` options as the other entry points. Tokens are returned in source order, and individual tokens are never empty. Their `text` is raw and unescaped, so joining the token text recreates the original input. Unmatched text has no `type`. An unknown language or invalid grammar returns the entire input as one untyped token instead of throwing an error.

The `type` is one of `deleted`, `err`, `var`, `section`, `kwd`, `class`, `cmnt`, `insert`, `type`, `func`, `bool`, `num`, `oper`, `str`, and `esc`. These are the same keys that a [theme](#themes-) uses to assign colors. Themes do not define italics for `cmnt`; that styling is an HTML output convention.

**A token may span multiple lines.** A block comment, template literal, or plain-text segment remains a single token regardless of how many lines it covers. To render line by line, tokenize the complete code **once**, then split the tokens. Tokenizing each line separately silently breaks constructs that cross line boundaries:

```js
// ✗ Tokenize each line in isolation
"const a = 1; /* multi\nline */".split("\n").map((line) => tokenize(line, { lang: "js" }));

// The second line becomes [{ text: "line " }, { text: "*/", type: "oper" }].
// The comment is lost, and `*/` is interpreted as an operator.

// ✓ Tokenize once, then split the tokens
const lines = [[]];
for (const { text, type } of tokenize(code, { lang: "js" })) {
  text.split("\n").forEach((part, i) => {
    if (i) lines.push([]);
    if (part) lines.at(-1).push({ text: part, type });
  });
}
```

## License 📄

[MIT](./LICENSE)

This project is a fork of [Speed Highlight JS](https://github.com/speed-highlight/core) by [matubu](https://mathias.ninja) and its contributors. The original project is dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), while this fork is distributed under the MIT license. See [LICENSE](./LICENSE) for details.

Thanks to [@kamikazechaser](https://github.com/kamikazechaser) for donating the `rangi` package name on npm.
