# SuperClaude Spec Workflow - Integration Plan

## User Decisions
- **Command Namespace**: `/scw:*` (brand new, unified)
- **Gemini Integration**: MCP wrapper (structured, trackable)
- **Priority**: Spec workflow commands first
- **Dashboard**: Deferred to later phase

---

## Executive Summary

Combining three frameworks into **SuperClaude Spec Workflow** (`/scw:*`):
1. **Claude Code Spec Workflow** (User Layer) - Phase-gated spec-driven development
2. **SuperClaude Framework** (Orchestration Layer) - Agents, validation, MCP coordination
3. **SuperGemini Framework** (Delegation Layer) - Token-heavy ops via Gemini MCP wrapper

---

## Architecture Overview

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
│  ├── 19 Merged Agents (from SuperClaude, auto-activated by context)         │
│  ├── 5 Behavioral Modes (Brainstorming, Research, Token-Efficiency...)      │
│  ├── 9 MCP Servers (Context7, Tavily, Serena, Sequential, Gemini...)        │
│  └── Wave→Checkpoint→Wave parallel execution (3.5x speedup)                 │
│                                                                              │
│  DELEGATION LAYER (Gemini MCP Wrapper - 2M tokens)                          │
│  ├── 8 MCP Tools: research, file_scan, generate, dialogue, test, etc.       │
│  ├── Claude validates ALL Gemini outputs before accepting                   │
│  ├── Session tracking for multi-step operations (handles Gemini bugs)       │
│  └── Triggers: >10 files, >5 file generation, deep research, bulk tests     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Command System Architecture

### 1.1 File Format: Markdown with YAML Frontmatter

```yaml
---
name: spec-create
description: Create feature specification with phased approval workflow
version: 1.0.0
category: workflow
complexity: advanced
platforms:
  claude_code: true
  gemini_cli: false
agents:
  primary: [requirements-analyst, pm-agent]
  secondary: [socratic-mentor, system-architect]
  validators: [quality-engineer]
mcp-servers:
  required: [sequential, serena]
  optional: [context7, tavily]
phases:
  - name: requirements
    approval: required
    agents: [requirements-analyst, socratic-mentor]
    gemini_delegation: false
  - name: design
    approval: required
    agents: [system-architect, backend-architect]
    gemini_delegation: codebase_analysis_large
  - name: tasks
    approval: required
    agents: [quality-engineer, pm-agent]
    gemini_delegation: false
gemini-delegation:
  triggers:
    - codebase_analysis_large  # >1000 files
    - context_overflow         # Token limit approaching
    - deep_research           # Extensive web research
---

# /scw:spec-create - Feature Specification Workflow
[Command body with phase instructions...]
```

### 1.2 Directory Structure

```
superclaude-spec-workflow/
├── .claude/
│   ├── commands/scw/              # All /scw: commands
│   │   ├── spec-create.md         # Main spec workflow
│   │   ├── spec-execute.md        # Task execution
│   │   ├── spec-validate.md       # Validation workflow
│   │   ├── bug-create.md          # Bug workflow
│   │   ├── brainstorm.md          # Requirements discovery
│   │   ├── design.md              # Architecture design
│   │   ├── implement.md           # Implementation helper
│   │   ├── test.md                # Testing workflow
│   │   ├── research.md            # Deep research
│   │   └── help.md                # Command reference
│   ├── specs/{feature}/           # Feature specifications
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── bugs/{bug}/                # Bug workflows
│   ├── steering/                  # Project context
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   ├── templates/                 # Document templates
│   └── config/
│       ├── scw-config.json        # Framework config
│       └── mcp-registry.json      # MCP server configs
│
├── agents/                        # Agent definitions
│   ├── core/                      # Always-loaded
│   │   ├── pm-agent.md
│   │   └── self-review.md
│   ├── spec-workflow/             # Spec specialists
│   │   ├── requirements-analyst.md
│   │   ├── system-architect.md
│   │   └── quality-engineer.md
│   ├── domain/                    # Domain specialists (7)
│   ├── analysis/                  # Analysis specialists (2)
│   ├── research/                  # Research agents (3)
│   └── communication/             # Writers (1)
│
├── modes/                         # Behavioral modes
│   ├── brainstorming.md
│   ├── research.md
│   ├── token-efficiency.md
│   ├── orchestration.md
│   └── task-management.md
│
├── mcp/                           # MCP configurations
│   ├── gemini-wrapper/            # Gemini MCP server
│   │   ├── server.py              # MCP server implementation
│   │   ├── tools.py               # Tool definitions
│   │   └── validation.py          # Output validation
│   └── configs/                   # Other MCP configs
│
├── CLAUDE.md                      # Project instructions
└── docs/
    ├── patterns/                  # Successful patterns (Reflexion)
    └── mistakes/                  # Error documentation
```

---

## 2. Gemini MCP Wrapper

### 2.1 MCP Tools (8 Tools)

| Tool | Purpose | Validation |
|------|---------|------------|
| `gemini_research` | Web research, documentation | Source verification |
| `gemini_file_scan` | Large directory scanning (>10 files) | File existence check |
| `gemini_generate` | Multi-file code generation (>5 files) | Syntax + pattern validation |
| `gemini_dialogue` | Claude↔Gemini brainstorming | Consensus check |
| `gemini_test` | Test suite execution/generation | Test pass/fail |
| `gemini_document` | Documentation generation | Completeness check |
| `gemini_analyze` | Deep codebase analysis | Scope validation |
| `gemini_continue` | Resume incomplete operations | State restoration |

