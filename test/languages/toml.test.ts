import { testLanguage } from "./_harness.ts";

testLanguage("toml", {
  comments: `# a comment\nkey = 1 # TODO: tune`,
  tables: `[package]\nname = "app"\n\n[dependencies.serde]\nversion = "1"`,
  strings: `basic = "double"\nliteral = 'single'\nmulti = """\nspanning\n"""`,
  numbers: `int = 42\nfloat = 3.14\nhex = 0xff\nexp = 1e6\ninf = inf\nnan = nan`,
  booleans: `yes = true\nno = false`,
  dates: `date = 1979-05-27\ndatetime = 1979-05-27T07:32:00Z`,
  arrays: `list = [1, 2, 3]\ninline = { a = 1, b = "x" }`,
});
