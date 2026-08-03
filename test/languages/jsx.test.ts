import { testLanguage } from "./_harness.ts";

testLanguage("jsx", {
  component: `import React, { useState } from "react";

export function Counter({ start }) {
  const [count, setCount] = useState(start ?? 0);
  return (
    <div className="counter" id="main">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)} disabled={count >= 10}>
        increment
      </button>
    </div>
  );
}`,

  "fragments and conditionals": `const view = (
  <>
    {loading ? <Spinner size={24} /> : null}
    {error && <p className="err">{error.message}</p>}
    <em>{\`\${items.length} left\`}</em>
  </>
);`,

  attributes: `<Widget {...props} data-id={id} aria-label="save &amp; exit" hidden={false} style={{ color: "red" }} />`,

  "text children": `<p>it's five &lt; ten &amp; fine {"—"} ok</p>`,

  "nested elements": `export const Page = () => (
  <section id="page">
    <div className="outer">
      <div className="inner">deep</div>
      <hr />
      tail
    </div>
  </section>
);`,

  // an element pairs with the nearest close of its own name, so a same named
  // child at the top level of the code ends the region early: the tags after
  // it still highlight, one by one, but `tail` is read as code again
  "same tag nested at top level": `const twin = <div><div>deep</div> tail</div>;`,

  comments: `// setup
/* legacy TODO: drop */
const el = <nav>{/* links */}</nav>;`,
});
