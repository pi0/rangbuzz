import { testLanguage } from "./_harness.ts";

testLanguage("cpp", {
  comments: `// line\n/* block\nspanning */\n// TODO: later`,
  includes: `#include <iostream>\n#include "local.hpp"\n#define MAX 10`,
  strings: `"double" 'c' "esc\\"aped" u8"utf8" L'w' U"wide"`,
  raw: `auto s = R"(no \\escape "here")";\nauto d = R"delim(ends )not" here)delim";`,
  numbers: `0 42 3.14f 1e-9 0xff 1'000'000 1UL 0b1010`,
  keywords: `constexpr auto x = 0;\nfor (int i = 0; i < 10; ++i) {\n  if (i) continue;\n  else break;\n}`,
  bools: `bool ok = true;\nbool no = false;\nint *p = nullptr;`,
  classes: `namespace app {\nclass Widget : public Base {\npublic:\n  virtual ~Widget() noexcept;\n};\n}`,
  templates: `template <typename T>\nstd::vector<T> wrap(const T &value) {\n  return std::vector<T>{value};\n}`,
  functions: `int main() {\n  std::cout << add(1, 2) << std::endl;\n  return 0;\n}`,
  operators: `a = b + c * d / e % f;\nx = y == z ? p && q : ~r ^ s;\nptr->field = *val;\nobj::member = 1;`,
});
