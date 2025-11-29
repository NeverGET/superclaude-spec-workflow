# CLAUDE.md - SuperClaude Spec Workflow

## Overview

This project implements **SuperClaude Spec Workflow** (`/scw:*`), a unified framework combining:
1. **Claude Code Spec Workflow** (User Layer) - Phase-gated spec-driven development
2. **SuperClaude Framework** (Orchestration Layer) - Agents, validation, MCP coordination
3. **SuperGemini Framework** (Delegation Layer) - Token-heavy ops via Gemini MCP wrapper

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUPERCLAUDE SPEC WORKFLOW (/scw:*)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USER LAYER (Primary Commands)                                              │
│  ├── /scw:spec-create → Requirements → Design → Tasks → Implementation      │
│  ├── /scw:spec-execute → Task execution with validation                     │
│  ├── /scw:bug-create → Report → Analysis → Fix → Verification               │
│  └── Steering documents (product.md, tech.md, structure.md)                 │
│                                                                              │
│  ORCHESTRATION LAYER (Claude Code - 200K tokens)                            │
│  ├── PM Agent: ConfidenceChecker (pre) + SelfCheckProtocol (post)           │
│  ├── 19 Merged Agents (auto-activated by context)                           │
│  ├── 7 Behavioral Modes                                                     │
│  ├── 9 MCP Servers (Context7, Tavily, Serena, Sequential, Gemini...)        │
│  └── Wave→Checkpoint→Wave parallel execution (3.5x speedup)                 │
│                                                                              │
│  DELEGATION LAYER (Gemini MCP Wrapper - 2M tokens)                          │
│  ├── 8 MCP Tools: research, file_scan, generate, dialogue, test, etc.       │
│  ├── Claude validates ALL Gemini outputs before accepting                   │
│  ├── Session tracking for multi-step operations                             │
│  └── Triggers: >10 files, >5 file generation, deep research, bulk tests     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
superclaude-spec-workflow/
├── .claude/
│   ├── commands/scw/              # All /scw: commands
│   │   ├── spec-create.md         # Main spec workflow
│   │   ├── spec-execute.md        # Task execution
│   │   └── ...
│   ├── specs/{feature}/           # Feature specifications
│   ├── bugs/{bug}/                # Bug workflows
│   ├── steering/                  # Project context
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   ├── templates/                 # Document templates
│   └── config/
│       └── scw-config.json        # Framework config
│
├── agents/                        # Agent definitions (19 total)
│   ├── core/                      # Always-loaded (pm-agent, self-review)
│   ├── spec-workflow/             # Spec specialists
│   ├── domain/                    # Domain specialists (6)
│   ├── analysis/                  # Analysis specialists (2)
│   ├── research/                  # Research agents (4)
│   └── communication/             # Writers (3)
│
├── modes/                         # Behavioral modes (7)
│   ├── brainstorming.md
│   ├── research.md
│   ├── token-efficiency.md
│   ├── orchestration.md
│   └── task-management.md
│
├── mcp/                           # MCP configurations
│   └── gemini-wrapper/            # Gemini MCP server (Node.js)
│
├── docs/
│   ├── superclaude-spec-workflow/ # Planning docs
│   ├── patterns/                  # Successful patterns
│   └── mistakes/                  # Error documentation
│
└── CLAUDE.md                      # This file
```

---

## Core Principles

### 1. Claude Orchestrates, Gemini Executes

**CRITICAL**: Claude Code (200K tokens) is the orchestrator. Gemini CLI (2M tokens) is the "second hand" that handles token-heavy operations.

**Delegation Triggers**:
- Scanning >10 files
- Generating >5 files
- Deep web research
- Bulk test execution
- Context overflow approaching

**Validation Protocol**: Claude MUST validate ALL Gemini outputs:
1. **Scope Check**: Output matches requested scope
2. **Format Check**: Expected structure/syntax
3. **Completeness**: All requested items present
4. **Pattern Compliance**: Follows steering doc conventions

### 2. PM Agent Validation Gates

**BEFORE each phase** - ConfidenceChecker:
- ≥90%: Proceed with implementation
- 70-89%: Present alternatives to user
- <70%: STOP and ask clarifying questions

**AFTER each phase** - SelfCheckProtocol:
- All tests passing?
- All requirements met?
- No assumptions without verification?
- Evidence for every claim?

**ON ERROR** - Reflexion Pattern:
- Stop immediately
- Analyze root cause
- Document in docs/mistakes/
- Update prevention checklist

### 3. Phase-Gated Approval

Every spec workflow requires explicit user approval at gates:
1. **Requirements Phase** → User approves requirements.md
2. **Design Phase** → User approves design.md
3. **Tasks Phase** → User approves tasks.md
4. **Implementation** → Execute with validation

---

## Agent Activation

| Tier | Agents | Activation |
|------|--------|------------|
| **Core** | pm-agent, self-review | Always active |
| **Spec Workflow** | requirements-analyst, system-architect, quality-engineer | Phase-based |
| **Domain** | backend-architect, frontend-architect, security-engineer, devops-architect, performance-engineer, python-expert | Task-based |
| **Analysis** | root-cause-analyst, refactoring-expert | Context-triggered |
| **Research** | deep-research-agent, socratic-mentor, learning-guide | Mode-triggered |
| **Communication** | technical-writer, business-panel-experts, repo-index | Explicit |

---

## MCP Server Integration

### Required Servers
- **sequential-thinking**: Complex problem decomposition
- **serena**: Session persistence, cross-session context
- **context7**: Library documentation
- **tavily**: Web research

### Optional Servers
- **gemini-wrapper**: Gemini CLI delegation (when implemented)
- **playwright**: Browser automation
- **chrome-devtools**: Performance analysis

---

## Commands Reference

### Primary Workflows
- `/scw:spec-create [feature]` - Create feature specification
- `/scw:spec-execute [task-id]` - Execute spec task
- `/scw:bug-create [issue]` - Create bug workflow

### Support Commands
- `/scw:brainstorm [topic]` - Requirements discovery
- `/scw:design [feature]` - Architecture design
- `/scw:implement [task]` - Implementation helper
- `/scw:test [scope]` - Testing workflow
- `/scw:research [topic]` - Deep research
- `/scw:help` - Command reference

---

## Development Workflow

### Creating a New Feature Spec
```bash
# 1. Start spec creation
/scw:spec-create user-authentication

