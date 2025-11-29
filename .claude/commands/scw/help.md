---
name: help
description: "Command reference and usage guide for SuperClaude Spec Workflow"
category: utility
complexity: basic
mcp-servers: []
personas: []
---

# /scw:help - Command Reference

> **SuperClaude Spec Workflow**: Unified framework for spec-driven development with agent orchestration and Gemini delegation.

## Quick Reference

| Command | Purpose | Complexity |
|---------|---------|------------|
| `/scw:spec-create` | Create feature specification | Advanced |
| `/scw:spec-execute` | Execute spec task | Standard |
| `/scw:bug-create` | Bug analysis and fix | Advanced |
| `/scw:brainstorm` | Requirements discovery | Standard |
| `/scw:design` | Architecture design | Advanced |
| `/scw:implement` | Implementation helper | Standard |
| `/scw:test` | Test execution | Standard |
| `/scw:research` | Deep research | Advanced |
| `/scw:help` | This reference | Basic |

---

## Core Workflows

### /scw:spec-create [feature-name]
**Full specification workflow with phased approval**

```
/scw:spec-create user-authentication
/scw:spec-create payment-gateway --skip-brainstorm
```

**Phases:**
1. Requirements → User approval
2. Design → User approval
3. Tasks → User approval
4. Implementation → Per-task execution

**Creates:** `.claude/specs/{feature}/requirements.md, design.md, tasks.md`

---

### /scw:spec-execute [feature-name] [task-number]
**Execute a single task from specification**

```
/scw:spec-execute user-authentication 1
/scw:spec-execute user-authentication 3 --validate-only
```

**Behavior:**
- Loads full spec context
- Executes ONE task
- Updates tasks.md with completion
- STOPS and waits for user

---

### /scw:bug-create [bug-name] [--severity critical|high|medium|low]
**Bug analysis and fix workflow**

```
/scw:bug-create login-timeout --severity high
/scw:bug-create form-validation --skip-report
```

**Phases:**
1. Report → Document symptoms
2. Analysis → Root cause
3. Fix → Implementation
4. Verification → Tests

**Creates:** `.claude/bugs/{bug}/bug-report.md`

---

## Supporting Commands

### /scw:brainstorm [topic]
**Interactive requirements discovery**

```
/scw:brainstorm user-notifications --depth deep
/scw:brainstorm dashboard --focus users
```

**Approach:** Socratic questioning to uncover hidden requirements

---

### /scw:design [feature]
**Architecture design with code reuse**

```
/scw:design auth-service --scope component
/scw:design api-gateway --format mermaid
```

**Includes:** Codebase analysis, pattern detection, integration points

---

### /scw:implement [what]
**Implementation with pattern guidance**

```
/scw:implement UserProfile component
/scw:implement GET /api/users endpoint
/scw:implement notification-service --files multi
```

**Behavior:** Pattern detection, code generation, convention compliance

---

### /scw:test [scope]
**Test execution and generation**

```
/scw:test src/services/ --coverage
/scw:test src/utils/ --generate-missing
/scw:test src/api/ --type integration
```

**Includes:** Coverage analysis, gap detection, test generation

---

### /scw:research [topic]
**Deep research with source verification**

```
/scw:research "JWT best practices" --depth deep
/scw:research "React state management" --sources docs
```

**Output:** Findings, comparisons, recommendations with sources

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 SUPERCLAUDE SPEC WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│  USER LAYER                                                      │
│  └── /scw:* commands                                            │
│                                                                  │
│  ORCHESTRATION LAYER (Claude Code - 200K tokens)                │
│  ├── PM Agent: Validation at every phase                        │
│  ├── 19 Agents: Auto-activated by context                       │
│  ├── MCP Servers: Sequential, Serena, Context7, Tavily          │
│  └── Wave→Checkpoint→Wave execution                             │
│                                                                  │
│  DELEGATION LAYER (Gemini CLI - 2M tokens)                      │
│  └── 8 MCP Tools for token-heavy operations                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Steering Documents

Located in `.claude/steering/`:

| Document | Purpose |
|----------|---------|
| `product.md` | Product vision and goals |
| `tech.md` | Technical standards and patterns |
| `structure.md` | Project structure and conventions |

---

## Agent Activation

| Agent Tier | Agents | Activation |
|------------|--------|------------|
| Core | pm-agent, self-review | Always active |
| Spec Workflow | requirements-analyst, system-architect, quality-engineer | Phase-based |
| Domain | backend, frontend, security, devops, performance, python | Task-based |
| Analysis | root-cause-analyst, refactoring-expert | Context-triggered |
| Research | deep-research, socratic-mentor, learning-guide | Mode-triggered |

---

## PM Agent Validation

**BEFORE each phase:** ConfidenceChecker
- ≥90%: Proceed
- 70-89%: Present alternatives
- <70%: STOP, ask questions

**AFTER each phase:** SelfCheckProtocol
- All requirements met?
- All tests passing?
- Evidence for claims?

**ON ERROR:** Reflexion Pattern
- Stop immediately
- Analyze root cause
- Document in docs/mistakes/

---

## Gemini Delegation Triggers

| Trigger | Threshold | Tool |
|---------|-----------|------|
| File scanning | >10 files | `gemini_file_scan` |
| Code generation | >5 files | `gemini_generate` |
| Deep research | Complex topics | `gemini_research` |
| Test execution | Large suite | `gemini_test` |
| Codebase analysis | Large codebase | `gemini_analyze` |

---

## Configuration

**Main config:** `.claude/config/scw-config.json`

Key settings:
- Agent activation rules
- Gemini delegation thresholds
- Confidence thresholds
- Session persistence

---

## Directory Structure

```
project/
├── .claude/
│   ├── commands/scw/     # SCW commands
│   ├── specs/{feature}/  # Feature specifications
│   ├── bugs/{bug}/       # Bug workflows
│   ├── steering/         # Steering documents
│   ├── templates/        # Document templates
│   └── config/           # Configuration
├── agents/               # Agent definitions
├── modes/                # Behavioral modes
├── mcp/                  # MCP servers
│   ├── gemini-wrapper/   # Gemini delegation
│   └── configs/          # MCP configs
└── docs/
    ├── patterns/         # Successful patterns
    └── mistakes/         # Error documentation
```

---

## Getting Started

1. **New Feature**: `/scw:brainstorm feature-name` → `/scw:spec-create feature-name`
2. **Bug Fix**: `/scw:bug-create bug-name --severity high`
3. **Quick Implementation**: `/scw:implement component-name`
4. **Research**: `/scw:research "topic" --depth deep`

---

## Best Practices

1. **Use steering documents** - Keep product.md, tech.md, structure.md current
2. **Trust but verify Gemini** - Claude validates all Gemini outputs
3. **Use confidence checks** - Stop early if uncertain
4. **Document patterns** - Save successful patterns to docs/patterns/
5. **Learn from mistakes** - Document failures in docs/mistakes/

---

*SuperClaude Spec Workflow v1.0*

ARGUMENTS: $ARGUMENTS
