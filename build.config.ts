import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    { type: "bundle", input: ["./src/index.ts"] },
    { type: "bundle", input: ["./src/themes/index.ts"] },
  ],
  hooks: {
    // rolldownOutput(_output) {},
  },
});
