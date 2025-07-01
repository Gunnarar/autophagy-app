# autophagy-app

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