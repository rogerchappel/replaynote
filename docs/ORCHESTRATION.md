# Orchestration Plan

`replaynote` captures command runs into reviewable notes for debugging and handoff workflows.

1. Run the target command through the CLI with the desired output format.
2. Store the generated markdown or JSON note with the related issue, PR, or incident record.
3. Review captured command, exit status, duration, and redacted environment context before sharing externally.
4. Run `npm run release:check` before publishing so tests, smoke checks, and package contents stay aligned.

The package records execution evidence; it does not decide whether a command was safe to run. Callers should apply their own approval and secret-handling policies.
