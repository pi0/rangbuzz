import { type Divergence, testLanguage } from "./_harness.ts";

/**
 * The tag names of an xml doc comment are marked up as their own token, the way
 * the `jsdoc` sub-language marks up a `/** *\/` block. Both judges do the same
 * thing internally — Shiki scopes them `entity.name.tag`, Prism has no XML
 * inside a `///` line at all — but the coarse alphabet the three highlighters
 * are compared in collapses anything nested in a comment back to `cmnt`.
 */
const docTag = (text: string): Divergence => ({
  text,
  judges: "cmnt",
  shj: "other",
  why: "an xml doc tag name, marked up inside a comment the judges only see as flat",
});

testLanguage(
  "cs",
  {
    comments: `// a line comment\n/* a block comment\n   spanning two lines */\nint x = 0; // TODO: rename\n/* unterminated`,
    "doc comments": `/// <summary>\n/// Adds <paramref name="a"/> to <paramref name="b"/>.\n/// </summary>\n/// <param name="a">The left operand.</param>\n/// <returns>The sum, see <see cref="Math.Abs"/>.</returns>\npublic static int Add(int a, int b) => a + b;`,
    strings: `var s = "a \\"quoted\\" word\\n";\nvar c = '\\'';\nvar nl = '\\n';\nvar u = "\\u00e9 \\x41 \\U0001F600";\nvar empty = "";`,
    "verbatim strings": `var path = @"C:\\Program Files\\App";\nvar sql = @"SELECT *\nFROM ""Users""\nWHERE Id = 1";`,
    "interpolated strings": `var line = $"{user.Name,-10} owes {balance:C2} on {due:yyyy-MM-dd}";\nvar dir = $@"{root}\\logs\\{DateTime.Now.Year}";\nConsole.WriteLine($"{count} of {total} done");`,
    "raw strings": `var json = """\n  { "id": 1, "tags": ["a", "b"] }\n  """;`,
    numbers: `0 42 3.14f 2.5d 19.99m 1_000_000 0xFF_FF 0b1010_0101 1e-9 6.02e23 7UL .5f 255L`,
    "class declaration": `[Serializable]\npublic sealed class Repository<T> : IRepository<T>, IDisposable where T : class, new()\n{\n    private readonly Dictionary<string, T> _items = new();\n\n    public string? Name { get; init; }\n\n    public int Count => _items.Count;\n\n    public Repository(IEnumerable<T> seed)\n    {\n        foreach (var item in seed)\n            Add(item);\n    }\n\n    public void Dispose() { }\n}`,
    "async methods": `[Obsolete("use FetchAsync instead")]\npublic async Task<IReadOnlyList<User>> LoadAsync(int page, CancellationToken ct = default)\n{\n    await using var conn = await Pool.OpenAsync(ct);\n    var rows = await conn.QueryAsync<User>("SELECT * FROM Users", ct);\n    return rows.ToList();\n}`,
    "records and patterns": `public record Point(int X, int Y)\n{\n    public Point Shifted => this with { X = X + 1 };\n}\n\nstatic string Describe(object o) => o switch\n{\n    Point { X: 0, Y: 0 } => "origin",\n    Point p when p.X > 0 => $"right of {p.Y}",\n    int and > 10 => "big",\n    null => "nothing",\n    _ => "unknown",\n};`,
    linq: `var names = from u in users\n            where u.Age >= 18 && u.Name != null\n            orderby u.Name descending, u.Age\n            group u by u.City into g\n            select new { City = g.Key, Count = g.Count() };\n\nvar top = users.Where(u => u.Active).Select(u => u.Name).Take(5).ToArray();`,
    preprocessor: `#nullable enable\n#region Helpers\n#if DEBUG && !RELEASE\n#warning debug build\n#pragma warning disable CS0168\n#else\n#define TRACE\n#endif\n#endregion`,
    operators: `x = a + b * c / d % e;\ny = p == q ? r && s : t ?? u;\nname ??= obj?.Field ?? "anon";\nflags |= Mask.Read | Mask.Write;\nn = ~m ^ (i << 2) >> 1;\nvar slice = items[1..^1];\nchecked { total += 1; }`,
    "generic methods": `public static TOut Map<TIn, TOut>(TIn input, Func<TIn, TOut> f) where TOut : notnull\n{\n    return f(input);\n}\n\nvar list = Map<string, int>("42", int.Parse);\nvar q = new List<Dictionary<string, object>>();`,
    "unsafe and pointers": `unsafe\n{\n    fixed (byte* p = &buffer[0])\n    {\n        *p = 0xFF;\n        Marshal.Copy((IntPtr)p, dest, 0, len);\n    }\n}`,
  },
  ["summary", "param", "paramref", "returns", "see"].map(docTag),
);
