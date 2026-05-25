import type { CommandResult } from './types.js';

export function formatJson(result: CommandResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}
