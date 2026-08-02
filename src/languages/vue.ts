import type { ShjLanguageComponent, ShjLanguageDefinition } from "../types.ts";
import { CLASS, KWD, OPER, STR, VAR } from "../tokens.ts";
import { name } from "./xml.ts";

/**
 * The body of a `{…}`, up to one level of nesting deep — enough for the object
 * literal of a `transition:fade={{ duration: 200 }}` — and the whole braced
 * expression, which the single file component grammars build their
 * interpolations and their unquoted attribute values out of.
 */
export let inner: string = `[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}`,
  brace: string = `\\{${inner}`,
  /** `{ expr }` — the braces are punctuation, the inside is an expression */
  expr: ShjLanguageComponent = [
    /* @__PURE__ */ RegExp(brace, "g"),
    OPER,
    [[/(?<=^\{)[^]+(?=\}$)/g, , "js"]],
  ];

// A component attribute name is not an XML name: the Vue directive shorthands
// bring `@`, `#` and `.` in, a dynamic argument brings `[` and `]`, the Svelte
// modifiers bring `|`, and `{…}` is a whole attribute of its own in Svelte and
// in Astro (`{...rest}`, `{value}`).
let attrName = `[$\\w@#:.|{}[\\]-]+`,
  // an attribute value: a braced expression, a bare word, or a quoted string
  value = `${brace}|[^"'>\\s][^>\\s]*`,
  properties = `(\\s+${attrName}\\s*(=\\s*(${value}|("|')(\\\\[^]|(?!\\4)[^])*\\4?)?)?)*\\s*`;

/**
 * The grammar of a single file component
 *
 * Vue, Svelte and Astro are the same language around a different directive
 * syntax and a different interpolation, so all three are this one call: the
 * tags, the `<script>`/`<style>` blocks, the comments and the entities are
 * shared, `directive` says what an attribute name has to look like to be one,
 * and `rules` are the interpolation forms of the language, spliced in ahead of
 * the tags.
 */
export const component = (directive: string, rules: ShjLanguageDefinition) => {
  const element: ShjLanguageComponent = [
      RegExp(`<[/!?]?${name}${properties}[/!?]?>`, "g"),
      ,
      [
        [RegExp(`^<[/!?]?${name}`, "g"), VAR, [[/^<[/!?]?/g, OPER]]],
        // `attr={expr}`: unlike a quoted value this is code, not a string
        [RegExp(`=${brace}`, "g"), OPER, [[/(?<=^=\{)[^]+(?=\}$)/g, , "js"]]],
        [RegExp(`(?<=\\s)${directive}`, "g"), KWD],
        [RegExp(`=\\s*(${value}|("|')(\\\\[^]|(?!\\2)[^])*\\2?)`, "g"), STR, [[/^=/g, OPER]]],
        [/[/!?]?>/g, OPER],
        [RegExp(name, "g"), CLASS],
      ],
    ],
    /**
     * One of the blocks whose body belongs to another grammar, the
     * sub-language picked from the `lang` attribute of the opening tag.
     *
     * Anything else — `<template>`, `<i18n>`, a custom block — stays with the
     * rules below, so a template keeps its directives and its interpolations
     * and an unknown block degrades to a tag around plain text.
     */
    block = (tag: string, pick: (open: string) => string) => [
      RegExp(`<${tag}${properties}>[^]*?</${tag}\\s*>`, "g"),
      ,
      (code: string) => [
        ,
        ,
        [
          [RegExp(`^<${tag}${properties}>`, "g"), , element[2]],
          [
            RegExp(`[^]*(?=</${tag}\\s*>$)`, "g"),
            ,
            pick(RegExp(`^<${tag}${properties}>`, "g").exec(code)?.[0] ?? ""),
          ],
          element,
        ],
      ],
    ];

  return [
    [/<!--[^]*?-->/g, , "todo"],
    // `<style>`, `<style scoped>`, `<style lang="scss" module>`
    block("style", (open) => (/lang\s*=\s*["']?s[ac]ss/i.test(open) ? "scss" : "css")),
    // `<script>`, `<script setup lang="ts">`
    block("script", (open) => (/lang\s*=\s*["']?tsx?\b/i.test(open) ? "ts" : "js")),
    ...rules,
    element,
    [/&(#x?)?[\da-z]{1,8};/gi, VAR],
  ] as ShjLanguageDefinition;
};

// the three grammars this builds are three top level calls, and a bundler has
// no way to know a call is only shaping data — without the annotation, pulling
// `component` in for Svelte would keep Vue's own definition alive as well
export default /* @__PURE__ */ component(
  /**
   * Any `v-` directive with its argument and its modifiers — `v-if`,
   * `v-on:click.prevent.stop`, `v-bind:[key]`, `v-slot:header` — and the four
   * shorthands `:prop`, `.prop`, `@click`, `#slot`
   */
  `(v-[\\w-]+|[.:@#])[$\\w:.[\\]-]*`,
  // `{{ expr }}`: the braces are punctuation, the inside is an expression
  [[/\{\{[^]*?\}\}/g, OPER, [[/(?<=^\{\{)[^]+(?=\}\})/g, , "js"]]]],
) as ShjLanguageDefinition;
