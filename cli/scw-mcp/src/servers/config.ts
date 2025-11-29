/**
 * MCP Server Configuration
 * Defines all 9 MCP servers and their setup requirements
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
  local?: boolean;
  localCommand?: string;
  localArgs?: string[];
  notes?: string;
}

export const MCP_SERVERS: McpServerConfig[] = [
  {
    name: 'sequential-thinking',
    displayName: 'Sequential Thinking',
    description: 'Complex problem decomposition with step-by-step reasoning',
    command: 'npx',
    args: ['-y', '@anthropic/mcp-sequential-thinking'],
  },
  {
    name: 'serena',
    displayName: 'Serena',
    description: 'Session persistence and cross-session context',
    command: 'uvx',
    args: ['--from', 'git+https://github.com/oraios/serena', 'serena', 'start-mcp-server', '--context', 'ide-assistant'],
    local: true,
    localCommand: 'python',
    localArgs: ['-m', 'serena', 'start-mcp-server', '--context', 'ide-assistant', '--no-web-dashboard'],
    notes: 'Local mode recommended for performance (uvx has overhead)',
  },
  {
    name: 'context7',
    displayName: 'Context7',
    description: 'Up-to-date library documentation and code examples',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
  },
  {
    name: 'tavily',
    displayName: 'Tavily',
    description: 'Real-time web search and content extraction',
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.tavily.com/mcp'],
    requiresToken: 'TAVILY_API_KEY',
    tokenFormat: /^tvly-[a-zA-Z0-9]+$/,
    notes: 'Get your API key at https://tavily.com',
  },
  {
    name: 'playwright',
    displayName: 'Playwright',
    description: 'Browser automation for E2E testing and web scraping',
    command: 'npx',
    args: ['-y', '@anthropic/mcp-playwright'],
  },
  {
    name: 'chrome-devtools',
    displayName: 'Chrome DevTools',
    description: 'Performance analysis, debugging, and profiling',
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp'],
  },
  {
    name: 'gemini-wrapper',
    displayName: 'Gemini Wrapper',
    description: 'Gemini CLI delegation for token-heavy operations',
    command: 'node',
    args: ['${SCW_FRAMEWORK}/mcp/gemini-wrapper/dist/index.js'],
    local: true,
    notes: 'Requires Gemini CLI to be installed and authenticated',
  },
  {
    name: 'filesystem-morph',
    displayName: 'Filesystem + Morph',
    description: 'Fast, accurate file editing (98% accuracy)',
    command: 'npx',
    args: ['-y', '@anthropic/mcp-filesystem'],
  },
  {
    name: 'morph',
    displayName: 'Morph Editor',
    description: 'Semantic code merging for complex edits',
    command: 'npx',
    args: ['-y', 'mcp-morph'],
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
