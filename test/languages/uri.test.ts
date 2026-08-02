import { testLanguage } from "./_harness.ts";

testLanguage(
  "uri",
  {
    url: `https://example.com/path/to/page`,
    query: `https://example.com/search?q=term&page=2`,
    port: `http://localhost:8080/api`,
    fragment: `https://example.com/doc#section`,
    mail: `mailto:user.name@example.com`,
    comments: `# a note\nhttps://example.com`,
  },
  [
    {
      text: "# a note",
      judges: "other",
      shj: "cmnt",
      why: "a `#` line is a note next to the uri, which Prism has no notion of",
    },
  ],
);
