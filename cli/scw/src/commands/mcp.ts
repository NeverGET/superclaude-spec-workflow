/**
 * MCP subcommand group - Server management commands
 */

import { Command } from 'commander';
import { setupCommand } from '../mcp/commands/setup.js';
import { checkCommand } from '../mcp/commands/check.js';
import { listCommand } from '../mcp/commands/list.js';
import { tokensCommand } from '../mcp/commands/tokens.js';
import chalk from 'chalk';

export function registerMcpCommand(program: Command): void {
  const mcp = program
    .command('mcp')
    .description('MCP server management')
    .action(() => {
      // Show help when just 'scw mcp' is run
      console.log(chalk.bold.cyan('\n  SCW MCP Server Manager\n'));
      console.log('  Configure and manage MCP servers:\n');
      console.log('  • sequential-thinking - Complex problem decomposition');
      console.log('  • serena - Session persistence');
      console.log('  • context7 - Library documentation');
      console.log('  • tavily - Web research');
      console.log('  • playwright - Browser automation');
      console.log('  • chrome-devtools - Performance analysis');
      console.log('  • gemini-wrapper - Gemini delegation');
      console.log('  • filesystem-morph - Fast file editing');
      console.log('');
      mcp.outputHelp();
    });

  mcp
    .command('setup')
    .description('Configure MCP servers (interactive)')
    .option('-s, --server <name>', 'Setup specific server only')
    .option('-y, --yes', 'Accept all defaults')
    .action(setupCommand);

  mcp
    .command('check')
    .description('Verify MCP servers are running')
    .option('-s, --server <name>', 'Check specific server only')
    .action(checkCommand);

  mcp
    .command('list')
    .description('List configured MCP servers and status')
    .action(listCommand);

  mcp
    .command('tokens')
    .description('Manage API tokens')
    .option('-a, --add <name>', 'Add/update token')
    .option('-r, --remove <name>', 'Remove token')
    .option('-l, --list', 'List configured tokens (masked)')
    .action(tokensCommand);
}
