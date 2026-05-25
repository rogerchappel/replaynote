const SECRET_KEY_PATTERN =
  /(api[_-]?key|auth|bearer|client[_-]?secret|credential|pass(word)?|private[_-]?key|secret|token)/i;

const SECRET_VALUE_PATTERNS: RegExp[] = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  /\b(?:sk|pk|ghp|github_pat|xox[baprs])_[A-Za-z0-9_=-]{8,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}\b/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g
];

export const REDACTED = '[REDACTED]';

export function isSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

export function redactValue(value: string): string {
  let redacted = value;

  for (const pattern of SECRET_VALUE_PATTERNS) {
    redacted = redacted.replace(pattern, REDACTED);
  }

  return redacted;
}

export function redactEnv(env: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      isSecretKey(key) ? REDACTED : redactValue(value)
    ])
  );
}

export function redactText(text: string): string {
  return redactValue(text);
}
