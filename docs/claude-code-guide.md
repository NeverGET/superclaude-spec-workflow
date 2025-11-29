# Claude Code with Opus 4.5: The complete developer guide

**Claude Code** is Anthropic's agentic coding tool that runs directly in your terminal, understands your entire codebase, and executes complex development tasks through natural language commands. With the release of **Claude Opus 4.5 on November 24, 2025**—Anthropic's most intelligent model to date—Claude Code has reached a new performance tier: **80.9% on SWE-bench Verified**, the first AI coding tool to achieve this benchmark. This guide covers everything developers need to know to use Claude Code efficiently, from installation through advanced optimization strategies.

## What Opus 4.5 brings to Claude Code

Claude Opus 4.5 represents a significant leap for agentic coding workflows. The model achieves state-of-the-art performance on coding benchmarks while using **up to 65% fewer tokens** than its predecessors, making it both more capable and more cost-effective.

| Specification | Opus 4.5 |
|---------------|----------|
| **Context Window** | 200,000 tokens |
| **Max Output** | 64,000 tokens |
| **Knowledge Cutoff** | March 2025 |
| **API Pricing** | $5 / $25 per million tokens (input/output) |
| **SWE-bench Verified** | 80.9% (industry-leading) |
| **Computer Use (OSWorld)** | 66.3% |

The model introduces **hybrid reasoning**—instant responses for simple queries or extended thinking for complex problems controlled via an "effort" parameter. Opus 4.5 also demonstrates the strongest prompt injection resistance of any frontier model, critical for autonomous coding agents operating on untrusted codebases.

Key improvements over previous models include better context management across long conversations, enhanced computer use capabilities with a new zoom tool for screen inspection, and a **10.6% improvement on Aider Polyglot** benchmarks compared to Sonnet 4.5. For agentic tasks specifically, Opus 4.5 scores **29% higher on Vending-Bench** than Sonnet.

## Core capabilities and agentic features

Claude Code operates in a continuous feedback loop: **gather context → take action → verify work → repeat**. Unlike traditional IDE assistants that provide suggestions, Claude Code directly edits files, runs commands, creates commits, and handles GitHub interactions.

### What Claude Code can do

The tool provides raw model access through a flexible, scriptable interface. Its core capabilities span the entire development workflow:

- **Build features from descriptions**: Describe what you want in natural language—Claude creates a plan, writes the code, and verifies it works
- **Debug and fix issues**: Paste an error message and Claude analyzes your codebase, identifies the root cause, and implements a fix
- **Navigate any codebase**: Uses agentic search to understand project structure and dependencies without manual context selection
- **Git operations**: Commits, branches, rebasing, merge conflict resolution, and PR creation through natural commands
- **GitHub integration**: Issues, pull requests, and code reviews via the `gh` CLI
- **External integrations via MCP**: Connect to Google Drive, Jira, Figma, Slack, databases, and custom tooling

### Available tools

Claude Code has access to a rich tool ecosystem:

| Tool | Description |
|------|-------------|
| `Read` | File reading operations |
| `Write` | File creation and modification |
| `Edit` | Targeted file editing |
| `Bash` | Shell command execution |
| `Glob` | File pattern matching |
| `Grep` | Text search across codebase |
| `WebFetch` | Fetch content from URLs |
| `WebSearch` | Web search (Anthropic API only) |
| `MCP tools` | External integrations |

### The subagent system

Subagents are specialized AI assistants that operate in isolated context windows, allowing parallel task execution without polluting your main conversation. Each subagent can have its own model, tools, and permissions.

Create subagents by placing Markdown files in `.claude/agents/` or `~/.claude/agents/`:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer ensuring high code quality standards.
Focus on: readability, duplication, error handling, and security issues.
```

Invoke subagents through the `/agents` command or reference them with `@agent-name` in your prompts. Subagents excel at parallel investigation tasks—spawn multiple reviewers to check different aspects of a change simultaneously.

## Installation and configuration

### System requirements and installation

Claude Code runs on macOS 10.15+, Ubuntu 20.04+/Debian 10+, and Windows 10+ (WSL or Git for Windows). The hardware requirement is minimal: **4GB+ RAM** and an internet connection.

```bash
# Native binary (recommended)
curl -fsSL https://claude.ai/install.sh | bash        # macOS/Linux/WSL
irm https://claude.ai/install.ps1 | iex               # Windows PowerShell

