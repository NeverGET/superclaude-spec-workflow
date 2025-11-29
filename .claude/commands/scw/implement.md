---
name: implement
description: "Implementation helper with pattern guidance"
category: workflow
complexity: standard
mcp-servers: [sequential, serena, context7]
personas: [backend-architect, frontend-architect, python-expert, pm-agent]
gemini-delegation:
  triggers:
    - bulk_file_generation
---

# /scw:implement - Implementation Helper

> **Guided Implementation**: Get implementation guidance with pattern matching and code generation. Works standalone or with spec workflow.

## Triggers
- Implementing a specific feature or component
- Need guidance on implementation approach
- Want to generate boilerplate following patterns
- Quick implementation without full spec workflow

## Usage
```
/scw:implement [what-to-implement] [--pattern existing|generate] [--files single|multi]
```

**Parameters:**
- `what-to-implement`: Feature, component, or task to implement
- `--pattern`: Use existing patterns or generate new (default: existing)
- `--files`: Single file or multi-file implementation (default: single)

## Behavioral Flow

### Phase 1: Understanding
1. **Parse Request**: What needs to be implemented?
2. **Load Context**: Check for spec files, steering docs
3. **Activate Agents**: Domain-appropriate architects
4. **Identify Patterns**: Find similar implementations

### Phase 2: Pattern Analysis
1. **Search Codebase**: Find similar code patterns
2. **Extract Patterns**: Identify reusable templates
3. **Analyze Conventions**: Match naming/style patterns
4. **Map Dependencies**: Understand integration needs

### Phase 3: Implementation
1. **Plan Implementation**: Break into steps
2. **Generate Code**: Following identified patterns
3. **[GEMINI DELEGATION]**: If >5 files to generate
4. **Add Integration**: Connect to existing code

### Phase 4: Validation
1. **PM Agent**: SelfCheckProtocol on implementation
2. **Run Tests**: If applicable
3. **Document**: What was implemented

Key behaviors:
- **Pattern First**: Always look for existing patterns
- **Minimal Change**: Implement only what's needed
- **Follow Conventions**: Match project style
- **Test Aware**: Consider testing during implementation

## MCP Integration
- **Sequential MCP**: Step-by-step implementation reasoning
- **Serena MCP**: Session persistence for long implementations
- **Context7 MCP**: Framework documentation for patterns

## Tool Coordination
- **Glob/Grep**: Find pattern examples
- **Read**: Analyze existing code
- **Edit/Write**: Implement code
- **Bash**: Run tests

## Key Patterns
- **Pattern Matching**: Find and follow existing code patterns
- **Incremental Implementation**: Small, testable steps
- **Convention Compliance**: Strict adherence to tech.md
- **Leverage Existing**: Extend rather than rewrite

## Examples

### Single Component
```
/scw:implement UserProfile component
# Finds similar component patterns
# Generates UserProfile.tsx following conventions
# Adds to appropriate exports
```

### API Endpoint
```
/scw:implement GET /api/users/:id endpoint
# Analyzes existing API patterns
# Creates endpoint with validation
# Follows error handling conventions
```

### Multi-file Feature
```
/scw:implement notification system --files multi
# Plans multi-file implementation
# Generates model, service, controller
# Adds tests for each component
```

### From Spec Task
```
/scw:implement --from-spec authentication task-3
# Loads spec context
# Implements task 3 from tasks.md
# Updates task status when complete
```

## Boundaries

**Will:**
- Analyze existing patterns before implementing
- Generate code following project conventions
- Implement in small, testable increments
- Validate implementation against requirements
- Delegate bulk generation to Gemini

**Will Not:**
- Implement without understanding patterns
- Generate code that doesn't follow conventions
- Skip testing considerations
- Make changes beyond requested scope

## Pattern Detection

When starting implementation:
1. **Find Similar**: Search for similar implementations
2. **Extract Template**: Identify common structure
3. **Apply Pattern**: Use template for new code
4. **Validate Match**: Ensure consistency

```typescript
// Example: Pattern detected from existing components
// src/components/ProfileCard.tsx follows this pattern:
// - Props interface at top
// - Destructured props
// - Early returns for loading/error states
// - Main render with styled components
// - Export at bottom

// New implementation follows same pattern
interface UserProfileProps {
  userId: string;
  onUpdate?: () => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // Implementation following detected pattern
}
```

## PM Agent Integration

```
Before Implementation:
  ConfidenceChecker:
  - Is the pattern clear?
  - Are dependencies understood?
  - Is scope well-defined?

After Implementation:
  SelfCheckProtocol:
  - Does code follow patterns?
  - Is it minimal and targeted?
  - Are tests considered?
  - Is integration complete?
```

## Gemini Delegation

When multi-file implementation needed (>5 files):
1. Prepare implementation spec
2. Delegate to `gemini_generate`
3. Claude validates each generated file
4. Integrate files into codebase

ARGUMENTS: $ARGUMENTS
