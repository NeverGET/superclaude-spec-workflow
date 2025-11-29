/**
 * Gemini CLI Executor
 *
 * Wraps the gemini CLI to execute prompts and capture output.
 * Handles session tracking for long-running operations.
 */

import { spawn } from 'child_process';
import type { GeminiResult } from './types.js';
import { createSession, markComplete, markError, markNeedsContinue } from './session.js';

/**
 * Default timeout in milliseconds (5 minutes)
 */
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Maximum output length before considering truncation
 */
const MAX_OUTPUT_LENGTH = 100000;

/**
 * Execute a Gemini CLI command
 */
export async function executeGemini(
  prompt: string,
  options: {
    tool: string;
    input: Record<string, unknown>;
    timeout_ms?: number;
    files?: string[];
    all_files?: boolean;
  }
): Promise<GeminiResult> {
  const { tool, input, timeout_ms = DEFAULT_TIMEOUT_MS, files, all_files } = options;

  // Create session for tracking
  const session = await createSession(tool, input);

  // Build command arguments
  const args: string[] = ['-p', prompt];

  // Add file references
  if (all_files) {
    args.push('--all_files');
  } else if (files && files.length > 0) {
    for (const file of files) {
      args.unshift(`@${file}`);
    }
  }

  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    let timedOut = false;

    const proc = spawn('gemini', args, {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
    }, timeout_ms);

    proc.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    proc.on('error', async (error) => {
      clearTimeout(timeoutId);
      await markError(session.id, error.message);
      resolve({
        success: false,
        output: '',
        error: `Failed to execute gemini: ${error.message}`,
        session_id: session.id,
      });
    });

    proc.on('close', async (code) => {
      clearTimeout(timeoutId);

      if (timedOut) {
        // Check if we have partial output that can be continued
        if (output.length > 0) {
          await markNeedsContinue(session.id, { partial_output: output });
          resolve({
            success: false,
            output,
            error: 'Operation timed out - use gemini_continue to resume',
            needs_continue: true,
            session_id: session.id,
          });
        } else {
          await markError(session.id, 'Operation timed out with no output');
          resolve({
            success: false,
            output: '',
            error: 'Operation timed out',
            session_id: session.id,
          });
        }
        return;
      }

      if (code !== 0) {
        await markError(session.id, errorOutput || `Exit code: ${code}`);
        resolve({
          success: false,
          output,
          error: errorOutput || `Gemini CLI exited with code ${code}`,
          session_id: session.id,
        });
        return;
      }

      // Check for truncation indicators
      if (output.length >= MAX_OUTPUT_LENGTH || output.includes('[Output truncated]')) {
        await markNeedsContinue(session.id, { partial_output: output });
        resolve({
          success: true,
          output,
          needs_continue: true,
          session_id: session.id,
        });
        return;
      }

      await markComplete(session.id, { output });
      resolve({
        success: true,
        output,
        session_id: session.id,
      });
    });
  });
}

/**
 * Parse JSON from Gemini output, handling markdown code blocks
 */
export function parseGeminiJson<T>(output: string): T | null {
  // Try direct parse first
  try {
    return JSON.parse(output) as T;
  } catch {
    // Look for JSON in code blocks
    const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        // Fall through
      }
    }

    // Look for JSON object/array anywhere
    const objectMatch = output.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        // Fall through
      }
    }

    const arrayMatch = output.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // Fall through
      }
    }

    return null;
  }
}

/**
 * Build a structured prompt for Gemini
 */
export function buildPrompt(
  task: string,
  context: Record<string, unknown>,
  outputFormat?: string
): string {
  let prompt = `# Task\n${task}\n\n`;

  if (Object.keys(context).length > 0) {
    prompt += '# Context\n';
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        prompt += `## ${key}\n${value}\n\n`;
      } else {
        prompt += `## ${key}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n\n`;
      }
    }
  }

  if (outputFormat) {
    prompt += `# Output Format\n${outputFormat}\n`;
  }

  return prompt;
}
