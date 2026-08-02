import { testLanguage } from "./_harness.ts";

testLanguage(
  "rs",
  {
    comments: `// line\n/* block */\n/// doc\n//! inner TODO: x`,
    strings: `"double" 'c' "esc\\"aped" b"bytes"`,
    numbers: `0 42 3.14 1e9 0xff 0b1011 0o17 1_000 1u8 2.0f32`,
    keywords: `pub fn main() -> Result<(), Error> {\n    let mut v = Vec::new();\n    match v.pop() {\n        Some(x) => x,\n        None => return Ok(()),\n    }\n}`,
    types: `struct Point {\n    x: i32,\n}\n\nimpl Display for Point {\n    fn fmt(&self, f: &mut Formatter) {}\n}`,
    lifetimes: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() > b.len() { a } else { b }\n}`,
    macros: `println!("{} {}", a, b);\n#[derive(Debug, Clone)]\nenum E { A, B }`,
    operators: `let z = x + y * 2 - 1;\nif a == b && c != d || !e { z <<= 1 }`,
  },
  [
    // a lifetime opens a character literal that only closes at the next quote,
    // so everything between two lifetimes is painted as a string
    {
      text: "'a>(a",
      judges: "other",
      shj: "str",
      why: "`'a` is read as an unterminated character literal, swallowing the text up to the next lifetime",
      bug: true,
    },
    { text: "'", judges: "other", shj: "str", why: "same lifetime confusion", bug: true },
    { text: "'a ", judges: "other", shj: "str", why: "same lifetime confusion", bug: true },
    { text: ") ", judges: "other", shj: "str", why: "same lifetime confusion", bug: true },
    {
      text: "b",
      judges: "str",
      shj: "other",
      why: 'the `b` of a `b"…"` byte string is left out of the literal',
      bug: true,
    },
  ],
);
