# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (Expo Go via WiFi/QR)
npx expo start

# Start and open on connected Android device
set PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools;%PATH% && npx expo start --android

# Start with tunnel (different network / mobile data)
npx expo start --tunnel

# Full native build (required for background GPS, maps, MMKV)
npx expo run:android
npx expo run:ios

# Type check
npx tsc --noEmit

# Install a package (always use expo install, not npm install, for native modules)
npx expo install <package-name>
```

> **Note:** `react-native-maps`, `expo-location`, `expo-task-manager`, and `expo-keep-awake` require a native build (`expo run:android`). They will crash in Expo Go.

## Environment

Copy `.env.example` to `.env` and fill in Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=   ← use the anon key (sb_anon_...), not the service role key
```

## Architecture

### Entry point & app bootstrap
`index.js` → calls `defineLocationTask()` before mounting the app. The background GPS task **must** be registered at module level before the app renders — this is why it lives in `index.js`, not inside a component.

`App.tsx` loads Inter fonts via `useFonts()`, wraps the app in `AuthProvider`, then renders `Navigator`. `Navigator` reads `session` from `AuthContext` to decide which stack to show (auth stack vs. app stack).

### Auth flow
`context/AuthContext.tsx` owns the Supabase session and broadcasts it app-wide via `useAuth()`. Screens never call `supabase.auth.getSession()` directly — they use `useAuth()` instead. `lib/supabase.tsx` creates the Supabase client with `AsyncStorage` as the session store.

### Navigation
`RootStackParamList` is defined and exported from `App.tsx`. All screens import it from there for typed navigation. Two conditional stacks:
- **Unauthenticated:** `Login` → `Register`
- **Authenticated:** `Home` → `Live` → `ActivitySummary`, `PermissionTest`

### GPS tracking
Two-layer architecture:
1. `hooks/useLocationPermission.tsx` — manages foreground + background permission state, re-checks via `AppState` listener whenever the app returns to foreground, and alerts the user if permission is revoked mid-session.
2. `hooks/useGps.tsx` — uses `Location.startLocationUpdatesAsync` (not `watchPositionAsync`) with a registered `TaskManager` task for reliable background tracking. A module-level `_onLocation` callback bridges the TaskManager callback (which runs outside React) into React state.

### Metrics calculation
`hooks/useMetrix.tsx` exports `useMetrics(coordinates, seconds)`. It is a pure calculation hook (no side effects) — computes distance via Haversine formula, pace (min/km), estimated calories (~60 kcal/km), and elevation gain from coordinate arrays. It does **not** do any GPS tracking.

### Data storage
`lib/activityStorage.tsx` provides `saveActivity` / `getActivities` using `AsyncStorage` (offline-first). Activities are stored as a JSON array under the key `"activities"`.

### Shared types
`types/activity.ts` is the single source of truth for `Activity`, `Coordinate`, and `ActivityType`. Both `hooks/useGps.tsx` and `lib/activityStorage.tsx` re-export these types for backward compatibility, but the canonical definitions live in `types/`.

### Styling
`styles/theme.ts` defines the design tokens: `colors`, `fonts`, `fontSize`, `radius`, `spacing`. Primary brand color is `#023949`, secondary is `#eea400`. Font is Inter (loaded via `hooks/useFonts.tsx`). `styles/auth.ts` is a pre-built `StyleSheet` for Login/Register screens that consumes the theme tokens.

Use `fontFamily: fonts.bold` (etc.) in StyleSheet — Inter is loaded at app startup, so it is always available by the time any screen renders.
