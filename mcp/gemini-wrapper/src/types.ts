/**
 * Common types for Gemini MCP Wrapper
 */

/**
 * Session state for tracking Gemini operations
 */
export interface GeminiSession {
  id: string;
  tool: string;
  status: 'running' | 'complete' | 'error' | 'needs_continue';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  created_at: string;
  updated_at: string;
  continue_count: number;
}

/**
 * Result from a Gemini CLI execution
 */
export interface GeminiResult {
  success: boolean;
  output: string;
  error?: string;
  needs_continue?: boolean;
  session_id?: string;
}

/**
 * Validation result for Gemini output
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Common tool input parameters
 */
export interface BaseToolInput {
  session_id?: string;
  timeout_ms?: number;
}

/**
 * Research tool input
 */
export interface ResearchInput extends BaseToolInput {
  query: string;
  depth?: 'shallow' | 'medium' | 'deep';
  sources?: string[];
  max_results?: number;
}

/**
 * File scan tool input
 */
export interface FileScanInput extends BaseToolInput {
  path: string;
  pattern?: string;
  max_files?: number;
  include_content?: boolean;
  recursive?: boolean;
}

/**
 * Generate tool input
 */
export interface GenerateInput extends BaseToolInput {
  spec: string;
  files: Array<{
    path: string;
    description: string;
  }>;
  templates?: Record<string, string>;
  style_guide?: string;
}

/**
 * Dialogue tool input
 */
export interface DialogueInput extends BaseToolInput {
  topic: string;
  context: string;
  questions: string[];
  perspective?: string;
}

/**
 * Test tool input
 */
export interface TestInput extends BaseToolInput {
  test_type: 'unit' | 'integration' | 'e2e' | 'all';
  scope: string;
  coverage_threshold?: number;
  generate_missing?: boolean;
}

/**
 * Document tool input
 */
export interface DocumentInput extends BaseToolInput {
  scope: string;
  format: 'markdown' | 'jsdoc' | 'readme' | 'api';
  sections?: string[];
  include_examples?: boolean;
}

/**
 * Analyze tool input
 */
export interface AnalyzeInput extends BaseToolInput {
  path: string;
  depth?: 'shallow' | 'medium' | 'deep';
  focus?: 'architecture' | 'patterns' | 'dependencies' | 'security' | 'performance' | 'all';
}

/**
 * Continue tool input
 */
export interface ContinueInput {
  session_id: string;
}
