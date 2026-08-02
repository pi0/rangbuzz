import { testLanguage } from "./_harness.ts";

testLanguage("yaml", {
  comments: `# a comment\nkey: value # TODO: check`,
  mappings: `name: app\nnested:\n  a: 1\n  b: two`,
  strings: `single: 'quoted'\ndouble: "quoted"\nplain: unquoted text`,
  numbers: `int: 42\nfloat: 3.14\nnegative: -1\nversion: 1.2.3`,
  // only the capitalized spellings are matched as booleans
  booleans: `on: Yes\noff: No\nlower: true\nnothing: null`,
  tags: `date: !!timestamp 2024-01-01\nblob: !!binary abc`,
  sequences: `list:\n  - one\n  - two\ninline: [1, 2, 3]\nmap: { a: 1 }`,
  anchors: `base: &anchor\n  a: 1\nderived:\n  <<: *anchor`,
  "block scalars": `literal: |\n  raw line\nfolded: >\n  folded line`,
  documents: `---\na: 1\n---\nb: 2\n...`,
});
