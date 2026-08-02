import { testLanguage } from "./_harness.ts";

testLanguage("rs", {
  comments: `// line\n/* block */\n/// doc\n//! inner TODO: x`,
  strings: `"double" 'c' "esc\\"aped" b"bytes" b'x'`,
  "raw strings": `r"raw \\d" r#"with "quotes""# br##"bytes"##`,
  escapes: `'\\n' '\\'' '\\u{1F600}'`,
  numbers: `0 42 3.14 1e9 0xff 0b1011 0o17 1_000 1u8 2.0f32`,
  keywords: `pub fn main() -> Result<(), Error> {\n    let mut v = Vec::new();\n    match v.pop() {\n        Some(x) => x,\n        None => return Ok(()),\n    }\n}`,
  types: `struct Point {\n    x: i32,\n}\n\nimpl Display for Point {\n    fn fmt(&self, f: &mut Formatter) {}\n}`,
  lifetimes: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() > b.len() { a } else { b }\n}`,
  macros: `println!("{} {}", a, b);\n#[derive(Debug, Clone)]\nenum E { A, B }`,
  operators: `let z = x + y * 2 - 1;\nif a == b && c != d || !e { z <<= 1 }`,
});
