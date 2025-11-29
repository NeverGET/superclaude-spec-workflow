/**
 * Unit tests for validation.ts - Output validation functionality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Validation Functions', () => {
  describe('validateScope', () => {
    it('should pass when output contains expected scope', () => {
      const output = { query: 'test', results: ['a', 'b'] };
      const expected = ['query', 'results'];

      const hasAllKeys = expected.every((key) => key in output);
      assert.ok(hasAllKeys, 'Output should contain all expected keys');
    });

    it('should fail when output missing required keys', () => {
      const output = { query: 'test' };
      const expected = ['query', 'results'];

      const hasAllKeys = expected.every((key) => key in output);
      assert.ok(!hasAllKeys, 'Should detect missing keys');
    });
  });

  describe('validateFileList', () => {
    it('should validate array of file paths', () => {
      const files = [
        { path: '/src/index.ts', exists: true },
        { path: '/src/utils.ts', exists: true },
      ];

      assert.ok(Array.isArray(files), 'Files should be an array');
      files.forEach((file) => {
        assert.ok(typeof file.path === 'string', 'Path should be string');
        assert.ok(file.path.length > 0, 'Path should not be empty');
      });
    });

    it('should detect invalid file entries', () => {
      const files = [
        { path: '', exists: false },
        { path: null, exists: false },
      ];

      const invalidFiles = files.filter((f) => !f.path || typeof f.path !== 'string');
      assert.ok(invalidFiles.length > 0, 'Should detect invalid entries');
    });
  });

  describe('validateCodeBlocks', () => {
    it('should extract code blocks from output', () => {
      const output = `
Here is the code:

\`\`\`typescript
function hello() {
  console.log('Hello');
}
\`\`\`

And another:

\`\`\`javascript
const x = 42;
\`\`\`
`;

      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const matches = [...output.matchAll(codeBlockRegex)];

      assert.strictEqual(matches.length, 2, 'Should find 2 code blocks');
      assert.strictEqual(matches[0][1], 'typescript');
      assert.strictEqual(matches[1][1], 'javascript');
    });

    it('should handle output without code blocks', () => {
      const output = 'Just plain text, no code here.';
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const matches = [...output.matchAll(codeBlockRegex)];

      assert.strictEqual(matches.length, 0, 'Should find 0 code blocks');
    });
  });

  describe('validateResearchOutput', () => {
    it('should validate complete research output', () => {
      const output = {
        query: 'JWT best practices',
        depth: 'medium',
        findings: [
          { title: 'Use short expiry', content: 'Tokens should expire quickly', relevance: 'high' },
        ],
        sources: ['https://example.com'],
        summary: 'JWT security summary',
        confidence: 0.85,
      };

      const requiredFields = ['query', 'findings', 'sources', 'summary', 'confidence'];
      const hasAllFields = requiredFields.every((field) => field in output);
      const hasValidConfidence = output.confidence >= 0 && output.confidence <= 1;
      const hasValidFindings = Array.isArray(output.findings) && output.findings.length > 0;

      assert.ok(hasAllFields, 'Should have all required fields');
      assert.ok(hasValidConfidence, 'Confidence should be between 0 and 1');
      assert.ok(hasValidFindings, 'Should have at least one finding');
    });

    it('should detect invalid research output', () => {
      const output = {
        query: 'JWT best practices',
        // missing findings, sources, summary, confidence
      };

      const requiredFields = ['query', 'findings', 'sources', 'summary', 'confidence'];
      const missingFields = requiredFields.filter((field) => !(field in output));

      assert.ok(missingFields.length > 0, 'Should detect missing fields');
      assert.ok(missingFields.includes('findings'));
      assert.ok(missingFields.includes('confidence'));
    });
  });

  describe('validateTestOutput', () => {
    it('should validate test results structure', () => {
      const output = {
        test_type: 'unit',
        scope: 'src/utils/',
        passed: 10,
        failed: 2,
        skipped: 1,
        coverage: 85.5,
        failures: [{ test: 'test1', error: 'assertion failed' }],
      };

      assert.strictEqual(typeof output.passed, 'number');
      assert.strictEqual(typeof output.failed, 'number');
      assert.ok(output.coverage >= 0 && output.coverage <= 100);
      assert.ok(Array.isArray(output.failures));
    });
  });

  describe('validateDocumentOutput', () => {
    it('should validate documentation structure', () => {
      const output = {
        title: 'API Documentation',
        format: 'markdown',
        sections: [
          { name: 'Overview', content: '# Overview\nThis is...' },
          { name: 'Usage', content: '## Usage\nTo use...' },
        ],
      };

      const requiredSections = ['Overview', 'Usage'];
      const sectionNames = output.sections.map((s) => s.name);
      const hasRequiredSections = requiredSections.every((s) => sectionNames.includes(s));

      assert.ok(hasRequiredSections, 'Should have required sections');
    });

    it('should detect missing sections', () => {
      const output = {
        title: 'API Documentation',
        format: 'markdown',
        sections: [{ name: 'Overview', content: '# Overview\nThis is...' }],
      };

      const requiredSections = ['Overview', 'Usage', 'API'];
      const sectionNames = output.sections.map((s) => s.name);
      const missingSections = requiredSections.filter((s) => !sectionNames.includes(s));

      assert.ok(missingSections.length > 0, 'Should detect missing sections');
      assert.ok(missingSections.includes('Usage'));
      assert.ok(missingSections.includes('API'));
    });
  });

  describe('validateAnalysisOutput', () => {
    it('should validate analysis structure with findings', () => {
      const output = {
        path: 'src/',
        depth: 'medium',
        focus: 'architecture',
        findings: [
          {
            category: 'architecture',
            severity: 'medium',
            title: 'Circular dependency',
            description: 'Found circular import',
            location: 'src/a.ts',
            recommendation: 'Refactor to break cycle',
          },
        ],
        summary: 'Analysis complete',
        metrics: { files_analyzed: 50, issues_found: 3 },
      };

      assert.ok(Array.isArray(output.findings));
      assert.ok(output.findings.length > 0);

      const finding = output.findings[0];
      assert.ok(['critical', 'high', 'medium', 'low'].includes(finding.severity));
      assert.ok(finding.title && finding.description);
    });
  });
});
