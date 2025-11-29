---
name: bug-create
description: "Create bug workflow with analysis, fix, and verification"
category: workflow
complexity: advanced
mcp-servers: [sequential, serena, context7, tavily]
personas: [pm-agent, root-cause-analyst, self-review]
phases:
  - name: report
    agents: [root-cause-analyst]
  - name: analysis
    agents: [root-cause-analyst, pm-agent]
    gemini_delegation: large_log_scan
  - name: fix
    agents: [domain-specific, pm-agent]
  - name: verification
    agents: [quality-engineer, pm-agent]
gemini-delegation:
  triggers:
    - large_log_scan
    - codebase_wide_search
---

# /scw:bug-create - Bug Analysis and Fix Workflow

> **Structured Bug Resolution**: Report → Analysis → Fix → Verification. Root cause analysis with PM Agent validation at each stage.

## Triggers
- Bug reports requiring systematic analysis
- Issues needing root cause investigation
- Defects requiring fix with regression testing
- Problems needing documented resolution

## Usage
```
/scw:bug-create [bug-name] [--severity critical|high|medium|low] [--skip-report]
```

**Parameters:**
- `bug-name`: Identifier for the bug (creates `.claude/bugs/{bug-name}/`)
- `--severity`: Bug severity level (affects prioritization)
- `--skip-report`: Skip report phase if symptoms already documented

## Behavioral Flow

### Phase 1: Report
1. **Create Bug Directory**: `.claude/bugs/{bug-name}/`
2. **Activate Agents**: root-cause-analyst, pm-agent
3. **Document Symptoms**: What is happening?
4. **Document Expected**: What should happen?
5. **Reproduction Steps**: How to reproduce?
6. **Environment**: Where does it occur?
7. **Generate**: Create bug-report.md using template

### Phase 2: Analysis
1. **Load Context**: Bug report + steering documents
2. **Codebase Search**: Find related code and components
3. **[GEMINI DELEGATION]**: If large logs/codebase scan needed
4. **Claude Validates**: Verify Gemini findings
5. **Root Cause Analysis**: Identify WHY the bug occurs
6. **PM Agent**: ConfidenceChecker on diagnosis (≥90% to proceed)
7. **Document**: Update bug-report.md with analysis

### Phase 3: Fix
1. **Plan Fix**: Define minimal change to resolve issue
2. **Activate Domain Agents**: Based on affected code area
3. **Implement Fix**: Following steering conventions
4. **Add Regression Test**: Prevent recurrence
5. **Document**: Record fix approach in bug-report.md

### Phase 4: Verification
1. **Run Tests**: All related tests + new regression test
2. **PM Agent**: SelfCheckProtocol validation
3. **Confirm Resolution**: Bug no longer reproduces
4. **Document**: Update bug-report.md with verification
5. **Mark Resolved**: Add "✅ RESOLVED" tag

Key behaviors:
- **Root Cause Focus**: Don't just fix symptoms, find the cause
- **Minimal Change**: Fix the bug, don't refactor
- **Regression Testing**: Always add test to prevent recurrence
- **Full Documentation**: Every step recorded in bug-report.md

## MCP Integration
- **Sequential MCP**: Step-by-step root cause analysis
- **Context7 MCP**: Library documentation for understanding behavior
- **Tavily MCP**: Search for known issues, similar bugs
- **Serena MCP**: Cross-session bug tracking persistence

## Tool Coordination
- **Read**: Load logs, stack traces, related code
- **Glob/Grep**: Search codebase for related files
- **Write/Edit**: Implement fixes, update bug report
- **Bash**: Run tests, check logs
- **TodoWrite**: Track analysis and fix progress

## Key Patterns
- **Symptom Documentation**: Observation → expected → steps → environment
- **Root Cause Analysis**: Symptoms → related code → causal chain → root cause
- **Minimal Fix**: Root cause → targeted change → regression test
- **Verification Loop**: Fix → tests → reproduce check → confirmation

## Examples

### Critical Production Bug
```
/scw:bug-create payment-failure --severity critical
# Phase 1: Document payment failure symptoms
# Phase 2: Analyze transaction logs, find root cause
# Phase 3: Fix with minimal change, add regression test
# Phase 4: Verify fix, confirm no recurrence
```

### UI Bug with Logs
```
/scw:bug-create form-validation-error --severity medium
# Documents form validation issue
# Analyzes frontend code
# Fixes validation logic
# Adds e2e test for verification
```

### Complex Bug Requiring Gemini
```
/scw:bug-create memory-leak --severity high
# Large log scan delegated to Gemini
# Claude validates findings
# Targeted fix with memory profiling
# Performance verification
```

## Boundaries

**Will:**
- Create structured bug documentation
- Perform systematic root cause analysis
- Implement minimal, targeted fixes
- Add regression tests for every fix
- Validate fixes with SelfCheckProtocol
- Delegate large log scans to Gemini (with validation)

**Will Not:**
- Fix symptoms without understanding root cause
- Make extensive refactoring during bug fix
- Skip regression testing
- Accept Gemini analysis without validation
- Close bugs without verification
- Proceed with <70% confidence on diagnosis

## Bug Report Template

Saved to: `.claude/bugs/{bug-name}/bug-report.md`

```markdown
# Bug Report: {bug-name}

## Status: [OPEN | IN_ANALYSIS | FIXING | VERIFYING | ✅ RESOLVED]

## Severity: [critical | high | medium | low]

## Summary
[One-line description]

## Symptoms
- What is happening?
- Error messages/logs

## Expected Behavior
- What should happen?

## Reproduction Steps
1. Step 1
2. Step 2
3. Step 3

## Environment
- OS/Browser:
- Version:
- Related components:

---

## Analysis

### Related Code
- [List of related files/functions]

### Root Cause
[Explanation of WHY the bug occurs]

### Confidence: [XX%]

---

## Fix

### Approach
[Description of fix approach]

### Files Modified
- [List of files]

### Regression Test
- [Test added to prevent recurrence]

---

## Verification

### Tests Run
- [ ] Unit tests
- [ ] Integration tests
- [ ] Regression test
- [ ] Manual reproduction check

### Confirmation
[✅ Bug no longer reproduces / ❌ Still occurs]

---

## Resolution
**Resolved on**: [date]
**Fix summary**: [brief description]
```

## PM Agent Integration

```
Phase 2 Analysis:
  ConfidenceChecker on diagnosis:
  ≥90%: Proceed with fix
  70-89%: Present alternative causes
  <70%: Need more investigation

Phase 3 Fix:
  Before implementing:
  - Is fix minimal and targeted?
  - Does it address root cause?
  - Is regression test planned?

Phase 4 Verification:
  SelfCheckProtocol:
  - [ ] All tests passing?
  - [ ] Bug no longer reproduces?
  - [ ] Regression test added?
  - [ ] No new issues introduced?
  - [ ] Documentation complete?

ON REGRESSION:
  Reflexion Pattern:
  - Stop and analyze
  - Document in docs/mistakes/
  - Re-analyze root cause
```

## Gemini Delegation

Delegate to Gemini when:
- Log files >1000 lines to analyze
- Codebase-wide search for bug pattern
- Multiple stack traces to correlate
- Performance profiling data analysis

Claude validates Gemini findings:
1. Findings relate to reported symptoms
2. Code references exist and are accurate
3. Causal chain is logical
4. No hallucinated file paths or functions

ARGUMENTS: $ARGUMENTS