# Alternative methods
brew install claude-code                              # Homebrew
npm install -g @anthropic-ai/claude-code              # NPM
```

After installation, run `claude doctor` to verify everything works. Authentication happens through Claude Console OAuth by default, or connect via Amazon Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`) or Google Vertex AI (`CLAUDE_CODE_USE_VERTEX=1`).

### Configuration hierarchy

Settings cascade from global to project-local, with later files overriding earlier ones:

```
~/.claude/settings.json          # User settings (all projects)
.claude/settings.json            # Project settings (shared with team)
.claude/settings.local.json      # Local project settings (gitignored)
```

A typical settings file configures model selection, token limits, and permissions:

```json
{
  "model": "claude-opus-4-5-20251101",
  "maxTokens": 4096,
  "permissions": {
    "allowedTools": ["Read", "Write(src/**)", "Bash(git *)", "Bash(npm *)"],
    "deny": ["Read(.env*)", "Bash(rm *)", "Bash(sudo *)"]
  }
}
```

### CLAUDE.md: persistent project memory

CLAUDE.md files are automatically loaded into context when starting a conversation. They serve as persistent memory for project-specific patterns, commands, and guidelines.

```markdown
# Bash commands
- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style
- Use ES modules (import/export) syntax, not CommonJS
- Destructure imports when possible

# Workflow
- Typecheck when done with code changes
- Prefer running single tests, not whole suite, for performance
```

Place CLAUDE.md at your repository root (team-shared), in `~/.claude/CLAUDE.md` (global), or use `CLAUDE.local.md` for personal settings that shouldn't be committed. Keep these files **under 100 lines**—focus on project-specific patterns, not generic programming advice.

## Complete command reference

### Shell commands

| Command | Description |
|---------|-------------|
| `claude` | Start interactive REPL session |
| `claude "prompt"` | Start with initial prompt |
| `claude -c` | Continue most recent conversation |
| `claude --resume` | Select and resume past session |
| `claude -p "prompt"` | Print mode (headless, non-interactive) |
| `claude doctor` | Run diagnostic checks |
| `claude mcp add <name>` | Add MCP server |
| `claude mcp list` | List MCP servers |

### Key CLI flags

| Flag | Description |
|------|-------------|
| `-p, --print` | Headless mode for automation |
| `-c, --continue` | Continue previous conversation |
| `--model <model>` | Specify model (opus, sonnet, haiku) |
| `--allowedTools` | Session-specific tool permissions |
| `--dangerously-skip-permissions` | Bypass all permission checks |
| `--output-format json` | JSON output for scripting |
| `--add-dir <path>` | Add directory to session |

### In-session slash commands

| Command | Description |
|---------|-------------|
| `/clear` | Clear conversation context |
| `/compact` | Summarize and compress context |
| `/model` | Switch Claude model |
| `/permissions` | Manage tool permissions |
| `/agents` | Manage subagents |
| `/init` | Initialize CLAUDE.md for project |
| `/rewind` | Roll back conversation and code changes |
| `/export` | Export conversation |
| `/sandbox` | Configure bash sandboxing |

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Interrupt Claude (preserves context) |
| `Escape` (double) | Rewind to previous checkpoint |
| `Shift+Tab` | Toggle permission modes |
| `#` | Add instruction to CLAUDE.md |
| `@` | Reference files, directories, or agents |
| `!` | Run shell command directly |

## Effective prompting strategies

### Extended thinking triggers

Claude Code allocates progressively larger thinking budgets based on specific phrases. Use these escalating triggers for complex problems:

- **`think`** — basic extended thinking
- **`think hard`** — increased computation budget
- **`think harder`** — even more reasoning time
- **`ultrathink`** — allocates maximum 31,999 tokens of thinking

For a complex refactoring task, you might prompt: *"Think hard about how to restructure the authentication module to support OAuth providers without breaking existing sessions."*

### The explore-plan-code-commit workflow

The most effective pattern for complex tasks follows four phases:

