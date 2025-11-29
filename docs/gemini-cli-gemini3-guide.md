# Google's Gemini CLI and Gemini 3: The complete developer's guide

Google's Gemini CLI transforms terminal-based development with free AI assistance, while Gemini 3 Pro—released November 18, 2025—achieves **1501 Elo on LMArena** (first model to exceed 1500), delivering state-of-the-art reasoning across coding, multimodal tasks, and agentic workflows. The CLI provides **60 requests/minute and 1,000 requests/day free** with a personal Google account, accessing Gemini's full 1 million token context window. Together, they represent Google's most powerful developer tooling to date.

## Gemini 3 sets new benchmarks across reasoning, coding, and multimodal tasks

Gemini 3 Pro fundamentally advances what AI models can accomplish. On **GPQA Diamond** (graduate-level science questions), it scores **91.9%** versus 86.4% for Gemini 2.5 Pro. **SWE-bench Verified** coding benchmarks show **76.2%** accuracy—a 28% improvement over its predecessor. Perhaps most striking: **ARC-AGI-2** jumps from 4.9% to **31.1%** (a 535% gain), and **MathArena Apex** leaps from 0.5% to **23.4%**.

The model processes **text, images, audio, video, code, and PDFs** natively within a **1 million token context window**, with output up to **64,000 tokens**. Pricing sits at **$2 per million input tokens** and **$12 per million output tokens** for prompts under 200K tokens (doubling to $4/$18 for longer contexts).

**Deep Think mode** pushes boundaries further. This enhanced reasoning mode—still undergoing safety evaluations for Google AI Ultra subscribers—achieves **93.8% on GPQA Diamond** and **41% on Humanity's Last Exam** (no tools). It generates 1.4×–2.3× latency but solves **92% of multi-step logic puzzles** versus 76% in standard mode.

New capabilities include **Generative UI** (creating interactive interfaces, calculators, and visualizations directly from prompts), **agentic coding** (autonomous multi-step software development), and what Google calls "vibe coding"—building complete applications from natural language descriptions. Gemini 3 is available in Gemini CLI, Google AI Studio, Vertex AI, and the new **Google Antigravity** agentic development platform.

## Gemini CLI delivers full AI agent capabilities in your terminal

Gemini CLI is an open-source (Apache 2.0) terminal application providing direct access to Gemini models. Installation requires only **Node.js 18+** and a single command:

```bash
npm install -g @google/gemini-cli
```

### Authentication options span personal to enterprise

Three authentication methods exist:
- **Google Login** (recommended for individuals): Select "Login with Google" on first launch—opens browser OAuth flow, grants free tier access
- **API Key**: Export `GEMINI_API_KEY` from Google AI Studio for programmatic/CI usage
- **Vertex AI**: Set `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and either ADC or service account credentials

### Built-in tools handle files, search, and shell commands

| Tool | Function |
|------|----------|
| `read_file` / `read_many_files` | Read single or multiple files |
| `write_file` / `smart_edit` | Create, overwrite, or intelligently edit files |
| `file_search` / `grep` | Search by filename or content (uses ripgrep if available) |
| `run_shell_command` | Execute terminal commands |
| `google_web_search` | Grounded web search |
| `web_fetch` | Retrieve URL contents |
| `save_memory` | Persist facts across sessions |

### Essential slash commands for daily workflows

```
/help          Show all commands and shortcuts
/chat save     Save conversation for later resumption
/restore       Roll back to file checkpoint
/memory show   View loaded context from GEMINI.md
/stats         Display token usage and session metrics
/tools         List available tools
/mcp           Manage MCP server connections
/model         Switch between Gemini models
/sandbox       Toggle sandboxed execution
```

### Command-line flags enable scripting and automation

```bash
gemini -p "prompt"              # Non-interactive mode
gemini --output-format json     # Structured output for parsing
gemini --yolo                   # Auto-approve all actions (caution!)
gemini --sandbox docker         # Run in containerized sandbox
gemini --checkpointing          # Enable file checkpoints
gemini -m gemini-2.5-flash      # Use specific model
```

## Configuration files control every aspect of CLI behavior

### Settings file hierarchy (precedence: low → high)

1. **System defaults**: `/etc/gemini-cli/system-defaults.json` (Linux)
2. **User settings**: `~/.gemini/settings.json`
3. **Project settings**: `<project>/.gemini/settings.json`
4. **System overrides**: `/etc/gemini-cli/settings.json` (enterprise lockdown)
5. **Environment variables**
6. **Command-line arguments** (highest)

### Key configuration categories

**Model settings** control which Gemini version runs and context handling:
```json
{
  "model": {
    "name": "gemini-2.5-pro",
    "compressionThreshold": 0.7,
    "maxSessionTurns": -1
  }
}
```

**Tool restrictions** allow security-conscious deployments:
```json
{
  "tools": {
    "exclude": ["run_shell_command(rm)", "run_shell_command(curl)"],
    "allowed": ["run_shell_command(git)", "run_shell_command(npm test)"],
    "sandbox": "docker"
  }
}
```

**Context file filtering** respects your project structure:
```json
{
  "context": {
    "fileName": "GEMINI.md",
    "fileFiltering": {
      "respectGitIgnore": true,
      "respectGeminiIgnore": true
    }
  }
}
```

### Essential environment variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | API authentication |
| `GOOGLE_CLOUD_PROJECT` | Required for Vertex AI/Code Assist |
| `GEMINI_SANDBOX` | Enable sandboxing (`true`, `docker`, `podman`) |
| `GEMINI_MODEL` | Override default model |
| `NODE_EXTRA_CA_CERTS` | Corporate CA certificate path |

## MCP servers extend CLI capabilities beyond built-in tools

The **Model Context Protocol** enables custom integrations. Configure servers in `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "$GITHUB_TOKEN" },
      "timeout": 15000,
      "trust": false
    },
    "slack": {
      "url": "http://localhost:8080/sse",
      "headers": { "Authorization": "Bearer $SLACK_TOKEN" }
    }
  }
}
```

Invoke MCP tools naturally: `> @github List my open pull requests` or `> @slack Send a summary to #dev`.

