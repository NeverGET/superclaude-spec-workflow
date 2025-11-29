/**
 * MCP Server Configuration
 * Defines all MCP servers and their setup requirements
 * Updated: 2025-11-29 with latest recommended configurations
 */

export interface McpServerConfig {
  name: string;
  displayName: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  requiresToken?: string;
  tokenFormat?: RegExp;
  tokenUrl?: string;
  local?: boolean;
  localCommand?: string;
  localArgs?: string[];
  localPath?: string;
  notes?: string;
  type?: 'stdio' | 'http';
  httpConfig?: {
    url: string;
    headers?: Record<string, string>;
  };
}

export const MCP_SERVERS: McpServerConfig[] = [
  {
    name: 'sequential-thinking',
    displayName: 'Sequential Thinking',
    description: 'Complex problem decomposition with step-by-step reasoning',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
  },
  {
    name: 'serena',
    displayName: 'Serena',
    description: 'IDE-like semantic code navigation and session persistence',
    command: 'uvx',
    args: ['--from', 'git+https://github.com/oraios/serena', 'serena-mcp-server'],
    local: true,
    localCommand: 'uv',
    localArgs: ['run', '--directory', '${HOME}/.mcp/serena', 'serena', 'start-mcp-server', '--context', 'ide-assistant'],
    localPath: '~/.mcp/serena',
    notes: 'Local mode: git clone https://github.com/oraios/serena ~/.mcp/serena',
  },
  {
    name: 'context7',
    displayName: 'Context7',
    description: 'Up-to-date library documentation and code examples',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
    requiresToken: 'CONTEXT7_API_KEY',
    tokenUrl: 'https://context7.com',
    notes: 'Sign up at https://context7.com to get API key',
  },
  {
    name: 'tavily',
    displayName: 'Tavily',
    description: 'Real-time web search and content extraction',
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.tavily.com/mcp'],
    requiresToken: 'TAVILY_API_KEY',
    tokenFormat: /^tvly-[a-zA-Z0-9]+$/,
    tokenUrl: 'https://tavily.com',
    notes: 'Free tier: 1000 credits/month. Get key at https://tavily.com',
  },
  {
    name: 'playwright',
    displayName: 'Playwright',
    description: 'Browser automation for E2E testing and web scraping',
    command: 'npx',
    args: ['-y', '@playwright/mcp@latest'],
  },
  {
    name: 'chrome-devtools',
    displayName: 'Chrome DevTools',
    description: 'Performance analysis, debugging, and profiling',
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp@latest'],
  },
  {
    name: 'gemini-wrapper',
    displayName: 'Gemini Wrapper',
    description: 'Gemini CLI delegation for token-heavy operations (2M tokens)',
    command: 'node',
    args: ['${SCW_FRAMEWORK}/mcp/gemini-wrapper/dist/index.js'],
    local: true,
    notes: 'Requires Gemini CLI: npm i -g @google/gemini-cli && gemini auth',
  },
  {
    name: 'morph-mcp',
    displayName: 'Morph MCP',
    description: 'Fast, accurate file editing with semantic merging (98% accuracy)',
    command: 'npx',
    args: ['-y', '@morphllm/morphmcp'],
    requiresToken: 'MORPH_API_KEY',
    tokenUrl: 'https://morphllm.com/dashboard/api-keys',
    notes: 'Prerequisite: brew install ripgrep (for warp_grep). Get key at https://morphllm.com',
  },
];

export function getServerByName(name: string): McpServerConfig | undefined {
  return MCP_SERVERS.find((s) => s.name === name);
}

export function getServersRequiringTokens(): McpServerConfig[] {
  return MCP_SERVERS.filter((s) => s.requiresToken);
}

export function getLocalServers(): McpServerConfig[] {
  return MCP_SERVERS.filter((s) => s.local);
}