1. **Explore**: Ask Claude to read relevant files without coding yet. Use subagents for parallel investigation to preserve main context.
2. **Plan**: Request a plan using thinking triggers. Have Claude write the plan to a markdown file or GitHub issue as a reset point.
3. **Code**: Implement with explicit verification steps. Ask Claude to run tests and confirm behavior.
4. **Commit**: Create a descriptive commit and PR.

### Prompt specificity matters enormously

Vague prompts waste tokens on clarification cycles and produce generic results.

| Poor Prompt | Effective Prompt |
|-------------|------------------|
| "add tests for foo.py" | "write a test case for foo.py covering the edge case where the user is logged out—avoid mocks" |
| "why is this API weird?" | "look through ExecutionFactory's git history and summarize how its API evolved" |
| "add a calendar widget" | "look at how HotDogWidget.php implements the widget pattern, then follow that pattern for a calendar widget with month pagination" |

### File references and context control

Use `@` to reference files directly, saving tokens compared to asking Claude to search:

```
@./src/utils/validation.js review this for security issues
@./components/ explain the component architecture
```

For structured outputs, place long-form data (20K+ tokens) at the **top** of your prompt and queries at the **end**—this improves accuracy by approximately 30%.

## Known limitations and failure modes

### Context and rate constraints

Claude Code faces several practical limits that affect daily usage:

- **Standard context window**: 200K tokens (500K on Enterprise, 1M via API for Sonnet 4.5)
- **5-hour rolling usage window**: All subscription plans reset every 5 hours
- **Weekly limits**: Introduced August 2025 to prevent continuous 24/7 background usage—affects approximately 5% of users
- **Output caps**: Individual responses often capped around 2048 tokens
- **Pro plan**: ~44,000 tokens per 5-hour period (10-40 typical prompts)
- **Max 20x plan**: ~220,000 tokens per 5-hour period (200-800 prompts)

Claude Code sessions are **heavier than chat**—large system instructions, full file contexts, and multi-step operations consume tokens rapidly. Running multiple parallel instances will hit limits faster.

### No cross-session memory

Claude doesn't retain information between sessions. Every conversation starts fresh. Include all necessary context each time, or use CLAUDE.md files for persistent project information. Write important decisions and task lists to markdown files that Claude can reference in future sessions.

### Common pitfalls and solutions

| Pitfall | Solution |
|---------|----------|
| Context becomes cluttered over long sessions | Use `/clear` after every 1-3 unrelated tasks |
| Auto-compact (at 95% capacity) makes Claude "dumber"—forgets files | Manually `/compact` at 70% with focused instructions |
| Claude gives up on large tasks prematurely | Break into smaller steps; maintain a checklist in a markdown file |
| Claude forgets to compile before running tests | Explicitly remind to build; common with mixed interpreted/compiled codebases |
| Claude writes failing tests first in TDD | Be explicit: "doing TDD—confirm tests fail before implementing" |
| Claude over-engineers solutions | Add explicit constraint: "Avoid over-engineering. Minimum complexity for current task." |
| Claude uses overly complex Git commands | Review git operations; Claude sometimes over-engineers version control |

### Things to explicitly avoid

- **Mixing multiple intentions in one prompt**: One prompt equals one job. Separate build, debug, and refine modes.
- **Burying requests under meta-instructions**: Be concrete and direct.
- **Jumping to "fix it" without context**: In debug mode, share inputs, errors, and environment first.
- **Not providing examples**: Include 3-5 examples for structured output tasks.

## Token efficiency and cost optimization

### Understanding costs

Average Claude Code usage runs approximately **$6/developer/day** or **$100-200/developer/month** with Sonnet 4.5. Opus 4.5 costs more per token but often uses fewer tokens overall due to improved efficiency.

### Context management commands

```bash
/compact           # Compress conversation when approaching limits
/clear             # Start fresh for unrelated tasks  
/cost              # Track token usage (API users)
```

### Token reduction strategies

**Use scripts instead of descriptions** for repetitive operations:

```bash
# Instead of:
"Look at all components and replace useState with our custom hook"

# Use:
"Create a script to replace useState with useCustomState across all components, run it, then delete the script"
```

This approach saves massive input tokens versus having Claude read every file individually.

