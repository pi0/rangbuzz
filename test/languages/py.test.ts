import { testLanguage } from "./_harness.ts";

testLanguage(
  "py",
  {
    comments: `# line\nx = 1  # TODO: trailing`,
    strings: `"double" 'single' "esc\\"aped" r"raw\\d" b"bytes"`,
    "f-strings": `f"{a!r} and {b:>10}"\nf'{x}'\nf"""{y}\n{z}"""`,
    docstrings: `def f():\n    """One line.\n\n    More text.\n    """`,
    numbers: `0 42 3.14 1e-9 0xff 0b101 0o17 1_000 2j`,
    keywords: `async def fetch(url):\n    async with session() as s:\n        return await s.get(url)`,
    "control flow": `for i in range(3):\n    if i in xs and not done:\n        continue\n    elif i is None:\n        break\nelse:\n    pass`,
    booleans: `True False None`,
    classes: `class Foo(Bar, metaclass=Meta):\n    def __init__(self):\n        super().__init__()`,
    operators: `a = b + c * d // e % f ** g\nx = y != z <= w\nlambda q: q @ r`,
  },
  [
    // triple quoted text is routed through the `todo` sub-language, which types
    // whatever it does not claim as a comment: a docstring reads as prose, so
    // it is colored like one
    {
      text: '"""One line.',
      judges: "str",
      shj: "cmnt",
      why: "docstrings are deliberately colored as comments, not as strings",
    },
    {
      text: "    More text.",
      judges: "str",
      shj: "cmnt",
      why: "docstrings are deliberately colored as comments, not as strings",
    },
    {
      text: '    """',
      judges: "str",
      shj: "cmnt",
      why: "docstrings are deliberately colored as comments, not as strings",
    },
  ],
);
