/**
 * Session Tracking for Gemini Operations
 *
 * Persists session state for multi-step operations and
 * enables resumption of incomplete Gemini CLI calls.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { GeminiSession } from './types.js';

/**
 * Session storage directory
 */
const SESSION_DIR = process.env.SCW_SESSION_DIR || join(process.cwd(), '.claude', 'sessions');

/**
 * Ensure session directory exists
 */
async function ensureSessionDir(): Promise<void> {
  try {
    await fs.mkdir(SESSION_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

/**
 * Get session file path
 */
function getSessionPath(id: string): string {
  return join(SESSION_DIR, `gemini-${id}.json`);
}

/**
 * Create a new session
 */
export async function createSession(
  tool: string,
  input: Record<string, unknown>
): Promise<GeminiSession> {
  await ensureSessionDir();

  const session: GeminiSession = {
    id: randomUUID(),
    tool,
    status: 'running',
    input,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    continue_count: 0,
  };

  await saveSession(session);
  return session;
}

/**
 * Load an existing session
 */
export async function loadSession(id: string): Promise<GeminiSession | null> {
  try {
    const data = await fs.readFile(getSessionPath(id), 'utf-8');
    return JSON.parse(data) as GeminiSession;
  } catch {
    return null;
  }
}

/**
 * Save session state
 */
export async function saveSession(session: GeminiSession): Promise<void> {
  await ensureSessionDir();
  session.updated_at = new Date().toISOString();
  await fs.writeFile(getSessionPath(session.id), JSON.stringify(session, null, 2));
}

/**
 * Update session with new status and output
 */
export async function updateSession(
  id: string,
  updates: Partial<Pick<GeminiSession, 'status' | 'output' | 'error' | 'continue_count'>>
): Promise<GeminiSession | null> {
  const session = await loadSession(id);
  if (!session) {
    return null;
  }

  Object.assign(session, updates);
  await saveSession(session);
  return session;
}

/**
 * Mark session as needing continuation
 */
export async function markNeedsContinue(
  id: string,
  partialOutput: Record<string, unknown>
): Promise<GeminiSession | null> {
  return updateSession(id, {
    status: 'needs_continue',
    output: partialOutput,
  });
}

/**
 * Mark session as complete
 */
export async function markComplete(
  id: string,
  output: Record<string, unknown>
): Promise<GeminiSession | null> {
  return updateSession(id, {
    status: 'complete',
    output,
  });
}

/**
 * Mark session as errored
 */
export async function markError(id: string, error: string): Promise<GeminiSession | null> {
  return updateSession(id, {
    status: 'error',
    error,
  });
}

/**
 * Increment continue count
 */
export async function incrementContinue(id: string): Promise<GeminiSession | null> {
  const session = await loadSession(id);
  if (!session) {
    return null;
  }

  session.continue_count++;
  session.status = 'running';
  await saveSession(session);
  return session;
}

/**
 * List all sessions
 */
export async function listSessions(): Promise<GeminiSession[]> {
  await ensureSessionDir();

  try {
    const files = await fs.readdir(SESSION_DIR);
    const sessions: GeminiSession[] = [];

    for (const file of files) {
      if (file.startsWith('gemini-') && file.endsWith('.json')) {
        const id = file.replace('gemini-', '').replace('.json', '');
        const session = await loadSession(id);
        if (session) {
          sessions.push(session);
        }
      }
    }

    return sessions.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Clean up old sessions (older than 24 hours)
 */
export async function cleanupSessions(maxAgeHours = 24): Promise<number> {
  const sessions = await listSessions();
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  let cleaned = 0;

  for (const session of sessions) {
    if (new Date(session.updated_at).getTime() < cutoff) {
      try {
        await fs.unlink(getSessionPath(session.id));
        cleaned++;
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  return cleaned;
}
