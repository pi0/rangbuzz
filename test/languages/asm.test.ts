import { testLanguage } from "./_harness.ts";

testLanguage("asm", {
  comments: `; semicolon comment\n# hash comment`,
  directives: `section .data\nglobal _start`,
  instructions: `\tmov eax, 1\n\tint 0x80\n\tret`,
  strings: `msg db "hello", 0xa`,
  numbers: `\tmov ebx, 42\n\tadd ecx, 0xff`,
  operands: `\tmovl $0x1, %eax`,
  memory: `\tmov eax, [ebx+8]\n\tmovl (%esp), %eax`,
});
