/**
 * gemini_dialogue - Claude↔Gemini Brainstorming Tool
 *
 * Enables multi-perspective brainstorming by getting Gemini's
 * perspective on topics, then Claude synthesizes the results.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import type { DialogueInput } from '../types.js';

export const dialogueTool: Tool = {
  name: 'gemini_dialogue',
  description: `Get Gemini's perspective for multi-model brainstorming.
Use when:
- Exploring design alternatives
- Getting second opinions on architecture
- Validating assumptions
- Brainstorming creative solutions

Claude synthesizes Gemini's responses with its own perspective.`,
  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        description: 'Topic or problem to discuss',
      },
      context: {
        type: 'string',
        description: 'Background context for the discussion',
      },
      questions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific questions to address',
      },
      perspective: {
        type: 'string',
        description:
          'Specific perspective to adopt (e.g., "security expert", "performance engineer")',
      },
    },
    required: ['topic', 'context', 'questions'],
  },
};

interface DialogueResponse {
  question: string;
  response: string;
  confidence: number;
  alternatives?: string[];
  considerations?: string[];
}

interface DialogueOutput {
  topic: string;
  perspective: string;
  responses: DialogueResponse[];
  synthesis: string;
  recommendations: string[];
  open_questions: string[];
}

export async function handleDialogue(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as DialogueInput;

  const questionsFormatted = input.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  const prompt = buildPrompt(
    `You are participating in a brainstorming dialogue about:

## Topic
${input.topic}

## Context
${input.context}

${input.perspective ? `## Your Perspective\nAdopt the perspective of: ${input.perspective}` : ''}

## Questions to Address
${questionsFormatted}

Provide thoughtful, detailed responses to each question.
Consider trade-offs, alternatives, and potential issues.
Be specific and actionable in your recommendations.`,
    {},
    `Return a JSON object with this structure:
{
  "topic": "the discussion topic",
  "perspective": "the perspective adopted",
  "responses": [
    {
      "question": "the question",
      "response": "detailed response",
      "confidence": 0.0-1.0,
      "alternatives": ["alternative approaches"],
      "considerations": ["things to consider"]
    }
  ],
  "synthesis": "overall synthesis of the discussion",
  "recommendations": ["actionable recommendations"],
  "open_questions": ["questions that need further discussion"]
}`
  );

  const result = await executeGemini(prompt, {
    tool: 'gemini_dialogue',
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

  const parsed = parseGeminiJson<DialogueOutput>(result.output);

  if (!parsed) {
    return {
      success: true,
      raw_output: result.output,
      warning: 'Could not parse structured output - returning raw',
      session_id: result.session_id,
    };
  }

  // Calculate average confidence
  const avgConfidence =
    parsed.responses.reduce((sum, r) => sum + r.confidence, 0) / parsed.responses.length;

  return {
    success: true,
    ...parsed,
    average_confidence: avgConfidence,
    session_id: result.session_id,
  };
}
