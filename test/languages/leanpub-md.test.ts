import { testLanguage } from "./_harness.ts";

// markdown plus the leanpub insert/delete markers; no judge models the dialect
testLanguage("leanpub-md", {
  insert: `leanpub-start-insert\nconst a = 1;\nleanpub-end-insert`,
  delete: `leanpub-start-delete\nconst b = 2;\nleanpub-end-delete`,
  markdown: `# heading\n\n*italic* **bold** \`code\` ~~struck~~\n\n> quote\n\n[text](https://a.b)`,
  "fenced code": "```js\nconst a = 1;\n```",
  mixed: `text before\n\nleanpub-start-insert\nSELECT * FROM t;\nleanpub-end-insert\n\ntext after`,
});
