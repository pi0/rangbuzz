import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: ["./src/index.ts", "./src/detect.ts", "./src/terminal.ts"],
      // Types come from JSDoc: `tsgo` (inferred default) drops cross-file `@typedef {import()}`
      dts: { generator: "tsc" },
    },

    // Lazily imported at runtime (`./languages/*.ts` and `./themes/*.ts`), kept as single files
    { type: "transform", input: "./src/languages", outDir: "./dist/languages" },
    { type: "transform", input: "./src/themes", outDir: "./dist/themes" },

    // Type-only module the transformed `.d.mts` files above import from
    {
      type: "transform",
      input: "./src",
      outDir: "./dist",
      filter: (name: string) => name === "types.ts",
    },
  ],
  hooks: {
    rolldownOutput(output) {
      // Keep shared chunks at the root of `dist/` (default is `dist/_chunks/`) so that
      // the runtime relative imports of `./languages/*` and `./themes/*` keep resolving.
      output.chunkFileNames = "_[name].mjs";
    },
  },
});
