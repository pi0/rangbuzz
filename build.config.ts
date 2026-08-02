import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      // Only the two default themes are bundled in the main entry; the others are
      // served by `./themes`, which shares them through a chunk.
      input: ["./src/index.ts", "./src/themes/index.ts"],
      // Types come from JSDoc: `tsgo` (inferred default) drops cross-file `@typedef {import()}`
      dts: { generator: "tsc" },
    },
  ],
  hooks: {
    rolldownOutput(output) {
      // Keep shared chunks at the root of `dist/` (default is `dist/_chunks/`) so that
      // the relative imports between the bundled entries keep resolving.
      output.chunkFileNames = "_[name].mjs";
    },
  },
});
