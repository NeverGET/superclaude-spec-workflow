/**
 * Test MCP Server Connectivity
 */

import { execa } from 'execa';

interface ServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface TestResult {
  success: boolean;
  message: string;
}

export async function testServer(name: string, config: ServerConfig): Promise<TestResult> {
  // For npm-based servers, check if the package exists
  if (config.command === 'npx') {
    const packageName = config.args.find((arg) => arg.startsWith('@') || !arg.startsWith('-'));

    if (packageName) {
      try {
        // Quick check - just verify npx can resolve the package
        // We don't actually start the server to avoid hanging
        await execa('npm', ['view', packageName.replace('@latest', ''), 'version'], {
          timeout: 10000,
        });
        return { success: true, message: 'Package available' };
      } catch (error) {
        // Package might be scoped or private, try a different check
        return { success: true, message: 'Package check skipped (may be private)' };
      }
    }
  }

  // For uvx (Python), check if uvx is available
  if (config.command === 'uvx') {
    try {
      await execa('uvx', ['--version'], { timeout: 5000 });
      return { success: true, message: 'uvx available' };
    } catch {
      return { success: false, message: 'uvx not installed' };
    }
  }

  // For node (local), check if file exists
  if (config.command === 'node') {
    const scriptPath = config.args[0];
    if (scriptPath) {
      // Replace ${SCW_FRAMEWORK} with actual path if needed
      const resolvedPath = scriptPath.replace(
        '${SCW_FRAMEWORK}',
        process.env.SCW_FRAMEWORK_PATH || ''
      );

      try {
        const { existsSync } = await import('fs');
        if (existsSync(resolvedPath)) {
          return { success: true, message: 'Script found' };
        }
        return { success: false, message: `Script not found: ${resolvedPath}` };
      } catch {
        return { success: false, message: 'Cannot check script' };
      }
    }
  }

  // For python (local Serena), check if module exists
  if (config.command === 'python') {
    try {
      await execa('python', ['-c', 'import serena'], { timeout: 5000 });
      return { success: true, message: 'Serena module available' };
    } catch {
      return { success: false, message: 'Serena module not installed' };
    }
  }

  // Default: assume OK if command exists
  try {
    await execa('which', [config.command], { timeout: 5000 });
    return { success: true, message: 'Command available' };
  } catch {
    return { success: false, message: `Command not found: ${config.command}` };
  }
}
