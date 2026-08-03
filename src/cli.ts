#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

import { codeToAnsi, detectLanguage } from "./index.ts";
import { languages } from "./languages.ts";

// the registry knows the aliases, so an extension and a `Dockerfile` style
// name are looked up in it as they are; anything it does not know is detected
// from the code rather than highlighted as a language that does not exist
const language = (file: string, code: string) => {
  const name = basename(file).toLowerCase(),
    lang = extname(name).slice(1) || name;

  return Object.hasOwn(languages, lang) ? lang : detectLanguage(code);
};

const files = process.argv.slice(2);
if (!files.length && process.stdin.isTTY) {
  console.log("Usage: rangi [file ...]\n       command | rangi");
  process.exit(0);
}

for (const file of files.length ? files : ["-"]) {
  try {
    const code = readFileSync(file === "-" ? 0 : file, "utf8");
    process.stdout.write(
      codeToAnsi(code, { lang: file === "-" ? detectLanguage(code) : language(file, code) }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`rangi: ${file}: ${message}`);
    process.exitCode = 1;
  }
}