### 2.2 Delegation Flow

```
Claude Code                     Gemini MCP Wrapper                    Gemini CLI
     │                                │                                    │
     │ 1. Prepare delegation request  │                                    │
     │ ──────────────────────────────>│                                    │
     │                                │ 2. Format as gemini -p prompt       │
     │                                │ ───────────────────────────────────>│
     │                                │                                    │
     │                                │ 3. Gemini executes (may need       │
     │                                │    "continue" for long ops)        │
     │                                │ <───────────────────────────────────│
     │                                │                                    │
     │                                │ 4. Track session state (Redis)     │
     │                                │                                    │
     │ 5. Return results + metadata   │                                    │
     │ <──────────────────────────────│                                    │
     │                                │                                    │
     │ 6. Claude validates:           │                                    │
     │    - Scope match               │                                    │
     │    - No hallucinations         │                                    │
     │    - Pattern compliance        │                                    │
     │                                │                                    │
     │ 7. Accept/Reject/Re-delegate   │                                    │
```

### 2.3 Validation Protocol

Claude performs lightweight validation (trusts content quality):
1. **Scope Check**: Output matches requested scope
2. **Format Check**: Expected structure/syntax
3. **Completeness**: All requested items present
4. **Pattern Compliance**: Follows steering doc conventions

---

## 3. Agent Integration

### 3.1 Merged Agent List (19 Agents)

| Tier | Agents | Activation |
|------|--------|------------|
| **Core** | pm-agent, self-review | Always active |
| **Spec Workflow** | requirements-analyst, system-architect, quality-engineer | Phase-based |
| **Domain** | backend-architect, frontend-architect, security-engineer, devops-architect, performance-engineer, python-expert | Task-based |
| **Analysis** | root-cause-analyst, refactoring-expert | Context-triggered |
| **Research** | deep-research-agent, socratic-mentor, learning-guide | Mode-triggered |
| **Communication** | technical-writer, business-panel-experts, repo-index | Explicit |

### 3.2 Agent Activation by Workflow Phase

| Phase | Primary Agents | Validation | Gemini Delegation |
|-------|---------------|------------|-------------------|
| Requirements | requirements-analyst, pm-agent, socratic-mentor | ConfidenceChecker ≥90% | No |
| Design | system-architect, pm-agent, (backend/frontend) | SelfCheckProtocol | Yes (large codebase) |
| Tasks | quality-engineer, pm-agent | Task completeness | No |
| Implementation | (task-specific), pm-agent | Reflexion post-task | Yes (bulk generation) |

### 3.3 PM Agent Integration Points

```
BEFORE each phase:  ConfidenceChecker
  ├── ≥90%: Proceed
  ├── 70-89%: Present alternatives
  └── <70%: STOP, ask questions

AFTER each phase:   SelfCheckProtocol
  ├── All tests passing?
  ├── All requirements met?
  ├── No assumptions without verification?
  └── Evidence for every claim?

ON ERROR:           Reflexion Pattern
  ├── Stop immediately
  ├── Analyze root cause
  ├── Document in docs/mistakes/
  └── Update prevention checklist
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Create directory structure
2. Set up CLAUDE.md with project instructions
3. Create scw-config.json
4. Copy and adapt agent files from SuperClaude

### Phase 2: Core Commands (Week 2-3)
1. `/scw:spec-create` with full phase workflow
2. `/scw:spec-execute` with validation
3. `/scw:bug-create` with analysis workflow
4. Integrate PM Agent validation gates

### Phase 3: Gemini MCP Wrapper (Week 4-5)
1. Create MCP server skeleton
2. Implement 8 delegation tools
3. Add session tracking (Redis)
4. Build validation protocol

### Phase 4: Additional Commands (Week 6)
1. `/scw:brainstorm`, `/scw:design`, `/scw:implement`
2. `/scw:test`, `/scw:research`
3. `/scw:help` command reference

### Phase 5: Testing & Refinement (Week 7)
1. End-to-end workflow testing
2. Agent activation tuning
3. Gemini delegation threshold tuning
4. Documentation

---

## 5. Critical Files to Read/Create

### From Source Repositories (Reference)
| File | Purpose |
|------|---------|
| `claude-code-spec-workflow/src/commands.ts` | Spec workflow logic |
| `claude-code-spec-workflow/src/templates.ts` | Document templates |
| `SuperClaude_Framework/plugins/superclaude/agents/pm-agent.md` | PM Agent with validation |
| `SuperClaude_Framework/plugins/superclaude/commands/brainstorm.md` | Brainstorming pattern |

### New Files to Create
| File | Priority |
|------|----------|
| `.claude/commands/scw/spec-create.md` | P0 |
| `.claude/commands/scw/spec-execute.md` | P0 |
| `agents/core/pm-agent.md` | P0 |
| `mcp/gemini-wrapper/server.py` | P1 |
| `CLAUDE.md` | P0 |
| `.claude/config/scw-config.json` | P0 |

---

## 6. Open Technical Questions

1. **MCP Server Runtime**: Python (uvx) or Node.js (npx)?
2. **Session Persistence**: Redis or file-based for Gemini session tracking?
3. **Agent File Format**: Keep SuperClaude's rich format or simplify?

---

*Plan synthesized from 3 planning agents: Command Architecture, Gemini MCP Wrapper, Agent Integration*
