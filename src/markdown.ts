import { formatCommand } from './shell.js';
import type { CommandResult } from './types.js';

function codeBlock(value: string, language = 'text'): string {
  const fence = value.includes('```') ? '````' : '```';
  return `${fence}${language}\n${value}${value.endsWith('\n') ? '' : '\n'}${fence}`;
}

function renderEnv(env: Record<string, string>): string {
  const entries = Object.entries(env);

  if (entries.length === 0) {
    return '_No selected environment keys were present._';
  }

  return entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `- \`${key}\`: \`${value}\``)
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
    `- CWD: \`${result.cwd}\``,
    `- Exit: \`${exit}\``,
    `- Duration: \`${result.durationMs}ms\``,
    `- Started: \`${result.startedAt}\``,
    `- Finished: \`${result.finishedAt}\``,
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
