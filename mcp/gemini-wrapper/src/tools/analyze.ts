/**
 * gemini_analyze - Deep Codebase Analysis Tool
 *
 * Delegates comprehensive codebase analysis to Gemini.
 * Provides architectural insights, patterns, and recommendations.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeGemini, buildPrompt, parseGeminiJson } from '../gemini-cli.js';
import { validateAnalysisOutput } from '../validation.js';
import type { AnalyzeInput } from '../types.js';

export const analyzeTool: Tool = {
  name: 'gemini_analyze',
  description: `Deep codebase analysis using Gemini's 2M token context.
Use when:
- Understanding large codebase architecture
- Finding patterns and anti-patterns
- Security analysis
- Performance bottleneck identification
- Dependency analysis

Returns structured analysis with actionable recommendations.`,
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to analyze (file or directory)',
      },
      depth: {
        type: 'string',
        enum: ['shallow', 'medium', 'deep'],
        description: 'Analysis depth',
        default: 'medium',
      },
      focus: {
        type: 'string',
        enum: ['architecture', 'patterns', 'dependencies', 'security', 'performance', 'all'],
        description: 'Analysis focus area',
        default: 'all',
      },
    },
    required: ['path'],
  },
};

interface AnalysisOutput {
  path: string;
  depth: string;
  focus: string;
  summary: string;
  architecture: {
    layers: string[];
    components: Array<{
      name: string;
      purpose: string;
      dependencies: string[];
    }>;
    patterns: string[];
  };
  findings: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    location?: string;
    recommendation?: string;
  }>;
  metrics: {
    total_files: number;
    total_lines?: number;
    complexity_score?: number;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export async function handleAnalyze(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const input = args as unknown as AnalyzeInput;

  const focusInstructions = {
    architecture: 'Focus on architectural patterns, layers, and component relationships',
    patterns: 'Focus on code patterns, design patterns, and anti-patterns',
    dependencies: 'Focus on dependencies, imports, and module relationships',
    security: 'Focus on security vulnerabilities, input validation, and auth patterns',
    performance: 'Focus on performance bottlenecks, optimization opportunities, and efficiency',
    all: 'Provide comprehensive analysis across all areas',
  };

  const prompt = buildPrompt(
    `Perform ${input.depth || 'medium'} analysis of: ${input.path}

${focusInstructions[input.focus || 'all']}

Analyze:
1. Overall architecture and structure
2. Code patterns and conventions
3. Dependencies and coupling
4. Potential issues and risks
5. Opportunities for improvement

Be specific with file locations and code references.`,
    {},
    `Return a JSON object with this structure:
{
  "path": "analyzed path",
  "depth": "${input.depth || 'medium'}",
  "focus": "${input.focus || 'all'}",
  "summary": "executive summary of the analysis",
  "architecture": {
    "layers": ["identified architectural layers"],
    "components": [
      {
        "name": "component name",
        "purpose": "what it does",
        "dependencies": ["what it depends on"]
      }
    ],
    "patterns": ["design patterns identified"]
  },
  "findings": [
    {
      "category": "security|performance|architecture|quality",
      "severity": "critical|high|medium|low|info",
      "title": "finding title",
      "description": "detailed description",
      "location": "file:line or component",
      "recommendation": "how to address"
    }
  ],
  "metrics": {
    "total_files": number,
    "total_lines": number,
    "complexity_score": 0-100
  },
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "recommendation title",
      "description": "detailed recommendation",
      "effort": "low|medium|high"
    }
  ]
}`
  );

  const result = await executeGemini(prompt, {
    tool: 'gemini_analyze',
    input: args,
    files: [`@${input.path}/`],
    timeout_ms: input.timeout_ms || 300000,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      session_id: result.session_id,
      needs_continue: result.needs_continue,
    };
  }

  const parsed = parseGeminiJson<AnalysisOutput>(result.output);

  if (!parsed) {
    return {
      success: true,
      raw_output: result.output,
      warning: 'Could not parse structured output - returning raw',
      session_id: result.session_id,
    };
  }

  // Validate analysis output
  const validation = validateAnalysisOutput(parsed as unknown as Record<string, unknown>);

  // Categorize findings by severity
  const findingsBySeverity = {
    critical: parsed.findings.filter((f) => f.severity === 'critical').length,
    high: parsed.findings.filter((f) => f.severity === 'high').length,
    medium: parsed.findings.filter((f) => f.severity === 'medium').length,
    low: parsed.findings.filter((f) => f.severity === 'low').length,
    info: parsed.findings.filter((f) => f.severity === 'info').length,
  };

  return {
    success: true,
    ...parsed,
    findings_summary: findingsBySeverity,
    validation,
    session_id: result.session_id,
  };
}
