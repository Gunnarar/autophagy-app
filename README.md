# autophagy-app

## 🚦 Current Status (October 2025)

**Genesis4PD Autophagy App** is a robust, user-friendly health-tracking app for Parkinson's Disease, focused on fasting, diet, and symptom logging. The MVP is complete and ready for final QA and user testing. All core flows are unified, accessible, and polished. See below for details.

### ✅ Core Features Implemented
- **Onboarding & Profile**: Multi-step onboarding, persistent profile, edit/view all data, required field validation, user-friendly errors.
- **Fasting Tracking**: Fasting timer, log/history, progress metrics (autophagy windows), ongoing fast shown on Home, predefined programs (24h–7d) with progressive unlocking, schedule/snooze fasts.
- **Diet/Food Logging**: Unified meal logging (animal meat, carb meals, regular meals) via a single Diet Log screen. All logs stored in a unified log context. Carb meals visually marked. Weekly summary and bar chart.
- **Symptom Logging**: Log symptoms with type, severity, time, notes. Associate with fasting periods. Filter/review history. Friendly empty states.
- **Logs & Filtering**: Unified, time-ordered log view with pill-style filters (All, Food, Symptoms, Fasting). Summary section tallies meat, fasts, symptoms.
- **Export**: Export logs as CSV (with summary) for any time range (week, month, 3m, 6m, year). Uses expo-file-system and expo-sharing.
- **Accessibility & Feedback**: Large fonts, high contrast, big touch targets, screen reader support. All actions show user feedback. Error handling and empty states reviewed. Runtime import checks backed by Jest smoke tests.
- **Data Persistence**: All logs and user data are persisted with AsyncStorage. Race conditions fixed. Export/download flows hardened with error messaging.
- **Data Visualization**: Simple bar chart for weekly animal meat and carb meals. Streaks, milestones, badges.
- **Developer Tooling**: ESLint with `react-native/no-inline-styles` enforced, Jest smoke tests for render/runtime regressions, and automated CI covering lint + tests.

### 🛣️ Roadmap Progress

#### Top Priority (Core Functionality & Accessibility)
- [x] **Onboarding & Profile**
- [x] **Fasting-Based Tracking**
- [x] **Dietary/Food Logging**
- [x] **Symptom Logging**
- [x] **Logs & Filtering**
- [x] **Feedback & Guidance**
- [x] **Developer Quality Gates** (lint + smoke tests)

#### High Value (User Engagement & Medical Relevance)
- [ ] **Reminders & Notifications** _(Deferred: requires on-device QA & dismissal persistence)_
- [x] **Data Visualization** _(basic charts/streaks done)_
- [ ] **Personalization** _(dark mode toggle, quick actions: future)_
- [ ] **Medical Safety** _(medication logging: future)_
- [ ] **Resilient Storage & Sync** _(better error fallback, corruption handling)_
- [ ] **Notification State Persistence** _(remember dismissals across sessions)_

#### Advanced/Optional (For Future)
- [ ] **User Feedback Indicators** _(future)_
- [ ] **Ketone Tracking** _(future)_
- [ ] **Biomarker Tracking** _(future)_
- [ ] **Offline Support & Sync** _(future)_
- [ ] **Theming & Delight** _(future)_

### 🧪 Next Steps
- Final QA and user testing (see QA checklist in project notes)
- Polish UI/UX based on user feedback
- Prepare for deployment (Expo Go, EAS Build, TestFlight/Play Store)
- Run an accessibility pass on the chip-driven entry modals (Home/Symptoms) to confirm VoiceOver/TalkBack announce emoji labels and selection state correctly.
- Adopt the refreshed Figma design system: new tokens, shared UI primitives, and updated screen layouts
- Validate the new bottom navigation + hero metrics flow against the Figma mock (remove the legacy FAB once quick actions move into the tabs)
- Persist notification snoozes/dismissals and harden AsyncStorage fallback paths
- Plan for reminders/notifications and advanced features

### 🎨 Visual Refresh (Figma Alignment)
- Introduce the Figma-derived design tokens (carnivore red palette, deep navy neutrals) in `utils/theme.js`
- Build shared React Native primitives (`components/ui`) for Card, Button, and Chip (logs filters and modals now rely on them); extend the library with checklist/toggle primitives for upcoming settings work.
- Mirror the Figma autophagy ranking in-app (`AutophagyLevelCard`) so the Info screen shows current level, next challenge, and completed tiers.
- Restructure Home, Logs, and Profile screens to mirror the new hero sections, stat grids, and insights cards
- Add trend visualizations (ketone/symptom correlation, weekly summaries) using reusable chart wrappers
- Modernize modals and forms with dialog-style layouts, icon-backed selectors, and consistent spacing

