/**
 * Steering Document Generator
 * Generates product.md, tech.md, structure.md
 */

import { writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

interface ProjectInfo {
  name: string;
  type: string;
  hasExistingProject: boolean;
  readExisting: boolean;
  createSteering: boolean;
  packageJson?: Record<string, unknown>;
  readme?: string;
}

export async function generateSteeringDocs(
  cwd: string,
  projectInfo: ProjectInfo
): Promise<void> {
  const steeringDir = join(cwd, '.claude/steering');

  // Generate product.md
  const productMd = generateProductMd(projectInfo);
  writeFileSync(join(steeringDir, 'product.md'), productMd);

  // Generate tech.md
  const techMd = generateTechMd(projectInfo);
  writeFileSync(join(steeringDir, 'tech.md'), techMd);

  // Generate structure.md
  const structureMd = generateStructureMd(cwd, projectInfo);
  writeFileSync(join(steeringDir, 'structure.md'), structureMd);
}

function generateProductMd(info: ProjectInfo): string {
  const description = info.packageJson?.description || `A ${getProjectTypeLabel(info.type)}`;

  return `# Product: ${info.name}

## Vision

${description}

## Goals

1. [Define primary goal here]
2. [Define secondary goal here]
3. [Define tertiary goal here]

## Non-Goals (v1)

- [Feature explicitly not in scope]
- [Another feature for later]
- [Third item deferred]

## Target Users

- [Primary user persona]
- [Secondary user persona]

## Success Metrics

- [Metric 1: e.g., "Page load time < 1 second"]
- [Metric 2: e.g., "80%+ test coverage"]
- [Metric 3: e.g., "Zero critical security vulnerabilities"]

---

*Update this document as project vision evolves*
`;
}

function generateTechMd(info: ProjectInfo): string {
  const stack = detectStack(info);

  return `# Tech Standards: ${info.name}

## Stack

${stack}

## Conventions

### TypeScript

- Strict mode enabled
- Explicit return types on public functions
- Use interfaces over types for object shapes
- No \`any\` - use \`unknown\` if type is truly unknown

### Naming

- **Files**: kebab-case (\`user-service.ts\`)
- **Classes/Interfaces**: PascalCase (\`UserService\`)
- **Functions/Variables**: camelCase (\`getUserById\`)
- **Constants**: SCREAMING_SNAKE_CASE (\`MAX_RETRIES\`)

### Git

- Conventional commits: \`feat:\`, \`fix:\`, \`docs:\`, \`refactor:\`, etc.
- Feature branches: \`feature/description\`
- Keep commits atomic and focused

### Testing

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

### Error Handling

- Use custom error classes
- Always include error context
- Log errors with appropriate severity

---

*Update this document as standards evolve*
`;
}

function generateStructureMd(cwd: string, info: ProjectInfo): string {
  const tree = generateDirectoryTree(cwd, 3);

  return `# Project Structure: ${info.name}

\`\`\`
${tree}
\`\`\`

## Key Files

| File | Purpose |
|------|---------|
| \`package.json\` | Dependencies and scripts |
| \`CLAUDE.md\` | AI assistant instructions |
| \`GEMINI.md\` | Gemini assistant instructions |
| \`.claude/steering/\` | Project context documents |
| \`.claude/specs/\` | Feature specifications |

## Directory Purposes

${getDirectoryDescriptions(info.type)}

---

*Update this document as structure evolves*
`;
}

function detectStack(info: ProjectInfo): string {
  const deps = info.packageJson?.dependencies as Record<string, string> | undefined;
  const devDeps = info.packageJson?.devDependencies as Record<string, string> | undefined;
  const allDeps = { ...deps, ...devDeps };

  const stack: string[] = [];

  // Frontend
  if (allDeps?.react) stack.push('- **Frontend**: React');
  else if (allDeps?.vue) stack.push('- **Frontend**: Vue.js');
  else if (allDeps?.svelte) stack.push('- **Frontend**: Svelte');
  else if (allDeps?.next) stack.push('- **Frontend**: Next.js');

  // Backend
  if (allDeps?.express) stack.push('- **Backend**: Express.js');
  else if (allDeps?.fastify) stack.push('- **Backend**: Fastify');
  else if (allDeps?.koa) stack.push('- **Backend**: Koa');
  else if (allDeps?.nestjs) stack.push('- **Backend**: NestJS');

  // Database
  if (allDeps?.prisma) stack.push('- **ORM**: Prisma');
  else if (allDeps?.sequelize) stack.push('- **ORM**: Sequelize');
  else if (allDeps?.mongoose) stack.push('- **Database**: MongoDB (Mongoose)');

  // Testing
  if (allDeps?.vitest) stack.push('- **Testing**: Vitest');
  else if (allDeps?.jest) stack.push('- **Testing**: Jest');

  // TypeScript
  if (allDeps?.typescript) stack.push('- **Language**: TypeScript');

  // Styling
  if (allDeps?.tailwindcss) stack.push('- **Styling**: TailwindCSS');

  if (stack.length === 0) {
    return getDefaultStack(info.type);
  }

  return stack.join('\n');
}

function getDefaultStack(type: string): string {
  const stacks: Record<string, string> = {
    webapp: `- **Frontend**: [React/Vue/Svelte]
- **Styling**: [TailwindCSS/CSS Modules]
- **Build**: [Vite/Webpack]
- **Testing**: [Vitest/Jest]`,

    api: `- **Runtime**: Node.js
- **Framework**: [Express/Fastify]
- **Language**: TypeScript
- **Database**: [PostgreSQL/MongoDB/SQLite]
- **Testing**: [Vitest/Jest]`,

    fullstack: `- **Frontend**: [React/Vue] + TypeScript
- **Backend**: Node.js + Express
- **Database**: [PostgreSQL/SQLite]
- **ORM**: [Prisma/Sequelize]
- **Testing**: Vitest`,

    cli: `- **Runtime**: Node.js
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Testing**: Vitest`,

    library: `- **Language**: TypeScript
- **Build**: [tsup/esbuild]
- **Testing**: Vitest
- **Documentation**: TypeDoc`,

    other: `- **Language**: [TypeScript/JavaScript]
- **Runtime**: Node.js
- **Testing**: [Vitest/Jest]`,
  };

  return stacks[type] || stacks.other;
}

function generateDirectoryTree(dir: string, maxDepth: number, depth: number = 0): string {
  if (depth >= maxDepth) return '';

  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'dist')
    .sort((a, b) => {
      // Directories first
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 15); // Limit entries

  const lines: string[] = [];
  const indent = '│   '.repeat(depth);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const prefix = isLast ? '└── ' : '├── ';

    if (entry.isDirectory()) {
      lines.push(`${indent}${prefix}${entry.name}/`);
      const subTree = generateDirectoryTree(join(dir, entry.name), maxDepth, depth + 1);
      if (subTree) lines.push(subTree);
    } else {
      lines.push(`${indent}${prefix}${entry.name}`);
    }
  }

  return lines.join('\n');
}

