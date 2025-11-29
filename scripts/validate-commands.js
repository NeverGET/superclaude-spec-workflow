#!/usr/bin/env node
/**
 * validate-commands.js
 * Validates all /scw:* command files for proper structure
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const COMMANDS_DIR = join(PROJECT_ROOT, '.claude/commands/scw');
const AGENTS_DIR = join(PROJECT_ROOT, 'agents');

// YAML frontmatter parser (simple)
function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};

  // Simple line-by-line parsing
  yaml.split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      let value = line.substring(colonIdx + 1).trim();

      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim());
      }
      // Handle booleans
      else if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // Handle numbers
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);

      result[key] = value;
    }
  });

  return result;
}

// Get all agent names from agents directory
function getAvailableAgents() {
  const agents = new Set();

  function scanDir(dir) {
    if (!existsSync(dir)) return;

    readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      if (entry.isDirectory()) {
        scanDir(join(dir, entry.name));
      } else if (entry.name.endsWith('.md')) {
        agents.add(entry.name.replace('.md', ''));
      }
    });
  }

  scanDir(AGENTS_DIR);
  return agents;
}

// Validate a single command file
function validateCommand(filepath) {
  const errors = [];
  const warnings = [];
  const filename = basename(filepath);

  const content = readFileSync(filepath, 'utf-8');

  // Check for YAML frontmatter
  const frontmatter = parseYamlFrontmatter(content);
  if (!frontmatter) {
    errors.push('Missing YAML frontmatter');
    return { filename, errors, warnings };
  }

  // Required fields
  const requiredFields = ['name', 'description', 'category'];
  requiredFields.forEach((field) => {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check name matches filename
  if (frontmatter.name && frontmatter.name !== filename.replace('.md', '')) {
    warnings.push(
      `Name '${frontmatter.name}' doesn't match filename '${filename.replace('.md', '')}'`
    );
  }

  // Validate category
  const validCategories = ['workflow', 'utility', 'standard', 'advanced'];
  if (frontmatter.category && !validCategories.includes(frontmatter.category)) {
    warnings.push(`Unknown category: ${frontmatter.category}`);
  }

  // Validate complexity if present
  const validComplexity = ['basic', 'standard', 'advanced'];
  if (frontmatter.complexity && !validComplexity.includes(frontmatter.complexity)) {
    warnings.push(`Unknown complexity: ${frontmatter.complexity}`);
  }

  // Validate MCP servers if present
  const validMcpServers = ['sequential', 'serena', 'context7', 'tavily', 'playwright', 'gemini'];
  if (frontmatter['mcp-servers']) {
    const servers = Array.isArray(frontmatter['mcp-servers'])
      ? frontmatter['mcp-servers']
      : [frontmatter['mcp-servers']];

    servers.forEach((server) => {
      if (!validMcpServers.includes(server)) {
        warnings.push(`Unknown MCP server: ${server}`);
      }
    });
  }

  // Validate personas/agents if present
  const availableAgents = getAvailableAgents();
  if (frontmatter.personas) {
    const personas = Array.isArray(frontmatter.personas)
      ? frontmatter.personas
      : [frontmatter.personas];

    personas.forEach((persona) => {
      if (!availableAgents.has(persona)) {
        warnings.push(`Referenced agent not found: ${persona}`);
      }
    });
  }

  // Check command body exists
  const bodyMatch = content.match(/^# \/scw:\w+/m);
  if (!bodyMatch) {
    warnings.push('Command body should start with # /scw:{name}');
  }

  return { filename, errors, warnings };
}

// Main validation
function main() {
  console.log('Validating SCW Commands\n');
  console.log('='.repeat(50));

  if (!existsSync(COMMANDS_DIR)) {
    console.error(`Commands directory not found: ${COMMANDS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md'));
  let totalErrors = 0;
  let totalWarnings = 0;

  files.forEach((file) => {
    const filepath = join(COMMANDS_DIR, file);
    const result = validateCommand(filepath);

    const status = result.errors.length > 0 ? '❌' : result.warnings.length > 0 ? '⚠️' : '✅';

    console.log(`\n${status} ${result.filename}`);

    result.errors.forEach((err) => {
      console.log(`   ERROR: ${err}`);
      totalErrors++;
    });

    result.warnings.forEach((warn) => {
      console.log(`   WARN: ${warn}`);
      totalWarnings++;
    });
  });

  console.log('\n' + '='.repeat(50));
  console.log(`\nSummary:`);
  console.log(`  Commands: ${files.length}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ Validation FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED');
    process.exit(0);
  }
}

main();
