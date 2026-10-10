# MPS Garden 🌿

A React Native + Expo (SDK 57) gardening companion with an animated, glass-style dark UI, full
**English / Arabic (RTL)** support, and AI plant care tuned for Bahrain and the Gulf climate.

## Features

| Feature | What it does | Where |
| --- | --- | --- |
| **Registration & login** | Email accounts with salted and stretched SHA-256 password hashes, session token in the encrypted Secure Store, a lockout after 5 failed logins, and a password-strength meter. You can **explore as a guest** first; anything you create is moved into your account when you register. Google / Apple / Facebook buttons are in place and need OAuth client IDs (see below). Optional cloud sync across devices. | `src/lib/auth.tsx`, `src/app/(auth)/*`, `src/lib/sync.ts` |
| **Multilingual** | English and Arabic with full right-to-left layout. Switch any time from the toggle or Settings. The first language follows the device language. | `src/lib/i18n.tsx`, `src/lib/translations.ts` |
| **Plant identifier** | Take a photo or pick one from the gallery. You get the common and scientific name, family, a confidence ring and a 6-part care guide, then **Add to my garden**, which also creates reminders. | `src/app/(tabs)/scan.tsx` |
| **AI diagnosis & assistant** | Photo and symptom diagnosis of **pests, diseases and nutrient deficiencies**, with severity, causes, treatment steps and prevention. A chat assistant knows your garden and the current season. | `src/lib/ai.ts`, `src/app/(tabs)/assistant.tsx` |
| **Guides & tutorials** | Step-by-step lessons (watering, planting, pruning, Gulf soil, natural pest control) with visuals, quick-check quizzes, saved progress and a completion screen. | `src/app/guides/*`, `src/data/guides.ts` |
| **Local shops directory** | Nurseries, markets, equipment suppliers and experts in Bahrain, with search, filters, distance sorting, and call / WhatsApp / directions buttons. | `src/app/shops.tsx`, `src/data/shops.ts` |
| **Reminders & growth tracking** | Care reminders per plant (watering, fertilising, pruning, misting, harvesting, repotting) sent as local notifications. A growth journal holds height, notes and photos, with an animated growth chart. | `src/app/(tabs)/garden.tsx`, `src/app/plant/[id].tsx`, `src/lib/notifications.ts` |
| **Season-based recommendations** | Gulf seasons (winter / spring / summer / autumn) with climate, care tips, and plants grouped as **cool-season, warm-season or perennial**. | `src/app/seasons.tsx`, `src/data/seasons.ts` |
| **Community forum** | Questions, showcases and tips with photos, likes and comments. | `src/app/(tabs)/community.tsx`, `src/app/post/[id].tsx` |

**Animation & design:** Reanimated 4 handles the floating leaves, the breathing logo, drifting background orbs,
staggered entrances, a springy sliding tab bar and segmented controls, press-scale and haptics, the scanner laser
and pulse rings, the typing indicator, animated progress and confidence meters, the growth-chart bars, quiz shake
feedback and the lesson-complete burst.

## Run it

```bash
cd mps-app
npm install
npx expo start        # then scan the QR code with Expo Go, or press a / i / w
```

Checks: `npx tsc --noEmit` and `npx expo lint`.

## Configuration (`.env`)

Copy `.env.example` to `.env`. Every setting is optional.

- **AI.** If no key is set, the app uses its **offline knowledge base**. In that mode, diagnosis matches your symptoms
  against the built-in issue library, and identification is a *demo*: it picks a plant from the local database and is
  clearly labelled as demo mode. For real recognition, set `EXPO_PUBLIC_ANTHROPIC_API_KEY` (development only) or point
  `EXPO_PUBLIC_AI_PROXY_URL` at your own backend proxy (recommended for production, so the key never ships in the app).
- **Sync.** Set `EXPO_PUBLIC_SYNC_URL` to a REST endpoint (`GET/PUT /users/{id}`) to sync plants, reminders, journal,
  chats and guide progress across phones and tablets. In production, put real backend auth in front of it.
- **Social sign-in.** Create OAuth clients (Google Cloud, Apple Developer, Meta) and wire them up with
  `expo-auth-session` / `expo-apple-authentication` in `src/components/auth-shell.tsx`. Until then, the buttons show a
  configuration notice.

## Notes

- Accounts, plants, journal and chats are stored on the device (AsyncStorage). Session tokens go in the Secure Store.
- The shop directory in `src/data/shops.ts` is **sample data**: names and phone numbers are placeholders. Replace it with
  verified listings before release.
- Expo Go supports local notifications. Remote push needs a development build.
