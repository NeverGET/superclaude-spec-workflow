/**
 * scw doctor - Check SCW installation health
 */

import chalk from 'chalk';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export async function doctorCommand(): Promise<void> {
  console.log(chalk.bold.cyan('\n  SCW Doctor - Health Check\n'));

  const cwd = process.cwd();
  const results: CheckResult[] = [];

  // Check 1: .claude directory exists
  results.push(checkClaudeDir(cwd));

  // Check 2: Commands symlink
  results.push(checkSymlink(join(cwd, '.claude/commands/scw'), 'Commands symlink'));

  // Check 3: Agents symlink
  results.push(checkSymlink(join(cwd, 'agents'), 'Agents symlink'));

  // Check 4: Modes symlink
  results.push(checkSymlink(join(cwd, 'modes'), 'Modes symlink'));

  // Check 5: CLAUDE.md exists
  results.push(checkFile(join(cwd, 'CLAUDE.md'), 'CLAUDE.md'));

  // Check 6: GEMINI.md exists
  results.push(checkFile(join(cwd, 'GEMINI.md'), 'GEMINI.md'));

  // Check 7: Steering documents
  results.push(checkSteeringDocs(cwd));

  // Check 8: Claude CLI available
  results.push(await checkClaude());

  // Check 9: Gemini CLI available
  results.push(await checkGemini());

  // Check 10: Node.js version
  results.push(checkNodeVersion());

  // Print results
  console.log('');
  let hasFailures = false;

  for (const result of results) {
    const icon =
      result.status === 'pass' ? chalk.green('✓') :
      result.status === 'warn' ? chalk.yellow('⚠') :
      chalk.red('✗');

    const color =
      result.status === 'pass' ? chalk.white :
      result.status === 'warn' ? chalk.yellow :
      chalk.red;

    console.log(`  ${icon} ${color(result.name)}`);
    if (result.status !== 'pass') {
      console.log(chalk.dim(`    ${result.message}`));
    }

    if (result.status === 'fail') {
      hasFailures = true;
    }
  }

  console.log('');

  if (hasFailures) {
    console.log(chalk.red('Some checks failed. Run `scw init` to fix issues.'));
    process.exit(1);
  } else {
    console.log(chalk.green('All checks passed! SCW is ready to use.'));
  }
}

function checkClaudeDir(cwd: string): CheckResult {
  const claudeDir = join(cwd, '.claude');
  if (existsSync(claudeDir)) {
    return { name: '.claude directory', status: 'pass', message: '' };
  }
  return {
    name: '.claude directory',
    status: 'fail',
    message: 'Run `scw init` to create',
  };
}

function checkSymlink(path: string, name: string): CheckResult {
  if (!existsSync(path)) {
    return { name, status: 'fail', message: 'Not found' };
  }

  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      return { name, status: 'pass', message: '' };
    }
    return { name, status: 'warn', message: 'Exists but is not a symlink' };
  } catch {
    return { name, status: 'fail', message: 'Cannot read' };
  }
}

function checkFile(path: string, name: string): CheckResult {
  if (existsSync(path)) {
    return { name, status: 'pass', message: '' };
  }
  return { name, status: 'fail', message: 'Not found' };
}

function checkSteeringDocs(cwd: string): CheckResult {
  const steeringDir = join(cwd, '.claude/steering');
  if (!existsSync(steeringDir)) {
    return { name: 'Steering documents', status: 'fail', message: 'Directory not found' };
  }

  const required = ['product.md', 'tech.md', 'structure.md'];
  const missing = required.filter((f) => !existsSync(join(steeringDir, f)));

  if (missing.length === 0) {
    return { name: 'Steering documents', status: 'pass', message: '' };
  }

  if (missing.length === required.length) {
    return { name: 'Steering documents', status: 'warn', message: 'No steering docs found' };
  }

  return {
    name: 'Steering documents',
    status: 'warn',
    message: `Missing: ${missing.join(', ')}`,
  };
}

async function checkClaude(): Promise<CheckResult> {
  try {
    const { stdout } = await execa('claude', ['--version']);
    return { name: 'Claude CLI', status: 'pass', message: stdout.trim() };
  } catch {
    return { name: 'Claude CLI', status: 'fail', message: 'Not installed or not in PATH' };
  }
}

async function checkGemini(): Promise<CheckResult> {
  try {
    const { stdout } = await execa('gemini', ['--version']);
    return { name: 'Gemini CLI', status: 'pass', message: stdout.trim() };
  } catch {
    return { name: 'Gemini CLI', status: 'warn', message: 'Not installed (optional for delegation)' };
  }
}

function checkNodeVersion(): CheckResult {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major >= 18) {
    return { name: `Node.js ${version}`, status: 'pass', message: '' };
  }

  return {
    name: `Node.js ${version}`,
    status: 'fail',
    message: 'Requires Node.js 18+',
  };
}
