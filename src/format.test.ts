import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatResult } from './format.js';
import { parseFixture } from './fixture.js';
import { ReplayNoteError, type CommandResult } from './types.js';

const result: CommandResult = {
  command: ['npm', 'test'],
  cwd: '/repo',
  durationMs: 42,
  env: { CI: 'true' },
  exitCode: 0,
  finishedAt: '2026-05-26T00:00:01.000Z',
  signal: null,
  startedAt: '2026-05-26T00:00:00.000Z',
  stderr: '',
  stdout: 'ok\n'
};

describe('formatting', () => {
  it('renders Markdown reports', () => {
    const markdown = formatResult(result, {
      format: 'markdown',
      title: 'Smoke Test'
    });

    assert.match(markdown, /^# Smoke Test/);
    assert.match(markdown, /npm test/);
    assert.match(markdown, /Exit: `0`/);
    assert.match(markdown, /ok/);
  });

  it('uses a fence longer than four-backtick output', () => {
    const markdown = formatResult(
      { ...result, stdout: 'before\n````\nafter\n' },
      { format: 'markdown' }
    );

    assert.match(markdown, /## Stdout\n\n`````text\nbefore\n````\nafter\n`````\n/);
  });

  it('uses a fence longer than every mixed backtick run', () => {
    const markdown = formatResult(
      {
        ...result,
        command: ['printf', '``` and ``````'],
        stderr: 'short ``` run\nlong ``````` run\n',
        stdout: 'ordinary output\n'
      },
      { format: 'markdown' }
    );

    assert.match(markdown, /## Command\n\n```````sh\nprintf/);
    assert.match(markdown, /## Stdout\n\n```text\nordinary output\n```\n/);
    assert.match(
      markdown,
      /## Stderr\n\n````````text\nshort ``` run\nlong ``````` run\n````````\n/
    );
  });

  it('preserves literal backticks and surrounding spaces in report metadata', () => {
    const markdown = formatResult(
      {
        ...result,
        cwd: '/repo/cwd`segment',
        env: {
          'DEMO`KEY': 'alpha`beta',
          PADDED: ' alpha`beta '
        }
      },
      { format: 'markdown' }
    );

    assert.match(markdown, /- CWD: ``\/repo\/cwd`segment``/);
    assert.match(markdown, /- ``DEMO`KEY``: ``alpha`beta``/);
    assert.match(markdown, /- `PADDED`: ``  alpha`beta  ``/);
  });

  it('renders JSON reports that parse as fixtures', () => {
    const json = formatResult(result, { format: 'json' });

    assert.deepEqual(parseFixture(json), result);
  });

  it('renders combined reports', () => {
    const both = formatResult(
      { ...result, stdout: 'literal ```` output\n' },
      { format: 'both' }
    );

    assert.match(both, /^# ReplayNote/);
    assert.match(both, /`````text\nliteral ```` output\n`````/);
    assert.match(both, /## JSON/);
  });
});

describe('fixture parsing', () => {
  it('accepts exit-code and signal result variants', () => {
    assert.deepEqual(parseFixture(JSON.stringify(result)), result);

    const signaled = { ...result, exitCode: null, signal: 'SIGTERM' as const };
    assert.deepEqual(parseFixture(JSON.stringify(signaled)), signaled);
  });

  it('rejects incomplete result metadata', () => {
    const { durationMs: _durationMs, ...incomplete } = result;

    assert.throws(
      () => parseFixture(JSON.stringify(incomplete)),
      (error: unknown) =>
        error instanceof ReplayNoteError && error.code === 'invalid-fixture'
    );
  });

  it('rejects non-string command entries', () => {
    assert.throws(
      () => parseFixture(JSON.stringify({ ...result, command: ['npm', null] })),
      (error: unknown) =>
        error instanceof ReplayNoteError && error.code === 'invalid-fixture'
    );
  });
});
