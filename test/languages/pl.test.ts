import { testLanguage } from "./_harness.ts";

testLanguage("pl", {
  comments: `# a comment\nmy $x = 1;  # TODO: rename`,
  strings: `my $s = "double $var";\nmy $t = 'single';\nprint "esc\\"aped";`,
  numbers: `my $a = 0;\nmy $b = 42;\nmy $c = 3.14;\nmy $d = 0xff;`,
  keywords: `use strict;\nmy @list = (1, 2);\nforeach my $i (@list) {\n  next if $i;\n  last unless $i;\n}\nsub f { return 1 }`,
  functions: `print join(",", sort keys %h);\npush(@a, 1);`,
  operators: `$x = $y + $z * 2;\nif ($a eq "b" && $c != 1) { $s .= "x" }`,
});
