# User Decisions Summary

## Final Decisions Made:
1. **Command Namespace**: `/scw:*` (brand new unified namespace)
2. **Gemini Integration**: MCP wrapper (Node.js npx)
3. **Session Persistence**: Redis (if available)
4. **Priority**: Full Foundation first, then spec workflow commands
5. **Dashboard**: Deferred to later phase

## Implementation Order:
1. Full directory structure + all agents + all modes
2. `/scw:spec-create` and `/scw:spec-execute` commands
3. Gemini MCP wrapper with 8 tools
4. Additional commands

## Key Files to Create (P0):
- `.claude/commands/scw/spec-create.md`
- `.claude/commands/scw/spec-execute.md`
- `agents/core/pm-agent.md`
- `CLAUDE.md`
- `.claude/config/scw-config.json`

## Source Reference Files:
- `claude-code-spec-workflow/src/commands.ts` - Workflow logic
- `claude-code-spec-workflow/src/templates.ts` - Templates
- `SuperClaude_Framework/plugins/superclaude/agents/pm-agent.md` - PM Agent
- `SuperClaude_Framework/plugins/superclaude/commands/` - Command patterns

## Architecture:
- Claude Code (200K) = Orchestrator + Validator
- Gemini CLI (2M) = Heavy operations executor
- Claude ALWAYS validates Gemini outputs
- 19 merged agents from SuperClaude
- 5 behavioral modes
- 9 MCP servers including Gemini wrapper
