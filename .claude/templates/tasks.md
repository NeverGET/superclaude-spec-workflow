# Implementation Plan: {feature-name}

> **Status**: DRAFT | ✅ APPROVED
> **Created**: {date}
> **Last Updated**: {date}
> **Requirements**: `.claude/specs/{feature-name}/requirements.md`
> **Design**: `.claude/specs/{feature-name}/design.md`

## Task Overview

{Brief description of the implementation approach. How will the design be broken into atomic, executable tasks?}

---

## Steering Document Compliance

### Structure Compliance (structure.md)
- All new files follow `{convention}` naming
- Files placed in `{directory}` per structure.md
- Imports organized per `{pattern}`

### Technical Compliance (tech.md)
- Code follows `{style guide}`
- Testing uses `{framework}`
- Error handling follows `{pattern}`

---

## Atomic Task Requirements

**Every task MUST meet these criteria:**

| Criterion | Requirement |
|-----------|-------------|
| **File Scope** | Touches 1-3 related files maximum |
| **Time Boxing** | Completable in 15-30 minutes |
| **Single Purpose** | One testable outcome per task |
| **Specific Files** | Exact file paths specified |
| **Agent-Friendly** | Clear input/output, minimal context |

---

## Task Format

```markdown
- [ ] N. Task description
  - **File(s)**: `path/to/file.ts`
  - Implementation details as bullet points
  - _Requirements: X.Y, Z.A_
  - _Leverage: path/to/existing/code.ts_
```

---

## Good vs Bad Examples

**❌ Bad Tasks (Too Broad)**
- "Implement authentication system"
- "Add user management features"
- "Create the frontend"

**✅ Good Tasks (Atomic)**
- "Create User model in `src/models/user.ts` with email/password fields"
- "Add login endpoint in `src/api/auth.ts` returning JWT"
- "Create LoginForm component in `src/components/LoginForm.tsx`"

---

## Tasks

### Phase 1: Foundation

- [ ] 1. Create core type definitions
  - **File(s)**: `src/types/{feature}.ts`
  - Define TypeScript interfaces for all data structures
  - Export types for use across components
  - _Requirements: All user stories_
  - _Leverage: src/types/base.ts_

- [ ] 2. Create base model/entity
  - **File(s)**: `src/models/{Model}.ts`
  - Implement model with all properties from design
  - Add validation methods
  - _Requirements: US-1_
  - _Leverage: src/models/BaseModel.ts_

### Phase 2: Core Logic

- [ ] 3. Implement service layer
  - **File(s)**: `src/services/{Feature}Service.ts`
  - Create service class with business logic
  - Add error handling per tech.md patterns
  - _Requirements: US-1, US-2_
  - _Leverage: src/services/BaseService.ts_

- [ ] 4. Create repository/data access
  - **File(s)**: `src/repositories/{Feature}Repository.ts`
  - Implement CRUD operations
  - Add query methods as needed
  - _Requirements: US-1_
  - _Leverage: src/repositories/BaseRepository.ts_

### Phase 3: API Layer

- [ ] 5. Create API endpoint - Create
  - **File(s)**: `src/api/{feature}/create.ts`
  - Implement POST endpoint
  - Add input validation
  - Add error responses
  - _Requirements: US-1 AC-1_
  - _Leverage: src/api/middleware/validation.ts_

- [ ] 6. Create API endpoint - Read
  - **File(s)**: `src/api/{feature}/read.ts`
  - Implement GET endpoint(s)
  - Add pagination if needed
  - _Requirements: US-1 AC-2_

- [ ] 7. Create API endpoint - Update
  - **File(s)**: `src/api/{feature}/update.ts`
  - Implement PUT/PATCH endpoint
  - Add authorization checks
  - _Requirements: US-2 AC-1_

- [ ] 8. Create API endpoint - Delete
  - **File(s)**: `src/api/{feature}/delete.ts`
  - Implement DELETE endpoint
  - Add soft delete if required
  - _Requirements: US-2 AC-2_

### Phase 4: UI Components (if applicable)

- [ ] 9. Create main component
  - **File(s)**: `src/components/{Feature}/{Feature}.tsx`
  - Implement component with props interface
  - Add basic styling
  - _Requirements: US-1_
  - _Leverage: src/components/common/Card.tsx_

- [ ] 10. Create form component
  - **File(s)**: `src/components/{Feature}/{Feature}Form.tsx`
  - Implement form with validation
  - Add submit handler
  - _Requirements: US-1 AC-1_
  - _Leverage: src/components/common/Form.tsx_

### Phase 5: Testing

- [ ] 11. Add unit tests for service
  - **File(s)**: `src/services/__tests__/{Feature}Service.test.ts`
  - Test all public methods
  - Test error cases
  - _Requirements: NFR-3_

- [ ] 12. Add API integration tests
  - **File(s)**: `src/api/__tests__/{feature}.test.ts`
  - Test all endpoints
  - Test validation
  - Test error responses
  - _Requirements: NFR-3_

- [ ] 13. Add component tests (if UI)
  - **File(s)**: `src/components/{Feature}/__tests__/{Feature}.test.tsx`
  - Test rendering
  - Test interactions
  - _Requirements: NFR-4_

### Phase 6: Integration

- [ ] 14. Wire up routing/navigation
  - **File(s)**: `src/routes.ts`, `src/navigation.ts`
  - Add routes for new feature
  - Update navigation menus
  - _Requirements: All_

- [ ] 15. Add documentation
  - **File(s)**: `docs/{feature}.md`
  - Document API endpoints
  - Document usage examples
  - _Requirements: All_

---

## Dependency Graph

```
Task 1 (types)
    ↓
Task 2 (model) ──→ Task 3 (service) ──→ Task 5-8 (API)
                        ↓
                   Task 4 (repository)
                        ↓
                   Task 9-10 (UI)
                        ↓
                   Task 11-13 (tests)
                        ↓
                   Task 14-15 (integration)
```

---

## Execution Notes

### Task Execution Command
```bash
/scw:spec-execute {feature-name} {task-number}
```

### Completion Tracking
- Tasks marked `[x]` are complete
- Execute tasks in order (respect dependencies)
- Run tests after each task if applicable

### Validation After Each Task
- [ ] Code follows steering conventions?
- [ ] Requirements reference satisfied?
- [ ] Tests passing?
- [ ] No regressions introduced?

---

## Progress Summary

| Phase | Tasks | Completed | Remaining |
|-------|-------|-----------|-----------|
| Foundation | 2 | 0 | 2 |
| Core Logic | 2 | 0 | 2 |
| API Layer | 4 | 0 | 4 |
| UI Components | 2 | 0 | 2 |
| Testing | 3 | 0 | 3 |
| Integration | 2 | 0 | 2 |
| **Total** | **15** | **0** | **15** |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| Developer | | | |

---

*Generated by /scw:spec-create - SuperClaude Spec Workflow*
