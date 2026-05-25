import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { pickEnvironment } from './env.js';
import { redactText } from './redact.js';
import { ReplayNoteError, type CommandResult, type RunCommandOptions } from './types.js';

export async function runCommand(options: RunCommandOptions): Promise<CommandResult> {
  const [executable, ...args] = options.command;

  if (!executable) {
    throw new ReplayNoteError('missing-command', 'Pass a command after --.');
  }

  const cwd = options.cwd ?? process.cwd();
  const env = options.passthroughEnv ?? process.env;
  const startedAt = new Date();
  const started = performance.now();

  return await new Promise<CommandResult>((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    child.on('error', reject);

    child.on('close', (exitCode, signal) => {
      const finishedAt = new Date();

      resolve({
        command: options.command,
        cwd,
        exitCode,
        signal,
        durationMs: Math.round(performance.now() - started),
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        env: pickEnvironment(env, options.envKeys),
        stdout: redactText(stdout),
        stderr: redactText(stderr)
      });
    });
  });
}
