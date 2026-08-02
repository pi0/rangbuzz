import { testLanguage } from "./_harness.ts";

testLanguage("sql", {
  comments: `-- line comment\n/* block */\n-- TODO: index`,
  strings: `SELECT 'text', "quoted" FROM t;`,
  select: `SELECT id, name\nFROM users\nWHERE age >= 18\nORDER BY name DESC\nLIMIT 10;`,
  functions: `SELECT COUNT(*), MAX(price), ROUND(AVG(qty), 2) FROM orders;`,
  ddl: `CREATE TABLE t (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(255) NOT NULL\n);`,
  booleans: `SELECT * FROM t WHERE active = TRUE AND deleted = FALSE;`,
  numbers: `INSERT INTO t VALUES (1, 3.14, NULL);`,
  variables: `SET @total = 0;\nSELECT @total + 1;`,
});
