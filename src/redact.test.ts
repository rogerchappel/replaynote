import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { REDACTED, redactEnv, redactText } from './redact.js';

describe('redaction', () => {
  it('redacts secret-looking environment keys', () => {
    assert.deepEqual(
      redactEnv({
        CI: 'true',
        GITHUB_TOKEN: 'ghp_abcdefghijklmnopqrstuvwxyz',
        NODE_ENV: 'test'
      }),
      {
        CI: 'true',
        GITHUB_TOKEN: REDACTED,
        NODE_ENV: 'test'
      }
    );
  });

  it('redacts secret-looking values in command output', () => {
    assert.equal(
      redactText('email me@example.com token Bearer abcdefghijklmnop'),
      `email ${REDACTED} token ${REDACTED}`
    );
  });
});
