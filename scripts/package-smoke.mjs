import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'replaynote-package-smoke-'));
const packDirectory = path.join(temporaryRoot, 'pack');
const consumerDirectory = path.join(temporaryRoot, 'consumer');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    env: { ...process.env, npm_config_update_notifier: 'false' },
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout;
}

try {
  fs.mkdirSync(packDirectory);
  fs.mkdirSync(consumerDirectory);
  fs.writeFileSync(
    path.join(consumerDirectory, 'package.json'),
    JSON.stringify({ name: 'replaynote-package-smoke-consumer', private: true }, null, 2) + '\n',
  );

  const packResult = JSON.parse(
    run('npm', ['pack', '--json', '--pack-destination', packDirectory]),
  )[0];
  assert.ok(packResult?.filename, 'npm pack must report the created tarball');
  const packedFiles = new Set(packResult.files.map(({ path: file }) => file));
  for (const requiredFile of [
    'dist/cli.js',
    'dist/index.js',
    'dist/index.d.ts',
    'examples/fixture-demo.sh',
    'fixtures/result.json',
    'README.md',
    'LICENSE',
    'SECURITY.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
  ]) {
    assert.ok(packedFiles.has(requiredFile), `packed tarball must include ${requiredFile}`);
  }

  const tarball = path.join(packDirectory, packResult.filename);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
    cwd: consumerDirectory,
  });

  const bin = path.join(
    consumerDirectory,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'replaynote.cmd' : 'replaynote',
  );
  assert.match(run(bin, ['--help'], { cwd: consumerDirectory }), /Turn command runs into reproducible Markdown and JSON notes/);
  assert.equal(run(bin, ['--version'], { cwd: consumerDirectory }).trim(), packageJson.version);

  const fixture = path.join(
    consumerDirectory,
    'node_modules',
    '@rogerchappel',
    'replaynote',
    'fixtures',
    'result.json',
  );
  const formatted = JSON.parse(run(bin, ['format', fixture, '--format', 'json'], { cwd: consumerDirectory }));
  assert.deepEqual(formatted.command, ['npm', 'test']);
  assert.equal(formatted.stdout, 'ok\n');

  console.log('Package smoke passed: packed, installed, and exercised replaynote in a disposable consumer.');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
