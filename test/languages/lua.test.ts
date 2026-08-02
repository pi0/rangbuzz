import { testLanguage } from "./_harness.ts";

testLanguage("lua", {
  comments: `-- line\n--[[ block\nspanning ]]\n-- TODO: refactor`,
  strings: `local s = "double"\nlocal t = 'single'\nlocal u = "esc\\"aped"`,
  numbers: `local a = 0\nlocal b = 42\nlocal c = 3.14\nlocal d = 0xff\nlocal e = 1e-9`,
  keywords: `local function f(x)\n  if x then\n    return x\n  elseif y then\n    for i = 1, 10 do end\n  else\n    while true do break end\n  end\nend`,
  booleans: `local t = true\nlocal f = false\nlocal n = nil`,
  functions: `print(string.format("%d", 1))\ntable.insert(t, v)`,
  operators: `local x = a + b * c\nif a ~= b and c or not d then end\nlocal s = "a" .. "b"`,
});
