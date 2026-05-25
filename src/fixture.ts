import { readFile } from 'node:fs/promises';
import { ReplayNoteError, type CommandResult } from './types.js';

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

export function parseFixture(raw: string): CommandResult {
  const parsed: unknown = JSON.parse(raw);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as CommandResult).command) ||
    typeof (parsed as CommandResult).cwd !== 'string' ||
    !isStringRecord((parsed as CommandResult).env) ||
    typeof (parsed as CommandResult).stdout !== 'string' ||
    typeof (parsed as CommandResult).stderr !== 'string'
  ) {
    throw new ReplayNoteError('invalid-fixture', 'Fixture is not a ReplayNote command result.');
  }

  return parsed as CommandResult;
}

export async function readFixture(path: string): Promise<CommandResult> {
  return parseFixture(await readFile(path, 'utf8'));
}
