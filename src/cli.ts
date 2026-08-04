#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

import type { ShjTheme, ShjThemeName } from "./types.ts";
import { codeToAnsi, detectLanguage } from "./index.ts";
import { languages } from "./languages.ts";

// each theme is its own module, loaded only when asked for.
const themes = {
  "atom-dark": () => import("./themes/atom-dark.ts"),
  "css-variables": () => import("./themes/css-variables.ts"),
  dark: () => import("./themes/dark.ts"),
  default: () => import("./themes/default.ts"),
  "github-dark": () => import("./themes/github-dark.ts"),
  "github-dim": () => import("./themes/github-dim.ts"),
  "github-light": () => import("./themes/github-light.ts"),
  "visual-studio-dark": () => import("./themes/visual-studio-dark.ts"),
} satisfies Record<ShjThemeName, () => Promise<{ default: ShjTheme }>>;

// the registry knows the aliases, so an extension and a `Dockerfile` style
// name are looked up in it as they are; anything it does not know is detected
// from the code rather than highlighted as a language that does not exist
const language = (file: string, code: string) => {
  const name = basename(file).toLowerCase(),
    lang = extname(name).slice(1) || name;

  return Object.hasOwn(languages, lang) ? lang : detectLanguage(code);
};

const args = process.argv.slice(2);
const flags = {
  help: false,
  theme: undefined as ShjThemeName | undefined,
  files: new Array<string>(),
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--theme" || arg.startsWith("--theme=")) {
    const name = arg === "--theme" ? args[++i] : arg.slice("--theme=".length);
    if (!name) {
      console.error("rangi: --theme requires a theme name");
      process.exit(1);
    }
    if (!Object.hasOwn(themes, name)) {
      console.error(`rangi: unknown theme: ${name}`);
      process.exit(1);
    }
    flags.theme = name as ShjThemeName;
    continue;
  }
  if (arg === "--help" || arg === "-h") {
    flags.help = true;
    continue;
  }
  if (arg.startsWith("-") && arg !== "-") {
    console.error(`rangi: unknown option: ${arg}`);
    process.exit(1);
  }
  flags.files.push(arg);
}

if (process.stdin.isTTY && (!flags.files.length || flags.help)) {
  const helpMessage = `Usage: rangi [OPTIONS] [files ...]

Options:
  --theme <name>  Use a specified theme (available themes: ${Object.keys(themes).join(", ")})
  --help, -h      Show help message
`;
  console.log(helpMessage);
} else {
  const { theme, files } = flags;
  for (const file of files.length ? files : ["-"]) {
    try {
      const code = readFileSync(file === "-" ? 0 : file, "utf8");
      process.stdout.write(
        codeToAnsi(code, {
          lang: file === "-" ? detectLanguage(code) : language(file, code),
          theme: theme ? (await themes[theme]()).default : undefined,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`rangi: ${file}: ${message}`);
      process.exitCode = 1;
    }
  }
}
