/**
 * Output Validation for Gemini Results
 *
 * Claude uses these helpers to validate Gemini outputs before accepting them.
 * Validation is lightweight - trusts content quality but checks structure.
 */

import type { ValidationResult } from './types.js';

/**
 * Validate that output matches expected scope
 */
export function validateScope(
  output: Record<string, unknown>,
  expectedKeys: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const key of expectedKeys) {
    if (!(key in output)) {
      errors.push(`Missing expected key: ${key}`);
    }
  }

  // Check for unexpected keys (warning only)
  const outputKeys = Object.keys(output);
  for (const key of outputKeys) {
    if (!expectedKeys.includes(key) && key !== 'metadata') {
      warnings.push(`Unexpected key in output: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that all requested files exist in output
 */
export function validateFileList(
  output: Record<string, unknown>,
  requestedPaths: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const files = output.files as Array<{ path: string }> | undefined;

  if (!Array.isArray(files)) {
    errors.push('Output missing files array');
    return { valid: false, errors, warnings };
  }

  const outputPaths = new Set(files.map((f) => f.path));

  for (const path of requestedPaths) {
    if (!outputPaths.has(path)) {
      warnings.push(`Requested file not in output: ${path}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate generated code has proper syntax markers
 */
export function validateCodeBlocks(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for balanced code blocks
  const codeBlockStarts = (content.match(/```\w*/g) || []).length;
  const codeBlockEnds = (content.match(/```\s*$/gm) || []).length;

  if (codeBlockStarts !== codeBlockEnds) {
    errors.push(`Unbalanced code blocks: ${codeBlockStarts} starts, ${codeBlockEnds} ends`);
  }

  // Check for common syntax issues
  if (content.includes('// TODO: implement') && !content.includes('// Implementation')) {
    warnings.push('Contains placeholder TODOs without implementation');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate research results have sources
 */
export function validateResearchOutput(output: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!output.findings || !Array.isArray(output.findings)) {
    errors.push('Research output missing findings array');
  }

  if (!output.sources || !Array.isArray(output.sources)) {
    warnings.push('Research output missing sources - cannot verify claims');
  }

  const findings = output.findings as Array<{ content: string }> | undefined;
  const sources = output.sources as string[] | undefined;

  if (findings && sources) {
    if (findings.length > 0 && sources.length === 0) {
      warnings.push('Findings present but no sources cited');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate test results
 */
export function validateTestOutput(output: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof output.passed !== 'number' && typeof output.failed !== 'number') {
    errors.push('Test output missing pass/fail counts');
  }

  if (output.failed && (output.failed as number) > 0) {
    if (!output.failures || !Array.isArray(output.failures)) {
      warnings.push('Failed tests reported but no failure details provided');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate documentation completeness
 */
export function validateDocumentOutput(
  output: Record<string, unknown>,
  requiredSections: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const content = output.content as string | undefined;

  if (!content) {
    errors.push('Document output missing content');
    return { valid: false, errors, warnings };
  }

  for (const section of requiredSections) {
    // Check for section headers (# or ##)
    const sectionPattern = new RegExp(`^#+\\s*${section}`, 'im');
    if (!sectionPattern.test(content)) {
      warnings.push(`Missing section: ${section}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate analysis output
 */
export function validateAnalysisOutput(output: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!output.summary) {
    errors.push('Analysis output missing summary');
  }

  if (!output.recommendations && !output.findings) {
    warnings.push('Analysis lacks actionable recommendations or findings');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
