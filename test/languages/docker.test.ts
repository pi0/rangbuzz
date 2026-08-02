import { testLanguage } from "./_harness.ts";

testLanguage("docker", {
  comments: `# syntax=docker/dockerfile:1\n# TODO: pin digest`,
  instructions: `FROM node:20-alpine AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci\nEXPOSE 3000\nCMD ["node", "index.js"]`,
  strings: `LABEL description="an image"\nENTRYPOINT ["sh", "-c", "echo hi"]`,
  variables: `ARG VERSION=1.0\nENV PATH=/usr/local/bin:$PATH\nRUN echo \${VERSION}`,
  numbers: `FROM alpine:3.19\nEXPOSE 8080`,
  // the shell rules of `bash` apply to what follows an instruction
  commands: `RUN apk add curl && npm ci\nRUN ./configure`,
  booleans: `RUN echo true\nRUN echo false`,
});
