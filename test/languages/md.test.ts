import { testLanguage } from "./_harness.ts";

testLanguage(
  "md",
  {
    headings: `# One\n\n## Two ##\n\nThree\n===\n\nFour\n---`,
    emphasis: `*italic* **bold** _under_ ~~struck~~`,
    "inline code": "use `const a = 1` here",
    "fenced code": "```js\nconst a = 1; // c\n```",
    "fenced code with metadata":
      '```js [file.js] {1,3-5} twoslash diff title="x"\nconst a = 1\n```',
    "fenced without language": "```\nplain text\n```",
    quotes: `> quoted line\n> more`,
    lists: `* one\n* two\n\n1. first\n2. second`,
    links: `[text](https://a.b) and <https://c.d>`,
  },
  [
    {
      text: "> quoted line",
      judges: "other",
      shj: "cmnt",
      why: "block quotes are deliberately colored as comments",
    },
    {
      text: "> more",
      judges: "other",
      shj: "cmnt",
      why: "block quotes are deliberately colored as comments",
    },
    {
      text: "`const a = 1`",
      judges: "other",
      shj: "str",
      why: "inline code is colored as a string; the judges give it a markup class of its own",
    },
  ],
);
