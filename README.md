# 🎨 rangi

🎨 A tiny syntax highlighter

Rangi is a fork of [Speed Highlight JS](https://github.com/speed-highlight/core).

- **Tiny** <small>(**~13.2kB** min+gzip with every language and the default themes bundled, **~1.5kB** for `codeToHtml` from [`rangi/core`](#core))</small>
- **Fast** <small>(outperforms other highlighters in our benchmarks)</small>
- **Simple** <small>(zero dependencies, fully synchronous, no stylesheet to load by default, and no global registry)</small>
- **Complete** <small>(**46 languages**, 8 themes, language detection, terminal output, and raw tokens for custom rendering)</small>

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

It scores the code against every language it knows and returns the best match, or `plain` when nothing scores high enough. Give it the whole document: some languages are told apart by how they open and close — json has no keyword to go on and is recognised by being a single `{`, `[` or `"` value — so a snippet cut out of the middle scores lower than the same code entire.

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

Every theme with real colors works in the terminal, where they are emitted as 24-bit escape sequences. For a light/dark pair, the terminal uses the dark theme. `codeToAnsi` returns the highlighted string instead of printing it. Colors a terminal cannot be given—anything that is not hex, such as the custom properties of [`cssVariables`](#css-variables)—leave their tokens uncolored rather than producing broken escape sequences.

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

| Name    | Aliases                     | Language detection |
| ------- | --------------------------- | ------------------ |
| asm     |                             | ✅                 |
| astro   |                             | ✅                 |
| bash    | sh, shell, zsh              | ✅                 |
| c       | h                           | ✅                 |
| cpp     | cc, cxx, hpp                | ✅                 |
| cs      | csharp                      | ✅                 |
| css     |                             | ✅                 |
| csv     |                             |                    |
| dart    |                             | ✅                 |
| diff    | patch                       | ✅                 |
| docker  | dockerfile                  | ✅                 |
| go      | golang                      | ✅                 |
| graphql | gql                         | ✅                 |
| html    | htm                         | ✅                 |
| http    |                             | ✅                 |
| ini     |                             |                    |
| java    |                             | ✅                 |
| js      | javascript, mjs, cjs        | ✅                 |
| jsdoc   |                             |                    |
| json    | jsonc, json5, jsonl, ndjson | ✅                 |
| jsx     |                             | ✅                 |
| kt      | kotlin, kts                 | ✅                 |
| less    |                             | ✅                 |
| log     |                             |                    |
| lua     |                             | ✅                 |
| make    | makefile, mk                | ✅                 |
| md      | markdown                    | ✅                 |
| php     |                             | ✅                 |
| pl      | perl                        | ✅                 |
| plain   | text, txt                   |                    |
| ps1     | powershell, pwsh            | ✅                 |
| py      | python                      | ✅                 |
| rb      | ruby                        | ✅                 |
| regex   |                             |                    |
| rs      | rust                        | ✅                 |
| scss    |                             | ✅                 |
| sql     |                             | ✅                 |
| svelte  |                             | ✅                 |
| swift   |                             | ✅                 |
| toml    |                             |                    |
| ts      | typescript, mts, cts        | ✅                 |
| tsx     |                             | ✅                 |
| uri     | url                         | ✅                 |
| vue     |                             | ✅                 |
| xml     | svg                         | ✅                 |
| yaml    | yml                         | ✅                 |

An alias is the same grammar under another name, so it works everywhere the name itself does — as the `lang` option, as the language of a markdown code fence, and as a named export of `rangi/languages`:

```js
codeToHtml(code, { lang: "yml" }); // the same as `lang: "yaml"`

import { python } from "rangi/languages"; // the `py` grammar itself
```

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
| css-variables      | `cssVariables`     |
| github-dark        | `githubDark`       |
| github-dim         | `githubDim`        |
| github-light       | `githubLight`      |
| vercel-dark        | `vercelDark`       |
| vercel-light       | `vercelLight`      |
| visual-studio-dark | `visualStudioDark` |

Each theme is a named export.

Any two themes can be passed together as a `{ light, dark }` pair, which is inlined with `light-dark()` and follows the reader's color scheme just like the default. `vercel` is exported as a ready-made one:

```js
import { codeToHtml } from "rangi";
import { vercel } from "rangi/themes";

// same as { light: vercelLight, dark: vercelDark }
codeToHtml(code, { lang: "js", theme: vercel });
```

A terminal has no color scheme to follow, so `codeToAnsi` reads a pair as its dark theme.

A custom theme is simply an object:

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

### CSS variables

The `cssVariables` theme colors nothing itself. Every slot is a custom property, so the markup stays self-contained—the layout, the font, and the box are still inlined—while the palette resolves from your stylesheet:

```js
import { codeToHtml } from "rangi";
import { cssVariables } from "rangi/themes";

codeToHtml("const a = 1", { lang: "js", theme: cssVariables });
// <div … style="…;background:var(--shj-bg);color:var(--shj-fg);…">
//   <span style="color:var(--shj-kwd)">const</span> a …
```

Define the properties wherever you like—on `:root`, on a container, or per code block—and every block on the page follows:

```css
:root {
  --shj-bg: #161b22;
  --shj-fg: #c9d1d9;
  --shj-numbers: #8b949e; /* falls back to --shj-cmnt */

  --shj-kwd: #ff7b72;
  --shj-deleted: #ff7b72;
  --shj-err: #ff7b72;
  --shj-class: #ffa657;
  --shj-cmnt: #8b949e;
  --shj-bracket: #8b949e;
  --shj-num: #79c0ff;
  --shj-bool: #79c0ff;
  --shj-type: #79c0ff;
  --shj-oper: #79c0ff;
  --shj-section: #79c0ff;
  --shj-var: #79c0ff;
  --shj-str: #a5d6ff;
  --shj-esc: #a5d6ff;
  --shj-func: #d2a8ff;
  --shj-insert: #98c379;
}
```

A property you leave undefined is not an error: the declaration is simply dropped and the token inherits the block's `--shj-fg`. Because the values are resolved by the browser, this theme is the one way to switch palettes—media queries, a `data-theme` attribute, a class on `<html>`—without re-running the highlighter. It is also the one theme that cannot color a terminal.

For markup with no `style` attribute at all, see [CSS classes](#css-classes) instead.

[light-dark]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark

## CSS classes

Pass `classes: true` to emit class names instead of inline styles. The output then carries **no `style` attribute anywhere**, which makes it the smallest markup rangi can produce and hands every decision to your stylesheet:

```js
import { codeToHtml } from "rangi";

codeToHtml("const a = 1", { lang: "js", classes: true });
// <div class="shj shj-lang-js shj-oneline" data-lang="js">
//   <span class="shj-kwd">const</span> a
//   <span class="shj-oper">=</span> <span class="shj-num">1</span>
// </div>
```

The `theme` option is unused in this mode, and `rangi/core` stops requiring one:

```js
import { codeToHtml } from "rangi/core";
import { js } from "rangi/languages";

codeToHtml(code, { lang: "js", languages: { js }, classes: true });
```

**Nothing is styled until you supply the CSS**—including `white-space: pre`, without which the code collapses onto one line. These are all the class names emitted:

| Class                                      | Element                                                          |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `shj`                                      | Every block, inline or not                                       |
| `shj-lang-<lang>`                          | The language, escaped                                            |
| `shj-inline` `shj-oneline` `shj-multiline` | The display mode                                                 |
| `shj-scroll`                               | The scroll container of a multiline block                        |
| `shj-numbers`                              | The line-number gutter, one `<div>` per line                     |
| `shj-code`                                 | The code beside the gutter                                       |
| `shj-<type>`                               | One per token type, e.g. `shj-kwd` (see [Tokenizer](#tokenizer)) |

This stylesheet reproduces the default appearance. Drop the palette and keep the structure if you only want your own colors:

```css
.shj {
  white-space: pre;
  box-sizing: border-box;
  max-width: min(100%, 100vw);
  font:
    normal 18px Consolas,
    "Courier New",
    Monaco,
    "Andale Mono",
    "Ubuntu Mono",
    monospace;
  line-height: 24px;
  color-scheme: light dark;
  background: light-dark(#fff, #1a1a1c);
  color: light-dark(#112, #f8f8f2);
  box-shadow: 0 0 5px #0001;
  text-shadow: none;
}
.shj-inline {
  display: inline-block;
  margin: 0;
  padding: 2px 5px;
  border-radius: 5px;
}
.shj-oneline,
.shj-multiline {
  margin: 10px 0;
  border-radius: 10px;
}
.shj-oneline {
  padding: 12px 10px;
}
.shj-multiline {
  padding: 30px 20px;
}

.shj-scroll {
  display: flex;
  overflow: auto;
}
.shj-numbers {
  padding-left: 5px;
  padding-right: 10px;
  text-align: right;
  opacity: 0.5;
  user-select: none;
  color: light-dark(#999, #7d828b);
}
.shj-code {
  flex: 1;
  outline: none;
}

.shj-deleted {
  color: light-dark(#f44, #ff5261);
}
.shj-err {
  color: light-dark(#e16, #ff5261);
}
.shj-var {
  color: light-dark(#f44, #ff5261);
}
.shj-section {
  color: light-dark(#84f, #ff7cc6);
}
.shj-kwd {
  color: light-dark(#e16, #ff7cc6);
}
.shj-class {
  color: light-dark(#f60, #eab07c);
}
.shj-insert {
  color: light-dark(#7d8, #71d58a);
}
.shj-type {
  color: light-dark(#5af, #71d58a);
}
.shj-func {
  color: light-dark(#84f, #71d58a);
}
.shj-bool {
  color: light-dark(#3bf, #71d58a);
}
.shj-num {
  color: light-dark(#f60, #b581fd);
}
.shj-oper {
  color: light-dark(#5af, #80c6ff);
}
.shj-str {
  color: light-dark(#7d8, #4dacfa);
}
.shj-cmnt {
  color: light-dark(#999, #7d828b);
  font-style: italic;
}
.shj-bracket {
  color: light-dark(#999, #7d828b);
}

/* the badge the inline-style mode gives a one-line HTTP request */
.shj-lang-http.shj-oneline .shj-kwd {
  background: #25f;
  color: #fff;
  padding: 5px 7px;
  border-radius: 5px;
}
```

Two things the inline-style mode does for you have to be written down here, because they are conventions of that output rather than theme data: the italic on `.shj-cmnt`, and the HTTP method badge. There is no `.shj-esc` rule above for the same reason the bundled themes have no `esc` color—it inherits—but the class is emitted, so you can style it.

The markup is the same in both modes, so the two are interchangeable per call: render `classes: true` where a stylesheet is already loaded, and inline the theme in the one email or RSS body that cannot have one.

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

The `type` is one of `deleted`, `err`, `var`, `section`, `kwd`, `class`, `cmnt`, `insert`, `type`, `func`, `bool`, `num`, `oper`, `str`, `esc`, and `bracket`. These are the same keys that a [theme](#themes-) uses to assign colors. Themes do not define italics for `cmnt`; that styling is an HTML output convention.

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
