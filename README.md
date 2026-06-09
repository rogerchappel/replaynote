# ReplayNote

ReplayNote turns local command runs into reproducible Markdown and JSON notes.
It captures the command, cwd, exit status, duration, selected environment keys,
stdout, and stderr, then redacts common secret-looking values before writing a
handoff-friendly report.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

```sh
npm install -g @rogerchappel/replaynote
```

For local development:

```sh
npm install
npm run check
npm test
npm run build
```

## Use

Run a command after `--` and write a Markdown note:

```sh
replaynote run --out smoke.md -- npm test
```

Emit JSON instead:

```sh
replaynote run --format json -- node --version
```

Include selected environment keys:

```sh
replaynote run --env CI,NODE_ENV --out smoke.md -- npm test
```

Format an existing result fixture without running a command:

```sh
replaynote format fixtures/result.json --format markdown
```

Use `--format both` to append the JSON payload below the Markdown report.

## What Gets Captured

- Command and working directory
- Exit code or signal
- Start time, finish time, and duration
- Selected environment keys only
- Stdout and stderr

ReplayNote redacts common token, password, private key, email, bearer, GitHub,
Slack, and AWS access key patterns. Redaction is a safety net, not a guarantee;
review generated notes before sharing them publicly.

## Verify

Run the local release gate before opening a pull request:

```sh
npm run release:check
npm run validate
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT

## Verification

Run the release-readiness checks before publishing or cutting a PR:

```bash
npm run check
npm run build
npm run test
npm run smoke
npm run package:smoke
npm run release:check
```

Use `npm run package:smoke` or `npm pack --dry-run` to confirm the published tarball includes the support docs and runnable package contents.
