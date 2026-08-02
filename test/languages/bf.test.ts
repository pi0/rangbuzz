import { testLanguage } from "./_harness.ts";

testLanguage("bf", {
  program: `++++++++[>++++[>++>+++<<-]>+>>+<<<-]>>.`,
  loops: `+[->+<]`,
  output: `.....`,
  comments: `+ this text is a comment in brainfuck\n-`,
});
