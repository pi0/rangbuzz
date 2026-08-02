import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: ["./src/index.ts", "./src/core.ts", "./src/languages.ts", "./src/themes/index.ts"],
    },
  ],
  hooks: {
    // rolldownOutput(_output) {},
  },
});
