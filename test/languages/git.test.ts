import { testLanguage } from "./_harness.ts";

testLanguage("git", {
  log: `commit 9fceb02684dcd53cbb0e07e2a0f9a0f9a0f9a0f9\nAuthor: A <a@b.c>\nDate:   Mon Jan 1 00:00:00 2024\n\n    fix the "quoted" thing`,
  commands: `$ git status\ngit commit -m "a message"`,
  comments: `# On branch main\n# Changes not staged for commit:`,
  diff: `diff --git a/f b/f\n--- a/f\n+++ b/f\n@@ -1 +1 @@\n-old\n+new`,
});
