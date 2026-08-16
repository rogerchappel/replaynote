import { formatCommand } from './shell.js';
import type { CommandResult } from './types.js';

function codeBlock(value: string, language = 'text'): string {
  const longestBacktickRun = Math.max(
    0,
    ...Array.from(value.matchAll(/`+/g), ([match]) => match.length)
  );
  const fence = '`'.repeat(Math.max(3, longestBacktickRun + 1));
  return `${fence}${language}\n${value}${value.endsWith('\n') ? '' : '\n'}${fence}`;
}

function codeSpan(value: string): string {
  const longestBacktickRun = Math.max(
    0,
    ...Array.from(value.matchAll(/`+/g), ([match]) => match.length)
  );
  const fence = '`'.repeat(longestBacktickRun + 1);
  const needsPadding =
    value.length === 0 ||
    value.startsWith('`') ||
    value.endsWith('`') ||
    (value.startsWith(' ') && value.endsWith(' ') && value.trim().length > 0);
  const padding = needsPadding ? ' ' : '';

  return `${fence}${padding}${value}${padding}${fence}`;
}

function renderEnv(env: Record<string, string>): string {
  const entries = Object.entries(env);

  if (entries.length === 0) {
    return '_No selected environment keys were present._';
  }

  return entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `- ${codeSpan(key)}: ${codeSpan(value)}`)
    .join('\n');
}

export function formatMarkdown(result: CommandResult, title = 'ReplayNote'): string {
  const exit = result.signal ? `signal ${result.signal}` : String(result.exitCode);

  return [
    `# ${title}`,
    '',
    '## Command',
    '',
    codeBlock(formatCommand(result.command), 'sh'),
    '',
    '## Result',
    '',
    `- CWD: ${codeSpan(result.cwd)}`,
    `- Exit: ${codeSpan(exit)}`,
    `- Duration: ${codeSpan(`${result.durationMs}ms`)}`,
    `- Started: ${codeSpan(result.startedAt)}`,
    `- Finished: ${codeSpan(result.finishedAt)}`,
    '',
    '## Environment',
    '',
    renderEnv(result.env),
    '',
    '## Stdout',
    '',
    result.stdout.length > 0 ? codeBlock(result.stdout) : '_No stdout captured._',
    '',
    '## Stderr',
    '',
    result.stderr.length > 0 ? codeBlock(result.stderr) : '_No stderr captured._',
    ''
  ].join('\n');
}
