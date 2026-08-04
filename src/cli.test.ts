import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

type CliResult = {
  exitCode: number | null;
  stderr: string;
  stdout: string;
};

async function runCli(args: string[]): Promise<CliResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [new URL('./cli.js', import.meta.url).pathname, ...args], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (exitCode) => resolve({ exitCode, stderr, stdout }));
  });
}

describe('CLI command start errors', () => {
  it('reports a missing executable without an internal stack trace', async () => {
    const executable = 'definitely-command-does-not-exist';
    const result = await runCli(['run', '--', executable]);

    assert.equal(result.exitCode, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, new RegExp(`^replaynote: could not start command "${executable}"`));
    assert.match(result.stderr, /\(ENOENT\)\.\n$/);
    assert.doesNotMatch(result.stderr, /node:child_process|    at /);
  });

  it('reports an unavailable working directory without an internal stack trace', async () => {
    const cwd = '/definitely/missing/replaynote-directory';
    const result = await runCli(['run', '--cwd', cwd, '--', process.execPath, '--version']);

    assert.equal(result.exitCode, 2);
    assert.equal(result.stdout, '');
    assert.equal(
      result.stderr,
      `replaynote: could not start command "${process.execPath}" in "${cwd}" (ENOENT).\n`
    );
    assert.doesNotMatch(result.stderr, /node:child_process|    at /);
  });
});

describe('CLI fixture errors', () => {
  for (const [description, fixture] of [
    [
      'incomplete result metadata',
      { command: ['npm', 'test'], cwd: '/repo', env: {}, stdout: '', stderr: '' }
    ],
    [
      'a non-string command entry',
      {
        command: ['npm', null],
        cwd: '/repo',
        durationMs: 1,
        env: {},
        exitCode: 0,
        finishedAt: '2026-05-26T00:00:01.000Z',
        signal: null,
        startedAt: '2026-05-26T00:00:00.000Z',
        stderr: '',
        stdout: ''
      }
    ]
  ] as const) {
    it(`reports ${description} without formatted output`, async () => {
      const directory = await mkdtemp(join(tmpdir(), 'replaynote-cli-test-'));
      const path = join(directory, 'fixture.json');

      try {
        await writeFile(path, JSON.stringify(fixture), 'utf8');
        const result = await runCli(['format', path, '--format', 'both']);

        assert.equal(result.exitCode, 2);
        assert.equal(result.stdout, '');
        assert.equal(result.stderr, 'replaynote: Fixture is not a ReplayNote command result.\n');
      } finally {
        await rm(directory, { force: true, recursive: true });
      }
    });
  }
});
