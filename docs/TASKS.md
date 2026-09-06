# Task Breakdown

## Release readiness

- Keep command-capture fixtures aligned with markdown and JSON output formats.
- Run `npm run release:check` before publishing or tagging a release candidate.
- Use `npm run package:smoke` to pack the exact artifact, verify its compiled output, examples, fixtures, and support docs, install it in a disposable consumer, and exercise the installed CLI.

## Follow-up candidates

- Add fixtures for failed commands and redacted environment values.
- Document retention guidance for replay notes that include sensitive command context.
