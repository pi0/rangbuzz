import type { ShjLanguageDefinition } from "../types.ts";
import { KWD, OPER } from "../tokens.ts";
import { component, expr, inner } from "./vue.ts";

export default /* @__PURE__ */ component(
  // `on:click|once`, `bind:value`, `use:action`, `transition:fade`, `in:`/`out:`,
  // `animate:`, `class:active`, `style:color`, `let:item` — and the Svelte 5
  // event attributes, which dropped the colon: `onclick={…}`
  `[\\w-]+:[$\\w|.-]*|on[a-z]+(?==)`,
  [
    /**
     * A logic block or a template tag: `{#if}` `{:else if}` `{/if}`,
     * `{#each x as y (key)}`, `{#await}/{:then}/{:catch}`, `{#key}`,
     * `{#snippet}`/`{@render}`, `{@html}` `{@const}` `{@debug}`.
     *
     * The sigil and the word that follows it are the keyword, whatever is left
     * before the closing brace is an expression — `as` included, which `js`
     * already knows.
     */
    [
      RegExp(`\\{[#:/@]${inner}`, "g"),
      OPER,
      [
        [/^\{[#:/@][a-z]*/g, KWD, [[/^\{./g, OPER]]],
        [/[^]+(?=\}$)/g, , "js"],
      ],
    ],
    expr,
  ],
) as ShjLanguageDefinition;
