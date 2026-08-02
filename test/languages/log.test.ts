import { testLanguage } from "./_harness.ts";

testLanguage(
  "log",
  {
    comments: `# a log header`,
    levels: `2024-01-01 12:00:00 ERROR request failed\n2024-01-01 12:00:01 WARN retrying\n2024-01-01 12:00:02 INFO ok`,
    errors: `NullPointerException: not found\nfatal: invalid state\nalert: ko`,
    strings: `request "GET /a" completed`,
    numbers: `took 1.5s, status 200, retries 3`,
    booleans: `cached: true, stale: false, verbose: yes, quiet: no`,
    nullish: `value: null, other: undefined`,
  },
  [
    {
      text: "# a log header",
      judges: "other",
      shj: "cmnt",
      why: "a leading `#` marks a comment; neither judge gives a log file comments",
    },
  ],
);
