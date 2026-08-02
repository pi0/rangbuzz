import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: ["./src/index.ts", "./src/detect.ts", "./src/terminal.ts"],
      // Types come from JSDoc: `tsgo` (inferred default) drops cross-file `@typedef {import()}`
      dts: { generator: "tsc" },
    },

    // Languages are bundled into the entries above, but the themes still ship as
    // single files: the `./themes/*` export serves the stylesheets, which cannot
    // be bundled into JS.
    { type: "transform", input: "./src/themes", outDir: "./dist/themes" },
  ],
  hooks: {
    rolldownOutput(output) {
      // Keep shared chunks at the root of `dist/` (default is `dist/_chunks/`) so that
      // the relative imports between the bundled entries keep resolving.
      output.chunkFileNames = "_[name].mjs";
    },
  },
});
