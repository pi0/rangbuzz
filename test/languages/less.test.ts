import { testLanguage } from "./_harness.ts";

testLanguage(
  "less",
  {
    comments: `// a line comment\n/* a block comment\n   over two lines */\n\n// TODO: drop the fallback\n.a {\n  color: red; // trailing\n}`,
    strings: `@family: "Helvetica Neue", Arial, sans-serif;\n@sep: '/';\n\n.a::after {\n  content: "\\201C";\n  content: "side is @{side}";\n  filter: ~"ms:alpha(opacity=50)";\n  height: ~\`document.body.clientHeight\`;\n}`,
    variables: `@primary: #3498db;\n@radius: 4px;\n@shadow: 0 2px 4px rgba(0, 0, 0, 0.25);\n@which: primary;\n\n.a {\n  background: red;\n  border-radius: @radius;\n  box-shadow: @shadow;\n  color: $background;\n  font-weight: @@which;\n}`,
    interpolation: `@prop: margin;\n@side: top;\n@base: "../img";\n\n.box-@{side} {\n  @{prop}-@{side}: 10px;\n  border-@{side}: 1px solid;\n  background: url("@{base}/bg.png");\n}\n\n@media (min-width: @sm) {\n  .a { display: none; }\n}`,
    urls: `.a {\n  background: url(//cdn.example.com/bg.png) no-repeat;\n  background-image: url(@{base}/hero.png);\n  src: url("inter.woff2") format("woff2");\n}`,
    nesting: `.card {\n  padding: 1rem;\n\n  &__title {\n    font-size: 1.25rem;\n  }\n\n  &--wide { width: 100%; }\n\n  &:hover,\n  &:focus-visible {\n    box-shadow: 0 0 0 2px currentColor;\n  }\n\n  h2 + p { margin-top: 0; }\n}`,
    selectors: `*,\n*::before {\n  box-sizing: border-box;\n}\n\nul > li:not(.active) ~ li {\n  color: inherit;\n}\n\ninput[type="checkbox"]:checked + label {\n  font-weight: 700;\n}\n\n#main .nav a:hover {\n  text-decoration: underline !important;\n}`,
    mixins: `.rounded(@r: 4px) {\n  border-radius: @r;\n}\n\n.bordered(@color) when (iscolor(@color)) {\n  border: 1px solid @color;\n}\n\n#ns {\n  .button() {\n    display: inline-block;\n  }\n}\n\n.a {\n  .rounded();\n  .rounded(8px) !important;\n  #ns > .button();\n  &:extend(.b all);\n}`,
    "detached rulesets": `@detached: {\n  background: red;\n};\n\n.a {\n  @detached();\n}\n\n.theme(@dark) when (@dark = true) {\n  color: #fff;\n}\n\n.theme(@dark) when not (@dark) {\n  color: #111;\n}`,
    functions: `@w: 100px;\n@half: (@w / 2);\n@gap: @w + 10px;\n\n.a {\n  width: unit(5, px);\n  height: percentage(0.5);\n  color: fade(@primary, 50%);\n  content: e("no-quotes");\n  margin: @gap * 2 @half;\n}`,
    "at rules": `@import (reference) "mixins.less";\n@import "theme";\n@plugin "my-plugin";\n\n@media screen and (min-width: 40em) {\n  .a { display: none; }\n}\n\n@supports (display: grid) {\n  .grid { display: grid; }\n}\n\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n@font-face {\n  font-family: "Inter";\n  src: url("inter.woff2") format("woff2");\n}\n\n:root {\n  --main: #fff;\n}\n\n.a { color: var(--main); }`,
  },
  [
    {
      // Shiki does give it its own `variable.other.readwrite` scope, nested in
      // the string one; the coarse alphabet the judges are compared in only
      // keeps the outermost of the two, so it reads as plain string here
      text: "@{side}",
      judges: "str",
      shj: "other",
      why: "an interpolation is code, not text: it is highlighted inside the string rather than swallowed by it",
    },
    {
      text: "`document.body.clientHeight`",
      judges: "other",
      shj: "str",
      why: "neither judge knows the backtick JavaScript evaluation of Less; it is a literal blob and is colored as one",
    },
    {
      // Prism leaves an unquoted url path unhighlighted, Shiki calls it a
      // string — and here the two happen to agree, since Shiki hands the
      // interpolation to its variable rule instead
      text: "@{base}",
      judges: "other",
      shj: "str",
      why: "the path of a `url()` is a string whatever it is written with, and a quoted one would have to be highlighted the same way",
    },
  ],
);
