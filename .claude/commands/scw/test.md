---
name: test
description: "Test execution with coverage analysis and reporting"
category: workflow
complexity: standard
mcp-servers: [sequential, serena]
personas: [quality-engineer, pm-agent]
gemini-delegation:
  triggers:
    - large_test_suite
    - coverage_analysis
---

# /scw:test - Test Execution Workflow

> **Quality Assurance**: Run tests with coverage analysis, generate missing tests, and provide comprehensive reporting.

## Triggers
- Running test suites with coverage
- Generating tests for uncovered code
- Analyzing test quality
- Verifying implementations

## Usage
```
/scw:test [scope] [--type unit|integration|e2e|all] [--coverage] [--generate-missing]
```

**Parameters:**
- `scope`: File, directory, or feature to test
- `--type`: Test type to run (default: all)
- `--coverage`: Generate coverage report
- `--generate-missing`: Create tests for uncovered code

## Behavioral Flow

### Phase 1: Analysis
1. **Identify Test Scope**: What to test?
2. **Find Existing Tests**: What tests already exist?
3. **Analyze Coverage**: What's currently covered?
4. **Load Test Config**: Testing framework and conventions

### Phase 2: Execution
1. **Run Tests**: Execute test suite
2. **[GEMINI DELEGATION]**: If large test suite
3. **Collect Results**: Pass/fail, coverage, timing
4. **Identify Failures**: Root cause analysis

### Phase 3: Gap Analysis
1. **Coverage Gaps**: What's not tested?
2. **Missing Tests**: What should be tested?
3. **Quality Issues**: Weak or flaky tests?
4. **Recommendations**: How to improve?

### Phase 4: Generation (if --generate-missing)
1. **Identify Targets**: Uncovered code
2. **Generate Tests**: Following test patterns
3. **Integrate Tests**: Add to test suite
4. **Verify**: Run new tests

Key behaviors:
- **Coverage Focused**: Always report coverage
- **Pattern Following**: Generate tests matching existing style
- **Root Cause Analysis**: Explain failures clearly
- **Actionable Output**: Provide clear next steps

## MCP Integration
- **Sequential MCP**: Step-by-step test analysis
- **Serena MCP**: Persist test session context

## Tool Coordination
- **Bash**: Run test commands
- **Read**: Analyze test files and coverage
- **Write**: Generate new test files
- **TodoWrite**: Track test improvements

## Key Patterns
- **Test Classification**: Unit vs Integration vs E2E
- **Coverage Thresholds**: Enforce minimum coverage
- **Test Generation**: Pattern-based test creation
- **Failure Analysis**: Root cause identification

## Examples

### Run All Tests
```
/scw:test src/ --type all --coverage
# Runs all tests in src/
# Generates coverage report
# Reports pass/fail summary
```

### Unit Tests Only
```
/scw:test src/services/auth.ts --type unit
# Runs unit tests for auth service
# Reports detailed results
```

### Generate Missing Tests
```
/scw:test src/utils/ --coverage --generate-missing
# Analyzes coverage gaps
# Generates tests for uncovered code
# Verifies new tests pass
```

### Integration Tests
```
/scw:test src/api/ --type integration
# Runs API integration tests
# Reports endpoint coverage
```

## Boundaries

**Will:**
- Execute tests and report results
- Analyze coverage and gaps
- Generate tests for uncovered code
- Identify and explain failures
- Delegate large suites to Gemini

**Will Not:**
- Skip running actual tests
- Generate tests without patterns
- Ignore test failures
- Lower coverage standards

## Output Format

```markdown
# Test Report: {scope}

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | {count} |
| Passed | {count} ✅ |
| Failed | {count} ❌ |
| Skipped | {count} ⏭️ |
| Coverage | {percentage}% |

## Failed Tests
### {test-name}
- **File**: {path}
- **Error**: {error-message}
- **Root Cause**: {analysis}
- **Fix Suggestion**: {suggestion}

## Coverage Gaps
| File | Coverage | Missing |
|------|----------|---------|
| {file} | {%} | {lines/functions} |

## Generated Tests
- `{path/to/new/test.ts}` - {description}

## Recommendations
1. {recommendation 1}
2. {recommendation 2}
```

## PM Agent Integration

```
Test Validation:
  SelfCheckProtocol:
  - All tests passing?
  - Coverage meets threshold?
  - New tests follow patterns?
  - No flaky tests introduced?
```

## Gemini Delegation

When test suite is large or coverage analysis extensive:
1. Delegate to `gemini_test`
2. Claude validates test results
3. Review generated tests before accepting

## Coverage Thresholds

Default thresholds (configurable in scw-config.json):
- **Unit Tests**: 80%
- **Integration Tests**: 70%
- **Overall**: 75%

ARGUMENTS: $ARGUMENTS
