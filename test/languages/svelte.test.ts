import { testLanguage } from "./_harness.ts";

testLanguage("svelte", {
  "single file component": `<script lang="ts">
  let count = $state(0);

  const double = $derived(count * 2);
</script>

<button onclick={() => count++}>
  clicked {count} times
</button>

<style>
  button {
    color: #09f;
  }
</style>`,

  "script module": `<script context="module">
  // shared by every instance
  export const load = () => "data";
</script>

<script module>
  let total = 0;
</script>`,

  comments: `<!-- the header -->
<!-- TODO: extract a component -->
<p>a &amp; b &lt; c</p>`,

  interpolation: `<p>{user.name}</p>
<p>{"Total: " + total.toFixed(2)}</p>
<p>{items.length} left</p>
<p>{price * 1.2}</p>`,

  "if blocks": `{#if state === "loading"}
  <p>Loading</p>
{:else if error}
  <p>{error.message}</p>
{:else}
  <p>Ready</p>
{/if}`,

  "each blocks": `<ul class="list">
  {#each items as item, i (item.id)}
    <li>{i}. {item.label}</li>
  {:else}
    <li>nothing here</li>
  {/each}
</ul>`,

  "await blocks": `{#await load()}
  <p>waiting</p>
{:then user}
  <p>{user.name}</p>
{:catch error}
  <p class="err">{error.message}</p>
{/await}

{#key id}
  <Chart {id} />
{/key}`,

  "snippets and render": `{#snippet row(item, index)}
  <tr><td>{index}</td><td>{item.name}</td></tr>
{/snippet}

<table>
  {#each rows as row}
    {@render row(row, 0)}
  {/each}
</table>`,

  "template tags": `<div>
  {@html "<b>bold</b>"}
  {@const area = width * height}
  {@debug area, width}
</div>`,

  directives: `<form on:submit|preventDefault={save}>
  <input bind:value={form.name} type="text" required />
  <div use:tooltip={"hello"} transition:fade in:fly out:slide animate:flip></div>
  <span class:active={selected} style:color={hue} on:click={pick}>pick</span>
  <slot name="footer" let:year />
</form>`,

  "modern events": `<button onclick={handleClick} onmouseenter={hover} disabled={busy}>
  Save
</button>
<Nested {...rest} {value} bind:this={node} />`,

  "style scss": `<style lang="scss">
  $brand: #09f;

  .card {
    color: $brand;

    &:hover {
      color: $brand;
    }
  }
</style>`,
});
