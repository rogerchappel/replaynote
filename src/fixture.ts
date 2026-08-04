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
  return value === null || typeof value === 'number';
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
    typeof (parsed as CommandResult).durationMs !== 'number' ||
    typeof (parsed as CommandResult).startedAt !== 'string' ||
    typeof (parsed as CommandResult).finishedAt !== 'string' ||
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
