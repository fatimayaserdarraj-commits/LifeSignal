import { IssueCategory, matchDiagnosis } from '@/data/diagnoses';
import { PLANTS, PlantInfo } from '@/data/plants';
import { currentSeason } from '@/data/seasons';

import type { ChatMessage } from './data';
import { Lang } from './translations';

/**
 * AI layer. When EXPO_PUBLIC_ANTHROPIC_API_KEY is set, plant identification, diagnosis and the chat
 * assistant are powered by Claude (vision + text). Otherwise an on-device knowledge base is used.
 *
 * NOTE: a key bundled into a client app can be extracted. For production, route these calls
 * through your own backend proxy and set EXPO_PUBLIC_AI_PROXY_URL instead.
 */
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL;
const MODEL = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL || 'claude-sonnet-5-5';

export const aiOnline = !!(API_KEY || PROXY_URL);

export type CareSheet = Record<'water' | 'light' | 'soil' | 'temperature' | 'fertilizer' | 'humidity', string>;

export type Identification = {
  matchId: string | null;
  emoji: string;
  name: string;
  scientific: string;
  family: string;
  description: string;
  confidence: number;
  care: CareSheet;
  demo: boolean;
};

export type DiagnosisResult = {
  category: IssueCategory;
  emoji: string;
  name: string;
  severity: number;
  confidence: number;
  causes: string;
  treatment: string[];
  prevention: string[];
  demo: boolean;
};

type Block =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

