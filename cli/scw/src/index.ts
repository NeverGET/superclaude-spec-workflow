#!/usr/bin/env node
/**
 * scw CLI - SuperClaude Spec Workflow
 * Project initialization and setup tool
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { doctorCommand } from './commands/doctor.js';
import { registerMcpCommand } from './commands/mcp.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('scw')
  .description('SuperClaude Spec Workflow - AI-powered development framework')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize SCW in current project (Full Socratic mode)')
  .option('-q, --quick', 'Quick mode: minimal prompts, auto-generate everything')
  .option('-y, --yes', 'Accept all defaults')
  .action(initCommand);

program
  .command('doctor')
  .description('Check SCW installation health')
  .action(doctorCommand);

program
  .command('update')
  .description('Update SCW framework to latest version')
  .action(() => {
    console.log(chalk.yellow('Update command coming soon...'));
    console.log('For now, pull the latest from the repository.');
  });

// Register MCP subcommand
registerMcpCommand(program);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Unknown command: ${program.args.join(' ')}`));
  console.log('Run ' + chalk.cyan('scw --help') + ' for available commands.');
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length === 2) {
  console.log(chalk.bold.cyan('\n  SuperClaude Spec Workflow (SCW)\n'));
  console.log('  AI-powered development framework combining:');
  console.log('  • Claude Code (200K tokens) - Orchestration');
  console.log('  • SuperClaude Agents (19) - Context-aware personas');
  console.log('  • Gemini CLI (2M tokens) - Token-heavy operations\n');
  program.outputHelp();
}

program.parse();
