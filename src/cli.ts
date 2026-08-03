#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

import { codeToAnsi, detectLanguage } from "./index.ts";

const aliases: Record<string, string> = {
  cjs: "js",
  cts: "ts",
  cxx: "cpp",
  gql: "graphql",
  h: "c",
  hpp: "cpp",
  htm: "html",
  jsx: "js",
  markdown: "md",
  mjs: "js",
  mts: "ts",
  patch: "diff",
  sh: "bash",
  svg: "xml",
  tsx: "ts",
  txt: "plain",
  yml: "yaml",
};

const language = (file: string, code: string) => {
  const name = basename(file).toLowerCase();
  if (name === "dockerfile") return "docker";
  if (name === "makefile") return "make";

  const extension = extname(name).slice(1);
  return aliases[extension] || extension || detectLanguage(code);
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
