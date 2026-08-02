import { testLanguage } from "./_harness.ts";

testLanguage(
  "md",
  {
    headings: `# One\n\nTwo\n===\n\nThree\n---`,
    emphasis: `*italic* **bold** _under_ ~~struck~~`,
    "inline code": "use `const a = 1` here",
    "fenced code": "```js\nconst a = 1; // c\n```",
    "fenced without language": "```\nplain text\n```",
    quotes: `> quoted line\n> more`,
    lists: `* one\n* two\n\n1. first\n2. second`,
    links: `[text](https://a.b) and <https://c.d>`,
  },
  [
    {
      text: "===",
      judges: "other",
      shj: "cmnt",
      why: "a setext underline is colored like the comment it visually is",
    },
    {
      text: "---",
      judges: "other",
      shj: "cmnt",
      why: "a setext underline is colored like the comment it visually is",
    },
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
