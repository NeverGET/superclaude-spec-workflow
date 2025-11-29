#!/usr/bin/env node
/**
 * Gemini MCP Wrapper - Main Entry Point
 *
 * MCP server that wraps Gemini CLI for delegating token-heavy operations
 * from Claude Code to Gemini's 2M token context window.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { researchTool, handleResearch } from './tools/research.js';
import { fileScanTool, handleFileScan } from './tools/file-scan.js';
import { generateTool, handleGenerate } from './tools/generate.js';
import { dialogueTool, handleDialogue } from './tools/dialogue.js';
import { testTool, handleTest } from './tools/test.js';
import { documentTool, handleDocument } from './tools/document.js';
import { analyzeTool, handleAnalyze } from './tools/analyze.js';
import { continueTool, handleContinue } from './tools/continue.js';

/**
 * All registered tools
 */
const TOOLS: Tool[] = [
  researchTool,
  fileScanTool,
  generateTool,
  dialogueTool,
  testTool,
  documentTool,
  analyzeTool,
  continueTool,
];

/**
 * Tool handlers mapped by name
 */
const TOOL_HANDLERS: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  gemini_research: handleResearch,
  gemini_file_scan: handleFileScan,
  gemini_generate: handleGenerate,
  gemini_dialogue: handleDialogue,
  gemini_test: handleTest,
  gemini_document: handleDocument,
  gemini_analyze: handleAnalyze,
  gemini_continue: handleContinue,
};

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'gemini-wrapper',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = TOOL_HANDLERS[name];
    if (!handler) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Unknown tool: ${name}`,
              available_tools: Object.keys(TOOL_HANDLERS),
            }),
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await handler(args ?? {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: errorMessage,
              tool: name,
              input: args,
            }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error('Gemini MCP Wrapper started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