### 🌙 Dark Mode Prep
- Split `theme` into light/dark palettes that share spacing/typography tokens; derive colors from the Figma night variant.
- Add a `ThemeProvider` wrapper that persists the chosen mode (system/default toggle via AsyncStorage) and exposes a `useThemeMode` hook.
- Audit components that still rely on literal hex values (e.g. `components/KetoneLogModal.js`, `components/SymptomLogModal.js`, `components/LogEntryModal.js`) and swap them to the semantic tokens before enabling the toggle.
- Provide light/dark values for `theme.overlay.scrim`/`scrimLight` once the theme provider lands so modal scrims adapt automatically.
- Extend smoke tests to render the app in both modes once the theme provider exists to guard against missing token references.

### ♿ Manual Accessibility QA
Use these quick checks whenever we touch chip selectors, modals, or other interactive primitives:
- **VoiceOver (iOS):** Enable the Screen Reader, focus the Home/Symptom modal chips, and verify it announces "`<label>`, button, selected`" (or `"not selected"`). Confirm emoji labels are read aloud (e.g., “Tremor” instead of the emoji glyph). Toggle selection and ensure state updates.
- **TalkBack (Android):** Repeat the same checks, paying attention to double-tap activation and swipe navigation order. The chip should respond to double-tap and expose “Selected” in its state announcement.
- **Keyboard / Switch Control:** On devices with external keyboards or switch control, ensure focus order follows the visual layout and chips respond to Enter/Space.
- Record any variance (e.g., emoji-only labels) in the PR and update `components/ui/Chip.js` with fallback `accessibilityLabel` props as needed.

---

This is the autophagy app for https://www.genesis4pd.com/pd-protocols.  Goals of the app are as follows:

Measuring autophagy, particularly in the context of an app for your Genesis Health for Parkinson's Disease business, is challenging because autophagy is a complex cellular process that cannot be directly measured in real-time with consumer-grade technology. However, you can incorporate proxy metrics and user-input data that are scientifically associated with autophagy, especially tailored for Parkinson's patients. Below are the primary methods to estimate or track autophagy in an app, along with considerations for implementation and relevance to Parkinson's disease.
1. Fasting-Based Tracking (Proxy for Autophagy Induction)
How It Works: Autophagy is strongly induced by nutrient deprivation, particularly during prolonged fasting (e.g., intermittent fasting or extended fasting). Studies suggest autophagy ramps up significantly after 16–24 hours of fasting, depending on individual factors.
App Implementation:
Fasting Timer: Allow users to log fasting periods (e.g., 16:8, 18:6, or 24-hour fasts) with start/stop timers.
Fasting Progress Metrics: Display estimated autophagy "windows" based on fasting duration (e.g., "Autophagy likely active after 16 hours").
Custom Reminders: Send notifications to encourage fasting adherence or remind users to break their fast safely, considering Parkinson's medication schedules (e.g., levodopa timing).
Relevance to Parkinson's: Fasting may reduce oxidative stress and promote neuronal health, potentially beneficial for Parkinson's. Ensure users consult healthcare providers, as fasting can affect medication efficacy.
Limitations: Fasting duration is an indirect proxy; actual autophagy levels vary by individual metabolism and health status.
2. Dietary Tracking (Nutrient-Based Proxies)
How It Works: Low carbohydrate or ketogenic diets can induce autophagy by mimicking fasting states through reduced insulin signaling and increased ketone production.
App Implementation:
Food Logging: Users input meals to track macronutrients (carbs, fats, proteins). Use a database like USDA's FoodData Central for nutrient data.
Ketosis Correlation: Combine with ketosis tracking (see below) to estimate autophagy induction, as ketosis is associated with autophagy pathways (e.g., mTOR inhibition).
Parkinson's-Specific Guidance: Suggest foods high in antioxidants (e.g., berries, leafy greens) or ketogenic diets tailored for neurological health, validated by dietitians.
Relevance to Parkinson's: Ketogenic diets show promise in reducing neuroinflammation and improving mitochondrial function, which may benefit Parkinson's patients.
Limitations: Dietary tracking relies on user accuracy and doesn't directly measure autophagy.
3. Ketone Levels as a Proxy
How It Works: Ketosis, induced by fasting or ketogenic diets, correlates with autophagy activation due to metabolic stress. Ketone bodies (beta-hydroxybutyrate, acetoacetate) can be measured via blood, breath, or urine tests.
App Implementation:
Manual Input: Allow users to enter ketone levels from blood meters (e.g., Precision Xtra, Keto-Mojo), breath analyzers, or urine strips.
Device Integration: If feasible, integrate with Bluetooth-enabled ketone meters for seamless data syncing.
Autophagy Estimation: Provide feedback like "Elevated ketones (e.g., >0.5 mmol/L) may indicate autophagy activity" based on research thresholds.
Relevance to Parkinson's: Ketones may provide alternative energy for neurons, potentially alleviating Parkinson's-related mitochondrial dysfunction.
Limitations: Ketone levels are an indirect marker, and not all ketosis states guarantee autophagy. Requires users to own testing devices.
4. Biomarker Tracking (Advanced, User-Input Based)
How It Works: Specific biomarkers associated with autophagy (e.g., LC3-II, p62 levels) can be measured in lab settings, though not practical for home use. Users could input results from medical tests.
App Implementation:
Lab Result Logging: Create fields for users to input lab-measured biomarkers (e.g., from blood tests ordered by a doctor).
Educational Content: Explain biomarkers

