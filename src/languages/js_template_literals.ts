import type { ShjLanguageDefinition } from "../types.ts";
import { KWD, STR } from "../tokens.ts";
export default [
  [
    new (class {
      lastIndex = 0;
      exec(str: string) {
        let i = this.lastIndex,
          j,
          f = (_?: number) => {
            while (++i < str.length - 2)
              if (str[i] == "{") f();
              else if (str[i] == "}") return;
          };
        for (; i < str.length; ++i)
          if (str[i - 1] != "\\" && str[i] == "$" && str[i + 1] == "{") {
            j = i++;
            f(i);
            this.lastIndex = i + 1;
            return { index: j, 0: str.slice(j, i + 1) };
          }
        return null;
      }
    })(),
    ,
    [
      [/^\${|}$/g, KWD],
      [/(?!^\$|{)[^]+(?=}$)/g, , "js"],
    ],
  ],
] as ShjLanguageDefinition;
export let type = STR;
