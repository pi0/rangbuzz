import { testLanguage } from "./_harness.ts";

testLanguage("java", {
  comments: `// line\n/* block */\n/** javadoc */\n// XXX: revisit`,
  strings: `"double" 'c' "esc\\"aped" "unicode \\u00e9"`,
  numbers: `0 42 3.14 1e-9 0xff 0b1011 1_000 10L 2.5f`,
  keywords: `public static final int X = 1;\n\nprivate synchronized void run() throws IOException {\n  try {\n    while (true) break;\n  } catch (Exception e) {\n  } finally {\n  }\n}`,
  classes: `package com.example;\n\nimport java.util.List;\n\npublic class Main extends Base implements Runnable {\n  private List<String> items = new ArrayList<>();\n}`,
  functions: `int sum(int a, int b) {\n  return Math.max(a, b);\n}`,
  operators: `a = b + c * d;\nif (x != null && y instanceof String || !z) i++;`,
});
