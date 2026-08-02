import { testLanguage } from "./_harness.ts";

// no judge has a counterpart for plain text: it is covered by the snapshot and
// the invariants only
testLanguage("plain", {
  text: `just some words\nover two lines`,
  quoted: `a "quoted" span stays a string`,
  "no other rule": `# not a comment, 42 not a number, const not a keyword`,
});
