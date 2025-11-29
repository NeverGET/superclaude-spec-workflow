---
name: spec-create
description: "Create feature specification with phased approval workflow"
category: workflow
complexity: advanced
mcp-servers: [sequential, serena, context7, tavily]
personas: [pm-agent, requirements-analyst, socratic-mentor, system-architect, quality-engineer]
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
    - codebase_analysis_large
    - context_overflow
    - deep_research
---

# /scw:spec-create - Feature Specification Workflow

> **Unified Spec Workflow**: This command implements phase-gated spec-driven development with PM Agent validation at every stage. Claude orchestrates, validates all outputs, and maintains approval gates between phases.

## Triggers
- New feature development requests
- Complex functionality requiring structured planning
- Projects needing requirements → design → tasks breakdown
- Requests for phase-gated implementation workflows

## Usage
```
/scw:spec-create [feature-name] [--skip-steering] [--resume phase]
```

**Parameters:**
- `feature-name`: Name for the feature (creates `.claude/specs/{feature-name}/`)
- `--skip-steering`: Skip loading steering documents (not recommended)
- `--resume`: Resume from a specific phase (requirements|design|tasks)

## Behavioral Flow

### Phase 1: Requirements Discovery
1. **Load Context**: Read steering documents (product.md, tech.md, structure.md)
2. **Activate Agents**: requirements-analyst, socratic-mentor, pm-agent
3. **Socratic Dialogue**: Ask probing questions to discover requirements
4. **ConfidenceChecker**: Validate understanding ≥90% before proceeding
5. **Generate**: Create requirements.md using template
6. **Approval Gate**: Present to user, wait for explicit approval
7. **Mark Approved**: Add "✅ APPROVED" tag to document

### Phase 2: Design Creation
1. **Load Context**: Requirements.md + steering documents
2. **Activate Agents**: system-architect, backend-architect (or frontend), pm-agent
3. **Codebase Analysis**: Search for reusable components
4. **[GEMINI DELEGATION]**: If >10 files to scan, delegate to Gemini CLI
5. **Claude Validates**: Verify Gemini output scope and accuracy
6. **Generate**: Create design.md with Mermaid diagrams
7. **SelfCheckProtocol**: Verify design meets requirements
8. **Approval Gate**: Present to user, wait for explicit approval
9. **Mark Approved**: Add "✅ APPROVED" tag to document

### Phase 3: Task Breakdown
1. **Load Context**: Requirements.md + design.md + steering
2. **Activate Agents**: quality-engineer, pm-agent
3. **Atomic Breakdown**: Split into tasks (1-3 files, 15-30 min each)
4. **Add Traceability**: _Requirements: X.Y_, _Leverage: path/to/file_
5. **Generate**: Create tasks.md using template
6. **Approval Gate**: Present to user, wait for explicit approval
7. **Offer Commands**: "Would you like to generate individual task commands?"

### Phase 4: Implementation
- Execute tasks one-at-a-time via `/scw:spec-execute [task-id]`
- Update tasks.md: `[ ]` → `[x]` after each completion
- Apply Reflexion pattern on any errors
- STOP after each task, wait for user instruction

Key behaviors:
- **Strict Phase Gating**: NEVER proceed without explicit user approval
- **PM Agent Validation**: ConfidenceChecker before, SelfCheckProtocol after
- **Gemini Delegation**: Large operations only, Claude always validates
- **Traceability**: Every task traces back to requirements

## MCP Integration
- **Sequential MCP**: Complex multi-step reasoning for requirements discovery
- **Context7 MCP**: Library documentation for design decisions
- **Tavily MCP**: Web research for technology choices
- **Serena MCP**: Cross-session persistence and project memory

## Tool Coordination
- **Read**: Load steering docs, existing specs, codebase files
- **Write**: Create requirements.md, design.md, tasks.md
- **Glob/Grep**: Find reusable components in codebase
- **TodoWrite**: Track phase progress
- **Task**: Delegate to specialized agents
- **sequentialthinking**: Structure complex design decisions

## Key Patterns
- **Socratic Discovery**: Questions → requirements clarification → user stories
- **Code Reuse Analysis**: Codebase scan → existing components → integration points
- **Atomic Task Decomposition**: Design → 15-30 min tasks → file-specific work
- **Approval Gating**: Phase output → user review → explicit approval → proceed

## Examples

### Basic Feature Spec
```
/scw:spec-create user-authentication
# Creates .claude/specs/user-authentication/
# Phase 1: Requirements discovery with Socratic questions
# Phase 2: Design with architecture diagrams
# Phase 3: Atomic task breakdown
```

### Resume from Design Phase
```
/scw:spec-create payment-system --resume design
# Loads existing requirements.md
# Continues from design phase
```

### Large Feature with Gemini Delegation
```
/scw:spec-create microservices-migration
# Requirements: Claude handles
# Design: Gemini scans large codebase, Claude validates
# Tasks: Claude breaks down with traceability
```

## Boundaries

**Will:**
- Create structured specifications following templates
- Apply PM Agent validation at every phase gate
- Delegate token-heavy operations to Gemini (with validation)
- Maintain requirement traceability throughout
- Wait for explicit user approval between phases

**Will Not:**
- Proceed without explicit approval ("yes", "approved", "looks good")
- Accept Gemini outputs without validation
- Skip phases or combine phases
- Make assumptions without asking clarifying questions
- Implement code during spec creation (that's /scw:spec-execute)

## Phase Templates

### Requirements Phase Output
Saved to: `.claude/specs/{feature}/requirements.md`
- Introduction and feature overview
- Alignment with product.md vision
- User stories in standard format
- Acceptance criteria in EARS format
- Non-functional requirements

### Design Phase Output
Saved to: `.claude/specs/{feature}/design.md`
- Technical overview and system placement
- Steering document alignment (tech.md, structure.md)
- Code reuse analysis with existing components
- Architecture with Mermaid diagrams
- Component interfaces and data models
- Error handling and testing strategy

### Tasks Phase Output
Saved to: `.claude/specs/{feature}/tasks.md`
- Task overview with steering compliance
- Atomic tasks (1-3 files, 15-30 min each)
- Checkbox format with file paths
- Requirement references and code leverage

## PM Agent Integration

```
BEFORE Requirements: ConfidenceChecker
  ≥90%: Proceed with discovery
  70-89%: Present alternatives
  <70%: STOP, ask more questions

BEFORE Design: ConfidenceChecker
  Verify requirements are complete and approved

AFTER Design: SelfCheckProtocol
  - Does design address all requirements?
  - Are components properly specified?
  - Is existing code leverage identified?

AFTER Tasks: SelfCheckProtocol
  - Are all tasks atomic (1-3 files)?
  - Do tasks have requirement traceability?
  - Is time boxing realistic (15-30 min)?
```

## Gemini Delegation Triggers

Delegate to Gemini CLI when:
- Scanning >10 files for reusable components
- Analyzing codebase with >1000 files
- Deep research requiring extensive web crawling
- Context window approaching 80% capacity

Claude ALWAYS validates Gemini output:
1. Scope matches request
2. Format is correct
3. All items present
4. Follows steering conventions

ARGUMENTS: $ARGUMENTS
