/**
 * The per language test harness.
 *
 * A language test file is a corpus and a list of divergences:
 *
 * ```ts
 * testLanguage("go", {
 *   comments: `// c\n/* b *\/`,
 *   strings: '"x" `raw`',
 * }, [
 *   { text: "\n", judges: "other", shj: "cmnt", why: "…" },
 * ]);
 * ```
 *
 * and `testLanguage` turns it into six checks:
 *
 * 1. the tokens join back to the source
 * 2. no empty tokens, no token type outside {@link ShjToken}
 * 3. the grammar is well formed — global regexes, resolvable `expand`/`sub`
 * 4. the corpus exercises every token type the grammar declares
 * 5. the tokens match the committed snapshot
 * 6. Prism and Shiki agree with us on where the comments and the strings are
 *
 * Only the last one needs an oracle, and only where the two judges agree with
 * each other: a disagreement one judge holds alone is a quirk of that judge,
 * not evidence about us.
 */

import { describe, expect, it } from "vitest";
import expandData from "../../src/common.ts";
import { tokenize } from "../../src/index.ts";
import { languages } from "../../src/languages.ts";
import type { ShjLanguage, ShjToken } from "../../src/types.ts";
import { JUDGED, type Klass, prismClasses, shikiClasses, STRUCTURAL } from "./_judges.ts";

const TOKENS = new Set<string>([
  "deleted",
  "err",
  "var",
  "section",
  "kwd",
  "class",
  "cmnt",
  "insert",
  "type",
  "func",
  "bool",
  "num",
  "oper",
  "str",
  "esc",
]);

/** Coarse class of one of our own token types */
const shjClass = (type?: ShjToken): Klass =>
  type == "cmnt"
    ? "cmnt"
    : type == "str" || type == "esc"
      ? "str"
      : type == "num"
        ? "num"
        : type == "kwd" || type == "bool"
          ? "kwd"
          : "other";

/**
 * A difference from the judges that is a decision, not a defect.
 *
 * Every one of them has to be spelled out: an undeclared disagreement fails the
 * suite, and so does a declared one that no longer happens, so the list cannot
 * rot into a blanket tolerance.
 */
export interface Divergence {
  /** The exact text the judges and we classify differently */
  text: string;
  /** What the judges call it */
  judges: Klass;
  /** What we call it */
  shj: Klass;
  /** Why we are right, or why the difference does not matter */
  why: string;
  /** Set when the divergence is a grammar bug we have not fixed yet */
  bug?: true;
}

/** A rule and the raw entry it came from, `expand` already resolved */
type Visit = (rule: any, raw: any) => void;

const walkRules = (def: any[], visit: Visit) => {
  for (const raw of def) {
    const rule = raw.expand ? expandData[raw.expand] : raw;
    visit(rule, raw);
    if (Array.isArray(rule?.sub)) walkRules(rule.sub, visit);
  }
};

const definitionOf = (lang: string) => {
  const found = (languages as any)[lang];
  return {
    def: (Array.isArray(found) ? found : found.default) as any[],
    type: Array.isArray(found) ? undefined : found.type,
  };
};

/** Render tokens so a snapshot diff is readable: `«kwd:const» a «num:1»` */
const render = (code: string, lang: string) =>
  tokenize(code, { lang })
    .map((t) => (t.type ? `«${t.type}:${t.text}»` : t.text))
    .join("");

/** Per character coarse classes of our own tokenizer */
const ourClasses = (code: string, lang: string): Klass[] => {
  const out: Klass[] = [];
  for (const token of tokenize(code, { lang })) {
    const klass = shjClass(token.type);
    for (let k = 0; k < token.text.length; k++) out.push(klass);
  }
  return out;
};

/** Group per character disagreements back into contiguous regions */
const regionsOf = (code: string, ours: Klass[], verdict: (i: number) => Klass | null) => {
  const out: { text: string; judges: Klass; shj: Klass }[] = [];
  let start = -1;

  for (let i = 0; i <= code.length; i++) {
    const hit = i < code.length && verdict(i);
    if (hit && start < 0) start = i;
    if (!hit && start >= 0) {
      out.push({ text: code.slice(start, i), judges: verdict(start)!, shj: ours[start]! });
      start = -1;
    }
  }

  return out;
};

/**
 * A line comment matched with the `//.*\n?` idiom keeps its trailing line
 * break, which the judges leave outside the comment. It is invisible in the
 * output — the newline is a line break whatever color it is given — so it is
 * allowed everywhere instead of being declared by the eight languages that
 * share the idiom.
 */
const isTrailingWhitespace = (region: { text: string; judges: Klass; shj: Klass }) =>
  region.judges == "other" && !region.text.trim();

