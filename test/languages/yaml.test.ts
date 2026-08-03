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
  "block scalar boundaries": `nested:\n  literal: |-\n    # scalar text\n  next: value\nroot: >\n  folded text\n# a comment\nname: "v"`,
  "sequence block scalar boundaries": `- key: |2-\n    scalar\n  next: value\n- - >+\n    nested scalar\n  - next`,
  "block scalar properties": `tagged: !!str >\n  text\n- anchored: &copy |\n    text\n? |\n  block key\n: value`,
  "block scalar lookalikes": `<!-- x -->\n\n# a comment\n\nname: "v"\nnote: a > b`,
  documents: `---\na: 1\n---\nb: 2\n...`,
});
