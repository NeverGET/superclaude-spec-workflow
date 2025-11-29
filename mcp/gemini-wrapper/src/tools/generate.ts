/**
 * gemini_generate - Multi-File Code Generation Tool
 *
 * Delegates generation of multiple files (>5) to Gemini.
 * Includes pattern validation and style compliance.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import { validateCodeBlocks, validateFileList } from '../validation.js';
import type { GenerateInput } from '../types.js';

export const generateTool: Tool = {
  name: 'gemini_generate',
  description: `Generate multiple files (>5) using Gemini's large context.
Use when:
- Scaffolding new features with multiple files
- Generating boilerplate across components
- Creating test suites for existing code
- Bulk file creation from templates

Claude validates syntax and pattern compliance before accepting.`,
  inputSchema: {
    type: 'object',
    properties: {
      spec: {
        type: 'string',
        description: 'Specification describing what to generate',
      },
      files: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Target file path' },
            description: { type: 'string', description: 'What this file should contain' },
          },
          required: ['path', 'description'],
        },
        description: 'List of files to generate',
      },
      templates: {
        type: 'object',
        additionalProperties: { type: 'string' },
        description: 'Template patterns to follow (optional)',
      },
      style_guide: {
        type: 'string',
        description: 'Coding style guidelines to follow',
      },
    },
    required: ['spec', 'files'],
  },
};

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  description: string;
}

interface GenerateOutput {
  spec: string;
  generated_files: GeneratedFile[];
  summary: string;
  dependencies_added?: string[];
  notes?: string[];
}

export async function handleGenerate(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as GenerateInput;

  const fileList = input.files.map((f) => `- ${f.path}: ${f.description}`).join('\n');

  const prompt = buildPrompt(
    `Generate the following files based on this specification:

## Specification
${input.spec}

## Files to Generate
${fileList}

${input.style_guide ? `## Style Guide\n${input.style_guide}` : ''}
${input.templates ? `## Templates to Follow\n${JSON.stringify(input.templates, null, 2)}` : ''}

Generate complete, production-ready code for each file.
Follow best practices and the provided style guide.
Include proper imports, exports, and documentation.`,
    {},
    `Return a JSON object with this structure:
{
  "spec": "brief summary of the spec",
  "generated_files": [
    {
      "path": "path/to/file.ts",
      "content": "full file content",
      "language": "typescript",
      "description": "what this file does"
    }
  ],
  "summary": "overview of what was generated",
  "dependencies_added": ["any new dependencies needed"],
  "notes": ["implementation notes or warnings"]
}`
  );

  const result = await executeGemini(prompt, {
    tool: 'gemini_generate',
    input: args,
    timeout_ms: input.timeout_ms || 300000, // 5 min for generation
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      session_id: result.session_id,
      needs_continue: result.needs_continue,
    };
  }

  const parsed = parseGeminiJson<GenerateOutput>(result.output);

  if (!parsed) {
    return {
      success: true,
      raw_output: result.output,
      warning: 'Could not parse structured output - returning raw',
      session_id: result.session_id,
    };
  }

  // Validate generated files
  const requestedPaths = input.files.map((f) => f.path);
  const fileValidation = validateFileList({ files: parsed.generated_files }, requestedPaths);

  // Validate code blocks in each file
  const codeValidations = parsed.generated_files.map((file) => validateCodeBlocks(file.content));

  const allValid = codeValidations.every((v) => v.valid);
  const allWarnings = codeValidations.flatMap((v) => v.warnings);

  return {
    success: true,
    ...parsed,
    validation: {
      files: fileValidation,
      code: {
        valid: allValid,
        warnings: allWarnings,
      },
    },
    session_id: result.session_id,
  };
}
