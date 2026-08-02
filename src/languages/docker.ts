import type { ShjLanguageDefinition } from "../types.ts";
import bash from "./bash.ts";

export default [
  {
    type: "kwd",
    match:
      /^(FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/gim,
  },
  ...bash,
] as ShjLanguageDefinition;
