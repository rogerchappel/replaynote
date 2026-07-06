# ReplayNote Social Hooks

Grounded notes for short posts about ReplayNote. These claims are limited to
the current CLI behavior in this repository.

## Hooks

- Turn a local command run into a Markdown handoff note with command, cwd,
  exit status, duration, stdout, and stderr captured in one place.
- Replay a known result fixture into Markdown or JSON without re-running the
  original command, useful when you need deterministic docs or examples.
- Include only selected environment keys, then redact common secret-looking
  values before a note is shared.
- Use `--format both` when a reviewer wants a readable Markdown report plus the
  underlying JSON payload in the same file.

## Demo Beats

1. Run `bash examples/fixture-demo.sh`.
2. Open the generated Markdown report in `/tmp/replaynote-fixture-demo`.
3. Show the matching JSON report and point out that both come from
   `fixtures/result.json`.
4. Close with the normal local gate: `npm run release:check`.

## Caveats

- Redaction is a safety net, not a guarantee; generated notes should still be
  reviewed before public sharing.
- ReplayNote captures selected environment keys only when they are requested
  with `--env`.
