import { redactEnv } from './redact.js';

export const DEFAULT_ENV_KEYS = [
  'CI',
  'GITHUB_ACTIONS',
  'NODE_ENV',
  'npm_lifecycle_event',
  'npm_package_name',
  'npm_package_version'
];

export function parseEnvKeys(input: string | undefined): string[] {
  if (!input) {
    return DEFAULT_ENV_KEYS;
  }

  return input
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}

export function pickEnvironment(
  env: NodeJS.ProcessEnv,
  keys: string[] = DEFAULT_ENV_KEYS
): Record<string, string> {
  const picked: Record<string, string> = {};

  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string') {
      picked[key] = value;
    }
  }

  return redactEnv(picked);
}
