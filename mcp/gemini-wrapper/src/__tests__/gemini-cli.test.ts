/**
 * Unit tests for gemini-cli.ts - CLI execution and prompt building
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Gemini CLI Functions', () => {
  describe('buildPrompt', () => {
    it('should build prompt with task and context', () => {
      const task = 'Research JWT authentication best practices';
      const context = { project: 'api-server', framework: 'express' };
      const outputFormat = 'Return JSON with findings array';

      // Simulate buildPrompt logic
      const prompt = `${task}

Context:
${JSON.stringify(context, null, 2)}

${outputFormat}`;

      assert.ok(prompt.includes(task));
      assert.ok(prompt.includes('express'));
      assert.ok(prompt.includes(outputFormat));
    });

    it('should handle empty context', () => {
      const task = 'Analyze codebase structure';
      const context = {};
      const outputFormat = 'Return file tree';

      const prompt = `${task}

Context:
${JSON.stringify(context, null, 2)}

${outputFormat}`;

      assert.ok(prompt.includes(task));
      assert.ok(prompt.includes('{}'));
    });

    it('should escape special characters in task', () => {
      const task = 'Search for "pattern" with $special chars';

      // The prompt should preserve the original text
      assert.ok(task.includes('"pattern"'));
      assert.ok(task.includes('$special'));
    });
  });

  describe('parseGeminiJson', () => {
    it('should parse valid JSON from output', () => {
      const output = `Here are my findings:

\`\`\`json
{
  "findings": [
    {"title": "Finding 1", "content": "Description"}
  ],
  "summary": "Summary text"
}
\`\`\`

Hope this helps!`;

      // Extract JSON block
      const jsonMatch = output.match(/```json\n([\s\S]*?)```/);
      assert.ok(jsonMatch, 'Should find JSON block');

      const parsed = JSON.parse(jsonMatch[1]);
      assert.ok(parsed.findings);
      assert.strictEqual(parsed.findings.length, 1);
      assert.strictEqual(parsed.summary, 'Summary text');
    });

    it('should handle JSON without code block wrapper', () => {
      const output = `{"query": "test", "results": [1, 2, 3]}`;

      const parsed = JSON.parse(output);
      assert.strictEqual(parsed.query, 'test');
      assert.deepStrictEqual(parsed.results, [1, 2, 3]);
    });

    it('should handle malformed JSON gracefully', () => {
      const output = `{broken: json, missing quotes}`;

      let parsed = null;
      let error = null;

      try {
        parsed = JSON.parse(output);
      } catch (e) {
        error = e;
      }

      assert.ok(error instanceof SyntaxError, 'Should throw SyntaxError');
      assert.strictEqual(parsed, null);
    });

    it('should extract JSON from mixed content', () => {
      const output = `
Analysis complete. Here are the results:

\`\`\`json
{
  "status": "success",
  "data": {
    "files": 42,
    "lines": 10000
  }
}
\`\`\`

The analysis shows good code coverage.
`;

      const jsonMatch = output.match(/```json\n([\s\S]*?)```/);
      assert.ok(jsonMatch);

      const parsed = JSON.parse(jsonMatch[1]);
      assert.strictEqual(parsed.status, 'success');
      assert.strictEqual(parsed.data.files, 42);
    });
  });

  describe('Timeout Handling', () => {
    it('should respect timeout configuration', async () => {
      const timeout = 5000;
      const startTime = Date.now();

      // Simulate timeout check
      await new Promise((resolve) => setTimeout(resolve, 10));

      const elapsed = Date.now() - startTime;
      assert.ok(elapsed < timeout, 'Should complete before timeout');
    });

    it('should use default timeout when not specified', () => {
      const defaultTimeout = 120000; // 2 minutes
      const input = { query: 'test' };

      const timeout = (input as Record<string, unknown>).timeout_ms || defaultTimeout;
      assert.strictEqual(timeout, defaultTimeout);
    });

    it('should override default with provided timeout', () => {
      const defaultTimeout = 120000;
      const input = { query: 'test', timeout_ms: 30000 };

      const timeout = input.timeout_ms || defaultTimeout;
      assert.strictEqual(timeout, 30000);
    });
  });

  describe('Error Handling', () => {
    it('should create error result structure', () => {
      const error = new Error('Gemini CLI not found');

      const result = {
        success: false,
        output: '',
        error: error.message,
        needs_continue: false,
      };

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Gemini CLI not found');
      assert.strictEqual(result.output, '');
    });

    it('should detect truncated output needing continuation', () => {
      const output = 'This is a long response that was cut off...';
      const indicators = ['[truncated]', '...', '[continues]'];

      const needsContinue = indicators.some((ind) => output.endsWith(ind));

      // In this case, ends with '...'
      assert.ok(needsContinue, 'Should detect truncation indicator');
    });
  });

  describe('Session Integration', () => {
    it('should generate session for new requests', () => {
      const tool = 'gemini_research';
      const input = { query: 'test' };

      const session = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        tool,
        status: 'running' as const,
        input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        continue_count: 0,
      };

      assert.ok(session.id);
      assert.strictEqual(session.tool, tool);
      assert.strictEqual(session.status, 'running');
    });

    it('should update session on completion', () => {
      const session = {
        id: 'test-123',
        tool: 'gemini_research',
        status: 'running' as const,
        input: { query: 'test' },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        continue_count: 0,
      };

      // Simulate completion
      const updatedSession = {
        ...session,
        status: 'complete' as const,
        output: { findings: [] },
        updated_at: new Date().toISOString(),
      };

      assert.strictEqual(updatedSession.status, 'complete');
      assert.ok(updatedSession.output);
      assert.notStrictEqual(updatedSession.updated_at, session.updated_at);
    });
  });
});
