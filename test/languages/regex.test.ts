import { testLanguage } from "./_harness.ts";

testLanguage(
  "regex",
  {
    anchors: `/^start.end$/`,
    classes: `/[a-z0-9_]+[^abc]/`,
    quantifiers: `/a*b+c{2,4}/`,
    escapes: `/\\d\\w\\s\\.\\//`,
    alternation: `/one|two|three/`,
    comments: `a plain line is not a regex\n/^ok$/`,
  },
  [
    {
      text: "a plain line is not a regex",
      judges: "other",
      shj: "cmnt",
      why: "a line that does not start with `/` is prose around the pattern, so it is routed through `todo` and colored as a comment",
    },
  ],
);