We will take inspiration from the following apps in the google play store:
https://play.google.com/store/apps/details?id=com.easyfastapp.app
https://play.google.com/store/apps/details?id=com.mindmypd.app

Images 1 through 4 are screenshots from applications that we want to take inspiration from.

## Genesis4PD Color Palette (from website)
- #b3c7f7 (light blue)
- #8babf1 (medium blue)
- #89ce00 (green)
- #d9e4ff (very light blue)

## Core Symptoms to Log
- Tremor
- Slowed movement (bradykinesia)
- Rigid muscles
- Poor posture and balance
- Loss of automatic movements
- Speech changes
- Writing changes
- Nonmotor symptoms

## 🛣️ Updated Roadmap

### Top Priority (Core Functionality & Accessibility)
- **Onboarding & Profile**
  - Multi-step onboarding: name, address, age, height, weight, email, cell phone, medications, symptoms, 12/24 month goals, start date.
  - Persistent user profile with ability to view/edit all onboarding data.
  - Start date triggers onboarding completion (and, in the future, onboarding email).
- **Fasting-Based Tracking**
  - Fasting timer (start/stop, log periods, see history).
  - Fasting progress metrics (autophagy "windows").
  - Ongoing fast clearly shown on Home.
  - Predefined fasting programs (24h, 36h, 48h, up to 7 days), with progressive unlocking.
  - Schedule and reminders for upcoming fasts.
  - **Accessibility:** Large fonts, high contrast, big touch targets, screen reader support.
- **Dietary/Food Logging**
  - Log meals/snacks with time, notes, and (optionally) macronutrients.
  - Track pounds of animal meat per week and carb meal frequency.
  - Select diet type ("standard" or "animal").
  - Simple, fast entry (floating + button, time picker).
- **Symptom Logging**
  - Log symptoms with type, severity, time, and notes.
  - Associate symptoms with fasting periods.
  - Filter and review symptom history.
- **Logs & Filtering**
  - Unified log view with pill-style filters (All, Food, Symptoms, Fasting).
  - Highlight filtered results, but keep all visible for context.
- **Feedback & Guidance**
  - Friendly empty states ("No logs yet, tap + to add your first!").
  - Success feedback (toast/banner on add/edit/delete).
  - Error handling (user-friendly messages).

### High Value (User Engagement & Medical Relevance)
- **Reminders & Notifications**
  - Custom reminders for fasting, meals, symptoms, or medication.
  - Preparation tips for upcoming fasts.
- **Data Visualization**
  - Simple charts/timelines for fasting, symptoms, and food patterns.
  - Streaks, milestones, or "longest fast" badges.
- **Personalization**
  - Customizable quick actions (if reintroduced).
  - Large text/dark mode toggle in Profile.
- **Medical Safety**
  - Medication logging (optional, with warnings for fasting/med conflicts).
  - Export logs as CSV/PDF for healthcare providers.

### Advanced/Optional (For Future)
- **User Feedback Indicators**
  - In-app prompts for users to log hunger, mood, or other indicators during fasts.
- **Ketone Tracking**
  - Manual input or device integration for ketone levels.
  - Feedback on autophagy likelihood.
- **Biomarker Tracking**
  - Manual input of lab results (for advanced users).
  - Educational content about biomarkers.
- **Offline Support & Sync**
  - Local-first data, sync when online.
- **Theming & Delight**
  - Subtle animations, Genesis4PD color palette, dark/light mode.

### Design & Inspiration
- Take UI/UX inspiration from referenced apps and screenshots (Easy Fast, MindMyPD).
- Use Genesis4PD color palette for branding and comfort.
