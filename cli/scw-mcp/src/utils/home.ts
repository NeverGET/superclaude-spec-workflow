/**
 * Cross-platform home directory utility
 */

import { join } from 'path';

/**
 * Get home directory path (works on Windows, macOS, Linux)
 */
export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || '';
}

/**
 * Get global Claude config path
 */
export function getGlobalConfigPath(): string {
  return join(getHomeDir(), '.claude', 'mcp.json');
}
