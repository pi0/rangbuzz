/**
 * Every contender this run compares us against, assembled here the way
 * `src/languages.ts` assembles `src/languages/*.ts`. One folder per contender
 * under `contenders/`, except where two rows are the same tool in two modes —
 * `rangi`'s two output modes, Shiki's two engines — which share a folder.
 */

import type { ShjLanguage } from "../../src/types.ts";

import { highlightJs } from "./contenders/highlight-js/highlight-js.ts";
import { lezer } from "./contenders/lezer/lezer.ts";
import { prism } from "./contenders/prism/prism.ts";
import { rangi } from "./contenders/rangi/rangi.ts";
import { rangiClasses } from "./contenders/rangi/rangi-classes.ts";
import { shikiJsRegexp } from "./contenders/shiki/shiki-js-regexp.ts";
import { shikiOniguruma } from "./contenders/shiki/shiki-oniguruma.ts";
import { speedHighlight } from "./contenders/speed-highlight/speed-highlight.ts";

/** One highlighter, asked for a string of HTML */
export interface Contender {
  /** What it is called in the output */
  name: string;
  /**
   * Whether this row is us
   *
   * Two of them are, one per output mode, and both are marked so neither is
   * read as somebody else's. The first is also what the bundle table's sizes
   * are a multiple of — that one needs an anchor, and it is the mode this
   * library defaults to.
   */
  mine?: true;
  /** The grammar it knows one of our languages by, `undefined` where it has none */
  grammar: (lang: ShjLanguage) => string | undefined;
  /** Highlight one block with the grammar {@link Contender.grammar} returned */
  html: (code: string, grammar: string) => string | Promise<string>;
  /**
   * Whether {@link Contender.html} hands back a promise
   *
   * Speed Highlight's is the only one that does, and awaiting it is part of
   * what it costs rather than an artifact of measuring it — see the top of
   * `compare.bench.ts`. The other contenders are timed in a plain synchronous
   * loop all the same: awaiting a value that is not a promise is still a turn
   * of the microtask queue per block, and there is no reason to charge them
   * for Speed Highlight's signature.
   */
  awaits?: true;
  /**
   * The module a consumer bundles to get {@link Contender.html} back
   *
   * The entry points and the loading dance are each contender's own, as
   * documented by it; what they have in common is that nothing else is in
   * there, and that the module ends up doing exactly what the benchmark above
   * timed.
   *
   * @param grammars The grammars this run needs, in {@link Contender.grammar}'s
   * spelling and deduplicated — one name can serve two of our languages
   * @returns The source of the entry, as a bundler would find it on disk
   */
  ship: (grammars: string[]) => string;
  /**
   * How that contender spells a grammar, as a bundler names the module
   *
   * What the `grammars` column counts is the modules of the finished bundle
   * this matches, not the names {@link Contender.ship} was handed, because the
   * two are rarely the same number: a grammar that embeds another pulls it in
   * — Shiki's `html` brings JavaScript and CSS, Prism's `typescript` brings
   * `clike` — and ours brings the registry whole whatever it was asked for.
   */
  carries: RegExp;
  /**
   * Match {@link Contender.carries} against the bundle's code, not its modules
   *
   * Speed Highlight publishes an entry that is already bundled: every grammar
   * it has is inlined in that one file, behind a map from the specifier each
   * used to be imported by to the copy now sitting beside it. So there is no
   * module left for a bundler to name — and no way to ask for fewer of them
   * either, since that map is reachable from `highlightText`, which is the
   * whole public API, so its thirty-odd grammars are in the bundle whichever
   * one this run wanted. The specifiers survive minification as string keys,
   * and are what its count is taken over.
   */
  inlined?: true;
}

/**
 * Every contender, ours first
 *
 * The order is the one `compare.bench.ts` reads `CONTENDERS[0]` off of for the
 * bundle table's baseline, so `rangi` has to stay first.
 */
export const CONTENDERS: Contender[] = [
  rangi,
  rangiClasses,
  speedHighlight,
  shikiOniguruma,
  shikiJsRegexp,
  prism,
  highlightJs,
  lezer,
];
