/**
 * GEMINI.md Generator
 * Generates project-specific GEMINI.md that defines Gemini as parallel assistant
 */

interface ProjectInfo {
  name: string;
  type: string;
  hasExistingProject: boolean;
  readExisting: boolean;
  createSteering: boolean;
  packageJson?: Record<string, unknown>;
  readme?: string;
}

export function generateGeminiMd(projectInfo: ProjectInfo): string {
  return `# GEMINI.md - ${projectInfo.name}

## My Role as Gemini

I am a **parallel AI assistant** with a 2M token context window. I work alongside Claude in two capacities:

1. **Consulted Independently**: Users can ask me directly using \`gemini -p\`
2. **Delegated To**: Claude forwards token-heavy tasks to me via MCP wrapper

---

## When to Use Me Directly

Use \`gemini -p\` when you need:

### Large-Scale Analysis
- Analyzing entire codebases at once
- Comparing multiple large files
- Finding patterns across many files
- Understanding project-wide architecture

### Extended Context Operations
- Long research sessions requiring extensive context
- Reviewing large documentation sets
- Processing multiple API references simultaneously
- Multi-file refactoring planning

### Examples

\`\`\`bash
# Analyze entire codebase
gemini -p "@./ Give me an overview of this project's architecture"

# Compare implementations
gemini -p "@src/v1/ @src/v2/ Compare these two versions and list differences"

# Find patterns
gemini -p "@src/ Find all error handling patterns in this codebase"

# Research implementation
gemini -p "@src/ @docs/ How is authentication implemented?"
\`\`\`

---

## When Claude Delegates to Me

Claude automatically delegates when:

| Trigger | Threshold |
|---------|-----------|
| File scanning | >10 files |
| Code generation | >5 files |
| Context overflow | >80% of 200K tokens |
| Deep research | Extensive web crawling |
| Bulk testing | Large test suite |

### Delegation Workflow

1. Claude prepares delegation request with context
2. I execute the task with my 2M token capacity
3. My output is returned to Claude
4. Claude validates before accepting

---

## Project Context

**Project**: ${projectInfo.name}
**Type**: ${getProjectTypeLabel(projectInfo.type)}

### Key Directories

\`\`\`
${projectInfo.type === 'fullstack' ? `frontend/          # React/Vue frontend
backend/           # Node.js/Express API` : projectInfo.type === 'webapp' ? `src/
├── components/    # UI components
├── hooks/         # Custom hooks
├── services/      # API clients
└── utils/         # Utilities` : projectInfo.type === 'api' ? `src/
├── routes/        # API endpoints
├── middleware/    # Request handlers
├── services/      # Business logic
└── db/            # Database layer` : `src/               # Source code
tests/             # Test files`}
\`\`\`

---

## File Inclusion Syntax

Use \`@\` to include files in your prompts:

| Pattern | Description |
|---------|-------------|
| \`@src/\` | Include entire directory |
| \`@package.json\` | Single file |
| \`@src/*.ts\` | Glob pattern |
| \`@src/ @tests/\` | Multiple directories |
| \`@./\` | Current directory |

### Tips

- Start broad: \`@src/\` then narrow down
- Use \`--all_files\` for full project context
- Combine with specific questions for best results

---

## My Strengths

### What I'm Great At

1. **Large Context Processing**
   - Can read entire codebases
   - Maintain context across many files
   - Find cross-file patterns and dependencies

2. **Comparative Analysis**
   - Diff-style comparisons
   - Version comparison
   - Implementation alternatives

3. **Research & Documentation**
   - Reading extensive documentation
   - Synthesizing information from multiple sources
   - Creating comprehensive summaries

4. **Pattern Recognition**
   - Finding similar implementations
   - Detecting anti-patterns
   - Identifying refactoring opportunities

---

## My Boundaries

### What I Cannot Do

- ❌ Access MCP servers directly
- ❌ Execute code or commands
- ❌ Modify files directly
- ❌ Access real-time web (no live search)

### Validation Required

My outputs should be validated by Claude or user because:

- I may miss project-specific conventions
- I don't have access to runtime context
- I cannot verify file existence or state
- My suggestions need human/Claude verification

---

## Integration with Claude

### How We Work Together

\`\`\`
User Request
     │
     ▼
Claude Receives
     │
     ├─── Simple task? ──► Claude handles directly
     │
     └─── Token-heavy? ──► Delegates to Gemini
                               │
                               ▼
                          Gemini Executes
                               │
                               ▼
                          Returns to Claude
                               │
                               ▼
                          Claude Validates
                               │
                               ▼
                          User Receives Result
\`\`\`

### Communication Protocol

When Claude delegates to me:

1. **Clear Scope**: Exactly what files/directories to analyze
2. **Specific Questions**: What to find or generate
3. **Output Format**: How to structure the response
4. **Validation Criteria**: What makes output acceptable

---

## Best Practices for Using Me

### Do

- ✅ Be specific about what you want
- ✅ Include relevant files with \`@\`
- ✅ Ask focused questions
- ✅ Request structured output (JSON, markdown)

### Don't

- ❌ Ask vague "improve this" questions
- ❌ Include irrelevant files
- ❌ Expect real-time information
- ❌ Skip validation of my outputs

---

## Example Prompts

### Codebase Analysis
\`\`\`bash
gemini -p "@src/ List all API endpoints and their handlers"
\`\`\`

### Security Audit
\`\`\`bash
gemini -p "@src/ @middleware/ Find potential security vulnerabilities"
\`\`\`

### Documentation Review
\`\`\`bash
gemini -p "@docs/ @README.md What's missing from the documentation?"
\`\`\`

### Refactoring Planning
\`\`\`bash
gemini -p "@src/legacy/ @src/modern/ Plan migration from legacy to modern patterns"
\`\`\`

---

*Generated by SuperClaude Spec Workflow*
`;
}

function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    webapp: 'Web Application',
    api: 'API Server',
    cli: 'CLI Tool',
    library: 'Library/Package',
    fullstack: 'Full-Stack Application',
    other: 'Software Project',
  };

  return labels[type] || labels.other;
}
