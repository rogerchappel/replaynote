export type OutputFormat = 'markdown' | 'json' | 'both';

export type CapturedStreams = {
  stdout: string;
  stderr: string;
};

export type CommandResult = CapturedStreams & {
  command: string[];
  cwd: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  env: Record<string, string>;
};

export type RunCommandOptions = {
  command: string[];
  cwd?: string;
  envKeys?: string[];
  passthroughEnv?: NodeJS.ProcessEnv;
};

export type FormatOptions = {
  format: OutputFormat;
  title?: string;
};

export type WriteReportOptions = FormatOptions & {
  out?: string;
};

export type ReplayNoteErrorCode =
  | 'missing-command'
  | 'invalid-fixture'
  | 'unsupported-format';

export class ReplayNoteError extends Error {
  readonly code: ReplayNoteErrorCode;

  constructor(code: ReplayNoteErrorCode, message: string) {
    super(message);
    this.name = 'ReplayNoteError';
    this.code = code;
  }
}
