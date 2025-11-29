/**
 * gemini_research - Web Research Delegation Tool
 *
 * Delegates web research, documentation lookup, and information gathering
 * to Gemini's large context window.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import { validateResearchOutput } from '../validation.js';
import type { ResearchInput } from '../types.js';

export const researchTool: Tool = {
  name: 'gemini_research',
  description: `Delegate web research and documentation lookup to Gemini (2M token context).
Use when:
- Deep research requiring multiple sources
- Documentation analysis across frameworks
- Comparative analysis of technologies
- Finding patterns across large documentation sets

Returns structured findings with sources for Claude to validate.`,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Research query or question to investigate',
      },
      depth: {
        type: 'string',
        enum: ['shallow', 'medium', 'deep'],
        description:
          'Research depth: shallow (quick facts), medium (analysis), deep (comprehensive)',
        default: 'medium',
      },
      sources: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific sources or domains to focus on (optional)',
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of findings to return',
        default: 10,
      },
    },
    required: ['query'],
  },
};

interface ResearchOutput {
  query: string;
  depth: string;
  findings: Array<{
    title: string;
    content: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
  sources: string[];
  summary: string;
  confidence: number;
}

export async function handleResearch(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as ResearchInput;

  const prompt = buildPrompt(
    `Research the following query and provide comprehensive findings:

"${input.query}"

Depth level: ${input.depth || 'medium'}
${input.sources ? `Focus on these sources: ${input.sources.join(', ')}` : ''}
${input.max_results ? `Return up to ${input.max_results} findings` : ''}`,
    {},
    `Return a JSON object with this structure:
{
  "query": "the original query",
  "depth": "the depth level used",
  "findings": [
    {
      "title": "finding title",
      "content": "detailed content",
      "relevance": "high|medium|low"
    }
  ],
  "sources": ["source urls or references"],
  "summary": "executive summary of findings",
  "confidence": 0.0-1.0
}`
  );

  const result = await executeGemini(prompt, {
    tool: 'gemini_research',
    input: args,
    timeout_ms: input.timeout_ms || 120000,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      session_id: result.session_id,
      needs_continue: result.needs_continue,
    };
  }

  const parsed = parseGeminiJson<ResearchOutput>(result.output);

  if (!parsed) {
    return {
      success: true,
      raw_output: result.output,
      warning: 'Could not parse structured output - returning raw',
      session_id: result.session_id,
    };
  }

  // Validate output
  const validation = validateResearchOutput(parsed as unknown as Record<string, unknown>);

  return {
    success: true,
    ...parsed,
    validation,
    session_id: result.session_id,
  };
}
