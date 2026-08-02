import { testLanguage } from "./_harness.ts";

testLanguage(
  "astro",
  {
    page: `---
import Layout from "../layouts/Layout.astro";
import Card from "../components/Card.astro";

const { title } = Astro.props;
const posts = await Astro.glob("./posts/*.md");
---

<Layout title={title}>
  <h1>{title}</h1>
  <Card href="/one" body="the first one" />
</Layout>`,

    frontmatter: `---
// the props of the page
interface Props {
  title: string;
  count?: number;
}

const { title, count = 0 } = Astro.props as Props;
---

<p>{title}: {count}</p>`,

    comments: `---
const ok = true;
---

<!-- the header -->
<!-- TODO: extract a component -->
<p>a &amp; b &lt; c</p>
{/* an expression comment */}`,

    expressions: `<p>{user.name}</p>
<p>{"Total: " + total.toFixed(2)}</p>
<p>{items.length} left</p>
<ul>{items.map((item) => item.label)}</ul>
<p>{ok ? "yes" : "no"}</p>`,

    "client directives": `<Counter client:load start={0} />
<Chart client:idle />
<Map client:visible />
<Sidebar client:media="(min-width: 50em)" />
<Widget client:only="react" />
<Comments server:defer />`,

    "content directives": `<article set:html={post.body}></article>
<pre set:text={raw}></pre>
<script is:inline src="/analytics.js"></script>
<style is:global>
  body {
    margin: 0;
  }
</style>
<div define:vars={{ color: "#09f" }}></div>`,

    "style and script": `<style lang="scss">
  $brand: #09f;

  .card {
    color: $brand;
  }
</style>

<script>
  // runs in the browser
  document.querySelector(".card")?.addEventListener("click", () => {
    console.log("clicked");
  });
</script>`,

    "plain markup": `<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Home</title>
  </head>
  <body class="page" data-role=main>
    <slot />
    <hr>
  </body>
</html>`,
  },
  [
    {
      text: "---",
      judges: "cmnt",
      shj: "other",
      why: "Shiki's grammar scopes the two frontmatter fences as a comment, which is an editor convenience — it makes the block foldable — rather than a claim about the syntax: the fence delimits TypeScript, it is not commented out. We call it punctuation, like the `---` of a yaml document",
    },
  ],
);
