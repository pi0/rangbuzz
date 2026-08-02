import { testLanguage } from "./_harness.ts";

testLanguage("html", {
  comments: `<!-- a comment -->\n<!-- TODO: fill in -->`,
  elements: `<!doctype html>\n<html lang="en">\n  <body>\n    <p>text</p>\n  </body>\n</html>`,
  attributes: `<a href="https://a.b" data-x='y' disabled>link</a>`,
  "inline css": `<style>\n  .a { color: red; }\n</style>`,
  "inline js": `<script>\n  const a = "x"; // c\n</script>`,
  entities: `<p>a &amp; b &lt; c</p>`,
});