MCP commands:
- `/mcp` — list configured servers
- `/mcp desc` — show tool descriptions
- `gemini mcp add <name> <command>` — add server from command line

## GEMINI.md context files provide persistent project instructions

Create `.gemini/GEMINI.md` at project root to inject persistent context:

```markdown
# Project: E-commerce API

## Instructions
- Use TypeScript 5.0+ with strict mode
- Follow REST conventions with JSON:API format
- All endpoints require authentication middleware

## Coding Style
- 2-space indentation, camelCase for variables
- Interface names prefixed with `I`
- JSDoc comments on all public functions

## Dependencies
- Express 4.x, Prisma ORM, Jest for testing
- Avoid adding new external dependencies without approval
```

Context loads hierarchically: `~/.gemini/GEMINI.md` (global) → project ancestors → subdirectories (up to 200 by default). Use `/memory show` to inspect combined context, `/memory refresh` after manual edits.

## Efficiency strategies maximize the free tier and minimize wasted tokens

**Run from your project directory** to automatically load correct GEMINI.md context. Use `/init` to generate a starter context file with automated project analysis.

**Request plans before execution**: "Generate the plan first" → review → "Proceed with implementation." This single habit prevents wasted tokens on wrong approaches.

**Enable checkpointing** (`gemini -c`) as a safety net—creates file snapshots before modifications. Use `/restore` to roll back mistakes.

**Use @ file references** instead of pasting content: `@src/auth.ts explain this code` reads the file into context efficiently. Reference directories with `@src/` to include all files recursively.

**Create custom commands** for repetitive tasks in `.gemini/commands/`:
```toml
# review.toml → invoke with /review
description = "Security-focused code review"
prompt = """
Review for: 1) SQL injection 2) XSS vulnerabilities 3) Auth bypass
Provide specific line numbers and fixes.
"""
```

**Monitor usage** with `/stats` to track token consumption. The CLI auto-switches from gemini-2.5-pro to gemini-2.5-flash when quota depletes—watch for this quality shift.

**Leverage session management**: `/chat save feature-work` preserves context between sessions; `/chat resume feature-work` continues exactly where you stopped.

## Rate limits and quotas require careful management

| Tier | Requests/Minute | Requests/Day | Notes |
|------|-----------------|--------------|-------|
| Free (OAuth) | 60 | 1,000 | Auto-falls back to Flash model |
| API Key (Free) | Lower | ~100/project | Per-project limits |
| Code Assist Standard | Higher | ~1,500 | Shared with IDE |
| Google AI Pro/Ultra | Higher limits | Shared quota | Across all surfaces |

**Critical quota behavior**: One user prompt can trigger multiple API requests in agent mode. Asking Gemini to "analyze this project" on a large codebase reads every file—you can hit daily limits in 20-30 minutes. Be specific about which files to analyze.

## Known limitations require awareness and workarounds

**Context window reality**: Despite 1M tokens, model understanding remains "localized"—it can still misinterpret relationships in very large contexts. As conversations grow longer, earlier instructions may be forgotten. Use `/compress` to summarize and reclaim context space.

