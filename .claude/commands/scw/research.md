---
name: research
description: "Deep research with Gemini delegation for comprehensive investigation"
category: workflow
complexity: advanced
mcp-servers: [sequential, tavily, context7]
personas: [deep-research-agent, pm-agent]
gemini-delegation:
  triggers:
    - deep_research
    - multiple_sources
---

# /scw:research - Deep Research Workflow

> **Comprehensive Research**: Deep dive research with web search, documentation analysis, and pattern discovery. Delegates to Gemini for extensive research.

## Triggers
- Researching best practices and patterns
- Investigating new technologies
- Finding solutions to complex problems
- Comparing approaches and libraries

## Usage
```
/scw:research [topic] [--depth shallow|medium|deep] [--sources web|docs|code|all]
```

**Parameters:**
- `topic`: Research topic or question
- `--depth`: Research depth (default: medium)
- `--sources`: Where to search (default: all)

## Behavioral Flow

### Phase 1: Scoping
1. **Parse Query**: What exactly to research?
2. **Identify Focus**: Technical, patterns, comparison?
3. **Set Boundaries**: What's in/out of scope?
4. **Plan Approach**: Where to look?

### Phase 2: Research
1. **Web Research**: Current best practices
2. **Documentation**: Official docs and guides
3. **Code Patterns**: Existing implementations
4. **[GEMINI DELEGATION]**: For deep/extensive research

### Phase 3: Synthesis
1. **Aggregate Findings**: Collect all insights
2. **Validate Sources**: Check reliability
3. **Identify Patterns**: Common approaches
4. **Note Trade-offs**: Pros/cons of options

### Phase 4: Output
1. **Summarize Findings**: Key insights
2. **Cite Sources**: Where info came from
3. **Recommendations**: Suggested approach
4. **Next Steps**: What to do with findings

Key behaviors:
- **Source Verification**: Validate all claims
- **Current Information**: Prefer recent sources
- **Multiple Perspectives**: Don't rely on single source
- **Actionable Output**: Research leads to action

## MCP Integration
- **Sequential MCP**: Structured research process
- **Tavily MCP**: Web research and search
- **Context7 MCP**: Framework documentation

## Tool Coordination
- **WebSearch/WebFetch**: Web research
- **Read**: Analyze documentation
- **TodoWrite**: Track research findings

## Key Patterns
- **Source Triangulation**: Verify with multiple sources
- **Recency Weighting**: Prefer recent information
- **Context Awareness**: Consider project context
- **Bias Detection**: Identify potential biases

## Examples

### Technology Research
```
/scw:research "JWT vs Session authentication" --depth deep --sources all
# Comprehensive comparison of auth approaches
# Includes security considerations
# Provides recommendation based on project context
```

### Best Practices
```
/scw:research "React error boundary patterns" --depth medium --sources docs
# Official documentation patterns
# Community best practices
# Example implementations
```

### Library Comparison
```
/scw:research "date-fns vs dayjs vs moment" --depth shallow
# Quick comparison of date libraries
# Bundle size, features, maintenance status
# Recommendation for project needs
```

### Problem Investigation
```
/scw:research "memory leak detection Node.js" --depth deep
# Comprehensive investigation approach
# Tools and techniques
# Step-by-step debugging guide
```

## Boundaries

**Will:**
- Conduct thorough research with source verification
- Synthesize findings from multiple sources
- Provide actionable recommendations
- Delegate extensive research to Gemini
- Cite all sources

**Will Not:**
- Accept single source without verification
- Provide opinions as facts
- Skip source citation
- Rush through complex topics

## Output Format

```markdown
# Research: {topic}

## Summary
{Executive summary of findings}

## Key Findings

### Finding 1: {title}
{Description}
- **Source**: {citation}
- **Confidence**: {high|medium|low}
- **Relevance**: {how it applies to project}

### Finding 2: {title}
{Description}

## Comparison (if applicable)
| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| {aspect} | {value} | {value} | {value} |

## Trade-offs
| Approach | Pros | Cons |
|----------|------|------|
| {approach} | {pros} | {cons} |

## Recommendation
{Recommended approach with rationale}

## Sources
1. {Source 1 with URL}
2. {Source 2 with URL}

## Next Steps
1. {What to do with this research}
```

## PM Agent Integration

```
Research Validation:
  ConfidenceChecker:
  - Are findings well-sourced?
  - Is the research comprehensive?
  - Are recommendations actionable?

  SelfCheckProtocol:
  - All claims have sources?
  - Multiple perspectives considered?
  - Trade-offs documented?
```

## Gemini Delegation

When research is extensive (--depth deep):
1. Delegate to `gemini_research`
2. Claude validates sources and claims
3. Synthesize with local research
4. Present unified findings

## Depth Levels

| Depth | Time | Sources | Output |
|-------|------|---------|--------|
| Shallow | ~2 min | 3-5 | Quick summary |
| Medium | ~5 min | 5-10 | Detailed findings |
| Deep | ~10 min | 10+ | Comprehensive report |

ARGUMENTS: $ARGUMENTS
