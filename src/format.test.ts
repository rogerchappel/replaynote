import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatResult } from './format.js';
import { parseFixture } from './fixture.js';
import type { CommandResult } from './types.js';

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