**Checkpoints only restore files**: External side effects (database changes, API calls, sent emails) cannot be undone. The `/restore` command exclusively handles file system state.

**Windows quirks**: Text pasting (Ctrl+V) doesn't work reliably in CMD/PowerShell. Missing vertical scrollbar for long responses. Consider Windows Terminal or WSL2 for better experience.

**Authentication edge cases**: Google Workspace accounts may not activate free tier—set `GOOGLE_CLOUD_PROJECT` or use AI Studio API keys. Corporate networks often need `NODE_EXTRA_CA_CERTS` pointing to CA certificate.

**CI environment detection**: CLI refuses interactive mode when `CI_*` environment variables exist. Workaround: `env -u CI_TOKEN gemini`.

## Security considerations demand active attention

A **critical prompt injection vulnerability** (fixed in v0.1.14) allowed malicious GEMINI.md or README.md files to silently execute commands and exfiltrate environment variables using hidden whitespace. **Always run the latest version**: `npm install -g @google/gemini-cli@latest`.

**Sandboxing options**:
- **Docker/Podman**: `gemini --sandbox docker` runs in isolated container
- **macOS Seatbelt**: `export SEATBELT_PROFILE=strict` for OS-level restrictions
- **Default (none)**: Shows persistent red warning—not recommended for untrusted code

**YOLO mode** (`gemini --yolo` or Ctrl+Y) auto-approves ALL actions including potentially destructive commands. A malicious file could trigger `rm -rf /` immediately. Only use with:
- Version control active
- Sandbox enabled
- Understanding of risks

**MCP server security**: Never set `trust: true` for servers you don't control. Review exposed tools with `/mcp desc`. Broadly-scoped GitHub tokens risk information leakage.

## Anti-patterns and mistakes to actively avoid

**Don't use vague prompts**: "Help me fix my UI" forces the model to guess. "Fix the login button in src/components/Header.tsx to redirect to /dashboard after successful auth" produces precise results.

**Don't pack GEMINI.md with everything**: Context bloat degrades model performance. Keep instructions focused on current project needs—use protocol blocks (`<PROTOCOL:PLAN>`, `<PROTOCOL:IMPLEMENT>`) for mode-specific guidance.

**Don't blindly accept all changes**: Always review diffs before approval. Gemini can misinterpret intent, apply changes to wrong files, or introduce subtle logic errors. Treat it as a capable junior developer requiring review.

**Don't skip checkpointing for non-trivial tasks**: A single `gemini -c` flag can save hours of manual recovery.

**Don't run without sandbox on untrusted repositories**: Prompt injection attacks can exfiltrate credentials from environment variables. Unknown codebases = sandbox required.

**Don't ignore rate limit warnings**: When you see "switching to flash model," quality is degrading. Consider pausing work or upgrading authentication tier.

## IDE integration bridges terminal and editor workflows

Install the VS Code companion extension:
```
/ide install    # Install extension
/ide enable     # Activate connection
```

Features include workspace context awareness, native diff viewing for code changes, and VS Code command palette integration. Accept changes via checkmark icon or save; reject via X icon or close tab.

The CLI also integrates with **Gemini Code Assist for VS Code**, where agent mode shares Gemini 3 Pro access with the terminal CLI.

## Headless mode enables CI/CD and scripting integration

```bash
# Basic prompt with text output
gemini -p "Review for security issues" < src/auth.py

# JSON output for programmatic parsing
result=$(git diff --cached | gemini -p "Write commit message" --output-format json)
echo "$result" | jq -r '.response'

# Batch processing
for file in src/*.py; do
  gemini -p "Find bugs" --output-format json < "$file" > "reports/$(basename $file).json"
done
```

JSON response schema includes `response` (string), `stats` (token counts, tool calls), and `error` (type, message, code).

## The path forward combines Gemini 3 power with CLI accessibility

Gemini 3 Pro represents a significant leap—its reasoning improvements (73% higher on Humanity's Last Exam versus 2.5 Pro), multimodal understanding (538% improvement on ScreenSpot-Pro), and agentic capabilities position it as a genuine development partner rather than a simple autocomplete tool. Gemini CLI delivers this power with zero cost for individual developers through generous free tiers.

The combination enables workflows previously requiring multiple tools: **analyze a codebase** with 1M token context, **generate implementation plans**, **write and test code**, **commit changes**—all from a single terminal session. MCP extensibility means the tool grows with your needs, from GitHub integration to custom internal APIs.

For maximum effectiveness: keep the CLI updated, use checkpointing religiously, sandbox untrusted code, and treat AI suggestions as expert recommendations requiring human judgment—not autonomous decisions. The technology has arrived; the skill is knowing when to trust it and when to verify.