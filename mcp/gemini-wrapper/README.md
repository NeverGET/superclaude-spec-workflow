# Gemini MCP Wrapper

MCP server that wraps Gemini CLI for delegating token-heavy operations from Claude Code to Gemini's 2M token context window.

## Overview

The Gemini MCP Wrapper acts as a bridge between Claude Code (200K tokens) and Gemini CLI (2M tokens). It handles operations that would exceed Claude's context window while providing structured output and session management.

**Key Principle**: Claude orchestrates, Gemini executes. Claude MUST validate ALL Gemini outputs before accepting.

## Installation

### From npm (Production)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini-wrapper": {
      "command": "npx",
      "args": ["-y", "@superclaude/gemini-wrapper"]
    }
  }
}
```

### Local Development

```bash
cd mcp/gemini-wrapper
npm install
npm run build
```

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini-wrapper": {
      "command": "node",
      "args": ["/path/to/project/mcp/gemini-wrapper/dist/index.js"]
    }
  }
}
```

## Prerequisites

- Node.js 18+
- Gemini CLI installed and authenticated (`gemini` command available)
- Optional: Redis for session persistence (uses file-based by default)

## Tools

### gemini_research

Delegate web research and documentation lookup.

```json
{
  "query": "Best practices for implementing JWT authentication",
  "depth": "deep",
  "sources": ["auth0.com", "jwt.io"],
  "max_results": 10
}
```

**Delegation Triggers**: Deep research, multiple sources, documentation analysis

### gemini_file_scan

Scan large directories (>10 files).

```json
{
  "path": "src/",
  "pattern": "**/*.ts",
  "max_files": 50,
  "include_content": true,
  "recursive": true
}
```

**Delegation Triggers**: >10 files, codebase exploration

### gemini_generate

Generate multiple files (>5).

```json
{
  "spec": "Create a REST API for user management",
  "files": [
    { "path": "src/models/user.ts", "description": "User model" },
    { "path": "src/routes/users.ts", "description": "User routes" },
    { "path": "src/controllers/userController.ts", "description": "User controller" }
  ],
  "style_guide": "Use TypeScript strict mode, functional patterns"
}
```

**Delegation Triggers**: >5 files to generate, scaffolding

### gemini_dialogue

Multi-model brainstorming.

```json
{
  "topic": "Authentication architecture",
  "context": "Building a SaaS application with multi-tenant support",
  "questions": [
    "What auth pattern is best for multi-tenant SaaS?",
    "How should we handle token refresh?"
  ],
  "perspective": "security architect"
}
```

**Delegation Triggers**: Design discussions, architecture review

### gemini_test

Bulk test execution and generation.

```json
{
  "test_type": "unit",
  "scope": "src/services/",
  "coverage_threshold": 80,
  "generate_missing": true
}
```

**Delegation Triggers**: Large test suites, coverage analysis

### gemini_document

Generate comprehensive documentation.

```json
{
  "scope": "src/api/",
  "format": "markdown",
  "sections": ["Overview", "Authentication", "Endpoints", "Examples"],
  "include_examples": true
}
```

**Delegation Triggers**: Large documentation, API docs

### gemini_analyze

Deep codebase analysis.

```json
{
  "path": "src/",
  "depth": "deep",
  "focus": "security"
}
```

**Focus Options**: architecture, patterns, dependencies, security, performance, all

**Delegation Triggers**: Architecture analysis, security review, performance analysis

### gemini_continue

Resume incomplete operations.

```json
{
  "session_id": "abc123-def456"
}
```

**Use When**: Previous operation timed out or output was truncated

## Session Management

Sessions are persisted to handle long-running operations and Gemini's output truncation.

### File-based (Default)

Sessions stored in `.claude/sessions/gemini-{id}.json`

### Redis (Optional)

Set `REDIS_URL` environment variable to use Redis for session persistence.

## Validation Protocol

Claude validates ALL Gemini outputs before accepting:

1. **Scope Check**: Output matches requested scope
2. **Format Check**: Expected structure/syntax
3. **Completeness**: All requested items present
4. **Pattern Compliance**: Follows steering doc conventions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SCW_SESSION_DIR` | Session storage directory | `.claude/sessions` |
| `REDIS_URL` | Redis connection URL (optional) | - |

## Project Structure

```
mcp/gemini-wrapper/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── types.ts          # Type definitions
│   ├── gemini-cli.ts     # Gemini CLI executor
│   ├── session.ts        # Session tracking
│   ├── validation.ts     # Output validation
│   └── tools/
│       ├── research.ts
│       ├── file-scan.ts
│       ├── generate.ts
│       ├── dialogue.ts
│       ├── test.ts
│       ├── document.ts
│       ├── analyze.ts
│       └── continue.ts
└── README.md
```

## Integration with SuperClaude Spec Workflow

This MCP server is part of the SuperClaude Spec Workflow (`/scw:*`) framework:

- **spec-create**: Delegates large codebase scans during design phase
- **spec-execute**: Delegates bulk file generation during implementation
- **bug-create**: Delegates large log analysis during investigation

Delegation triggers are configured in `.claude/config/scw-config.json`.

## License

MIT
