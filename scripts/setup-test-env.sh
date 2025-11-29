#!/bin/bash
#
# setup-test-env.sh
# Creates an isolated test environment for SuperClaude Spec Workflow
#

set -e

TEST_DIR="${HOME}/test-scw"
SCW_DIR="/Users/cemalkurt/Projects/SuperClaudeSpecWorkflow"
PROJECT_NAME="test-fullstack-app"
PROJECT_DIR="${TEST_DIR}/${PROJECT_NAME}"

echo "=============================================="
echo "  SuperClaude Spec Workflow - Test Environment"
echo "=============================================="
echo ""

# Check if SCW_DIR exists
if [ ! -d "$SCW_DIR" ]; then
    echo "ERROR: SuperClaude Spec Workflow not found at $SCW_DIR"
    exit 1
fi

# Clean up existing test environment
if [ -d "$TEST_DIR" ]; then
    echo "Cleaning up existing test environment..."
    rm -rf "$TEST_DIR"
fi

# Create test environment directory
echo "Creating test environment at $TEST_DIR..."
mkdir -p "$TEST_DIR"

# Copy Claude authentication
if [ -d "${HOME}/.claude" ]; then
    echo "Copying Claude authentication..."
    cp -r "${HOME}/.claude" "${TEST_DIR}/.claude"
else
    echo "WARNING: ~/.claude not found. You'll need to run 'claude login' in the test environment."
fi

# Create test project directory structure
echo "Creating test project: $PROJECT_NAME..."
mkdir -p "${PROJECT_DIR}/.claude/steering"
mkdir -p "${PROJECT_DIR}/.claude/specs"
mkdir -p "${PROJECT_DIR}/.claude/bugs"
mkdir -p "${PROJECT_DIR}/.claude/commands"
mkdir -p "${PROJECT_DIR}/frontend"
mkdir -p "${PROJECT_DIR}/backend"

# Create symlinks to framework
echo "Creating symlinks to framework..."

# Commands symlink
ln -sf "${SCW_DIR}/.claude/commands/scw" "${PROJECT_DIR}/.claude/commands/scw"

# Agents symlink
ln -sf "${SCW_DIR}/agents" "${PROJECT_DIR}/agents"

# Modes symlink
ln -sf "${SCW_DIR}/modes" "${PROJECT_DIR}/modes"

# Templates symlink
ln -sf "${SCW_DIR}/.claude/templates" "${PROJECT_DIR}/.claude/templates"

# Config symlink
ln -sf "${SCW_DIR}/.claude/config" "${PROJECT_DIR}/.claude/config"

# Create project CLAUDE.md
cat > "${PROJECT_DIR}/CLAUDE.md" << 'EOF'
# TaskFlow - Test Project

## Overview
This is a test full-stack application to validate SuperClaude Spec Workflow.

## Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite

## Testing SCW Commands
1. `/scw:help` - View all commands
2. `/scw:brainstorm task management` - Discover requirements
3. `/scw:spec-create user-authentication` - Create feature spec
4. `/scw:implement TaskCard component` - Implement with patterns

## Directory Structure
```
test-fullstack-app/
├── .claude/
│   ├── commands/scw/  -> SCW commands (symlink)
│   ├── steering/      - Project context
│   ├── specs/         - Feature specs (created by /scw:spec-create)
│   └── bugs/          - Bug workflows
├── agents/            -> SCW agents (symlink)
├── modes/             -> SCW modes (symlink)
├── frontend/          - React app
└── backend/           - Node.js API
```
EOF

# Create steering documents
echo "Creating steering documents..."

cat > "${PROJECT_DIR}/.claude/steering/product.md" << 'EOF'
# Product: TaskFlow

## Vision
A simple, elegant task management application for personal productivity.

## Goals
1. Allow users to create, edit, and complete tasks
2. Organize tasks by categories/projects
3. Simple authentication for personal use

## Non-Goals
- Team collaboration features (v1)
- Mobile app (v1)
- Integrations with external services (v1)

## Target Users
- Individual professionals
- Students
- Anyone needing simple task tracking

## Success Metrics
- Tasks can be created in < 3 clicks
- Page load time < 1 second
- 80%+ test coverage
EOF

cat > "${PROJECT_DIR}/.claude/steering/tech.md" << 'EOF'
# Tech Standards: TaskFlow

## Stack
- **Frontend**: React 18+, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js 20+, Express, TypeScript
- **Database**: SQLite with better-sqlite3
- **Testing**: Vitest (frontend), Node test runner (backend)

## Conventions

### TypeScript
- Strict mode enabled
- Explicit return types on public functions
- Use interfaces over types for object shapes
- No `any` - use `unknown` if type is truly unknown

### React
- Functional components only
- Custom hooks for shared logic
- Props interfaces named `{Component}Props`
- Use React Query for server state

### API
- RESTful conventions
- `/api/v1/` prefix
- JSON request/response
- Proper HTTP status codes

### File Structure
```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── services/       # API clients
├── types/          # TypeScript types
└── utils/          # Utilities
```

### Naming
- Components: PascalCase (`TaskCard.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils: camelCase (`formatDate.ts`)
- Types: PascalCase (`Task.ts`)
EOF

cat > "${PROJECT_DIR}/.claude/steering/structure.md" << 'EOF'
# Project Structure: TaskFlow

```
test-fullstack-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared components
│   │   │   ├── tasks/          # Task-related components
│   │   │   └── auth/           # Auth components
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── tasks.ts
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── types/
│   │   ├── db/
│   │   │   └── schema.sql
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .claude/
│   ├── commands/scw/           # SCW commands (symlink)
│   ├── steering/               # Project context
│   ├── specs/                  # Feature specifications
│   └── bugs/                   # Bug workflows
│
├── agents/                     # SCW agents (symlink)
├── modes/                      # SCW modes (symlink)
├── CLAUDE.md                   # Project instructions
└── package.json                # Root package.json
```

## Key Files
- `frontend/src/App.tsx` - Main React app
- `backend/src/index.ts` - Express server entry
- `backend/src/db/schema.sql` - Database schema
EOF

# Create root package.json
cat > "${PROJECT_DIR}/package.json" << 'EOF'
{
  "name": "taskflow",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm -w frontend run dev",
    "dev:backend": "npm -w backend run dev",
    "build": "npm -w frontend run build && npm -w backend run build",
    "test": "npm -w frontend run test && npm -w backend run test"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
EOF

echo ""
echo "=============================================="
echo "  Test Environment Ready!"
echo "=============================================="
echo ""
echo "Location: $PROJECT_DIR"
echo ""
echo "To start testing:"
echo "  cd $PROJECT_DIR"
echo "  claude"
echo ""
echo "Try these commands:"
echo "  /scw:help"
echo "  /scw:brainstorm task management"
echo "  /scw:spec-create user-authentication"
echo ""
