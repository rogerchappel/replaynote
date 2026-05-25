export function quoteCommandPart(part: string): string {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(part)) {
    return part;
  }

  return `'${part.replace(/'/g, `'\\''`)}'`;
}

export function formatCommand(command: string[]): string {
  return command.map(quoteCommandPart).join(' ');
}