/**
 * Most languages route their comments through the `todo` sub-language, which
 * picks `TODO`, `FIXME` and friends back out of them. The judges see a comment
 * and nothing else, so they read those words as an unhighlighted hole.
 *
 * Rather than repeat the same paragraph in every language that does it, the
 * allowance asks the `todo` grammar itself whether it claims the text, so it
 * stays true if that grammar changes.
 */
const isTodoKeyword = (region: { text: string; judges: Klass; shj: Klass }) => {
  if (region.judges != "cmnt" || region.shj == "cmnt") return false;

  const tokens = tokenize(region.text, { lang: "todo" });
  return tokens.length > 0 && tokens.every((t) => t.type && t.type != "cmnt");
};

const key = (r: { text: string; judges: Klass; shj: Klass }) =>
  `${JSON.stringify(r.text)} judges=${r.judges} ours=${r.shj}`;

/**
 * Register the whole suite for one language
 *
 * @param lang The language, as registered in `src/languages.ts`
 * @param corpus Snippets keyed by what they are there to cover
 * @param divergences Differences from the judges that are decisions, not defects
 */
export function testLanguage(
  lang: ShjLanguage,
  corpus: Record<string, string>,
  divergences: Divergence[] = [],
): void {
  const cases = Object.entries(corpus);

  describe(lang, () => {
    it("joins its tokens back to the source", () => {
      for (const [name, code] of cases)
        expect(
          tokenize(code, { lang })
            .map((t) => t.text)
            .join(""),
          name,
        ).toBe(code);
    });

    it("emits no empty token and no unknown token type", () => {
      for (const [name, code] of cases)
        for (const token of tokenize(code, { lang })) {
          expect(token.text, `${name}: empty token`).not.toBe("");
          if (token.type) expect(TOKENS, `${name}: ${token.type}`).toContain(token.type);
        }
    });

    it("is a well formed grammar", () => {
      const { def } = definitionOf(lang);

      walkRules(def, (rule, raw) => {
        expect(rule, `unknown expand: ${raw.expand}`).toBeDefined();
        // the engine drives `lastIndex` itself, a sticky-less regex loops
        if (rule.match instanceof RegExp)
          expect(rule.match.flags, String(rule.match)).toContain("g");
        if (typeof rule.sub == "string") expect(languages).toHaveProperty(rule.sub);
      });
    });

    it("exercises every token type it declares", () => {
      const { def, type } = definitionOf(lang),
        declared = new Set<string>(type ? [type] : []),
        produced = new Set<string>();

      walkRules(def, (rule) => {
        if (rule?.type) declared.add(rule.type);
      });
      for (const [, code] of cases)
        for (const token of tokenize(code, { lang })) if (token.type) produced.add(token.type);

      // a type the corpus never triggers is either a thin corpus or a dead rule
      expect([...declared].filter((t) => !produced.has(t))).toEqual([]);
    });

    describe("tokens", () => {
      for (const [name, code] of cases)
        it(name, () => {
          expect(render(code, lang)).toMatchSnapshot();
        });
    });

    const judges = JUDGED[lang];

    it.skipIf(!judges)("is confirmed by Prism and Shiki", async () => {
      const seen = new Set<string>(),
        unexpected: string[] = [];

      for (const [name, code] of cases) {
        const ours = ourClasses(code, lang),
          prism = judges!.prism ? prismClasses(code, judges!.prism) : undefined,
          shiki = judges!.shiki ? await shikiClasses(code, judges!.shiki) : undefined;

        // a judge that loses track of the offsets cannot be compared at all
        for (const [judge, classes] of [
          ["prism", prism],
          ["shiki", shiki],
        ] as const)
          if (classes) expect(classes.length, `${judge} offsets on ${name}`).toBe(code.length);

        const regions = regionsOf(code, ours, (i) => {
          // only where every judge present agrees with the others, and differs
          const votes = [prism?.[i], shiki?.[i]].filter(Boolean) as Klass[];
          if (votes.length === 0 || votes.some((v) => v != votes[0])) return null;
          const them = votes[0]!;
          if (them == ours[i]) return null;
          // structural classes only: `num` and `kwd` are a matter of taste
          return STRUCTURAL.includes(them) || STRUCTURAL.includes(ours[i]!) ? them : null;
        });

        for (const region of regions) {
          if (isTrailingWhitespace(region) || isTodoKeyword(region)) continue;
          const id = key(region);
          seen.add(id);
          if (!divergences.some((d) => key(d) == id)) unexpected.push(`${name}: ${id}`);
        }
      }

      expect(unexpected, "undeclared disagreement with both judges").toEqual([]);
      // a divergence that stopped happening is a fix nobody wrote down
      expect(
        divergences.filter((d) => !seen.has(key(d))).map(key),
        "declared divergence that no longer happens",
      ).toEqual([]);
    });
  });
}
