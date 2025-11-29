# Bug Report: {bug-name}

> **Status**: OPEN | IN_ANALYSIS | FIXING | VERIFYING | ✅ RESOLVED
> **Severity**: critical | high | medium | low
> **Created**: {date}
> **Last Updated**: {date}
> **Resolved**: {date or N/A}

---

## Summary

{One-line description of the bug}

---

## Symptoms

### What is Happening?
{Detailed description of the observed behavior}

### Error Messages
```
{Paste error messages, stack traces, or log output here}
```

### Screenshots/Evidence
{Links to screenshots or recordings if applicable}

---

## Expected Behavior

{What should happen instead of the current behavior?}

---

## Reproduction Steps

1. {Step 1: e.g., Navigate to /settings page}
2. {Step 2: e.g., Click on "Update Profile" button}
3. {Step 3: e.g., Enter invalid email format}
4. {Step 4: e.g., Click Submit}
5. **Result**: {What happens - the bug}

### Reproduction Rate
- [ ] Always (100%)
- [ ] Often (>50%)
- [ ] Sometimes (<50%)
- [ ] Rarely (<10%)

---

## Environment

| Factor | Value |
|--------|-------|
| **OS** | {e.g., macOS 14.0, Windows 11} |
| **Browser** | {e.g., Chrome 120, Safari 17} |
| **App Version** | {e.g., v2.3.1} |
| **Environment** | {e.g., Production, Staging, Local} |
| **User Role** | {e.g., Admin, Regular User} |

### Additional Context
{Any other relevant environment details}

---

## Affected Components

{List files, modules, or components that are likely involved}

- `path/to/suspected/file.ts`
- `path/to/related/component.tsx`

---

## Analysis

### Investigation Notes
{Document your investigation process here}

**Date**: {date}
**Investigator**: {name}

1. {Finding 1}
2. {Finding 2}
3. {Finding 3}

### Related Code

| File | Line(s) | Relevance |
|------|---------|-----------|
| `path/to/file.ts` | 45-67 | {Why this code is relevant} |
| `path/to/other.ts` | 123-145 | {Why this code is relevant} |

### Root Cause

**Confidence**: {XX%}

{Detailed explanation of WHY the bug occurs. Not just where, but the actual cause.}

**Causal Chain**:
1. {Event/Condition 1} leads to
2. {Event/Condition 2} which causes
3. {The observed bug behavior}

### Alternative Causes Considered

| Cause | Why Ruled Out |
|-------|---------------|
| {Potential cause 1} | {Reason it's not the cause} |
| {Potential cause 2} | {Reason it's not the cause} |

---

## Fix

### Approach

{Description of how the bug will be fixed}

**Fix Type**:
- [ ] Code change
- [ ] Configuration change
- [ ] Data fix
- [ ] Dependency update
- [ ] Other: {specify}

### Implementation Details

{Specific changes to be made}

1. {Change 1}
2. {Change 2}
3. {Change 3}

### Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `path/to/file.ts` | Modified | {What was changed} |
| `path/to/new.ts` | Created | {Why created} |
| `path/to/old.ts` | Deleted | {Why deleted} |

### Regression Test Added

**Test File**: `path/to/tests/regression-{bug-name}.test.ts`

```typescript
// Regression test to prevent recurrence
describe('Regression: {bug-name}', () => {
  it('should not reproduce the bug', () => {
    // Test implementation
  });
});
```

---

## Verification

### Test Checklist

- [ ] Reproduction steps no longer produce the bug
- [ ] Regression test added and passing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] No new issues introduced
- [ ] Performance not degraded

### Test Results

| Test Type | Status | Notes |
|-----------|--------|-------|
| Regression Test | PASS/FAIL | {notes} |
| Unit Tests | PASS/FAIL | {notes} |
| Integration Tests | PASS/FAIL | {notes} |
| Manual Testing | PASS/FAIL | {notes} |

### Verification Steps

1. {How to verify the fix works}
2. {Additional verification step}
3. {Edge case to check}

### Verification Result

- [ ] ✅ Bug is fixed and verified
- [ ] ❌ Bug still occurs (back to analysis)
- [ ] ⚠️ Partially fixed (document remaining issues)

---

## Resolution

### Fix Summary
{Brief description of what was done to fix the bug}

### Lessons Learned
{What can be done to prevent similar bugs in the future?}

1. {Lesson 1}
2. {Lesson 2}

### Documentation Updates
- [ ] Updated relevant documentation
- [ ] Added to known issues (if applicable)
- [ ] Updated runbook (if applicable)

### Related Issues
- {Link to related bugs or issues}
- {Link to follow-up tasks}

---

## Timeline

| Date | Action | By |
|------|--------|-----|
| {date} | Bug reported | {name} |
| {date} | Analysis started | {name} |
| {date} | Root cause identified | {name} |
| {date} | Fix implemented | {name} |
| {date} | Fix verified | {name} |
| {date} | Deployed to production | {name} |

---

## PM Agent Validation

### Pre-Fix Confidence Check
- **Confidence Level**: {XX%}
- **Proceed**: YES/NO/NEED_MORE_INFO

### Post-Fix Self-Check
- [ ] Root cause addressed (not just symptoms)?
- [ ] Fix is minimal and targeted?
- [ ] Regression test prevents recurrence?
- [ ] No new issues introduced?
- [ ] All tests passing?
- [ ] Documentation updated?

---

*Generated by /scw:bug-create - SuperClaude Spec Workflow*
