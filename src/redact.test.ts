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

  it('redacts every supported secret-value format without leaking fixture values', () => {
    const fixtures = [
      { label: 'email', value: 'private.person@example.test', input: 'contact private.person@example.test' },
      { label: 'API token', value: 'sk_abcdefgh12345678', input: 'token sk_abcdefgh12345678' },
      { label: 'GitHub token', value: 'ghp_abcdefgh12345678', input: 'token ghp_abcdefgh12345678' },
      { label: 'GitHub fine-grained token', value: 'github_pat_abcdefgh12345678', input: 'token github_pat_abcdefgh12345678' },
      { label: 'Slack token', value: 'xoxb_abcdefgh12345678', input: 'token xoxb_abcdefgh12345678' },
      { label: 'AWS access key', value: 'AKIA1234567890ABCDEF', input: 'key AKIA1234567890ABCDEF' },
      { label: 'bearer authorization', value: 'Bearer abcdefghijklmnop', input: 'auth Bearer abcdefghijklmnop' },
      { label: 'basic authorization', value: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l', input: 'auth Basic YWxhZGRpbjpvcGVuc2VzYW1l' },
      {
        label: 'multiline PEM private key',
        value: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAfixture-only\n-----END RSA PRIVATE KEY-----',
        input: 'key -----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAfixture-only\n-----END RSA PRIVATE KEY----- end'
      }
    ];

    for (const { label, value, input } of fixtures) {
      const result = redactText(input);
      assert.ok(result.includes(REDACTED), `${label} should be redacted`);
      assert.ok(!result.includes(value), `${label} fixture should not leak`);
    }
  });
});
