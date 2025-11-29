/**
 * scw-mcp list - List configured MCP servers
 */

import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { MCP_SERVERS } from '../servers/config.js';
import { getGlobalConfigPath } from '../utils/home.js';

interface McpConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export async function listCommand(): Promise<void> {
  console.log(chalk.bold.cyan('\n  SCW MCP Servers\n'));

  // Find config
  const cwd = process.cwd();
  const localConfig = join(cwd, '.claude', 'mcp.json');
  const globalConfig = getGlobalConfigPath();

  let config: McpConfig | null = null;
  let configPath = '';

  if (existsSync(localConfig)) {
    config = JSON.parse(readFileSync(localConfig, 'utf-8'));
    configPath = localConfig;
    console.log(chalk.dim(`Local config: ${localConfig}\n`));
  } else if (existsSync(globalConfig)) {
    config = JSON.parse(readFileSync(globalConfig, 'utf-8'));
    configPath = globalConfig;
    console.log(chalk.dim(`Global config: ${globalConfig}\n`));
  }

  // Display all available servers
  console.log(chalk.bold('Available Servers:\n'));

  const maxNameLen = Math.max(...MCP_SERVERS.map((s) => s.displayName.length));

  for (const server of MCP_SERVERS) {
    const isConfigured = config?.mcpServers[server.name] !== undefined;
    const status = isConfigured ? chalk.green('✓') : chalk.dim('○');
    const name = server.displayName.padEnd(maxNameLen + 2);

    console.log(`  ${status} ${name} ${chalk.dim(server.description)}`);

    if (server.requiresToken) {
      const hasToken = config?.mcpServers[server.name]?.env?.[server.requiresToken];
      const tokenStatus = hasToken ? chalk.green('(token set)') : chalk.yellow('(token required)');
      console.log(`      ${tokenStatus}`);
    }
  }

  console.log('');

  // Summary
  const configuredCount = config ? Object.keys(config.mcpServers).length : 0;
  console.log(chalk.dim(`Configured: ${configuredCount}/${MCP_SERVERS.length} servers`));

  if (configuredCount < MCP_SERVERS.length) {
    console.log(chalk.dim('Run `scw-mcp setup` to configure more servers'));
  }

  console.log('');
}
