import { testLanguage } from "./_harness.ts";

testLanguage("xml", {
  comments: `<!-- a comment -->\n<!-- TODO: schema -->`,
  elements: `<?xml version="1.0" encoding="utf-8"?>\n<root>\n  <child>text</child>\n</root>`,
  attributes: `<node id="1" ns:attr='v' empty="" />`,
  namespaces: `<ns:root xmlns:ns="http://example.com">\n  <ns:child />\n</ns:root>`,
  cdata: `<node><![CDATA[raw < & > text]]></node>`,
});
