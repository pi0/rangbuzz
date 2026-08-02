import { testLanguage } from "./_harness.ts";

// the sub-language every other grammar routes its comments through, so its own
// tokens end up inside comments; no judge models it
testLanguage("todo", {
  errors: `TODO: a thing\nFIXME now\nDEBUG XXX BUG WARNING OPTIMIZE`,
  ideas: `IDEA: try another way`,
  inserts: `CHANGED the api, FIX applied, CHANGE pending`,
  questions: `QUESTION: is this right?`,
  "plain comment text": `nothing special here`,
});
