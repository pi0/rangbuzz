import { testLanguage } from "./_harness.ts";

testLanguage("http", {
  request: `GET /api/users HTTP/1.1\nHost: example.com\nAccept: application/json`,
  methods: `POST /a HTTP/1.1\nPUT /b HTTP/2\nDELETE /c HTTP/1.0\nPATCH /d HTTP/1.1`,
  response: `HTTP/1.1 404 Not Found\nContent-Type: text/plain\nContent-Length: 9`,
  body: `POST /api HTTP/1.1\nContent-Type: application/json\n\n{\n  "a": 1\n}`,
  strings: `GET /a HTTP/1.1\nCookie: name="value"`,
});
