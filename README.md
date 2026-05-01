# LAJU — Running Tracker App

Aplikasi pelacak aktivitas lari berbasis React Native + Expo, dengan GPS tracking real-time, statistik mingguan, dan riwayat aktivitas tersinkron ke Supabase.

---

## Fitur

- **GPS Tracking Real-time** — Rekam rute lari dengan background location tracking
- **Live Stats** — Jarak, pace, durasi, dan kalori terhitung otomatis saat berlari
- **Peta Rute** — Visualisasi jalur lari di peta interaktif saat dan setelah sesi
- **Ringkasan Aktivitas** — Statistik lengkap, split per KM, dan share screenshot
- **Riwayat Aktivitas** — Daftar semua sesi dengan filter tipe dan mini-map rute
- **Dashboard Home** — Jarak mingguan, streak, last activity, dan all-time stats
- **Simpan ke Cloud** — Aktivitas tersimpan ke Supabase untuk sinkronisasi antar perangkat
- **Auth** — Login dan register via email dengan sesi persisten

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Backend / Auth | Supabase |
| Navigasi | React Navigation (Native Stack + Bottom Tabs) |
| State / Fetching | TanStack React Query |
| GPS | expo-location + expo-task-manager |
| Peta | react-native-maps |
| Grafik Rute | react-native-svg |
| Font | Inter (via @expo-google-fonts) |
| Icons | @expo/vector-icons (Ionicons) |

---

## Struktur Proyek

```
├── App.tsx                  # Root navigator + QueryClientProvider
├── index.js                 # Entry point, register background GPS task
├── navigation/
│   └── TabNavigator.tsx     # Bottom tab navigator (Beranda, Riwayat, Progress, Profil)
├── screens/
│   ├── HomeScreen.tsx       # Dashboard: weekly stats, streak, last activity
│   ├── LiveScreen.tsx       # Sesi lari aktif dengan peta real-time
│   ├── ActivitySummaryScreen.tsx  # Ringkasan setelah sesi + save ke Supabase
│   ├── RiwayatScreen.tsx    # Riwayat semua aktivitas dengan filter
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
├── hooks/
│   ├── useGps.tsx           # Background GPS tracking (TaskManager)
│   ├── useMetrix.tsx        # Haversine distance, pace, kalori, elevasi
│   ├── useStopwatch.tsx     # Timer untuk durasi sesi
│   └── useLocationPermission.tsx
├── context/
│   └── AuthContext.tsx      # Supabase session, useAuth()
├── lib/
│   ├── supabase.tsx         # Supabase client
│   └── activityStorage.tsx  # AsyncStorage offline cache
├── types/
│   └── activity.ts          # Activity, Coordinate, ActivityType
└── styles/
    ├── theme.ts             # Design tokens: colors, fonts, spacing, radius
    ├── activitySummary.ts
    └── live.ts
```

---

## Memulai

### Prasyarat

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Akun [Supabase](https://supabase.com)

### Setup

```bash
# Clone repo
git clone https://github.com/GalangNour/LajuApp.git
cd LajuApp

# Install dependencies
npm install

# Salin file environment
cp .env.example .env
```

Isi `.env` dengan kredensial Supabase kamu:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_anon_xxxx
```

### Database (Supabase)

Jalankan SQL ini di Supabase SQL Editor:

```sql
create table activities (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  type             text not null,
  distance_meters  float not null,
  duration_seconds int not null,
  calories         int,
  elevation_gain   float,
  started_at       timestamptz not null,
  gps_polyline     jsonb,
  created_at       timestamptz default now()
);

alter table activities enable row level security;

create policy "User can insert own activities"
  on activities for insert with check (auth.uid() = user_id);

create policy "User can read own activities"
  on activities for select using (auth.uid() = user_id);
```

### Jalankan App

```bash
# Development (Expo Go — GPS tidak tersedia)
npx expo start

# Build native Android (diperlukan untuk GPS, peta, background tracking)
npx expo run:android

# Dengan tunnel (beda jaringan)
npx expo start --tunnel
```

> **Catatan:** `expo-location`, `expo-task-manager`, dan `react-native-maps` memerlukan native build (`expo run:android`). Tidak bisa dijalankan di Expo Go.

### Build APK / Rilis

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Konfigurasi (sekali)
eas build:configure

# APK untuk testing
eas build -p android --profile preview

# AAB untuk Play Store
eas build -p android --profile production
```

---

## GPS Testing Tanpa Jalan-jalan

Gunakan **Android Emulator Extended Controls** → tab **Routes** → import file `.gpx` untuk simulasi rute lari. Atau gunakan app **Lockito** di perangkat fisik dengan Developer Options mock location.

---

## Warna Brand

| Token | Nilai | Keterangan |
|---|---|---|
| `primary` | `#023949` | Biru gelap utama |
| `secondary` | `#eea400` | Kuning aksen |
| `surface` | `#021820` | Background gelap |
| `successAlt` | `#22c984` | Hijau GPS / start |

---

## Lisensi

MIT
