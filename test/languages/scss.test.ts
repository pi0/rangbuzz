import { testLanguage } from "./_harness.ts";

testLanguage(
  "scss",
  {
    comments: `// a line comment\n/* a block comment\n   over two lines */\n\n// TODO: drop the fallback\n.a {\n  color: red; // trailing\n}`,
    strings: `@use "sass:math";\n\n$font: "Helvetica Neue", Arial, sans-serif;\n$sep: '/';\n\n.a::after {\n  content: "\\201C";\n  background: url("img/bg.png") no-repeat;\n}`,
    variables: `$primary: #3498db !default;\n$radius: 4px;\n$shadow: 0 2px 4px rgba(0, 0, 0, 0.25);\n$enabled: true !global;\n$fallback: null;\n\n.a {\n  border-radius: $radius;\n  box-shadow: $shadow;\n}`,
    maps: `$breakpoints: (\n  "sm": 576px,\n  "md": 768px,\n  "lg": 992px\n);\n\n$theme: (primary: #333, secondary: #666);\n\n.a {\n  width: map.get($breakpoints, "md");\n}`,
    nesting: `.card {\n  padding: 1rem;\n\n  &__title {\n    font-size: 1.25rem;\n  }\n\n  &--wide { width: 100%; }\n\n  &:hover,\n  &:focus-visible {\n    box-shadow: 0 0 0 2px currentColor;\n  }\n\n  h2 + p { margin-top: 0; }\n}`,
    selectors: `*,\n*::before {\n  box-sizing: border-box;\n}\n\nul > li:not(.active) ~ li {\n  color: inherit;\n}\n\ninput[type="checkbox"]:checked + label {\n  font-weight: 700;\n}\n\n#main .nav a:hover {\n  text-decoration: underline !important;\n}`,
    mixins: `@mixin flex($dir: row, $gap: 0) {\n  display: flex;\n  flex-direction: $dir;\n  gap: $gap;\n  @content;\n}\n\n.row {\n  @include flex($dir: column) {\n    align-items: center;\n  }\n}`,
    placeholders: `%btn-base {\n  border: 0;\n  cursor: pointer;\n}\n\n.btn-primary {\n  @extend %btn-base;\n  background: $primary;\n}`,
    conditionals: `@mixin theme($mode) {\n  @if $mode == dark {\n    background: #111;\n  } @else if $mode == light {\n    background: #fff;\n  } @else {\n    background: transparent;\n  }\n}\n\n@at-root .a { color: red; }\n\n@debug "mode is #{$mode}";\n@warn "deprecated";\n@error "unreachable";`,
    loops: `@each $name, $color in $palette {\n  .text-#{$name} {\n    color: $color;\n  }\n}\n\n@for $i from 1 through 3 {\n  .mt-#{$i} { margin-top: $i * 4px; }\n}\n\n@while $i > 0 {\n  $i: $i - 1;\n}`,
    functions: `@use "sass:math";\n\n@function rem($px, $base: 16px) {\n  @return math.div($px, $base) * 1rem;\n}\n\n.a {\n  width: calc(100% - #{$gutter});\n  color: rgba(0, 0, 0, 0.5);\n  margin: rem(24px) auto;\n  transform: translate(1px, 2px) rotate(45deg);\n}`,
    interpolation: `$prop: margin;\n$side: top;\n\n.box-#{$side} {\n  #{$prop}-#{$side}: 10px;\n  border-#{$side}: 1px solid;\n}\n\n@media (min-width: #{$sm}) {\n  .a { display: none; }\n}`,
    modules: `@use "config" as cfg;\n@use "sass:map" with ($base: 12px);\n@forward "buttons" show %btn-base, $btn-gap;\n\n.a {\n  padding: cfg.$gutter;\n}`,
    "at rules": `@import "reset";\n\n@media screen and (min-width: 40em) {\n  .a { display: none; }\n}\n\n@supports (display: grid) {\n  .grid { display: grid; }\n}\n\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n@font-face {\n  font-family: "Inter";\n  src: url("inter.woff2") format("woff2");\n}\n\n:root {\n  --main: #fff;\n}\n\n.a { color: var(--main); }`,
  },
  [
    {
      // Prism folds the whole attribute selector into one selector token, and
      // Shiki keeps the quotes but not what they hold, so the two only agree on
      // the word itself
      text: "checkbox",
      judges: "other",
      shj: "str",
      why: "the quoted value of an attribute selector is a string like any other, the judges fold it into the selector",
    },
  ],
);
