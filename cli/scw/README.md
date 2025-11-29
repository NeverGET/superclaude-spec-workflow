# SuperClaude Spec Workflow (SCW)

> Unified AI-powered development framework combining Claude Code, SuperClaude agents, and Gemini delegation.

## What is SCW?

SuperClaude Spec Workflow is a comprehensive framework that enhances Claude Code with:

- **19 AI Agents**: Context-aware personas activated based on task type
- **7 Behavioral Modes**: Brainstorming, research, token-efficiency, and more
- **9 MCP Servers**: Extended capabilities (sequential-thinking, serena, context7, tavily, etc.)
- **Gemini Delegation**: 2M token capacity for token-heavy operations
- **Spec-Driven Workflows**: Phase-gated feature development with user approval

## Requirements

Before using SCW, you need:

### 1. Claude Code (Required)

Anthropic's official CLI tool for AI-powered development.

```bash
# Install via npm
npm install -g @anthropic-ai/claude-code
```

[Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)

### 2. Gemini CLI (Optional)

Required for token-heavy operations delegation (2M token context).

```bash
# Install via npm
npm install -g @google/gemini-cli

# Authenticate
gemini auth
```

[Gemini CLI Documentation](https://github.com/google-gemini/gemini-cli)

## Quick Start

### Option A: Install from npm (Recommended)

```bash
# Install CLI globally
npm install -g @neverg3t/scw-cli

# Setup MCP servers
scw mcp setup

# Initialize your project
cd your-project
scw init
```

### Option B: Install from Source

```bash
# Clone and build
git clone https://github.com/NeverGET/superclaude-spec-workflow.git
cd superclaude-spec-workflow
npm install
npm run build --workspaces

# Setup MCP servers
./cli/scw/dist/index.js mcp setup

# Initialize your project
cd your-project
/path/to/superclaude-spec-workflow/cli/scw/dist/index.js init
```

### Start Using SCW

Open Claude Code in your project and try:

```
/scw:help                    # See all commands
/scw:brainstorm [topic]      # Discover requirements
/scw:spec-create [feature]   # Create feature specification
```

## What You Get

### Directory Structure

After running `scw init`, your project will have:

```
project/
├── .claude/
│   ├── commands/scw/    → SCW commands (symlink)
│   ├── steering/        # Project context
│   │   ├── product.md   # Vision, goals, users
│   │   ├── tech.md      # Stack, conventions
│   │   └── structure.md # Directory layout
│   ├── specs/           # Feature specifications
│   ├── bugs/            # Bug workflows
│   └── templates/       → Document templates (symlink)
├── agents/              → 19 AI agents (symlink)
├── modes/               → 7 behavioral modes (symlink)
├── CLAUDE.md            # Claude's role definition
└── GEMINI.md            # Gemini's role definition
```

### Framework Commands

| Command | Description |
|---------|-------------|
| `/scw:help` | Show all available commands |
| `/scw:spec-create [feature]` | Create feature specification (4-phase workflow) |
| `/scw:spec-execute [task-id]` | Execute a spec task |
| `/scw:brainstorm [topic]` | Socratic requirements discovery |
| `/scw:design [feature]` | Architecture design workflow |
| `/scw:implement [task]` | Implementation with pattern matching |
| `/scw:test [scope]` | Run tests with coverage reporting |
| `/scw:research [topic]` | Deep research with Gemini delegation |
| `/scw:bug-create [issue]` | Bug workflow (report → analyze → fix → verify) |

### CLI Commands

| Command | Description |
|---------|-------------|
| `scw init` | Initialize SCW in current project |
| `scw init --quick` | Quick initialization with defaults |
| `scw doctor` | Check installation health |
| `scw mcp setup` | Configure MCP servers |
| `scw mcp check` | Verify servers are running |
| `scw mcp list` | List configured servers |
| `scw mcp tokens` | Manage API tokens |

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

## MCP Servers

SCW integrates 9 MCP servers:

| Server | Purpose | Repository | Token |
|--------|---------|------------|-------|
| sequential-thinking | Complex problem decomposition | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) | No |
| serena | Session persistence | [oraios/serena](https://github.com/oraios/serena) | No |
| context7 | Library documentation | [upstash/context7](https://github.com/upstash/context7) | Yes (`CONTEXT7_API_KEY`) |
| tavily | Web research | [tavily-ai/tavily-mcp](https://github.com/tavily-ai/tavily-mcp) | Yes (`TAVILY_API_KEY`) |
| playwright | Browser automation | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | No |
| chrome-devtools | Performance analysis | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | No |
| gemini-wrapper | Gemini delegation | Included in SCW | No (Gemini CLI auth) |
| filesystem-morph | Fast file editing | [morphllm.com/mcp](https://www.morphllm.com/mcp) | Yes (`MORPH_API_KEY`) |
| morph | Semantic code merging | [docs.morphllm.com](https://docs.morphllm.com/introduction) | Yes (`MORPH_API_KEY`) |

## Agents

19 agents organized by tier:

| Tier | Agents | Activation |
|------|--------|------------|
| **Core** | pm-agent, self-review | Always active |
| **Spec Workflow** | requirements-analyst, system-architect, quality-engineer | Phase-based |
| **Domain** | backend-architect, frontend-architect, security-engineer, devops-architect, performance-engineer, python-expert | Task-based |
| **Analysis** | root-cause-analyst, refactoring-expert | Context-triggered |
| **Research** | deep-research-agent, socratic-mentor, learning-guide | Mode-triggered |
| **Communication** | technical-writer, business-panel-experts, repo-index | Explicit request |

## Steering Documents

Steering documents define project context:

- **product.md**: Vision, goals, non-goals, target users, success metrics
- **tech.md**: Stack, conventions, coding standards
- **structure.md**: Directory layout, key files

These documents guide all agents and ensure consistent, project-aware responses.

## Spec Workflow

The spec workflow is a 4-phase process with user approval gates:

1. **Requirements Phase** → User approves `requirements.md`
2. **Design Phase** → User approves `design.md`
3. **Tasks Phase** → User approves `tasks.md`
4. **Implementation** → Execute with validation

Each phase includes:
- ConfidenceChecker (≥90% to proceed)
- SelfCheckProtocol (validation after completion)
- Reflexion Pattern (error handling and learning)

## Gemini Integration

Claude delegates to Gemini for token-heavy operations:

- **File Scanning**: >10 files
- **Code Generation**: >5 files
- **Deep Research**: Extensive web crawling
- **Bulk Testing**: Large test suites
- **Context Overflow**: >80% of 200K tokens

Gemini can also be used independently:
```bash
gemini -p "@src/ Analyze the architecture of this codebase"
```

## Development

### Building the MCP Wrapper

```bash
cd mcp/gemini-wrapper
npm install
npm run build
npm test
```

### Running Tests

```bash
# MCP wrapper tests
cd mcp/gemini-wrapper
npm run validate

# Command validation
node scripts/validate-commands.js
```

### Creating Test Environment

```bash
./scripts/setup-test-env.sh
cd ~/test-scw/test-fullstack-app
```

## Acknowledgments

This project builds upon and integrates ideas from these excellent open-source projects:

| Project | Author | Contribution |
|---------|--------|--------------|
| [Claude Code Spec Workflow](https://github.com/Pimzino/claude-code-spec-workflow) | Pimzino | Spec-driven development workflow, phase-gated approval system |
| [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) | SuperClaude-Org | Agent architecture, behavioral modes, PM validation patterns |
| [SuperGemini Framework](https://github.com/SuperClaude-Org/SuperGemini_Framework) | SuperClaude-Org | Gemini CLI integration patterns, delegation strategies |

We are grateful to these authors for their pioneering work in AI-assisted development workflows.

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

---

*SuperClaude Spec Workflow - Unified AI-Powered Development Framework*
