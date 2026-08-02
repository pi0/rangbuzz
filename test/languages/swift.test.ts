import { testLanguage } from "./_harness.ts";

testLanguage(
  "swift",
  {
    comments: `// a plain line comment
/// A greeting for the given name.
///
/// - Parameter name: who to greet
/// - Returns: the greeting
/**
 A block doc comment.
 - Note: these nest too
 */
/* regular block
   spanning lines */
/* outer /* nested */ still outer */
// TODO: localize this
// CHANGED: switched to async/await`,

    declarations: `import Foundation

typealias Completion = (Result<Data, Error>) -> Void

final class Store: NSObject {
  static let shared = Store()
  private(set) var items: [Item] = []

  override init() { super.init() }
  deinit { items.removeAll() }

  var isEmpty: Bool {
    get { items.isEmpty }
    set { if newValue { items.removeAll() } }
  }

  var tracked = 0 {
    didSet { print("was \\(oldValue)") }
    willSet { }
  }
}`,

    swiftui: `struct ContentView: View {
  @State private var count = 0
  @Environment(\\.colorScheme) private var scheme
  @Binding var title: String

  var body: some View {
    VStack(spacing: 12) {
      Text("Tapped \\(count) time\\(count == 1 ? "" : "s")")
        .font(.headline)
      Button("Tap me") { count += 1 }
    }
    .padding()
  }
}`,

    protocols: `protocol Repository {
  associatedtype Item: Identifiable
  var count: Int { get }
  func fetch(id: Item.ID) throws -> Item
}

extension Repository where Item: Equatable {
  func contains(_ item: Item) -> Bool { true }
}`,

    concurrency: `@available(iOS 15, *)
actor Loader {
  private var cache: [URL: Data] = [:]

  func load(from url: URL) async throws -> Data {
    guard let cached = cache[url] else {
      let (data, _) = try await URLSession.shared.data(from: url)
      cache[url] = data
      return data
    }
    return cached
  }
}`,

    patterns: `enum Outcome {
  case success(Int)
  case failure(Error, retry: Bool)
}

switch outcome {
case .success(let value) where value > 0:
  print("ok \\(value)")
case .success, .failure(_, retry: false):
  fallthrough
case .failure(let error, _):
  throw error
default:
  break
}`,

    control: `func process(_ values: inout [Int]) {
  defer { values.removeAll() }
  outer: for (i, v) in values.enumerated() {
    if v == 0 { continue outer }
    while v > i { break }
  }
  repeat { values.append(0) } while values.count < 3
}

indirect enum Tree {
  case leaf(Int)
  case node(Tree, Tree)
}`,

    generics: `struct Stack<Element> {
  private var storage: [Element] = []

  mutating func push(_ item: Element) { storage.append(item) }
  subscript(i: Int) -> Element { storage[i] }
}

func firstIndex<C: Collection>(of value: C.Element, in c: C) -> Int?
  where C.Element: Equatable { nil }

func make() -> some Shape { Circle() }
let shape: any Shape = Circle()`,

    strings: `let plain = "hello, world"
let escaped = "tab\\tnewline\\nquote\\"backslash\\\\"
let unicode = "\\u{1F600} and \\u{2764}"
let greeting = "\\(user.name) has \\(items.count) item\\(items.count == 1 ? "" : "s")"`,

    multiline: `let query = """
    SELECT *
    FROM users
    WHERE name = "\\(name)"
    """`,

    raw: `let pattern = #"\\d{3}-\\d{4}"#
let windows = #"C:\\Users\\admin\\Documents"#
let mixed = ##"a "# that stays raw"##
let embedded = #"id = \\#(user.id)"#`,

    numbers: `let ints = [0, 42, 1_000_000]
let hex = 0xFF_FF
let hexFloat = 0x1p4
let oct = 0o755
let bin = 0b1010_0101
let floats = [3.14, 6.02e23, 1.5e-9]`,

    optionals: `var nickname: String?
let length = nickname?.count ?? 0
if let name = nickname, !name.isEmpty {
  print(name.uppercased())
}
guard let first = names.first as? String else { return nil }
let forced = nickname!.trimmingCharacters(in: .whitespaces)`,

    closures: `let names = people.map { $0.name }.filter { !$0.isEmpty }.sorted()
let total = orders.reduce(into: 0) { sum, order in sum += order.total }
let byName = people.sorted(by: \\.name)
DispatchQueue.main.async { [weak self] in
  self?.reload()
}`,

    directives: `#if DEBUG
  print(#function, #line, #file)
#elseif os(macOS)
  let action = #selector(AppDelegate.reload(_:))
#else
  #warning("unsupported platform")
#endif`,
  },
  // a `///` or `/** */` comment is documentation, so its markup callouts are
  // painted as the structure they are; the judges only ever see one flat
  // comment there
  ["- Parameter", "- Returns", "- Note"].map((text) => ({
    text,
    judges: "cmnt" as const,
    shj: "kwd" as const,
    why: "a doc comment callout is picked out of the comment, the way `todo` picks out TODO",
  })),
);
