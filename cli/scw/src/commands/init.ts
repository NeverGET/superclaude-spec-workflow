/**
 * scw init - Initialize SCW in current project
 * Full Socratic mode: Claude-style questioning to understand project
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, symlinkSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateClaudeMd } from '../generators/claude-md.js';
import { generateGeminiMd } from '../generators/gemini-md.js';
import { generateSteeringDocs } from '../generators/steering.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cross-platform home directory
function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || '';
}

// Find framework root (where agents/, modes/, .claude/commands/scw exist)
function findFrameworkRoot(): string {
  // Check if SCW_FRAMEWORK_PATH is set
  if (process.env.SCW_FRAMEWORK_PATH) {
    return process.env.SCW_FRAMEWORK_PATH;
  }

  const homeDir = getHomeDir();

  // Try common locations
  const candidates = [
    join(__dirname, '../../../../'), // Relative to cli/scw/dist/commands
    join(homeDir, 'Projects/SuperClaudeSpecWorkflow'),
    join(homeDir, 'superclaude-spec-workflow'),
    '/usr/local/share/superclaude-spec-workflow',
    'C:\\Program Files\\superclaude-spec-workflow', // Windows
  ];

  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'agents')) && existsSync(join(candidate, 'modes'))) {
      return candidate;
    }
  }

  throw new Error(
    'Cannot find SCW framework. Set SCW_FRAMEWORK_PATH environment variable.'
  );
}

interface InitOptions {
  quick?: boolean;
  yes?: boolean;
}

interface ProjectInfo {
  name: string;
  type: string;
  hasExistingProject: boolean;
  readExisting: boolean;
  createSteering: boolean;
  packageJson?: Record<string, unknown>;
  readme?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n  SCW Project Initialization\n'));

  const cwd = process.cwd();
  const frameworkRoot = findFrameworkRoot();

  console.log(chalk.dim(`Framework: ${frameworkRoot}`));
  console.log(chalk.dim(`Project: ${cwd}\n`));

  // Check if already initialized
  if (existsSync(join(cwd, '.claude/commands/scw'))) {
    const { reinit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'reinit',
        message: 'SCW is already initialized. Reinitialize?',
        default: false,
      },
    ]);
    if (!reinit) {
      console.log(chalk.yellow('Aborted.'));
      return;
    }
  }

  let projectInfo: ProjectInfo;

  if (options.quick || options.yes) {
    // Quick mode: minimal prompts
    projectInfo = await quickModePrompts(cwd);
  } else {
    // Full Socratic mode
    projectInfo = await socraticModePrompts(cwd);
  }

  // Create directory structure
  const spinner = ora('Creating directory structure...').start();

  try {
    await createDirectoryStructure(cwd, frameworkRoot, projectInfo);
    spinner.succeed('Directory structure created');

    // Generate CLAUDE.md
    spinner.start('Generating CLAUDE.md...');
    const claudeMd = generateClaudeMd(projectInfo, frameworkRoot);
    writeFileSync(join(cwd, 'CLAUDE.md'), claudeMd);
    spinner.succeed('CLAUDE.md generated');

    // Generate GEMINI.md
    spinner.start('Generating GEMINI.md...');
    const geminiMd = generateGeminiMd(projectInfo);
    writeFileSync(join(cwd, 'GEMINI.md'), geminiMd);
    spinner.succeed('GEMINI.md generated');

    // Generate steering docs if requested
    if (projectInfo.createSteering) {
      spinner.start('Generating steering documents...');
      await generateSteeringDocs(cwd, projectInfo);
      spinner.succeed('Steering documents generated');
    }

    console.log(chalk.green('\n✓ SCW initialized successfully!\n'));
    console.log('Next steps:');
    console.log(chalk.cyan('  1. Run `scw-mcp setup` to configure MCP servers'));
    console.log(chalk.cyan('  2. Start Claude Code and try `/scw:help`'));
    console.log(chalk.cyan('  3. Use `/scw:brainstorm` to discover requirements\n'));
  } catch (error) {
    spinner.fail('Initialization failed');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

async function quickModePrompts(cwd: string): Promise<ProjectInfo> {
  // Detect project info from existing files
  const packageJsonPath = join(cwd, 'package.json');
  const readmePath = join(cwd, 'README.md');

  let packageJson: Record<string, unknown> | undefined;
  let readme: string | undefined;
  let name = 'my-project';

  if (existsSync(packageJsonPath)) {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (packageJson && packageJson.name) {
      name = packageJson.name as string;
    }
  }

  if (existsSync(readmePath)) {
    readme = readFileSync(readmePath, 'utf-8');
  }

  return {
    name,
    type: detectProjectType(cwd),
    hasExistingProject: packageJson !== undefined || readme !== undefined,
    readExisting: true,
    createSteering: true,
    packageJson,
    readme,
  };
}

async function socraticModePrompts(cwd: string): Promise<ProjectInfo> {
  const packageJsonPath = join(cwd, 'package.json');
  const readmePath = join(cwd, 'README.md');

  // Step 1: Check for existing project
  const hasPackageJson = existsSync(packageJsonPath);
  const hasReadme = existsSync(readmePath);
  const hasFiles = readdirSync(cwd).filter((f) => !f.startsWith('.')).length > 0;

  let packageJson: Record<string, unknown> | undefined;
  let readme: string | undefined;
  let readExisting = false;

  if (hasFiles) {
    console.log(chalk.dim('Detected existing files in this directory.\n'));

    const { existingAnswer } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'existingAnswer',
        message: 'Is there an existing project in this directory?',
        default: true,
      },
    ]);

    if (existingAnswer && (hasPackageJson || hasReadme)) {
      const { readAnswer } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'readAnswer',
          message: 'Want me to read existing files to understand context?',
          default: true,
        },
      ]);

      readExisting = readAnswer;

      if (readExisting) {
        const spinner = ora('Reading project files...').start();

        if (hasPackageJson) {
          packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        }
        if (hasReadme) {
          readme = readFileSync(readmePath, 'utf-8');
        }

        spinner.succeed('Project files read');

        if (packageJson) {
          console.log(chalk.dim(`  Found: ${packageJson.name || 'unnamed'} - ${packageJson.description || 'no description'}`));
        }
      }
    }
  }

  // Step 2: Project type
  const detectedType = detectProjectType(cwd);
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project is this?',
      choices: [
        { name: 'Web App (React, Vue, etc.)', value: 'webapp' },
        { name: 'API Server (Express, FastAPI, etc.)', value: 'api' },
        { name: 'CLI Tool', value: 'cli' },
        { name: 'Library/Package', value: 'library' },
        { name: 'Full-Stack (Frontend + Backend)', value: 'fullstack' },
        { name: 'Other', value: 'other' },
      ],
      default: detectedType,
    },
  ]);

  // Step 3: Project name
  const defaultName = packageJson?.name as string || 'my-project';
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: defaultName,
    },
  ]);

  // Step 4: Steering documents
  const { createSteering } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createSteering',
      message: 'Do you want to create steering documents (product.md, tech.md, structure.md)?',
      default: true,
    },
  ]);

  return {
    name: projectName,
    type: projectType,
    hasExistingProject: hasFiles,
    readExisting,
    createSteering,
    packageJson,
    readme,
  };
}

function detectProjectType(cwd: string): string {
  const files = readdirSync(cwd);

  if (files.includes('vite.config.ts') || files.includes('next.config.js')) {
    return 'webapp';
  }
  if (files.includes('backend') && files.includes('frontend')) {
    return 'fullstack';
  }
  if (files.includes('server.ts') || files.includes('app.ts')) {
    return 'api';
  }
  if (existsSync(join(cwd, 'package.json'))) {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf-8'));
    if (pkg.bin) return 'cli';
  }

  return 'other';
}

async function createDirectoryStructure(
  cwd: string,
  frameworkRoot: string,
  projectInfo: ProjectInfo
): Promise<void> {
  const claudeDir = join(cwd, '.claude');

  // Create .claude directories
  mkdirSync(join(claudeDir, 'steering'), { recursive: true });
  mkdirSync(join(claudeDir, 'specs'), { recursive: true });
  mkdirSync(join(claudeDir, 'bugs'), { recursive: true });

  // Create symlinks to framework
  const symlinks = [
    { src: join(frameworkRoot, '.claude/commands/scw'), dest: join(claudeDir, 'commands/scw') },
    { src: join(frameworkRoot, '.claude/templates'), dest: join(claudeDir, 'templates') },
    { src: join(frameworkRoot, '.claude/config'), dest: join(claudeDir, 'config') },
    { src: join(frameworkRoot, 'agents'), dest: join(cwd, 'agents') },
    { src: join(frameworkRoot, 'modes'), dest: join(cwd, 'modes') },
  ];

  for (const { src, dest } of symlinks) {
    if (existsSync(src) && !existsSync(dest)) {
      // Ensure parent directory exists
      mkdirSync(dirname(dest), { recursive: true });
      symlinkSync(src, dest);
    }
  }
}
