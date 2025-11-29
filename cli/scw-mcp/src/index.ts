#!/usr/bin/env node
/**
 * scw-mcp CLI - MCP Server Management
 * Configure, check, and manage MCP servers for SuperClaude Spec Workflow
 */

import { Command } from 'commander';
import { setupCommand } from './commands/setup.js';
import { checkCommand } from './commands/check.js';
import { listCommand } from './commands/list.js';
import { tokensCommand } from './commands/tokens.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('scw-mcp')
  .description('SuperClaude Spec Workflow - MCP Server Manager')
  .version('1.0.0');

program
  .command('setup')
  .description('Configure MCP servers (interactive)')
  .option('-s, --server <name>', 'Setup specific server only')
  .option('-y, --yes', 'Accept all defaults')
  .action(setupCommand);

program
  .command('check')
  .description('Verify MCP servers are running')
  .option('-s, --server <name>', 'Check specific server only')
  .action(checkCommand);

program
  .command('list')
  .description('List configured MCP servers and status')
  .action(listCommand);

program
  .command('tokens')
  .description('Manage API tokens')
  .option('-a, --add <name>', 'Add/update token')
  .option('-r, --remove <name>', 'Remove token')
  .option('-l, --list', 'List configured tokens (masked)')
  .action(tokensCommand);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Unknown command: ${program.args.join(' ')}`));
  console.log('Run ' + chalk.cyan('scw-mcp --help') + ' for available commands.');
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length === 2) {
  console.log(chalk.bold.cyan('\n  SCW MCP Server Manager\n'));
  console.log('  Configure and manage MCP servers for SuperClaude Spec Workflow:\n');
  console.log('  • sequential-thinking - Complex problem decomposition');
  console.log('  • serena - Session persistence');
  console.log('  • context7 - Library documentation');
  console.log('  • tavily - Web research');
  console.log('  • playwright - Browser automation');
  console.log('  • chrome-devtools - Performance analysis');
  console.log('  • gemini-wrapper - Gemini delegation');
  console.log('  • filesystem-morph - Fast file editing');
  console.log('');
  program.outputHelp();
}

program.parse();
