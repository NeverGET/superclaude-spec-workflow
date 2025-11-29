/**
 * gemini_document - Documentation Generation Tool
 *
 * Delegates documentation generation to Gemini.
 * Generates comprehensive docs from code analysis.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import { validateDocumentOutput } from '../validation.js';
import type { DocumentInput } from '../types.js';

export const documentTool: Tool = {
  name: 'gemini_document',
  description: `Generate documentation using Gemini's large context.
Use when:
- Documenting large codebases
- Generating API documentation
- Creating README files
- Writing architectural docs

Returns structured documentation with completeness validation.`,
  inputSchema: {
    type: 'object',
    properties: {
      scope: {
        type: 'string',
        description: 'Scope of documentation (file, directory, or project)',
      },
      format: {
        type: 'string',
        enum: ['markdown', 'jsdoc', 'readme', 'api'],
        description: 'Documentation format to generate',
      },
      sections: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific sections to include',
      },
      include_examples: {
        type: 'boolean',
        description: 'Include usage examples',
        default: true,
      },
    },
    required: ['scope', 'format'],
  },
};

interface DocumentOutput {
  scope: string;
  format: string;
  content: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  completeness: {
    sections_covered: string[];
    sections_missing: string[];
    score: number;
  };
  examples?: Array<{
    title: string;
    code: string;
    description: string;
  }>;
}

export async function handleDocument(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as DocumentInput;

  const sectionsRequested = input.sections?.join(', ') || 'all relevant sections';

  const prompt = buildPrompt(
    `Generate comprehensive ${input.format} documentation for: ${input.scope}

Include these sections: ${sectionsRequested}
${input.include_examples ? 'Include practical usage examples' : 'Focus on reference documentation only'}

Analyze the code thoroughly and create documentation that:
1. Explains the purpose and architecture
2. Documents all public APIs
3. Provides clear usage instructions
4. Includes code examples where helpful
5. Notes any important considerations or gotchas`,
    {},
    `Return a JSON object with this structure:
{
  "scope": "what was documented",
  "format": "${input.format}",
  "content": "the full documentation content in ${input.format} format",
  "sections": [
    {
      "title": "section title",
      "content": "section content"
    }
  ],
  "completeness": {
    "sections_covered": ["list of sections included"],
    "sections_missing": ["sections that couldn't be documented"],
    "score": 0-100
  }${
    input.include_examples
      ? `,
  "examples": [
    {
      "title": "example title",
      "code": "example code",
      "description": "what this example demonstrates"
    }
  ]`
      : ''
  }
}`
  );

  const result = await executeGemini(prompt, {
    tool: 'gemini_document',
    input: args,
    files: [`@${input.scope}`],
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

  const parsed = parseGeminiJson<DocumentOutput>(result.output);

  if (!parsed) {
    return {
      success: true,
      raw_output: result.output,
      warning: 'Could not parse structured output - returning raw',
      session_id: result.session_id,
    };
  }

  // Validate documentation completeness
  const requiredSections = input.sections || ['Overview', 'Usage', 'API'];
  const validation = validateDocumentOutput(
    parsed as unknown as Record<string, unknown>,
    requiredSections
  );

  return {
    success: true,
    ...parsed,
    validation,
    session_id: result.session_id,
  };
}
