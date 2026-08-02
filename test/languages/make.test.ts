import { testLanguage } from "./_harness.ts";

testLanguage("make", {
  comments: `# a comment\n# TODO: parallel builds`,
  targets: `.PHONY: all clean\n\nall: build test\n\nclean:\n\trm -rf dist`,
  variables: `CC = gcc\nFLAGS = -O2\n\nbuild:\n\t$(CC) $(FLAGS) -o out main.c`,
  strings: `greet:\n\techo "hello"`,
  conditionals: `ifneq ($(OS),Windows_NT)\nSHELL = /bin/sh\nendif`,
  numbers: `JOBS = 4\n\nrun:\n\tmake -j 4`,
});
