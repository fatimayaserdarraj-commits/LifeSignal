import * as Crypto from 'expo-crypto';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { readJSON, secure, uid, writeJSON } from './storage';

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  provider: 'email' | 'guest';
};

type StoredAccount = User & { salt: string; hash: string };

type AuthError = 'errExists' | 'errCredentials' | 'errLocked';

type AuthValue = {
  user: User | null;
  ready: boolean;
  isGuest: boolean;
  register: (name: string, email: string, password: string) => Promise<AuthError | null>;
  login: (email: string, password: string) => Promise<AuthError | null>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
};

const ACCOUNTS_KEY = 'mps.accounts';
const SESSION_KEY = 'mps_session';
const GUEST: User = { id: 'guest', name: '', email: '', createdAt: 0, provider: 'guest' };

// Simple brute-force protection: lock login for 60s after 5 failures.
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;
let failures = 0;
let lockedUntil = 0;

async function hashPassword(password: string, salt: string) {
  // Key stretching: iterate SHA-256 so offline guessing is expensive.
  let digest = `${salt}:${password}`;
  for (let i = 0; i < 600; i++) {
    digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, digest + salt);
  }
  return digest;
}

function toUser({ salt: _s, hash: _h, ...user }: StoredAccount): User {
  return user;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const session = await secure.get(SESSION_KEY);
        if (session === 'guest') setUser(GUEST);
        else if (session) {
          const accounts = await readJSON<StoredAccount[]>(ACCOUNTS_KEY, []);
          const acc = accounts.find((a) => a.id === session);
          if (acc) setUser(toUser(acc));
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const accounts = await readJSON<StoredAccount[]>(ACCOUNTS_KEY, []);
    const normalized = email.trim().toLowerCase();
    if (accounts.some((a) => a.email === normalized)) return 'errExists' as const;
    const salt = Crypto.randomUUID();
    const account: StoredAccount = {
      id: uid(),
      name: name.trim(),
      email: normalized,
      createdAt: Date.now(),
      provider: 'email',
      salt,
      hash: await hashPassword(password, salt),
    };
    await writeJSON(ACCOUNTS_KEY, [...accounts, account]);
    await secure.set(SESSION_KEY, account.id);
    setUser(toUser(account));
    return null;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (Date.now() < lockedUntil) return 'errLocked' as const;
    const accounts = await readJSON<StoredAccount[]>(ACCOUNTS_KEY, []);
    const acc = accounts.find((a) => a.email === email.trim().toLowerCase());
    if (!acc || (await hashPassword(password, acc.salt)) !== acc.hash) {
      failures += 1;
      if (failures >= MAX_ATTEMPTS) {
        lockedUntil = Date.now() + LOCK_MS;
        failures = 0;
      }
      return 'errCredentials' as const;
    }
    failures = 0;
    await secure.set(SESSION_KEY, acc.id);
    setUser(toUser(acc));
    return null;
  }, []);

  const continueAsGuest = useCallback(async () => {
    await secure.set(SESSION_KEY, 'guest');
    setUser(GUEST);
  }, []);

  const logout = useCallback(async () => {
    await secure.remove(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, isGuest: user?.provider === 'guest', register, login, continueAsGuest, logout }),
    [user, ready, register, login, continueAsGuest, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export const validPassword = (p: string) => p.length >= 8 && /[a-zA-Z]/.test(p) && /\d/.test(p);
export function passwordScore(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4) / 4;
}
