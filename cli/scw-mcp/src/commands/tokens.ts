/**
 * scw-mcp tokens - Manage API tokens
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { MCP_SERVERS, getServersRequiringTokens } from '../servers/config.js';

interface TokensOptions {
  add?: string;
  remove?: string;
  list?: boolean;
}

interface McpConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export async function tokensCommand(options: TokensOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n  SCW MCP Token Manager\n'));

  // Find config
  const cwd = process.cwd();
  const localConfig = join(cwd, '.claude', 'mcp.json');
  const globalConfig = join(process.env.HOME || '', '.claude', 'mcp.json');

  let config: McpConfig | null = null;
  let configPath = '';

  if (existsSync(localConfig)) {
    config = JSON.parse(readFileSync(localConfig, 'utf-8'));
    configPath = localConfig;
  } else if (existsSync(globalConfig)) {
    config = JSON.parse(readFileSync(globalConfig, 'utf-8'));
    configPath = globalConfig;
  }

  if (!config) {
    console.log(chalk.yellow('No MCP configuration found.'));
    console.log('Run ' + chalk.cyan('scw-mcp setup') + ' first.');
    process.exit(1);
  }

  // List tokens
  if (options.list || (!options.add && !options.remove)) {
    console.log(chalk.bold('Configured Tokens:\n'));

    const serversWithTokens = getServersRequiringTokens();
    let hasAnyToken = false;

    for (const server of serversWithTokens) {
      const serverConfig = config.mcpServers[server.name];
      const hasToken = serverConfig?.env?.[server.requiresToken!];

      if (hasToken) {
        const maskedToken = maskToken(hasToken);
        console.log(`  ${chalk.green('✓')} ${server.requiresToken}: ${maskedToken}`);
        hasAnyToken = true;
      } else {
        console.log(`  ${chalk.dim('○')} ${server.requiresToken}: ${chalk.dim('not set')}`);
      }
    }

    if (!hasAnyToken) {
      console.log(chalk.dim('  No tokens configured'));
    }

    console.log('');
    return;
  }

  // Add/update token
  if (options.add) {
    const tokenName = options.add.toUpperCase();
    const server = MCP_SERVERS.find((s) => s.requiresToken === tokenName);

    if (!server) {
      console.error(chalk.red(`Unknown token: ${tokenName}`));
      console.log('Available tokens:', getServersRequiringTokens().map((s) => s.requiresToken).join(', '));
      process.exit(1);
    }

    const { token } = await inquirer.prompt([
      {
        type: 'input', // Plain text, not password
        name: 'token',
        message: `Enter ${tokenName}:`,
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Token is required';
          }
          if (server.tokenFormat && !server.tokenFormat.test(input)) {
            return `Invalid format. Expected: ${server.tokenFormat.toString()}`;
          }
          return true;
        },
      },
    ]);

    // Update config
    if (!config.mcpServers[server.name]) {
      config.mcpServers[server.name] = {
        command: server.command,
        args: [...server.args],
      };
    }

    if (!config.mcpServers[server.name].env) {
      config.mcpServers[server.name].env = {};
    }

    config.mcpServers[server.name].env![tokenName] = token;

    // Update tavily URL if applicable
    if (server.name === 'tavily') {
      config.mcpServers[server.name].args = config.mcpServers[server.name].args.map((arg) =>
        arg.includes('mcp.tavily.com')
          ? `https://mcp.tavily.com/mcp?tavilyApiKey=${token}`
          : arg
      );
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✓ ${tokenName} updated`));
    return;
  }

  // Remove token
  if (options.remove) {
    const tokenName = options.remove.toUpperCase();
    const server = MCP_SERVERS.find((s) => s.requiresToken === tokenName);

    if (!server) {
      console.error(chalk.red(`Unknown token: ${tokenName}`));
      process.exit(1);
    }

    if (config.mcpServers[server.name]?.env?.[tokenName]) {
      delete config.mcpServers[server.name].env![tokenName];

      if (Object.keys(config.mcpServers[server.name].env!).length === 0) {
        delete config.mcpServers[server.name].env;
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`✓ ${tokenName} removed`));
    } else {
      console.log(chalk.yellow(`${tokenName} was not set`));
    }
  }
}

function maskToken(token: string): string {
  if (token.length <= 8) {
    return '****';
  }
  return token.slice(0, 4) + '****' + token.slice(-4);
}
