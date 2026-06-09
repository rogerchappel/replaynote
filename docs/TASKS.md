# Task Breakdown

## Release readiness

- Keep command-capture fixtures aligned with markdown and JSON output formats.
- Run `npm run release:check` before publishing or tagging a release candidate.
- Use `npm run package:smoke` to confirm the published package includes compiled output, examples, fixtures, and support docs.

## Follow-up candidates

- Add fixtures for failed commands and redacted environment values.
- Document retention guidance for replay notes that include sensitive command context.
