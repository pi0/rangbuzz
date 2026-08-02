import { testLanguage } from "./_harness.ts";

testLanguage("bash", {
  comments: `# a comment\nls # TODO: flags`,
  strings: `echo "double $HOME" 'single' "esc\\"aped"`,
  variables: `NAME=value\necho $NAME \${OTHER} $(date)`,
  commands: `git status\n./script.sh --flag\ncat /etc/hosts | grep -i a`,
  keywords: `if [ -f a ]; then\n  export X=1\nelif true; then\n  exit 1\nfi\n\nfor f in *; do\n  echo $f\ndone`,
  numbers: `sleep 10\nexit 0`,
  // at the start of a line `true` is read as a command, not as a boolean
  booleans: `echo true\necho false`,
  operators: `a=$((1 + 2))\ncmd && other || fallback\ntest ! -z "$a"`,
});
