/**
 * Optional multi-device sync. Point EXPO_PUBLIC_SYNC_URL at any REST endpoint that
 * stores a JSON document per user (GET/PUT {url}/users/{id}). Last write wins.
 */
const SYNC_URL = process.env.EXPO_PUBLIC_SYNC_URL;

export const syncEnabled = !!SYNC_URL;

export type Syncable = { updatedAt: number };

export async function pushUserData<T extends Syncable>(userId: string, data: T, token: string) {
  if (!SYNC_URL) throw new Error('sync not configured');
  const res = await fetch(`${SYNC_URL}/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`sync failed: ${res.status}`);
}

export async function pullUserData<T extends Syncable>(userId: string, token: string): Promise<T | null> {
  if (!SYNC_URL) return null;
  const res = await fetch(`${SYNC_URL}/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`sync failed: ${res.status}`);
  return (await res.json()) as T;
}
