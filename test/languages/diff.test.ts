import { testLanguage } from "./_harness.ts";

testLanguage("diff", {
  unified: `--- a/file.ts\n+++ b/file.ts\n@@ -1,3 +1,3 @@\n context\n-removed line\n+added line`,
  context: `*** a/file.ts\n--- b/file.ts\n***************\n*** 1,3 ****\n! changed line`,
  normal: `1c1\n< old text\n---\n> new text`,
});
