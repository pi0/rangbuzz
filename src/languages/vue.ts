import type { ShjLanguageDefinition } from "../types.ts";
import { name } from "./xml.ts";

// A Vue attribute name is not an XML name: the directive shorthands bring `@`,
// `#` and `.` in, and a dynamic argument brings `[` and `]`.
let attrName = `[$\\w@#:.[\\]-]+`,
  properties = `(\\s+${attrName}\\s*(=\\s*([^"'>\\s][^>\\s]*|("|')(\\\\[^]|(?!\\4)[^])*\\4?)?)?)*\\s*`,
  /**
   * Any `v-` directive with its argument and its modifiers — `v-if`,
   * `v-on:click.prevent.stop`, `v-bind:[key]`, `v-slot:header` — and the four
   * shorthands `:prop`, `.prop`, `@click`, `#slot`
   */
  directive = `(v-[\\w-]+|[.:@#])[$\\w:.[\\]-]*`,
  element: { match: RegExp; sub: ShjLanguageDefinition } = {
    match: RegExp(`<[/!?]?${name}${properties}[/!?]?>`, "g"),
    sub: [
      {
        type: "var",
        match: RegExp(`^<[/!?]?${name}`, "g"),
        sub: [
          {
            type: "oper",
            match: /^<[/!?]?/g,
          },
        ],
      },
      {
        type: "kwd",
        match: RegExp(`(?<=\\s)${directive}`, "g"),
      },
      {
        type: "str",
        match: /=\s*([^"'>\s][^>\s]*|("|')(\\[^]|(?!\2)[^])*\2?)/g,
        sub: [
          {
            type: "oper",
            match: /^=/g,
          },
        ],
      },
      {
        type: "oper",
        match: /[/!?]?>/g,
      },
      {
        type: "class",
        match: RegExp(name, "g"),
      },
    ],
  };

/**
 * One of the blocks whose body belongs to another grammar, the sub-language
 * picked from the `lang` attribute of the opening tag.
 *
 * Anything else — `<template>`, `<i18n>`, a custom block — stays with the rules
 * below, so a template keeps its directives and its interpolations and an
 * unknown block degrades to a tag around plain text.
 */
const block = (tag: string, pick: (open: string) => string) => ({
  match: RegExp(`<${tag}${properties}>[^]*?</${tag}\\s*>`, "g"),
  sub: (code: string) => ({
    sub: [
      {
        match: RegExp(`^<${tag}${properties}>`, "g"),
        sub: element.sub,
      },
      {
        match: RegExp(`[^]*(?=</${tag}\\s*>$)`, "g"),
        sub: pick(RegExp(`^<${tag}${properties}>`, "g").exec(code)?.[0] ?? ""),
      },
      element,
    ],
  }),
});

export default [
  {
    match: /<!--[^]*?-->/g,
    sub: "todo",
  },
  // `<style>`, `<style scoped>`, `<style lang="scss" module>`
  block("style", (open) => (/lang\s*=\s*["']?s[ac]ss/i.test(open) ? "scss" : "css")),
  // `<script>`, `<script setup lang="ts">`
  block("script", (open) => (/lang\s*=\s*["']?tsx?\b/i.test(open) ? "ts" : "js")),
  {
    // `{{ expr }}`: the braces are punctuation, the inside is an expression
    type: "oper",
    match: /\{\{[^]*?\}\}/g,
    sub: [
      {
        match: /(?<=^\{\{)[^]+(?=\}\}$)/g,
        sub: "js",
      },
    ],
  },
  element,
  {
    type: "var",
    match: /&(#x?)?[\da-z]{1,8};/gi,
  },
] as ShjLanguageDefinition;
