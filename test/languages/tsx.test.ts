import { testLanguage } from "./_harness.ts";

testLanguage("tsx", {
  "typed component": `interface Props {
  title: string;
  count?: number;
  onSave: () => void;
}

export const Panel = ({ title, count, onSave }: Props) => (
  <section className="panel">
    <h2>{title.toUpperCase()}</h2>
    <button onClick={onSave} disabled={count === 0}>
      save {count} drafts
    </button>
  </section>
);`,

  // the lookbehind guard on the element rule is what keeps the type argument
  // of `useState<boolean>` from reading as a tag
  "hooks and generics": `export function useToggle(initial: boolean) {
  const [on, setOn] = useState<boolean>(initial);
  const strict: boolean = true;
  const label = on ? "on" : "off";
  return { on, label, strict, toggle: () => setOn(!on) } as const;
}`,

  "typed expressions": `const rows = (
  <ul data-kind="list">
    {items.map((item: Item) => (
      <li key={item.id}>{item.name as string}</li>
    ))}
  </ul>
);`,

  comments: `// view
const view = <>{/* TODO: paginate */}<Footer year={2025} /></>;`,
});
