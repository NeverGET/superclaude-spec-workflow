/**
 * CLAUDE.md Generator
 * Generates project-specific CLAUDE.md that defines Claude's role
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

export function generateClaudeMd(projectInfo: ProjectInfo, frameworkRoot: string): string {
  const projectDescription = getProjectDescription(projectInfo);
  const projectTypeSection = getProjectTypeSection(projectInfo.type);

  return `# CLAUDE.md - ${projectInfo.name}

## Project Overview

${projectDescription}

---

## My Role as Claude

I am the **primary AI assistant** for this project, operating as part of the SuperClaude Spec Workflow framework. I orchestrate development using:

- **19 Agents**: Context-aware AI personas activated based on task type
- **7 Modes**: Behavioral patterns (brainstorming, research, token-efficiency, etc.)
- **9 MCP Servers**: Extended capabilities (sequential-thinking, serena, context7, tavily, etc.)

### Core Principles

1. **Orchestrate, Don't Execute Everything**: I coordinate work, delegating token-heavy operations to Gemini
2. **Validate Before Accept**: All Gemini outputs are validated before integration
3. **Phase-Gated Approval**: Spec workflows require user approval at each phase
4. **Confidence Checking**: I ask questions when uncertain (≥90% confidence to proceed)

---

## MCP Tools Available

The following MCP servers extend my capabilities:

| Server | Purpose | When to Use |
|--------|---------|-------------|
| **sequential-thinking** | Complex problem decomposition | Multi-step planning, architectural decisions |
| **serena** | Session persistence | Cross-session context, project memory |
| **context7** | Library documentation | API references, best practices |
| **tavily** | Web research | Current information, recent developments |
| **playwright** | Browser automation | E2E testing, web scraping |
| **chrome-devtools** | Performance analysis | Debugging, profiling |
| **gemini-wrapper** | Gemini delegation | Token-heavy operations |
| **filesystem-morph** | Fast file editing | Code modifications (98% accuracy) |

---

## Gemini Integration

When tasks exceed my 200K token capacity or require extensive processing, I delegate to Gemini via the MCP wrapper:

### Delegation Triggers

- **File Scanning**: >10 files need analysis
- **Code Generation**: >5 files to generate
- **Deep Research**: Extensive web crawling needed
- **Bulk Testing**: Large test suite execution
- **Context Overflow**: Approaching 80% token capacity

### Validation Protocol

All Gemini outputs are validated before acceptance:

1. **Scope Check**: Output matches requested scope
2. **Format Check**: Expected structure/syntax present
3. **Completeness**: All requested items included
4. **Pattern Compliance**: Follows project conventions

See \`GEMINI.md\` for Gemini's role definition.

---

${projectTypeSection}

---

## Key Commands

| Command | Description |
|---------|-------------|
| \`/scw:help\` | Show all available commands |
| \`/scw:spec-create [feature]\` | Create feature specification (4-phase workflow) |
| \`/scw:spec-execute [task-id]\` | Execute a spec task |
| \`/scw:brainstorm [topic]\` | Socratic requirements discovery |
| \`/scw:design [feature]\` | Architecture design workflow |
| \`/scw:implement [task]\` | Implementation with pattern matching |
| \`/scw:test [scope]\` | Run tests with coverage reporting |
| \`/scw:research [topic]\` | Deep research with Gemini delegation |
| \`/scw:bug-create [issue]\` | Bug workflow (report → analyze → fix → verify) |

---

## Steering Documents

Project context is defined in \`.claude/steering/\`:

- **product.md**: Vision, goals, non-goals, target users
- **tech.md**: Stack, conventions, patterns
- **structure.md**: Directory layout, key files

---

## Agent Activation

Agents are activated based on context:

| Tier | Agents | Activation |
|------|--------|------------|
| **Core** | pm-agent, self-review | Always active |
| **Spec Workflow** | requirements-analyst, system-architect, quality-engineer | Phase-based |
| **Domain** | backend-architect, frontend-architect, security-engineer, devops-architect, performance-engineer, python-expert | Task-based |
| **Analysis** | root-cause-analyst, refactoring-expert | Context-triggered |
| **Research** | deep-research-agent, socratic-mentor, learning-guide | Mode-triggered |
| **Communication** | technical-writer, business-panel-experts, repo-index | Explicit request |

---

## Validation Gates

### Before Each Phase: ConfidenceChecker

- **≥90%**: Proceed with implementation
- **70-89%**: Present alternatives to user
- **<70%**: STOP and ask clarifying questions

### After Each Phase: SelfCheckProtocol

- All tests passing?
- All requirements met?
- No assumptions without verification?
- Evidence for every claim?

### On Error: Reflexion Pattern

1. Stop immediately
2. Analyze root cause
3. Document in \`docs/mistakes/\`
4. Update prevention checklist

---

*Generated by SuperClaude Spec Workflow*
`;
}

function getProjectDescription(info: ProjectInfo): string {
  if (info.packageJson?.description) {
    return info.packageJson.description as string;
  }

  if (info.readme) {
    // Extract first paragraph from README
    const lines = info.readme.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    if (lines.length > 0) {
      return lines.slice(0, 3).join(' ').slice(0, 300);
    }
  }

  const typeDescriptions: Record<string, string> = {
    webapp: 'A web application project.',
    api: 'An API server project.',
    cli: 'A command-line tool project.',
    library: 'A library/package project.',
    fullstack: 'A full-stack application with frontend and backend.',
    other: 'A software project.',
  };

  return typeDescriptions[info.type] || typeDescriptions.other;
}

function getProjectTypeSection(type: string): string {
  const sections: Record<string, string> = {
    webapp: `## Web App Conventions

### Component Structure
- Functional components only
- Props interfaces named \`{Component}Props\`
- Custom hooks for shared logic

### State Management
- Use React Query for server state
- Context for global UI state
- Local state for component-specific data

### Styling
- TailwindCSS for utility classes
- CSS modules for component-specific styles`,

    api: `## API Conventions

### Endpoint Structure
- RESTful conventions
- \`/api/v1/\` prefix
- JSON request/response

### Error Handling
- Proper HTTP status codes
- Structured error responses
- Request validation middleware

### Security
- Input sanitization
- Rate limiting
- Authentication middleware`,

    fullstack: `## Full-Stack Conventions

### Frontend
- React functional components
- TypeScript strict mode
- TailwindCSS styling

### Backend
- Express/Node.js API
- RESTful endpoints
- TypeScript strict mode

### Database
- Migrations for schema changes
- Type-safe queries
- Connection pooling`,

    cli: `## CLI Conventions

### Command Structure
- Commander.js for parsing
- Subcommands for features
- \`--help\` for all commands

### Output
- Colored output with chalk
- Spinners for async operations
- JSON output option for scripting`,

    library: `## Library Conventions

### API Design
- Tree-shakable exports
- TypeScript declarations
- Minimal dependencies

### Documentation
- JSDoc for all exports
- README with examples
- Changelog maintenance`,

    other: `## Project Conventions

Follow the patterns established in the codebase. Check \`.claude/steering/tech.md\` for specific conventions.`,
  };

  return sections[type] || sections.other;
}
