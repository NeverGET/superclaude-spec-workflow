/**
 * scw-mcp setup - Configure MCP servers
 * Interactive setup with token input (plain text, no hiding)
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { MCP_SERVERS, McpServerConfig, getServerByName } from '../servers/config.js';
import { testServer } from '../utils/test-server.js';

interface SetupOptions {
  server?: string;
  yes?: boolean;
}

interface McpConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export async function setupCommand(options: SetupOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n  SCW MCP Server Setup\n'));

  // Determine config location
  const cwd = process.cwd();
  const localConfig = join(cwd, '.claude', 'mcp.json');
  const globalConfig = join(process.env.HOME || '', '.claude', 'mcp.json');

  // Check for existing config
  let configPath = localConfig;
  let existingConfig: McpConfig = { mcpServers: {} };

  if (existsSync(localConfig)) {
    console.log(chalk.dim(`Found local config: ${localConfig}`));
    existingConfig = JSON.parse(readFileSync(localConfig, 'utf-8'));
  } else if (existsSync(globalConfig)) {
    console.log(chalk.dim(`Found global config: ${globalConfig}`));
    existingConfig = JSON.parse(readFileSync(globalConfig, 'utf-8'));

    const { useGlobal } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useGlobal',
        message: 'Use global config (~/.claude/mcp.json)?',
        default: true,
      },
    ]);

    if (useGlobal) {
      configPath = globalConfig;
    }
  }

  // Filter servers if specific one requested
  const servers = options.server
    ? MCP_SERVERS.filter((s) => s.name === options.server)
    : MCP_SERVERS;

  if (options.server && servers.length === 0) {
    console.error(chalk.red(`Unknown server: ${options.server}`));
    console.log('Available servers:', MCP_SERVERS.map((s) => s.name).join(', '));
    process.exit(1);
  }

  // Store tokens
  const tokens: Record<string, string> = {};

  // Interactive setup for each server
  for (const server of servers) {
    console.log('');
    console.log(chalk.bold(`${server.displayName}`));
    console.log(chalk.dim(server.description));

    if (server.notes) {
      console.log(chalk.yellow(`  Note: ${server.notes}`));
    }

    // Check if already configured
    const isConfigured = existingConfig.mcpServers[server.name] !== undefined;
    if (isConfigured && !options.yes) {
      const { reconfigure } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reconfigure',
          message: `${server.name} is already configured. Reconfigure?`,
          default: false,
        },
      ]);

      if (!reconfigure) {
        console.log(chalk.dim('  Skipped'));
        continue;
      }
    }

    // Ask to install
    let install = options.yes;
    if (!options.yes) {
      const { installAnswer } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installAnswer',
          message: `Install ${server.name}?`,
          default: true,
        },
      ]);
      install = installAnswer;
    }

    if (!install) {
      console.log(chalk.dim('  Skipped'));
      continue;
    }

    // Handle Serena special case (local vs uvx)
    let serverConfig = { ...server };
    if (server.name === 'serena' && server.local && !options.yes) {
      const { runLocal } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'runLocal',
          message: 'Run Serena locally? (recommended for performance)',
          default: true,
        },
      ]);

      if (runLocal && server.localCommand && server.localArgs) {
        serverConfig.command = server.localCommand;
        serverConfig.args = server.localArgs;
      }
    }

    // Handle token if required
    if (server.requiresToken) {
      console.log(chalk.cyan(`  Token required: ${server.requiresToken}`));

      // Check if token already exists in environment
      const existingToken = process.env[server.requiresToken];
      if (existingToken && !options.yes) {
        const { useExisting } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useExisting',
            message: `Use existing ${server.requiresToken} from environment?`,
            default: true,
          },
        ]);

        if (useExisting) {
          tokens[server.requiresToken] = existingToken;
        }
      }

      // Prompt for token if not using existing
      if (!tokens[server.requiresToken]) {
        const { token } = await inquirer.prompt([
          {
            type: 'input', // NOT password - plain text as requested
            name: 'token',
            message: `Enter ${server.requiresToken}:`,
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

        tokens[server.requiresToken] = token;
      }
    }

    // Build config entry
    const configEntry: McpConfig['mcpServers'][string] = {
      command: serverConfig.command,
      args: [...serverConfig.args],
    };

    // Add environment variables
    if (server.requiresToken && tokens[server.requiresToken]) {
      configEntry.env = {
        [server.requiresToken]: tokens[server.requiresToken],
      };

      // For tavily, add key to URL
      if (server.name === 'tavily' && server.requiresToken) {
        const tokenValue = tokens[server.requiresToken];
        configEntry.args = configEntry.args.map((arg) =>
          arg.includes('mcp.tavily.com')
            ? `${arg}?tavilyApiKey=${tokenValue}`
            : arg
        );
      }
    }

    existingConfig.mcpServers[server.name] = configEntry;
    console.log(chalk.green(`  ✓ ${server.name} configured`));
  }

  // Write config
  const spinner = ora('Saving configuration...').start();

  try {
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
    spinner.succeed(`Configuration saved to ${configPath}`);

    // Test servers
    console.log(chalk.bold('\n  Testing servers...\n'));

    for (const serverName of Object.keys(existingConfig.mcpServers)) {
      const testSpinner = ora(`Testing ${serverName}...`).start();
      try {
        const result = await testServer(serverName, existingConfig.mcpServers[serverName]);
        if (result.success) {
          testSpinner.succeed(`${serverName}: ${chalk.green('OK')}`);
        } else {
          testSpinner.warn(`${serverName}: ${chalk.yellow(result.message)}`);
        }
      } catch (error) {
        testSpinner.fail(`${serverName}: ${chalk.red((error as Error).message)}`);
      }
    }

    console.log(chalk.green('\n✓ MCP setup complete!\n'));
    console.log('Next steps:');
    console.log(chalk.cyan('  1. Run `scw init` to initialize your project'));
    console.log(chalk.cyan('  2. Start Claude Code and try `/scw:help`\n'));
  } catch (error) {
    spinner.fail('Failed to save configuration');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}
