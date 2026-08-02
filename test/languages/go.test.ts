import { testLanguage } from "./_harness.ts";

testLanguage(
  "go",
  {
    comments: `// line\n/* block\nspanning lines */\nx // TODO: trailing`,
    strings: `"double" 'r' "esc\\"aped" \`raw\``,
    numbers: `0 42 0xff 0b1011 0o17 1e9 1.5 3i`,
    keywords: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfor i := range 3 {\n\t\tdefer fmt.Println(i)\n\t}\n}`,
    "types and calls": `type Reader interface {\n\tRead(p []byte) (n int, err error)\n}\n\nvar w Writer = os.Stdout`,
    operators: `a := b + c*d\nif a != 0 && b <= 1 || !ok {\n\tch <- v\n}`,
  },
  [
    {
      text: "`raw`",
      judges: "str",
      shj: "other",
      why: "go.ts has no raw string literal rule, only `expand: str` for ' and \"",
      bug: true,
    },
  ],
);
