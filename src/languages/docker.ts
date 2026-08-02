import type { ShjLanguageDefinition } from "../types.ts";
import { KWD } from "../tokens.ts";
import bash from "./bash.ts";

export default [
  [
    /^(FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/gim,
    KWD,
  ],
  ...bash,
] as ShjLanguageDefinition;
