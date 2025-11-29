/**
 * scw mcp check - Verify MCP servers are running
 */

import chalk from 'chalk';
import ora from 'ora';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { MCP_SERVERS } from '../servers/config.js';
import { testServer } from '../utils/test-server.js';
import { getGlobalConfigPath } from '../utils/home.js';

interface CheckOptions {
  server?: string;
}

interface McpConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export async function checkCommand(options: CheckOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n  SCW MCP Server Check\n'));

  // Find config
  const cwd = process.cwd();
  const localConfig = join(cwd, '.claude', 'mcp.json');
  const globalConfig = getGlobalConfigPath();

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
    console.log('Run ' + chalk.cyan('scw mcp setup') + ' to configure servers.');
    process.exit(1);
  }

  console.log(chalk.dim(`Config: ${configPath}\n`));

  // Get servers to check
  const serversToCheck = options.server
    ? Object.keys(config.mcpServers).filter((s) => s === options.server)
    : Object.keys(config.mcpServers);

  if (options.server && serversToCheck.length === 0) {
    console.error(chalk.red(`Server not configured: ${options.server}`));
    process.exit(1);
  }

  let allPassed = true;
  const results: { name: string; status: 'pass' | 'warn' | 'fail'; message: string }[] = [];

  for (const serverName of serversToCheck) {
    const serverConfig = config.mcpServers[serverName];
    const serverInfo = MCP_SERVERS.find((s) => s.name === serverName);

    const spinner = ora(`Checking ${serverName}...`).start();

    try {
      const result = await testServer(serverName, serverConfig);

      if (result.success) {
        spinner.succeed(`${serverName}: ${chalk.green('OK')}`);
        results.push({ name: serverName, status: 'pass', message: '' });
      } else {
        spinner.warn(`${serverName}: ${chalk.yellow(result.message)}`);
        results.push({ name: serverName, status: 'warn', message: result.message });
      }
    } catch (error) {
      spinner.fail(`${serverName}: ${chalk.red((error as Error).message)}`);
      results.push({ name: serverName, status: 'fail', message: (error as Error).message });
      allPassed = false;
    }
  }

  // Summary
  console.log('');
  const passCount = results.filter((r) => r.status === 'pass').length;
  const warnCount = results.filter((r) => r.status === 'warn').length;
  const failCount = results.filter((r) => r.status === 'fail').length;

  console.log(chalk.bold('Summary:'));
  console.log(`  ${chalk.green('✓')} Passed: ${passCount}`);
  if (warnCount > 0) console.log(`  ${chalk.yellow('⚠')} Warnings: ${warnCount}`);
  if (failCount > 0) console.log(`  ${chalk.red('✗')} Failed: ${failCount}`);

  if (!allPassed) {
    console.log(chalk.yellow('\nSome servers failed. Run `scw mcp setup` to reconfigure.'));
    process.exit(1);
  }

  console.log(chalk.green('\nAll servers operational!'));
}
