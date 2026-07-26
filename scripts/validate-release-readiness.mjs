import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const scripts = packageJson.scripts ?? {};
const failures = [];

function requireField(condition, message) {
  if (!condition) failures.push(message);
}

requireField(packageJson.repository, 'package.json must declare repository metadata');
requireField(Array.isArray(packageJson.files) && packageJson.files.length > 0, 'package.json must declare a non-empty files allowlist');
requireField(scripts['package:smoke'], 'package.json scripts must include package:smoke');
requireField(scripts['release:check'], 'package.json scripts must include release:check');
requireField(packageJson.name === '@rogerchappel/replaynote', 'package name must remain @rogerchappel/replaynote');
requireField(packageJson.publishConfig?.access === 'public', 'package.json must declare public npm access');

const binPath = packageJson.bin?.replaynote;
requireField(binPath === 'dist/cli.js', 'package must expose replaynote from dist/cli.js');

let packedFiles = [];
try {
  const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    encoding: 'utf8',
  });
  packedFiles = JSON.parse(packOutput)[0]?.files?.map(({ path: file }) => file) ?? [];
} catch (error) {
  failures.push(`npm pack --dry-run --json failed: ${error.message}`);
}
requireField(packedFiles.includes('dist/cli.js'), 'npm package must contain the replaynote bin target dist/cli.js');

const workflowDir = path.join(root, '.github', 'workflows');
if (fs.existsSync(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir).filter((file) => /\.ya?ml$/.test(file));
  requireField(workflowFiles.length > 0, 'repository must include at least one workflow file');

  for (const file of workflowFiles) {
    const workflow = fs.readFileSync(path.join(workflowDir, file), 'utf8');
    requireField(!/TODO|FIXME|template becomes an app|customization TODO/i.test(workflow), '.github/workflows/' + file + ' still contains placeholder text');
  }

  const combined = workflowFiles.map((file) => fs.readFileSync(path.join(workflowDir, file), 'utf8')).join('\n');
  requireField(/release:check/.test(combined), 'CI workflows must run npm run release:check');

  const releaseWorkflowPath = path.join(workflowDir, 'release.yml');
  const releaseWorkflow = fs.existsSync(releaseWorkflowPath)
    ? fs.readFileSync(releaseWorkflowPath, 'utf8')
    : '';
  const publishIndex = releaseWorkflow.indexOf('npm publish --provenance --access public');
  const githubReleaseIndex = releaseWorkflow.indexOf('gh release create');
  requireField(publishIndex >= 0, 'release workflow must publish to npm with provenance and public access');
  requireField(
    githubReleaseIndex >= 0 && publishIndex < githubReleaseIndex,
    'release workflow must publish to npm before creating a GitHub release',
  );

  const dryRunPath = path.join(workflowDir, 'release-dry-run.yml');
  const dryRunWorkflow = fs.existsSync(dryRunPath) ? fs.readFileSync(dryRunPath, 'utf8') : '';
  requireField(
    dryRunWorkflow.includes('npm publish --dry-run --access public'),
    'release dry-run workflow must validate the intended public npm publish command',
  );
}

if (failures.length > 0) {
  console.error('Release readiness validation failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Release readiness validation passed.');
