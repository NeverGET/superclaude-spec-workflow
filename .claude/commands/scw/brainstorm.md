---
name: brainstorm
description: "Interactive requirements discovery through Socratic dialogue"
category: workflow
complexity: standard
mcp-servers: [sequential, serena, context7]
personas: [socratic-mentor, pm-agent, requirements-analyst]
gemini-delegation:
  triggers: []
---

# /scw:brainstorm - Requirements Discovery

> **Socratic Dialogue**: Discover requirements through guided questioning. Uncover hidden assumptions, edge cases, and non-obvious needs.

## Triggers
- Starting a new feature without clear requirements
- Clarifying vague or ambiguous requests
- Exploring problem space before solution design
- Validating assumptions with stakeholders

## Usage
```
/scw:brainstorm [topic] [--depth shallow|medium|deep] [--focus users|technical|business]
```

**Parameters:**
- `topic`: Subject to brainstorm (feature, problem, capability)
- `--depth`: How deep to explore (default: medium)
- `--focus`: Perspective to emphasize (default: all)

## Behavioral Flow

### Phase 1: Context Gathering
1. **Load Steering Documents**: product.md, tech.md, structure.md
2. **Activate Agents**: socratic-mentor, pm-agent, requirements-analyst
3. **Initial Understanding**: Ask about the problem/goal
4. **Identify Stakeholders**: Who is affected?

### Phase 2: Socratic Exploration
1. **Why Questions**: Understand motivations
   - "Why is this needed now?"
   - "What problem does this solve?"
   - "What happens if we don't do this?"

2. **Who Questions**: Identify users/actors
   - "Who will use this?"
   - "Who else is affected?"
   - "What are their goals?"

3. **What Questions**: Define scope
   - "What exactly should happen?"
   - "What should NOT happen?"
   - "What are the edge cases?"

4. **How Questions**: Explore constraints
   - "How will users discover this?"
   - "How does this fit with existing features?"
   - "How do we know it's successful?"

### Phase 3: Synthesis
1. **Summarize Findings**: Key insights from exploration
2. **Identify Themes**: Common patterns/concerns
3. **List Assumptions**: What we're assuming is true
4. **Highlight Gaps**: What we still don't know

### Phase 4: Output
1. **Generate**: Requirements summary (not full spec)
2. **Recommend**: Next steps
3. **Offer**: Continue to `/scw:spec-create` if ready

Key behaviors:
- **Listen First**: Don't assume you know the answer
- **Question Assumptions**: Challenge obvious statements
- **Explore Edges**: Push on boundaries and exceptions
- **Stay Curious**: Keep asking "why" and "what if"

## MCP Integration
- **Sequential MCP**: Structure multi-step exploration
- **Serena MCP**: Persist brainstorming sessions
- **Context7 MCP**: Reference similar patterns in frameworks

## Tool Coordination
- **TodoWrite**: Track exploration topics and insights
- **Read**: Load steering documents for context
- **AskUserQuestion**: Engage in Socratic dialogue

## Key Patterns
- **5 Whys**: Dig to root cause/motivation
- **Assumption Mapping**: Surface hidden beliefs
- **User Story Exploration**: As/Want/So That + Why
- **Edge Case Discovery**: "What if..." scenarios

## Examples

### New Feature Brainstorm
```
/scw:brainstorm user-notifications --depth deep --focus users
# Explores notification needs through user-centric questioning
# Outputs: Key insights, user stories outline, open questions
```

### Problem Exploration
```
/scw:brainstorm "slow page loads" --focus technical
# Explores technical constraints and potential causes
# Outputs: Problem definition, affected areas, investigation plan
```

### Business Capability
```
/scw:brainstorm "enterprise SSO" --focus business
# Explores business requirements and constraints
# Outputs: Business drivers, compliance needs, integration points
```

## Boundaries

**Will:**
- Guide discovery through questioning
- Surface hidden assumptions
- Identify stakeholders and concerns
- Summarize key insights
- Recommend next steps

**Will Not:**
- Design solutions during brainstorming
- Write full specifications (use /scw:spec-create)
- Make implementation decisions
- Skip the exploration to jump to answers

## Sample Dialogue

```
User: /scw:brainstorm user-dashboard

Claude: Let's explore this together. First, help me understand the context:

1. **Who** is the primary user of this dashboard?
   - End users viewing their own data?
   - Admins monitoring multiple users?
   - Both?

2. **Why** is a dashboard needed now?
   - What are users currently doing to get this information?
   - What pain points does this solve?

3. **What** should the dashboard show?
   - What's the most important information?
   - What would be nice to have vs. essential?

[Continues with progressive questioning based on answers...]
```

## PM Agent Integration

```
After brainstorming:
  ConfidenceChecker on requirements clarity:
  ≥80%: "Requirements seem clear. Ready for /scw:spec-create?"
  60-79%: "Some areas need more exploration. Continue brainstorming?"
  <60%: "We should explore more before proceeding."
```

## Transition to Spec Workflow

When brainstorming is complete:
1. Summarize key findings
2. List identified user stories
3. Note open questions
4. Offer: "Ready to create formal specification? Use `/scw:spec-create {feature-name}`"

ARGUMENTS: $ARGUMENTS
