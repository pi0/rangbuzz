import { testLanguage } from "./_harness.ts";

testLanguage(
  "rb",
  {
    comments: `# frozen_string_literal: true\n=begin\nA block comment,\nspanning lines.\n=end\nvalue = 1 # TODO: rename`,
    strings: `name = "double"\nother = 'single, no #{interp}'\nescaped = "she said \\"hi\\"\\n"\nquote = 'it\\'s fine'`,
    interpolation: `puts "Hello #{name}, you owe #{total - paid} for #{h[:plan]}"\nputs "nested #{items.map { |i| i.id }.join(", ")}"`,
    "percent literals": `WORDS = %w[alpha beta gamma]\nKEYS = %i[id name email]\nraw = %q(no #{interp} here)\ncooked = %Q{sum is #{a + b}}\nbare = %(plain #{x})\npattern = %r{\\A\\d{3}-\\d{4}\\z}i\nshell = %x(ls -la)`,
    heredocs: `sql = <<~SQL\n  SELECT *\n  FROM invoices\n  WHERE id = #{id}\nSQL\n\nusage = <<-HELP\n  usage: tool [options]\n  HELP\n\nbanner = <<BANNER\nplain heredoc, terminator at column 0\nBANNER\n\nraw = <<~'RAW'\n  literal #{not_interpolated}\nRAW`,
    "class definition": `module Billing\n  class Invoice < Record\n    include Comparable\n\n    MAX_ITEMS = 100\n\n    attr_accessor :customer, :total\n    attr_reader :id\n\n    def initialize(id, customer:, total: 0.0)\n      @id = id\n      @customer = customer\n      @total = total\n      @@count += 1\n    end\n\n    def self.build(row)\n      new(row[:id], customer: row[:customer])\n    end\n\n    def paid?\n      !@total.zero?\n    end\n\n    def total=(value)\n      @total = value.to_f\n    end\n\n    def to_s\n      "Invoice #{@id} for #{@customer}"\n    end\n  end\nend`,
    blocks: `items.each do |item|\n  puts item.name\nend\n\ntotals = items.map { |i| i.price * i.qty }\nactive = users.select { |u| u.active? }.map(&:name)\n3.times { |n| yield n }\ndouble = lambda { |x| x * 2 }\nbump = proc { |y| y + 1 }`,
    "modules and requires": `require "json"\nrequire_relative "../lib/store"\n\nmodule Util\n  module_function\n\n  def dump(obj)\n    JSON.generate(obj)\n  end\n\n  alias_method :to_json, :dump\nend\n\nputs defined?(Util) ? __method__ : "none"`,
    "case when": `case status\nwhen :pending, :queued then "waiting"\nwhen /\\Aerr/ then "error"\nwhen 1..5\n  "small"\nelse\n  "unknown"\nend`,
    exceptions: `begin\n  raise ArgumentError, "bad #{value}" unless valid?\nrescue ArgumentError => e\n  warn e.message\n  retry if attempts < 3\nrescue StandardError\n  raise\nensure\n  file&.close\nend`,
    "symbols and hashes": `config = { host: "localhost", port: 8080, tags: %i[a b] }\nlegacy = { :name => "old", "str" => 1 }\nputs config[:host]\nputs config.fetch(:port, 80)\nsend(:update!, id)`,
    variables: `$stdout.puts "boot"\n@config = {}\n@@registry ||= []\n$LOAD_PATH.unshift(dir)\nputs $0`,
    numbers: `0 42 3.14 1_000_000 0xff 0b1010 0o17 1e-9 1.5e3 2i 3r`,
    booleans: `enabled = true\ndisabled = false\nmissing = nil\nputs "on" if enabled && !disabled\nputs missing.nil? ? "none" : missing`,
    "control flow": `while queue.any?\n  job = queue.shift\n  next if job.nil?\n  break unless job.ready?\nend\n\nuntil done\n  done = step\nend\n\nfor i in 0...10 do\n  redo if i.zero?\nend`,
    operators: `avg = total / count\nratio = (a + b) / 2.0\nn = 10 % 3\norder = x <=> y\nflag = a && b || !c\nsquare = base ** 2\nlist = [1, 2, 3] << 4\nname = person&.name\nfound = text =~ /\\d+/\nclean = text.gsub /\\s+/, " "\nassert_match /error/, output\nletter = ?a\nbreaker = ?\\n\nscoped = Foo::Bar::BAUD\npadded = format("%.2f", total)`,
  },
  [
    // Prism's interpolation pattern cannot cross the `}` of a nested block, so
    // it gives up half way through `#{items.map { |i| i.id }.join(", ")}` and
    // reads the tail as string text; Shiki paints every interpolation with the
    // enclosing string scope. Where Prism's pattern does work — `#{name}` — it
    // agrees with us that interpolated code is code, not string text.
    {
      text: '#{items.map { |i| i.id }.join("',
      judges: "str",
      shj: "other",
      why: "interpolated code is deliberately not painted as string text, and Prism says the same wherever its own interpolation pattern survives the nested braces",
    },
    {
      text: '")}',
      judges: "str",
      shj: "other",
      why: "the tail of the same interpolation, which Prism mis-reads as a second string literal",
    },
    // `/` is division as often as it opens a regex, and nothing but a parser
    // can tell the two apart. The grammar recognises a literal only where a
    // division cannot stand — after an operator, a bracket, a comma, a keyword,
    // or one of the methods that idiomatically take a bare pattern — which
    // leaves a pattern passed bare to any other method unpainted.
    {
      text: "/error/",
      judges: "str",
      shj: "other",
      bug: true,
      why: "a regex handed bare to an arbitrary method (`assert_match /error/, out`) is read as two divisions; recognising it would mean mis-reading real division far more often",
    },
  ],
);
