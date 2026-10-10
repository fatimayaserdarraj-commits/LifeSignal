import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { plantById } from '@/data/plants';

import { useAuth } from './auth';
import { useI18n } from './i18n';
import { cancelNotification, ensureNotificationPermission, scheduleCareNotification } from './notifications';
import { pullUserData, pushUserData, syncEnabled } from './sync';
import { readJSON, removeKey, uid, writeJSON } from './storage';
import { TKey } from './translations';

export type CareTask = 'watering' | 'fertilizing' | 'pruning' | 'misting' | 'harvesting' | 'repotting';
export const CARE_TASKS: { id: CareTask; emoji: string }[] = [
  { id: 'watering', emoji: '💧' },
  { id: 'fertilizing', emoji: '🧪' },
  { id: 'pruning', emoji: '✂️' },
  { id: 'misting', emoji: '🌫️' },
  { id: 'harvesting', emoji: '🧺' },
  { id: 'repotting', emoji: '🪴' },
];

export type GardenPlant = {
  id: string;
  speciesId: string;
  nickname: string;
  location: 'indoor' | 'outdoor' | 'balcony';
  photoUri?: string;
  createdAt: number;
};

export type Reminder = {
  id: string;
  plantId: string;
  task: CareTask;
  intervalDays: number;
  lastDone: number;
  notificationId?: string;
};

export type JournalEntry = {
  id: string;
  plantId: string;
  at: number;
  heightCm?: number;
  note: string;
  photoUri?: string;
};

export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; at: number; imageUri?: string };

export type Comment = { id: string; authorId: string; authorName: string; text: string; at: number };
export type PostType = 'question' | 'showcase' | 'tip';
export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  type: PostType;
  text: string;
  imageUri?: string;
  likes: string[];
  comments: Comment[];
  at: number;
};

type UserData = {
  plants: GardenPlant[];
  reminders: Reminder[];
  journal: JournalEntry[];
  chat: ChatMessage[];
  guideProgress: Record<string, number>;
  updatedAt: number;
  lastSynced?: number;
};

const EMPTY: UserData = { plants: [], reminders: [], journal: [], chat: [], guideProgress: {}, updatedAt: 0 };
const POSTS_KEY = 'mps.posts';
const userKey = (id: string) => `mps.user.${id}`;

const DAY = 86_400_000;
export const dueAt = (r: Reminder) => r.lastDone + r.intervalDays * DAY;
export const daysUntil = (r: Reminder) => Math.ceil((dueAt(r) - Date.now()) / DAY);

const now = Date.now();
const SEED_POSTS: Post[] = [
  {
    id: 'seed1',
    authorId: 'seed',
    authorName: 'Maryam A.',
    type: 'showcase',
    text: 'My first tomato harvest of the season from the balcony in Riffa! 🍅 Started from seed in October.',
    likes: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    comments: [{ id: 'c1', authorId: 'x', authorName: 'Hassan', text: 'Beautiful! Which variety is it?', at: now - 3 * 3600_000 }],
    at: now - 5 * 3600_000,
  },
  {
    id: 'seed2',
    authorId: 'seed',
    authorName: 'Ali K.',
    type: 'question',
    text: 'سؤال: أوراق الليمون عندي صارت صفراء مع عروق خضراء. هل هو نقص حديد؟ 🍋',
    likes: ['a', 'b', 'c'],
    comments: [
      { id: 'c2', authorId: 'y', authorName: 'Noor', text: 'نعم غالبًا نقص حديد بسبب قلوية التربة. جرّب الحديد المخلبي.', at: now - 20 * 3600_000 },
    ],
    at: now - 26 * 3600_000,
  },
  {
    id: 'seed3',
    authorId: 'seed',
    authorName: 'Sara M.',
    type: 'tip',
    text: 'Tip: freeze water in plastic bottles, poke a tiny hole and lay them by your pots in August. Slow, cool drip irrigation for free! 💧',
    likes: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
    comments: [],
    at: now - 3 * 86_400_000,
  },
];