# 2. Claude activates requirements-analyst + socratic-mentor
# 3. Requirements phase with Socratic questioning
# 4. User approves requirements.md

# 5. Design phase (may delegate large codebase scan to Gemini)
# 6. User approves design.md

# 7. Tasks phase - breakdown into implementable tasks
# 8. User approves tasks.md

# 9. Execute tasks
/scw:spec-execute auth-task-001
```

### Bug Fix Workflow
```bash
# 1. Start bug workflow
/scw:bug-create login-timeout-issue

# 2. Claude activates root-cause-analyst
# 3. Analysis phase (may delegate to Gemini for large log scan)
# 4. Fix implementation
# 5. Verification with tests
```

---

## Token Efficiency

### Parallel Execution Pattern
**Wave → Checkpoint → Wave** (3.5x speedup):
```
[Read files in parallel] → Analyze → [Edit files in parallel]
```

### Gemini Delegation Thresholds
- File scanning: >10 files
- Code generation: >5 files
- Documentation: >2000 lines
- Research: Extensive web crawling

### Budget Guidelines
- Simple (typo fix): 200 tokens
- Medium (bug fix): 1,000 tokens
- Complex (feature): 2,500 tokens
- Confidence check ROI: spend 100-200 to save 5,000-50,000

---

## Best Practices

1. **Always use steering documents** - Keep product.md, tech.md, structure.md current
2. **Trust but verify Gemini** - Never accept Gemini output without validation
3. **Use confidence checks** - Stop early if uncertain
4. **Document patterns** - Save successful patterns to docs/patterns/
5. **Learn from mistakes** - Document failures in docs/mistakes/
6. **Parallel when possible** - Use Wave→Checkpoint→Wave pattern

---

## Related Documentation

- `docs/superclaude-spec-workflow/MASTER-PLAN.md` - Full architecture plan
- `docs/superclaude-spec-workflow/USER-DECISIONS.md` - Design decisions
- `agents/core/pm-agent.md` - PM Agent with validation protocols
- `modes/` - Behavioral mode definitions

---

*SuperClaude Spec Workflow v1.0 - Unified Development Framework*
