import { testLanguage } from "./_harness.ts";

testLanguage(
  "kt",
  {
    comments: `// a line comment\n/* a block comment\n   spanning lines */\n/* outer /* inner */ still outer */\n// TODO: nested comments are a Kotlin thing`,
    kdoc: `/**\n * Sums [a] and [b], saturating on overflow.\n *\n * @param a the first addend\n * @param b the second addend\n * @return the sum, or [Int.MAX_VALUE]\n */\nfun saturatingAdd(a: Int, b: Int): Int = a + b`,
    strings: `val plain = "double quoted"\nval escaped = "he said \\"hi\\"\\tand\\nleft"\nval dollar = "costs \\$5, not \\$name"\nval unicode = "\\u00e9t\\u00e9"\nval c = 'x'\nval nl = '\\n'\nval quote = '\\''\nval cp = '\\u0041'`,
    "raw strings": `val query = """\n  SELECT id, name\n    FROM users\n   WHERE name = '$name' AND age > \${minAge + 1}\n""".trimIndent()\n\nval literalDollar = """price: \${'$'}9.99"""`,
    interpolation: `val greeting = "Hello, $name! You are \${user.age} years old."\nval nested = "names: \${people.map { it.name }.joinToString()}"\nval indexed = "first = \${list[0]}, last = \${list[list.size - 1]}"`,
    numbers: `val ints = listOf(0, 42, 1_000_000, 0xFF, 0b1010_1010)\nval longs = listOf(100L, 0xDEAD_BEEFL, 9_223_372_036_854_775_807L)\nval unsigned = listOf(7u, 42uL, 0xFFu)\nval floats = listOf(3.14f, 0.5F, 2.5e3, 1e-9, 6.022e23)`,
    "data classes": `package com.example.app\n\nimport kotlinx.coroutines.Dispatchers\nimport kotlinx.coroutines.withContext\n\ndata class User(val id: Long, val name: String, val email: String? = null) {\n  val initials: String\n    get() = name.split(" ").map { it.first() }.joinToString("")\n}\n\nenum class Role { ADMIN, EDITOR, VIEWER }\n\ntypealias Users = List<User>`,
    "sealed classes": `sealed class Result<out T> {\n  data class Success<T>(val value: T) : Result<T>()\n  data class Failure(val error: Throwable) : Result<Nothing>()\n  object Loading : Result<Nothing>()\n}\n\nfun <T> Result<T>.orNull(): T? = when (this) {\n  is Result.Success -> value\n  is Result.Failure -> null\n  else -> null\n}`,
    coroutines: `suspend fun fetchAll(ids: List<Int>): List<User> = coroutineScope {\n  ids.map { id -> async(Dispatchers.IO) { api.fetch(id) } }.awaitAll()\n}\n\n@Throws(IOException::class)\nsuspend fun load(url: String): String = withContext(Dispatchers.IO) {\n  client.get(url).body()\n}`,
    "extension functions": `inline fun <reified T : Any> Bundle.require(key: String): T =\n  get(key) as? T ?: error("missing $key")\n\ninfix fun Int.clampTo(range: IntRange): Int = coerceIn(range)\n\nfun <T> Iterable<T>.second(): T where T : Comparable<T> = sorted()[1]`,
    "classes and objects": `class Repo internal constructor(private val db: Db) : Closeable by db {\n  lateinit var cache: MutableMap<String, User>\n  val logger: Logger by lazy { Logger.of(Repo::class) }\n\n  init {\n    cache = mutableMapOf()\n  }\n\n  companion object Factory {\n    const val VERSION = 3\n\n    @JvmStatic\n    fun create() = Repo(Db.open())\n  }\n\n  override fun close() = db.close()\n}\n\ninterface Store<K, V> {\n  operator fun get(key: K): V?\n  fun put(key: K, value: V)\n}`,
    modifiers: `public expect abstract class Platform {\n  protected abstract val name: String\n}\n\nactual final class Jvm : Platform() {\n  actual override val name: String = "jvm"\n    get() = field.uppercase()\n}\n\nannotation class Marker\ninner class Meters(val v: Double)\n\ntailrec fun gcd(a: Int, b: Int): Int = if (b == 0) a else gcd(b, a % b)\nexternal fun native(vararg args: String): Unit\ninline fun wrap(noinline f: () -> Unit, crossinline g: () -> Unit) = f()`,
    annotations: `@file:JvmName("Utils")\n@file:Suppress("UNUSED")\n\n@Composable\nfun Greeting(@StringRes id: Int, modifier: Modifier = Modifier) {\n  Text(text = stringResource(id), modifier = modifier)\n}\n\ndata class Dto(@field:Json(name = "user_id") val userId: Long)`,
    "lambdas and labels": `val (name, age) = person\n\nusers.forEach { user ->\n  if (user.age < 18) return@forEach\n  println("\${user.name} is \${user.age}")\n}\n\nloop@ for (i in 1..10) {\n  for (j in 1..10) if (i * j > 50) break@loop\n}\n\nval short = users.map { it.name }.filter { it.isNotEmpty() }`,
    nullability: `fun find(id: Int): User? = users[id]\n\nval len = find(1)?.name?.length ?: 0\nval forced = find(2)!!.name\nval cast = (obj as? User)?.email.orEmpty()\nval chained = repo?.cache?.get("a")?.takeIf { it.id > 0 }`,
    operators: `for (i in 10 downTo 1 step 3) print(i)\n\nval inRange = x in 1..100 && y !in setOf(0)\nval mask = flags and 0xF0 shl 2 or 1 xor 3\nval pair = "a" to 1\nval eq = a == b && a !== c\ni++\nj--\nn += 2`,
  },
  [
    // Kotlin block comments nest, which both judges get wrong: Prism's `clike`
    // comment and the TextMate grammar Shiki uses both stop at the first `*/`,
    // so the tail of a nested comment reads as code to them
    {
      text: " still outer ",
      judges: "other",
      shj: "cmnt",
      why: "block comments nest in Kotlin, so the inner `*/` closes only the inner one",
    },
    // inside kdoc the annotation language takes over, so a documentation link
    // is no longer painted as comment text
    {
      text: "[a]",
      judges: "cmnt",
      shj: "other",
      why: "a `[link]` is claimed by the kdoc sub-language, which the judges read as plain comment text",
    },
    {
      text: "[b]",
      judges: "cmnt",
      shj: "other",
      why: "a `[link]` is claimed by the kdoc sub-language, which the judges read as plain comment text",
    },
  ],
);