async function callClaude(system: string, messages: { role: 'user' | 'assistant'; content: string | Block[] }[], maxTokens = 1024) {
  const url = PROXY_URL || 'https://api.anthropic.com/v1/messages';
  const headers: Record<string, string> = { 'content-type': 'application/json', 'anthropic-version': '2023-06-01' };
  if (!PROXY_URL && API_KEY) {
    headers['x-api-key'] = API_KEY;
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const json = await res.json();
  return (json.content as { type: string; text?: string }[])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

function parseJSON<T>(text: string): T {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return JSON.parse(text.slice(start, end + 1)) as T;
}

const langName = (lang: Lang) => (lang === 'ar' ? 'Arabic' : 'English');

function careFromPlant(p: PlantInfo, lang: Lang): CareSheet {
  const c = p.care;
  return {
    water: c.water[lang],
    light: c.light[lang],
    soil: c.soil[lang],
    temperature: c.temperature[lang],
    fertilizer: c.fertilizer[lang],
    humidity: c.humidity[lang],
  };
}

function fromPlant(p: PlantInfo, lang: Lang, confidence: number, demo: boolean): Identification {
  return {
    matchId: p.id,
    emoji: p.emoji,
    name: p.name[lang],
    scientific: p.scientific,
    family: p.family,
    description: p.description[lang],
    confidence,
    care: careFromPlant(p, lang),
    demo,
  };
}

const imageBlock = (base64: string, mime = 'image/jpeg'): Block => ({
  type: 'image',
  source: { type: 'base64', media_type: mime, data: base64 },
});

export async function identifyPlant(base64: string | undefined, seed: string, lang: Lang): Promise<Identification> {
  if (aiOnline && base64) {
    const ids = PLANTS.map((p) => p.id).join(', ');
    const text = await callClaude(
      `You are an expert botanist for a gardening app used in the Arabian Gulf. Identify the plant in the photo. ` +
        `Reply ONLY with JSON: {"match_id": one of [${ids}] or null, "emoji": string, "common_name": string, "scientific_name": string, ` +
        `"family": string, "confidence": number 0-1, "description": string (2 sentences), "care": {"water","light","soil","temperature","fertilizer","humidity"} ` +
        `(each one practical sentence adapted to a hot, dry climate)}. Write all text values in ${langName(lang)}.`,
      [{ role: 'user', content: [imageBlock(base64), { type: 'text', text: 'Identify this plant.' }] }],
    );
    const r = parseJSON<{
      match_id: string | null;
      emoji: string;
      common_name: string;
      scientific_name: string;
      family: string;
      confidence: number;
      description: string;
      care: CareSheet;
    }>(text);
    return {
      matchId: PLANTS.some((p) => p.id === r.match_id) ? r.match_id : null,
      emoji: r.emoji || '🌿',
      name: r.common_name,
      scientific: r.scientific_name,
      family: r.family,
      description: r.description,
      confidence: r.confidence,
      care: r.care,
      demo: false,
    };
  }
  // Offline demo: deterministic pick from the local database.
  await new Promise((r) => setTimeout(r, 1800));
  const hash = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const plant = PLANTS[hash % PLANTS.length];
  return fromPlant(plant, lang, 0.78 + (hash % 18) / 100, true);
}

export async function diagnosePlant(base64: string | undefined, symptoms: string, lang: Lang): Promise<DiagnosisResult> {
  if (aiOnline && (base64 || symptoms.trim())) {
    const content: Block[] = [];
    if (base64) content.push(imageBlock(base64));
    content.push({ type: 'text', text: `Symptoms reported by the user: ${symptoms || 'none given'}` });
    const text = await callClaude(
      `You are a plant pathologist for a gardening app in the Arabian Gulf. Diagnose plant health from the photo and symptoms. ` +
        `Consider pests, diseases and nutritional deficiencies (and heat/salt stress). Reply ONLY with JSON: ` +
        `{"category": "pest"|"disease"|"nutrient"|"healthy", "emoji": string, "name": string, "severity": number 0-1, "confidence": number 0-1, ` +
        `"causes": string, "treatment": string[] (3 steps), "prevention": string[] (2-3 tips)}. Write all text values in ${langName(lang)}.`,
      [{ role: 'user', content }],
    );
    const r = parseJSON<Omit<DiagnosisResult, 'demo'>>(text);
    return { ...r, demo: false };
  }
  await new Promise((r) => setTimeout(r, 1800));
  const { diagnosis: d, confidence } = matchDiagnosis(symptoms);
  return {
    category: d.category,
    emoji: d.emoji,
    name: d.name[lang],
    severity: d.severity,
    confidence,
    causes: d.causes[lang],
    treatment: d.treatment.map((x) => x[lang]),
    prevention: d.prevention.map((x) => x[lang]),
    demo: true,
  };
}

export async function chatReply(history: ChatMessage[], gardenSummary: string, lang: Lang): Promise<string> {
  const season = currentSeason();
  if (aiOnline) {
    const system =
      `You are the MPS Garden assistant: a warm, expert gardener helping users in Bahrain and the Gulf. ` +
      `Current season: ${season.id} (${season.climate.en}). The user's garden: ${gardenSummary || 'no plants yet'}. ` +
      `Give personalised, practical, concise advice (short paragraphs or bullet points). Cover pests, diseases and nutrient issues when relevant, ` +
      `with treatment and prevention. Reply in ${langName(lang)} unless the user writes in another language.`;
    const messages = history.slice(-16).map((m) => ({ role: m.role, content: m.text }));
    return callClaude(system, messages, 800);
  }
  await new Promise((r) => setTimeout(r, 900));
  return offlineReply(history[history.length - 1]?.text ?? '', lang);
}

/** Rule-based fallback assistant built on the local knowledge base. */
function offlineReply(question: string, lang: Lang): string {
  const q = question.toLowerCase();
  const season = currentSeason();

  if (/(plant|grow|sow|month|season|ازرع|أزرع|زراعة|موسم|شهر)/.test(q)) {
    const picks = PLANTS.filter((p) => p.plantIn.includes(season.id)).slice(0, 6);
    const head =
      lang === 'ar'
        ? `نحن الآن في ${season.months.ar} (${season.climate.ar}). أنصحك بزراعة:`
        : `It's ${season.months.en} now (${season.climate.en}). Great picks to plant:`;
    return `${head}\n${picks.map((p) => `• ${p.emoji} ${p.name[lang]}`).join('\n')}\n\n${season.tips[0][lang]}`;
  }

  const plant = PLANTS.find((p) => p.tags.some((t) => q.includes(t.toLowerCase())));
  if (plant && !/(yellow|spot|bug|pest|أصفر|اصفرار|بقع|حشر|آف)/.test(q)) {
    const c = plant.care;
    return lang === 'ar'
      ? `${plant.emoji} ${plant.name.ar}\n• الري: ${c.water.ar}\n• الإضاءة: ${c.light.ar}\n• التربة: ${c.soil.ar}\n• التسميد: ${c.fertilizer.ar}`
      : `${plant.emoji} ${plant.name.en}\n• Water: ${c.water.en}\n• Light: ${c.light.en}\n• Soil: ${c.soil.en}\n• Feeding: ${c.fertilizer.en}`;
  }

  const { diagnosis: d } = matchDiagnosis(q);
  if (d.id !== 'healthy') {
    const label = lang === 'ar' ? ['قد تكون المشكلة', 'العلاج', 'الوقاية'] : ['This sounds like', 'Treatment', 'Prevention'];
    return `${d.emoji} ${label[0]}: ${d.name[lang]}\n${d.causes[lang]}\n\n${label[1]}:\n${d.treatment
      .map((x) => `• ${x[lang]}`)
      .join('\n')}\n\n${label[2]}:\n${d.prevention.map((x) => `• ${x[lang]}`).join('\n')}`;
  }

  return lang === 'ar'
    ? `سؤال رائع! لأعطيك نصيحة دقيقة، أخبرني باسم النبتة والأعراض (مثل لون الأوراق أو وجود بقع أو حشرات)، أو استخدم الماسح لتشخيص الصورة. 🌿\n\nنصيحة الموسم: ${season.tips[1].ar}`
    : `Great question! To give precise advice, tell me the plant and the symptoms (leaf colour, spots, insects…) or use the scanner to diagnose a photo. 🌿\n\nSeasonal tip: ${season.tips[1].en}`;
}