type DataValue = UserData & {
  posts: Post[];
  addPlant: (p: Omit<GardenPlant, 'id' | 'createdAt'>) => GardenPlant;
  removePlant: (id: string) => void;
  addReminder: (plantId: string, task: CareTask, intervalDays: number, plantLabel?: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  removeReminder: (id: string) => void;
  addJournal: (e: Omit<JournalEntry, 'id' | 'at'>) => void;
  removeJournal: (id: string) => void;
  setChat: (messages: ChatMessage[]) => void;
  setGuideProgress: (guideId: string, step: number) => void;
  addPost: (p: Pick<Post, 'type' | 'text' | 'imageUri'>) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  syncNow: () => Promise<boolean>;
  wipe: () => Promise<void>;
};

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t, l } = useI18n();
  const [data, setData] = useState<UserData>(EMPTY);
  const [posts, setPosts] = useState<Post[]>([]);
  const loadedFor = useRef<string | null>(null);

  const prevUser = useRef<string | null>(null);

  // Load per-user data whenever the signed-in user changes.
  useEffect(() => {
    const from = prevUser.current;
    prevUser.current = user?.id ?? null;
    loadedFor.current = null;
    (async () => {
      if (!user) return setData(EMPTY);
      let d = await readJSON<UserData>(userKey(user.id), EMPTY);
      // A guest who registers keeps what they created while exploring.
      if (from === 'guest' && user.id !== 'guest' && !d.updatedAt) {
        const guest = await readJSON<UserData>(userKey('guest'), EMPTY);
        if (guest.updatedAt) {
          d = guest;
          await removeKey(userKey('guest'));
        }
      }
      setData({ ...EMPTY, ...d });
      loadedFor.current = user.id;
    })();
  }, [user]);

  useEffect(() => {
    readJSON<Post[] | null>(POSTS_KEY, null).then((p) => setPosts(p ?? SEED_POSTS));
  }, []);

  // Persist on change (only after the user's data has been loaded, to avoid clobbering).
  useEffect(() => {
    if (user && loadedFor.current === user.id) writeJSON(userKey(user.id), data);
  }, [data, user]);

  const update = useCallback((fn: (d: UserData) => UserData) => {
    setData((d) => ({ ...fn(d), updatedAt: Date.now() }));
  }, []);

  const savePosts = useCallback((fn: (p: Post[]) => Post[]) => {
    setPosts((p) => {
      const next = fn(p);
      writeJSON(POSTS_KEY, next);
      return next;
    });
  }, []);

  const plantName = useCallback(
    (plantId: string) => {
      const p = data.plants.find((x) => x.id === plantId);
      const species = p && plantById(p.speciesId);
      return p?.nickname || (species ? l(species.name) : '');
    },
    [data.plants, l],
  );

  const schedule = useCallback(
    async (r: Reminder, label?: string) => {
      const ok = await ensureNotificationPermission();
      if (!ok) return undefined;
      return scheduleCareNotification(
        `${t('appName')} 🌿`,
        t('reminderBody', { task: t(r.task as TKey), plant: label ?? plantName(r.plantId) }),
        new Date(dueAt(r)),
      );
    },
    [t, plantName],
  );

  const value = useMemo<DataValue>(
    () => ({
      ...data,
      posts,
      addPlant: (p) => {
        const plant: GardenPlant = { ...p, id: uid(), createdAt: Date.now() };
        update((d) => ({ ...d, plants: [plant, ...d.plants] }));
        return plant;
      },
      removePlant: (id) => {
        data.reminders.filter((r) => r.plantId === id).forEach((r) => cancelNotification(r.notificationId));
        update((d) => ({
          ...d,
          plants: d.plants.filter((p) => p.id !== id),
          reminders: d.reminders.filter((r) => r.plantId !== id),
          journal: d.journal.filter((j) => j.plantId !== id),
        }));
      },
      addReminder: async (plantId, task, intervalDays, plantLabel) => {
        const r: Reminder = { id: uid(), plantId, task, intervalDays, lastDone: Date.now() };
        r.notificationId = await schedule(r, plantLabel);
        update((d) => ({ ...d, reminders: [...d.reminders, r] }));
      },
      completeReminder: async (id) => {
        const r = data.reminders.find((x) => x.id === id);
        if (!r) return;
        await cancelNotification(r.notificationId);
        const next: Reminder = { ...r, lastDone: Date.now() };
        next.notificationId = await schedule(next);
        update((d) => ({ ...d, reminders: d.reminders.map((x) => (x.id === id ? next : x)) }));
      },
      removeReminder: (id) => {
        cancelNotification(data.reminders.find((x) => x.id === id)?.notificationId);
        update((d) => ({ ...d, reminders: d.reminders.filter((r) => r.id !== id) }));
      },
      addJournal: (e) => update((d) => ({ ...d, journal: [{ ...e, id: uid(), at: Date.now() }, ...d.journal] })),
      removeJournal: (id) => update((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) })),
      setChat: (chat) => update((d) => ({ ...d, chat })),
      setGuideProgress: (guideId, step) =>
        update((d) => ({ ...d, guideProgress: { ...d.guideProgress, [guideId]: Math.max(step, d.guideProgress[guideId] ?? 0) } })),
      addPost: (p) => {
        if (!user) return;
        savePosts((list) => [
          { ...p, id: uid(), authorId: user.id, authorName: user.name || t('guest'), likes: [], comments: [], at: Date.now() },
          ...list,
        ]);
      },
      toggleLike: (postId) => {
        if (!user) return;
        savePosts((list) =>
          list.map((p) =>
            p.id !== postId ? p : { ...p, likes: p.likes.includes(user.id) ? p.likes.filter((x) => x !== user.id) : [...p.likes, user.id] },
          ),
        );
      },
      addComment: (postId, text) => {
        if (!user) return;
        savePosts((list) =>
          list.map((p) =>
            p.id !== postId
              ? p
              : { ...p, comments: [...p.comments, { id: uid(), authorId: user.id, authorName: user.name || t('guest'), text, at: Date.now() }] },
          ),
        );
      },
      syncNow: async () => {
        if (!user || !syncEnabled) return false;
        const remote = await pullUserData<UserData>(user.id, user.id);
        const merged = remote && remote.updatedAt > data.updatedAt ? remote : data;
        await pushUserData(user.id, merged, user.id);
        setData({ ...merged, lastSynced: Date.now() });
        return true;
      },
      wipe: async () => {
        if (!user) return;
        data.reminders.forEach((r) => cancelNotification(r.notificationId));
        await removeKey(userKey(user.id));
        setData(EMPTY);
      },
    }),
    [data, posts, update, savePosts, schedule, user, t],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