function getDirectoryDescriptions(type: string): string {
  const descriptions: Record<string, string> = {
    webapp: `| Directory | Purpose |
|-----------|---------|
| \`src/components/\` | React/Vue components |
| \`src/hooks/\` | Custom React hooks |
| \`src/services/\` | API client functions |
| \`src/utils/\` | Utility functions |
| \`public/\` | Static assets |`,

    api: `| Directory | Purpose |
|-----------|---------|
| \`src/routes/\` | API endpoint handlers |
| \`src/middleware/\` | Express middleware |
| \`src/services/\` | Business logic |
| \`src/db/\` | Database layer |
| \`src/types/\` | TypeScript types |`,

    fullstack: `| Directory | Purpose |
|-----------|---------|
| \`frontend/\` | React/Vue frontend |
| \`backend/\` | Node.js API server |
| \`shared/\` | Shared types/utils |`,

    cli: `| Directory | Purpose |
|-----------|---------|
| \`src/commands/\` | CLI command handlers |
| \`src/utils/\` | Utility functions |
| \`templates/\` | Template files |`,

    library: `| Directory | Purpose |
|-----------|---------|
| \`src/\` | Library source code |
| \`tests/\` | Test files |
| \`docs/\` | Documentation |`,

    other: `| Directory | Purpose |
|-----------|---------|
| \`src/\` | Source code |
| \`tests/\` | Test files |`,
  };

  return descriptions[type] || descriptions.other;
}

function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    webapp: 'Web Application',
    api: 'API Server',
    cli: 'CLI Tool',
    library: 'Library',
    fullstack: 'Full-Stack Application',
    other: 'Software Project',
  };
  return labels[type] || 'Project';
}
