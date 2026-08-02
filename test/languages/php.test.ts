import { testLanguage } from "./_harness.ts";

// every snippet opens with `<?php`: outside the tags the judges grade HTML, not
// PHP, and so does the grammar
testLanguage("php", {
  comments: `<?php
// a single line comment
# the shell flavoured one, still a comment
/* a block comment
   spanning two lines */
$debug = false; // TODO: read this from the environment`,

  docblock: `<?php
/**
 * Find a user by its identifier.
 *
 * @param int $id The primary key
 * @param bool $fresh Bypass the cache
 * @return User|null The user, or null when unknown
 * @throws StorageException
 */
public function find(int $id, bool $fresh = false): ?User
{
    return $fresh ? $this->reload($id) : $this->cache[$id] ?? null;
}`,

  strings: `<?php
$plain = 'no $interpolation, and a \\' quote';
$greeting = "Hello, $name! You have {$counts[$box]} unread.";
$escaped = "tab\\there\\nbell\\x07\\u{1F600} and a \\\\ backslash";
$path = 'C:\\\\Users\\\\' . $name;`,

  heredoc: `<?php
$body = <<<HTML
<p>Hello, {$user->name}!</p>
Total: $total\\n
HTML;

$sql = <<<'SQL'
SELECT * FROM users WHERE name = '$name'
SQL;

$listing = \`ls -l /tmp\`;`,

  numbers: `<?php
$int = 42;
$neg = -17;
$hex = 0xFF_EC;
$oct = 0o17;
$legacy = 0755;
$bin = 0b1010_0110;
$big = 1_000_000;
$float = 3.14159;
$sci = 6.022e23;
$tiny = .5e-3;`,

  classes: `<?php
namespace App\\Models;

use App\\Contracts\\Arrayable;
use App\\Support\\Str;

final class User extends Model implements Arrayable, JsonSerializable
{
    public const ROLE_ADMIN = 'admin';

    protected static int $count = 0;

    public function __construct(
        private readonly string $name,
        private ?string $email = null,
        protected array $roles = [],
    ) {
        self::$count++;
    }

    public function getName(): string
    {
        return Str::title($this->name);
    }
}`,

  "interfaces and enums": `<?php
interface Repository
{
    public function all(): iterable;
}

trait Timestamps
{
    public ?DateTimeImmutable $createdAt = null;
}

enum Status: string
{
    case Draft = 'draft';
    case Published = 'published';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'not published yet',
            self::Published => 'live',
        };
    }
}`,

  functions: `<?php
function slugify(string $value, string $separator = '-'): string
{
    return trim(preg_replace('/[^a-z0-9]+/i', $separator, $value), $separator);
}

$sum = fn(int ...$parts): int => array_sum($parts);

$slug = slugify(value: $title, separator: '_');

function counter(): Generator
{
    yield from range(1, 3);
}

echo sprintf('%s in %s', __FUNCTION__, __FILE__), PHP_EOL;`,

  "control flow": `<?php
foreach ($rows as $index => $row) {
    if ($index % 2 === 0) {
        continue;
    } elseif (empty($row)) {
        break;
    }

    try {
        $result = $handler->process($row);
    } catch (RuntimeException | LogicException $e) {
        error_log($e->getMessage());
        throw $e;
    } finally {
        unset($row);
    }
}

switch (true) {
    case $index > 1:
        echo 'big';
        break;
    default:
        echo 'small';
}`,

  attributes: `<?php
#[Attribute(Attribute::TARGET_CLASS)]
final class Route
{
    #[Deprecated(reason: 'use path instead')]
    public string $uri = '/';

    #[Route('/users/{id}', methods: ['GET', 'HEAD'])]
    public function show(int $id): Response
    {
        return new Response($id);
    }
}`,

  bootstrap: `<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use App\\Kernel;
use function App\\Support\\env;

const VERSION = '1.4.0';

if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

$kernel = new Kernel(env('APP_ENV', 'production'));
exit($kernel->run() ? 0 : 1);`,

  operators: `<?php
$x = $a === $b ? $a <=> $b : $a ?? $b;
$y ??= $z ?: $fallback;
$value = $obj?->child?->value;
$n = $i++ + --$j;
$mask = $flags & ~self::MASK | 0b1;
$total = (int) $raw + (float) $tax;
$text .= implode(', ', $parts);
$ref = &$original;
[$first, , $third] = $list;`,

  markup: `<?php $items = ['a', 'b']; ?>
<ul class="list">
<?php foreach ($items as $item): ?>
  <li><?= htmlspecialchars($item) ?></li>
<?php endforeach; ?>
</ul>`,
});
