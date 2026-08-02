import { relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { rolldown } from "rolldown";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));

/**
 * What a `codeToHtml` import costs, and what it is allowed to reach
 *
 * `size` is min+gzip, in bytes, and only ever goes down on purpose: the check
 * has headroom upward and none downward, so shrinking the bundle fails the
 * test until the number here is updated to the one it prints.
 *
 * `modules` is every module of `src/` the bundle may contain, beside the
 * grammars — those are listed as a whole by `grammars`, since the main entry
 * pulls in the registry and the core entry must pull in none of it. Anything
 * else that ends up in there leaked: an import reached past the entry, or
 * something stopped being tree-shakeable.
 */
const BUNDLES = {
  ".": {
    entry: "index.ts",
    size: 12_617,
    grammars: true,
    modules: [
      "common.ts",
      "defaults.ts",
      "highlight.ts",
      "index.ts",
      "languages.ts",
      "themes/dark.ts",
      "themes/default.ts",
      "tokens.ts",
    ],
  },
  "./core": {
    entry: "core.ts",
    size: 1465,
    grammars: false,
    modules: ["highlight.ts", "tokens.ts"],
  },
} as const;

/** How much a change may add before the size check fails */
const TOLERANCE = 0.02;

const VIRTUAL_ENTRY = "\0bundle-check";

/**
 * Bundle `codeToHtml` out of an entry, as a consumer would, and weigh it
 *
 * @param entry The file of the entry, relative to `src/`
 * @returns The minified and the min+gzip size, in bytes, and the modules of
 * `src/` that ended up in the bundle
 */
const measure = async (
  entry: string,
): Promise<{ min: number; gzip: number; modules: string[] }> => {
  const bundle = await rolldown({
    input: VIRTUAL_ENTRY,
    platform: "browser",
    logLevel: "silent",
    plugins: [
      {
        name: "bundle-check-entry",
        resolveId: (id) => (id === VIRTUAL_ENTRY ? id : undefined),
        load: (id) =>
          id === VIRTUAL_ENTRY
            ? `export { codeToHtml } from ${JSON.stringify(SRC + entry)};`
            : undefined,
      },
    ],
  });

  const { output } = await bundle.generate({ format: "esm", minify: true });
  await bundle.close();

  const chunks = output.filter((chunk) => chunk.type === "chunk");
  const code = chunks.map((chunk) => chunk.code).join("");
  const modules = chunks
    .flatMap((chunk) => Object.keys(chunk.modules))
    .filter((id) => id.startsWith(SRC))
    .map((id) => relative(SRC, id).replaceAll(sep, "/"))
    .sort();

  return { min: code.length, gzip: gzipSync(code, { level: 9 }).length, modules };
};

/** One build per entry, however many assertions look at it */
const measured = new Map<string, ReturnType<typeof measure>>();
const measureOnce = (entry: string) =>
  measured.get(entry) ?? measured.set(entry, measure(entry)).get(entry)!;

describe.each(Object.entries(BUNDLES))("codeToHtml from `%s`", (name, bundle) => {
  const isGrammar = (module: string) => module.startsWith("languages/");

  it(`weighs ${bundle.size} bytes min+gzip`, { timeout: 60_000 }, async () => {
    const { min, gzip } = await measureOnce(bundle.entry);
    const limit = Math.ceil(bundle.size * (1 + TOLERANCE));
    const note = `${gzip} bytes min+gzip (${min} minified)`;

    expect(
      gzip,
      `\`${name}\` grew past the ${TOLERANCE * 100}% headroom: ${note}. ` +
        `Shrink it back, or set the size of \`${name}\` to ${gzip}.`,
    ).toBeLessThanOrEqual(limit);

    expect(
      gzip,
      `\`${name}\` shrank: ${note}. ` + `Set the size of \`${name}\` to ${gzip} to keep the win.`,
    ).toBeGreaterThanOrEqual(bundle.size);
  });

  it("pulls in nothing else", { timeout: 60_000 }, async () => {
    const { modules } = await measureOnce(bundle.entry);

    expect(
      modules.filter((module) => !isGrammar(module)),
      `\`${name}\` reaches a module it should not, or stopped reaching one it may.`,
    ).toEqual([...bundle.modules].sort());

    const grammars = modules.filter(isGrammar);
    if (bundle.grammars) {
      expect(grammars.length, `\`${name}\` bundles the registry`).toBeGreaterThan(0);
    } else {
      expect(grammars, `\`${name}\` must bundle no grammar at all`).toEqual([]);
    }
  });
});
