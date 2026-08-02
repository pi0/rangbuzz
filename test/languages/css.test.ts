import { testLanguage } from "./_harness.ts";

testLanguage("css", {
  comments: `/* block */\n/* TODO: theme */`,
  selectors: `.class,\n#id > a:hover::before {\n  color: red;\n}`,
  strings: `a::after {\n  content: "x";\n  background: url("a.png");\n}`,
  numbers: `.a {\n  width: 10px;\n  opacity: 0.5;\n  z-index: 100;\n  margin: -1em 0 2rem;\n}`,
  "at rules": `@media screen and (min-width: 40em) {\n  .a { display: none }\n}\n\n@import "other.css";`,
  variables: `:root {\n  --main: #fff;\n}\n\n.a {\n  color: var(--main);\n}`,
  functions: `.a {\n  transform: translate(1px, 2px);\n  background: linear-gradient(to top, #fff, #000);\n}`,
});
