/**
 * gemini_continue - Resume Incomplete Operations Tool
 *
 * Resumes operations that timed out or were truncated.
 * Uses session tracking to restore state.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import { loadSession, incrementContinue, markComplete, markError } from '../session.js';
import type { ContinueInput } from '../types.js';

export const continueTool: Tool = {
  name: 'gemini_continue',
  description: `Resume an incomplete Gemini operation.
Use when:
- Previous operation timed out
- Output was truncated
- Session needs continuation

Restores session state and continues from where it left off.`,
  inputSchema: {
    type: 'object',
    properties: {
      session_id: {
        type: 'string',
        description: 'Session ID to resume',
      },
    },
    required: ['session_id'],
  },
};

export async function handleContinue(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as ContinueInput;

  // Load existing session
  const session = await loadSession(input.session_id);

  if (!session) {
    return {
      success: false,
      error: `Session not found: ${input.session_id}`,
    };
  }

  if (session.status === 'complete') {
    return {
      success: true,
      message: 'Session already complete',
      output: session.output,
      session_id: session.id,
    };
  }

  if (session.status === 'error') {
    return {
      success: false,
      error: 'Session ended in error',
      original_error: session.error,
      session_id: session.id,
    };
  }

  // Check for maximum continue attempts
  if (session.continue_count >= 5) {
    await markError(session.id, 'Maximum continue attempts reached');
    return {
      success: false,
      error: 'Maximum continue attempts (5) reached',
      partial_output: session.output,
      session_id: session.id,
    };
  }

  // Increment continue count
  await incrementContinue(session.id);

  // Get partial output if any
  const partialOutput = session.output as { partial_output?: string } | undefined;
  const previousOutput = partialOutput?.partial_output || '';

  const prompt = buildPrompt(
    `Continue the previous operation that was interrupted.

## Original Task
Tool: ${session.tool}
Input: ${JSON.stringify(session.input, null, 2)}

## Previous Output (continue from here)
${previousOutput ? previousOutput.slice(-5000) : 'No previous output captured'}

Continue the operation from where it left off.
Maintain consistency with the previous output format.`,
    {},
    'Continue in the same format as the previous output. If JSON, maintain the same structure.'
  );

  const result = await executeGemini(prompt, {
    tool: session.tool,
    input: session.input as Record<string, unknown>,
    timeout_ms: 300000, // 5 min for continuation
  });

  if (!result.success) {
    if (result.needs_continue) {
      return {
        success: false,
        error: 'Operation still incomplete after continuation',
        needs_continue: true,
        continue_count: session.continue_count + 1,
        partial_output: result.output,
        session_id: session.id,
      };
    }

    await markError(session.id, result.error || 'Unknown error');
    return {
      success: false,
      error: result.error,
      session_id: session.id,
    };
  }

  // Combine outputs if we have previous partial output
  const combinedOutput = previousOutput ? previousOutput + '\n' + result.output : result.output;

  await markComplete(session.id, { output: combinedOutput });

  // Try to parse the combined output
  const parsed = parseGeminiJson<Record<string, unknown>>(combinedOutput);

  return {
    success: true,
    output: parsed || combinedOutput,
    raw: !parsed,
    continue_count: session.continue_count + 1,
    session_id: session.id,
  };
}
