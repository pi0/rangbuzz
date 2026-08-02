import { testLanguage } from "./_harness.ts";

testLanguage("c", {
  comments: `// line\n/* block\nspanning */\n// FIXME: later`,
  includes: `#include <stdio.h>\n#include "local.h"\n#define MAX 10`,
  strings: `"double" 'c' "esc\\"aped" "tab\\there"`,
  numbers: `0 42 3.14f 1e-9 0xff 0777 1UL`,
  keywords: `static const unsigned int x = 0;\nfor (int i = 0; i < 10; ++i) {\n  if (i) continue;\n  else break;\n}`,
  types: `typedef struct Node {\n  struct Node *next;\n} Node;\n\nenum Color { RED, GREEN };`,
  functions: `int main(void) {\n  printf("%d\\n", add(1, 2));\n  return 0;\n}`,
  operators: `a = b + c * d / e % f;\nx = y == z ? p && q : ~r ^ s;\nptr->field = *val;`,
});