**Token reduction checklist**:

1. Write specific queries—avoid vague requests that trigger unnecessary scanning
2. Break complex tasks into focused interactions
3. Clear history between unrelated tasks with `/clear`
4. Use explicit file selection with `@` instead of "look at everything"
5. Compact with custom instructions: `/compact Focus on code samples`
6. Use Opus for planning, Sonnet for execution (hybrid approach)
7. Start fresh sessions for unrelated tasks

### Model selection strategy

- **Opus 4.5**: Planning, complex reasoning, brainstorming—higher intelligence, higher cost
- **Sonnet 4.5**: Execution, refinement, repetitive tasks—excellent performance, lower cost
- **Haiku 4.5**: Simple queries, quick lookups—fastest, cheapest

The **opusplan** model alias uses Opus for planning and automatically switches to Sonnet for execution, optimizing the cost-intelligence tradeoff.

## Advanced workflows and integrations

### Git as your safety net

Unlike some tools, Claude Code has no built-in checkpoint system beyond `/rewind`. Git is your primary safety mechanism. Use Claude for 90%+ of git interactions—it excels at commit messages, history searches, and rebase conflicts.

For parallel work, create git worktrees:

```bash
git worktree add ../project-feature-a feature-a
cd ../project-feature-a && claude
```

Run separate Claude instances in each worktree for independent tasks without context pollution.

### Custom slash commands

Create reusable workflows by placing Markdown files in `.claude/commands/`:

```markdown
# .claude/commands/fix-github-issue.md
Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:
1. Use `gh issue view` to get the issue details
2. Search the codebase for relevant files
3. Implement the necessary changes
4. Write and run tests
5. Create a descriptive commit
6. Push and create a PR
```

Invoke with `/project:fix-github-issue 1234`. Commit these files to share workflows with your team.

### MCP server integration

The Model Context Protocol connects Claude Code to external systems. Add servers via CLI:

```bash
# HTTP transport (recommended)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# With authentication
claude mcp add --transport http github https://api.github.com/mcp \
  --header "Authorization: Bearer $GITHUB_TOKEN"
```

Popular MCP servers include GitHub (issues, PRs), Puppeteer (browser automation), PostgreSQL (database queries), and Sentry (error monitoring).

### Headless mode for CI/CD

Run Claude Code in automation pipelines:

```bash
# Fix lint errors automatically
claude -p "fix lint errors" --output-format json

# Security review with restricted tools
claude -p "review for security issues" --allowedTools Read Bash
```

Use `--dangerously-skip-permissions` in trusted CI environments to skip all confirmation prompts.

## Recent updates worth noting

**November 24, 2025** (with Opus 4.5 release):
- Upgraded Plan Mode creates more precise plans and follows them directly
- Desktop app support—run Claude Code from the Claude desktop application
- Multiple local and remote sessions in parallel

**November 12, 2025**:
- Claude Code on the Web launched (research preview)—browser-based coding without terminal
- Connect GitHub repositories to isolated cloud environments

**September 29, 2025** (with Sonnet 4.5):
- Version 2.0 of terminal interface
- VS Code Extension (beta) with inline diffs
- Checkpoints—automatic code state saving, rewind with `Esc+Esc` or `/rewind`
- Claude Agent SDK for building custom agents

## Conclusion

Claude Code with Opus 4.5 represents the current state of the art in agentic coding tools. The combination of an **80.9% SWE-bench score**, **200K token context**, and the terminal-native workflow creates a powerful development multiplier—but only when used correctly.

The key insights for effective usage: **manage context aggressively** with `/clear` and `/compact`, **use the explore-plan-code-commit workflow** for complex tasks, **be specific in prompts** to avoid token waste, and **treat Git as your safety net** rather than relying on the tool's checkpoints alone.

Think of Claude Code as a highly capable but context-dependent assistant. It excels when given clear direction, appropriate scope, and explicit verification steps. The overhead of learning these patterns pays off quickly—developers report **2-3x productivity gains** on appropriate tasks once they internalize the workflow.

Start with small, well-defined tasks. Build up your CLAUDE.md with project patterns. Use subagents for parallel investigation. And remember: specificity in prompts directly translates to quality in output.