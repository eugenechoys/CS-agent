import { getPool, ensureSchema } from "./client";

export async function dbGet(filePath: string): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  await ensureSchema();
  const { rows } = await pool.query("SELECT content FROM prompts WHERE path = $1", [filePath]);
  return rows[0]?.content ?? null;
}

export async function dbSave(filePath: string, content: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await ensureSchema();
  await pool.query(
    `INSERT INTO prompts (path, content, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (path) DO UPDATE SET content = $2, updated_at = NOW()`,
    [filePath, content],
  );
}

export async function dbDelete(filePath: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query("DELETE FROM prompts WHERE path = $1", [filePath]);
}

export async function dbListAll(): Promise<{ path: string; updated_at: Date }[]> {
  const pool = getPool();
  if (!pool) return [];
  await ensureSchema();
  const { rows } = await pool.query("SELECT path, updated_at FROM prompts ORDER BY path");
  return rows;
}

export async function dbExportAll(): Promise<{ path: string; content: string; updated_at: string }[]> {
  const pool = getPool();
  if (!pool) return [];
  await ensureSchema();
  const { rows } = await pool.query("SELECT path, content, updated_at::text FROM prompts ORDER BY path");
  return rows;
}

export async function dbLoadAll(): Promise<{ path: string; content: string }[]> {
  const pool = getPool();
  if (!pool) return [];
  await ensureSchema();
  const { rows } = await pool.query("SELECT path, content FROM prompts");
  return rows;
}
