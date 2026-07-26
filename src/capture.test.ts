import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runCommand } from './capture.js';
import { ReplayNoteError } from './types.js';

describe('command capture', () => {
  it('captures stdout, stderr, status, and selected environment keys', async () => {
    const result = await runCommand({
      command: [
        process.execPath,
        '-e',
        "console.log(process.env.REPLAYNOTE_SAFE); console.error('warn')"
      ],
      envKeys: ['REPLAYNOTE_SAFE'],
      passthroughEnv: {
        ...process.env,
        REPLAYNOTE_SAFE: 'visible'
      }
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout, 'visible\n');
    assert.equal(result.stderr, 'warn\n');
    assert.equal(result.env.REPLAYNOTE_SAFE, 'visible');
    assert.ok(result.durationMs >= 0);
  });

  it('wraps a missing executable with command and working-directory context', async () => {
    const executable = 'definitely-command-does-not-exist';
    const cwd = process.cwd();

    await assert.rejects(
      runCommand({ command: [executable], cwd }),
      (error: unknown) => {
        assert.ok(error instanceof ReplayNoteError);
        assert.equal(error.code, 'command-start-failed');
        assert.equal(
          error.message,
          `could not start command "${executable}" in "${cwd}" (ENOENT).`
        );
        return true;
      }
    );
  });

  it('wraps an unavailable working directory with command and path context', async () => {
    const cwd = '/definitely/missing/replaynote-directory';

    await assert.rejects(
      runCommand({ command: [process.execPath, '--version'], cwd }),
      (error: unknown) => {
        assert.ok(error instanceof ReplayNoteError);
        assert.equal(error.code, 'command-start-failed');
        assert.equal(
          error.message,
          `could not start command "${process.execPath}" in "${cwd}" (ENOENT).`
        );
        return true;
      }
    );
  });
});
