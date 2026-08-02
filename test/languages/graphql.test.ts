import { testLanguage } from "./_harness.ts";

testLanguage(
  "graphql",
  {
    comments: `# a comment\n{ hero } # TODO: paginate`,
    strings: `{ user(name: "ada", note: "say \\"hi\\"") { id } }`,
    "block strings": `"""\nA block description\nspanning lines\n"""\ntype User {\n  """The unique id"""\n  id: ID!\n}`,
    descriptions: `"Short description"\ntype Query {\n  "the current user"\n  me: User\n}`,
    "hashes and quotes": `# a comment with a "quote\n{ search(q: "a # b") }`,
    "block string edges": `"""Contains "quotes" and # hashes"""\nscalar X\n\n""""""\ninput Y {\n  z: Int\n}`,
    "escaped triple quote": `"""He said \\""" out loud"""\nscalar Loud`,
    escapes: `{ f(a: "tab\\there", b: "\\u00e9", c: "back\\\\slash") }`,
    numbers: `{ items(first: 10, ratio: 1.5, offset: -3, big: 1e6) { id } }`,
    "booleans and null": `{ nodes(withDeleted: true, archived: false, cursor: null) { id } }`,
    schema: `schema {\n  query: Query\n}\n\nscalar DateTime\n\ninterface Node {\n  id: ID!\n}\n\ntype User implements Node & Entity {\n  id: ID!\n  tags: [String!]!\n}\n\ninput Filter {\n  limit: Int = 10\n}\n\nunion Result = User | Error\n\nenum Role {\n  ADMIN\n  GUEST\n}\n\nextend type User {\n  role: Role\n}`,
    operations: `query GetUser($id: ID!, $skip: Boolean = false) {\n  user(id: $id) {\n    ...UserFields\n    friends @include(if: $skip) {\n      name\n    }\n  }\n}\n\nmutation { like }\n\nsubscription { events }\n\nfragment UserFields on User {\n  id\n  name\n}`,
    directives: `directive @cache(ttl: Int) repeatable on FIELD_DEFINITION | OBJECT`,
  },
  [
    {
      text: " out loud",
      judges: "other",
      shj: "str",
      why: '`\\"""` is the only escape a block string has, so the literal runs on past it; both judges close the string at those quotes and read the rest of the line as code',
    },
  ],
);
