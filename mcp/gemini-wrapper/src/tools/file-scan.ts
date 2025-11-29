/**
 * gemini_file_scan - Large Directory Scanning Tool
 *
 * Delegates scanning of large directories (>10 files) to Gemini.
 * Returns structured summaries of file contents.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import { validateFileList } from '../validation.js';
import type { FileScanInput } from '../types.js';

export const fileScanTool: Tool = {
  name: 'gemini_file_scan',
  description: `Scan large directories (>10 files) using Gemini's 2M token context.
Use when:
- Scanning directories with many files
- Understanding codebase structure
- Finding patterns across multiple files
- Initial project exploration

Returns file summaries and structure analysis.`,
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Directory path to scan (relative to project root)',
      },
      pattern: {
        type: 'string',
        description: 'File pattern to match (e.g., "*.ts", "**/*.js")',
      },
      max_files: {
        type: 'number',
        description: 'Maximum number of files to analyze',
        default: 50,
      },
      include_content: {
        type: 'boolean',
        description: 'Include file content summaries',
        default: true,
      },
      recursive: {
        type: 'boolean',
        description: 'Scan subdirectories recursively',
        default: true,
      },
    },
    required: ['path'],
  },
};

interface FileScanOutput {
  path: string;
  total_files: number;
  files: Array<{
    path: string;
    type: string;
    size_estimate: string;
    summary?: string;
    exports?: string[];
    imports?: string[];
  }>;
  structure: {
    directories: string[];
    patterns_found: string[];
  };
  recommendations: string[];
}

export async function handleFileScan(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as FileScanInput;

  const filePaths = input.recursive ? [`@${input.path}/`] : [`@${input.path}`];

  const prompt = buildPrompt(
    `Scan and analyze the directory structure at: ${input.path}

${input.pattern ? `Focus on files matching: ${input.pattern}` : ''}
${input.max_files ? `Analyze up to ${input.max_files} files` : ''}
${input.include_content ? 'Include content summaries for each file' : 'Only list file metadata'}

Provide a comprehensive analysis of:
1. All files found
2. Directory structure
3. Code patterns and conventions
4. Dependencies and imports
5. Recommendations for understanding the codebase`,
    {},
    `Return a JSON object with this structure:
{
  "path": "scanned path",
  "total_files": number,
  "files": [
    {
      "path": "relative/file/path.ts",
      "type": "typescript|javascript|python|etc",
      "size_estimate": "small|medium|large",
      "summary": "brief description of file purpose",
      "exports": ["exported symbols"],
      "imports": ["imported modules"]
    }
  ],
  "structure": {
    "directories": ["list of directories"],
    "patterns_found": ["naming conventions", "file organization patterns"]
  },
  "recommendations": ["suggestions for navigating this codebase"]
}`
  );

  const result = await executeGemini(prompt, {
    tool: 'gemini_file_scan',
    input: args,
    files: filePaths,
    timeout_ms: input.timeout_ms || 180000,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      session_id: result.session_id,
      needs_continue: result.needs_continue,
    };
  }

  const parsed = parseGeminiJson<FileScanOutput>(result.output);

  if (!parsed) {
    return {
      success: true,
      raw_output: result.output,
      warning: 'Could not parse structured output - returning raw',
      session_id: result.session_id,
    };
  }

  // Validate file list
  const validation = validateFileList(
    parsed as unknown as Record<string, unknown>,
    [input.path]
  );

  return {
    success: true,
    ...parsed,
    validation,
    session_id: result.session_id,
  };
}
