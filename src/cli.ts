#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { Command, InvalidArgumentError } from 'commander';
import { runCommand } from './capture.js';
import { parseEnvKeys } from './env.js';
import { formatResult } from './format.js';
import { readFixture } from './fixture.js';
import {
  ReplayNoteError,
  type FormatOptions,
  type OutputFormat,
  type RunCommandOptions
} from './types.js';

const FORMATS = new Set<OutputFormat>(['markdown', 'json', 'both']);

type CommonOptions = {
  format: OutputFormat;
  out?: string;
  title?: string;
};

type RunOptions = CommonOptions & {
  cwd?: string;
  env?: string;
};

function parseFormat(value: string): OutputFormat {
  if (FORMATS.has(value as OutputFormat)) {
    return value as OutputFormat;
  }

  throw new InvalidArgumentError('format must be markdown, json, or both');
}

async function writeOutput(out: string | undefined, output: string): Promise<void> {
  if (out) {
    try {
      await writeFile(out, output, 'utf8');
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : 'UNKNOWN';
      throw new ReplayNoteError(
        'output-write-failed',
        `could not write output "${out}" (${code}).`
      );
    }
    return;
  }

  process.stdout.write(output);
}

function normalizeCommand(command: string[]): string[] {
  return command[0] === '--' ? command.slice(1) : command;
}

function formatOptions(options: CommonOptions): FormatOptions {
  return options.title
    ? { format: options.format, title: options.title }
    : { format: options.format };
}

function runCommandOptions(command: string[], options: RunOptions): RunCommandOptions {
  return {
    command: normalizeCommand(command),
    envKeys: parseEnvKeys(options.env),
    ...(options.cwd ? { cwd: options.cwd } : {})
  };
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('replaynote')
    .description('Turn command runs into reproducible Markdown and JSON notes.')
    .version('0.1.0')
    .enablePositionalOptions();

  program
    .command('run')
    .description('Run a command and write a replay note.')
    .argument('[command...]', 'command to run after --')
    .allowUnknownOption(true)
    .passThroughOptions()
    .option('-f, --format <format>', 'output format', parseFormat, 'markdown')
    .option('-o, --out <path>', 'write output to a file')
    .option('--title <title>', 'Markdown report title')
    .option('--cwd <path>', 'working directory for the command')
    .option('--env <keys>', 'comma-separated environment keys to include')
    .action(async (command: string[], options: RunOptions) => {
      const result = await runCommand(runCommandOptions(command, options));
      const output = formatResult(result, formatOptions(options));

      await writeOutput(options.out, output);

      if (result.signal) {
        process.exitCode = 1;
      } else if (typeof result.exitCode === 'number') {
        process.exitCode = result.exitCode;
      }
    });

  program
    .command('format')
    .description('Format an existing ReplayNote JSON fixture.')
    .argument('<fixture>', 'ReplayNote JSON fixture path')
    .option('-f, --format <format>', 'output format', parseFormat, 'markdown')
    .option('-o, --out <path>', 'write output to a file')
    .option('--title <title>', 'Markdown report title')
    .action(async (fixture: string, options: CommonOptions) => {
      const result = await readFixture(fixture);
      const output = formatResult(result, formatOptions(options));

      await writeOutput(options.out, output);
    });

  return program;
}

export async function main(argv = process.argv): Promise<void> {
  try {
    await createProgram().parseAsync(argv);
  } catch (error) {
    if (error instanceof ReplayNoteError) {
      process.stderr.write(`replaynote: ${error.message}\n`);
      process.exitCode = 2;
      return;
    }

    throw error;
  }
}

await main();
