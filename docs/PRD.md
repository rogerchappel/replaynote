# ReplayNote PRD

Status: in-progress

## Summary

ReplayNote turns a short local command run into a reproducible Markdown note: command, cwd, exit code, selected environment keys, sanitized output, and fixture references. It gives developers and agents a tidy paper trail without recording secrets or terminal noise.

## Problem

Bug reports and agent handoffs often say "I ran the smoke test" but omit the exact command or useful output. Full terminal recorders are heavy and risky. ReplayNote records just enough to reproduce local checks safely.

## V1 Scope

- Run a command locally through an explicit `--` separator.
- Capture stdout, stderr, exit code, duration, cwd, and selected safe environment keys.
- Redact common secret-looking values.
- Emit Markdown and JSON reports.
- Support a no-exec mode that formats an existing result fixture.
- Include tests for redaction, formatting, and command capture.

## Non-Goals

- TTY session recording.
- Shell history ingestion.
- Remote execution.

## CLI

```bash
replaynote run --out smoke.md -- npm test
replaynote format fixtures/result.json --format markdown
```

## Source Attribution

Inspired by script/shell transcript workflows and CI job summaries, reframed as a deterministic local-first note generator for agentic handoffs.
