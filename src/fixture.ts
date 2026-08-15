import { readFile } from 'node:fs/promises';
import { ReplayNoteError, type CommandResult } from './types.js';

const SIGNALS = new Set<NodeJS.Signals>([
  'SIGABRT', 'SIGALRM', 'SIGBREAK', 'SIGBUS', 'SIGCHLD', 'SIGCONT', 'SIGFPE',
  'SIGHUP', 'SIGILL', 'SIGINFO', 'SIGINT', 'SIGIO', 'SIGIOT', 'SIGKILL',
  'SIGLOST', 'SIGPIPE', 'SIGPOLL', 'SIGPROF', 'SIGPWR', 'SIGQUIT', 'SIGSEGV',
  'SIGSTKFLT', 'SIGSTOP', 'SIGSYS', 'SIGTERM', 'SIGTRAP', 'SIGTSTP', 'SIGTTIN',
  'SIGTTOU', 'SIGUNUSED', 'SIGURG', 'SIGUSR1', 'SIGUSR2', 'SIGVTALRM',
  'SIGWINCH', 'SIGXCPU', 'SIGXFSZ'
]);

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function isExitCode(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && (value as number) >= 0);
}

function isDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isSignal(value: unknown): value is NodeJS.Signals | null {
  return (
    value === null ||
    (typeof value === 'string' && SIGNALS.has(value as NodeJS.Signals))
  );
}

export function parseFixture(raw: string): CommandResult {
  const parsed: unknown = JSON.parse(raw);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as CommandResult).command) ||
    !(parsed as CommandResult).command.every((part) => typeof part === 'string') ||
    typeof (parsed as CommandResult).cwd !== 'string' ||
    !isExitCode((parsed as CommandResult).exitCode) ||
    !isSignal((parsed as CommandResult).signal) ||
    ((parsed as CommandResult).exitCode === null) === ((parsed as CommandResult).signal === null) ||
    !isDuration((parsed as CommandResult).durationMs) ||
    !isTimestamp((parsed as CommandResult).startedAt) ||
    !isTimestamp((parsed as CommandResult).finishedAt) ||
    !isStringRecord((parsed as CommandResult).env) ||
    typeof (parsed as CommandResult).stdout !== 'string' ||
    typeof (parsed as CommandResult).stderr !== 'string'
  ) {
    throw new ReplayNoteError('invalid-fixture', 'Fixture is not a ReplayNote command result.');
  }

  return parsed as CommandResult;
}

export async function readFixture(path: string): Promise<CommandResult> {
  let raw: string;

  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : 'UNKNOWN';
    throw new ReplayNoteError(
      'fixture-read-failed',
      `could not read fixture "${path}" (${code}).`
    );
  }

  try {
    return parseFixture(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ReplayNoteError(
        'fixture-parse-failed',
        `could not parse fixture "${path}" as JSON.`
      );
    }

    throw error;
  }
}
