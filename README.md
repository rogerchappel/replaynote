# ReplayNote

ReplayNote turns local command runs into reproducible Markdown and JSON notes.
It captures the command, cwd, exit status, duration, selected environment keys,
stdout, and stderr, then redacts common secret-looking values before writing a
handoff-friendly report.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

ReplayNote is not yet available from the npm registry. Until the first tagged
release publishes `@rogerchappel/replaynote`, install it from source:

```sh
git clone https://github.com/rogerchappel/replaynote.git
cd replaynote
npm ci
npm run build
npm link
```

After the first npm release, the global installation command will be:

```sh
npm install -g @rogerchappel/replaynote
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

ReplayNote command-start, validation, and file failures print one concise
diagnostic to stderr and exit with status 2. This includes commands that cannot start,
fixtures that cannot be read or parsed, invalid fixture data, and output paths
that cannot be written. These failures do not emit partial formatted output or
internal stack traces. Commands that start successfully retain their own exit
status.

Format an existing result fixture without running a command:

```sh
replaynote format fixtures/result.json --format markdown
```

Use `--format both` to append the JSON payload below the Markdown report.
Markdown reports preserve literal command output, including runs of backticks,
by automatically choosing code fences that cannot collide with captured text.

Result fixtures require a non-negative integer `exitCode` and a null `signal`,
or a null `exitCode` and a recognized signal. `durationMs` must be a finite,
non-negative number, and `startedAt` and `finishedAt` must be valid timestamps.

Run the checked-in fixture demo to create Markdown and JSON reports from the
sample result fixture:

```sh
bash examples/fixture-demo.sh
```

Short promotion hooks for demo videos and social posts live in
[`docs/promo/social-hooks.md`](docs/promo/social-hooks.md).

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

## Release readiness

Run the same checks that CI uses before opening a release PR:

```sh
npm run release:readiness
npm run release:check
```

`release:readiness` validates repository metadata, package identity, the
packaged CLI entry point, and the npm publication workflow. `release:check`
runs the project build, test, smoke, and release-readiness checks.

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
