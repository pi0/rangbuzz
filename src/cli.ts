#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { parseArgs } from "node:util";

import type { ShjTheme } from "./types.ts";

import { codeToAnsi, detectLanguage } from "./index.ts";
import { languages } from "./languages.ts";
import * as themes from "./themes/index.ts";

// the registry knows the aliases, so an extension and a `Dockerfile` style
// name are looked up in it as they are; anything it does not know is detected
// from the code rather than highlighted as a language that does not exist
const language = (file: string, code: string) => {
  const name = basename(file).toLowerCase(),
    lang = extname(name).slice(1) || name;

  return Object.hasOwn(languages, lang) ? lang : detectLanguage(code);
};

const parsedArgs = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: "boolean", short: "h" },
    theme: { type: "string" },
  },
});

const { values: flags, positionals: args } = parsedArgs;
// the module also exports light/dark pairs, which a terminal reads as their
// dark theme: they have no name of their own, and listing one would only be
// another spelling of a theme already here
const themeMap = new Map(
  Object.values(themes)
    .filter((theme): theme is ShjTheme => !("light" in theme))
    .map((theme) => [theme.name, theme]),
);
const theme = flags.theme ? themeMap.get(flags.theme as string) : undefined;
if (flags.theme === "") {
  console.error("rangi: --theme requires a theme name");
  process.exit(1);
}
if (flags.theme && !theme) {
  console.error(`rangi: unknown theme: ${flags.theme}`);
  process.exit(1);
}

if (process.stdin.isTTY && flags.help) {
  const helpMessage = `Usage: rangi [OPTIONS] [files ...]

Options:
  --theme <name>  Use a specified theme (available themes: ${Array.from(themeMap.keys()).join(", ")})
  --help, -h      Show help message
`;
  console.log(helpMessage);
  process.exit(0);
}

const files = args.length ? args : ["-"];
for (let i = 0; i < files.length; i++) {
  const filename = files[i]!;
  try {
    const code = readFileSync(filename === "-" ? 0 : filename, "utf8");
    if (files.length > 1) {
      const line = "─".repeat(process.stdout.columns || 80);
      process.stdout.write(`\x1b[90m${line}\n• ${filename}\n${line}\x1b[0m\n`);
    }
    process.stdout.write(
      codeToAnsi(code, {
        lang: filename === "-" ? detectLanguage(code) : language(filename, code),
        theme,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`rangi: ${filename}: ${message}`);
    process.exitCode = 1;
  }
}
