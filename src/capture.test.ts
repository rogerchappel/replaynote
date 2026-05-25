import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runCommand } from './capture.js';

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
});
