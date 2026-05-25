import { formatJson } from './json.js';
import { formatMarkdown } from './markdown.js';
import { ReplayNoteError, type CommandResult, type FormatOptions } from './types.js';

export function formatResult(result: CommandResult, options: FormatOptions): string {
  if (options.format === 'markdown') {
    return formatMarkdown(result, options.title);
  }

  if (options.format === 'json') {
    return formatJson(result);
  }

  if (options.format === 'both') {
    return [
      formatMarkdown(result, options.title).trimEnd(),
      '',
      '---',
      '',
      '## JSON',
      '',
      '```json',
      formatJson(result).trimEnd(),
      '```',
      ''
    ].join('\n');
  }

  throw new ReplayNoteError('unsupported-format', `Unsupported format: ${options.format}`);
}
