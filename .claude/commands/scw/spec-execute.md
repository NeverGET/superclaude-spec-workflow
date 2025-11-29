---
name: spec-execute
description: "Execute a single task from an approved spec with validation"
category: workflow
complexity: standard
mcp-servers: [sequential, serena, context7]
personas: [pm-agent, self-review]
gemini-delegation:
  triggers:
    - multi_file_generation
    - bulk_test_execution
---

# /scw:spec-execute - Task Execution with Validation

> **Single Task Execution**: Execute ONE task at a time from an approved specification. Load full context, implement with validation, mark complete, then STOP and wait for user.

## Triggers
- Ready to implement a specific task from approved spec
- Need to execute task with full specification context
- Want validation and traceability during implementation

## Usage
```
/scw:spec-execute [feature-name] [task-id]
```

**Parameters:**
- `feature-name`: Name of the feature (matches `.claude/specs/{feature-name}/`)
- `task-id`: Task number or identifier from tasks.md (e.g., "1", "task-1", "T001")

## Behavioral Flow

1. **Load Specification Context**
   - Read `.claude/specs/{feature}/requirements.md`
   - Read `.claude/specs/{feature}/design.md`
   - Read `.claude/specs/{feature}/tasks.md`
   - Read `.claude/steering/product.md` (if exists)
   - Read `.claude/steering/tech.md` (if exists)
   - Read `.claude/steering/structure.md` (if exists)

2. **Locate Task**
   - Find task by ID in tasks.md
   - Verify task is not already completed (`[x]`)
   - Extract task details, file paths, requirements references

3. **Activate Domain Agents**
   - Determine task domain from file paths and description
   - Activate relevant agents (backend-architect, frontend-architect, etc.)
   - Always include pm-agent for validation

4. **Execute Implementation**
   - Follow design.md implementation details
   - Leverage existing code patterns from _Leverage:_ references
   - Create/modify ONLY specified files (1-3 max)
   - Follow steering doc conventions
   - Include error handling per tech.md patterns
   - Add tests where specified

5. **[GEMINI DELEGATION]**
   - If generating >5 files, delegate to Gemini
   - Claude validates all Gemini output before accepting

6. **Validation**
   - PM Agent: SelfCheckProtocol
   - Run related tests if specified
   - Verify requirement satisfaction

7. **Complete Task**
   - Update tasks.md: change `- [ ]` to `- [x]`
   - Report completion summary to user
   - **STOP** - wait for next task instruction

Key behaviors:
- **Single Task Only**: NEVER execute multiple tasks
- **Full Context Loading**: Always load complete specification
- **Strict Completion**: Mark task complete ONLY after validation passes
- **Wait for User**: STOP after each task, never auto-proceed

## MCP Integration
- **Sequential MCP**: Step-by-step implementation reasoning
- **Context7 MCP**: Library documentation for implementation
- **Serena MCP**: Cross-session context and project memory

## Tool Coordination
- **Read**: Load specs, steering docs, existing code
- **Write/Edit**: Implement task changes
- **Glob/Grep**: Find leverage code, related files
- **Bash**: Run tests, build commands
- **TodoWrite**: Track implementation progress

## Key Patterns
- **Context Loading**: Specs + steering → full understanding
- **Domain Activation**: Task type → relevant agents
- **Implementation**: Design details + leverage code → changes
- **Validation**: SelfCheckProtocol → tests → completion

## Examples

### Execute First Task
```
/scw:spec-execute user-authentication 1
# Loads all specs for user-authentication
# Finds task 1 in tasks.md
# Implements with validation
# Marks [x] and STOPS
```

### Execute Specific Task
```
/scw:spec-execute payment-system task-3
# Loads payment-system specs
# Finds task-3
# Implements, validates, marks complete
```

### Task with Gemini Delegation
```
/scw:spec-execute microservices api-scaffolding
# Large task generating >5 files
# Delegates to Gemini for generation
# Claude validates all output
# Marks complete after validation
```

## Boundaries

**Will:**
- Execute exactly ONE task per invocation
- Load complete specification context before implementing
- Follow design.md and steering doc patterns
- Validate implementation with SelfCheckProtocol
- Mark task complete in tasks.md
- STOP and wait for user after each task

**Will Not:**
- Execute multiple tasks in one invocation
- Proceed to next task automatically
- Skip context loading
- Accept unvalidated Gemini output
- Mark incomplete tasks as done
- Modify files outside task scope

## Task Completion Protocol

```
1. Implement task following specs
2. Run validation:
   - SelfCheckProtocol checks
   - Run specified tests
   - Verify requirements met
3. Update tasks.md:
   - Find task line: `- [ ] N. Task description`
   - Change to: `- [x] N. Task description`
4. Report to user:
   - "Task N completed: [summary]"
   - "Files modified: [list]"
   - "Tests passed: [status]"
5. STOP - await next instruction
```

## PM Agent Integration

```
BEFORE Implementation:
  - ConfidenceChecker on task understanding
  - Verify design details are clear
  - Identify leverage code

DURING Implementation:
  - Follow design.md patterns
  - Apply steering conventions
  - Document complex logic

AFTER Implementation:
  SelfCheckProtocol:
  - [ ] Code matches design specification?
  - [ ] Requirements from _Requirements:_ satisfied?
  - [ ] Leverage code properly integrated?
  - [ ] Tests passing?
  - [ ] Error handling included?
  - [ ] Follows steering conventions?

ON ERROR:
  Reflexion Pattern:
  - Stop immediately
  - Analyze what went wrong
  - Document in docs/mistakes/
  - Fix before marking complete
```

## Gemini Delegation

Delegate to Gemini when:
- Task requires generating >5 files
- Bulk test generation needed
- Large refactoring across many files

Validation after Gemini:
1. All specified files created
2. Code follows project patterns
3. No hallucinated dependencies
4. Tests are valid and runnable

ARGUMENTS: $ARGUMENTS
