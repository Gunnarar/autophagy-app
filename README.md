## TODO (Prioritized)

### MVP
- [ ] Meal and fasting logging (UI + local storage)
- [ ] Symptom logging (PD-specific and general)
- [ ] View today's logs and simple progress
- [ ] Generate and email report to coach

### Next
- [ ] Reminders for logging/fasting
- [ ] Data export (CSV/email)
- [ ] Motivational notifications

### Future
- [ ] AI-powered recommendations
- [ ] Cloud sync/user accounts
- [ ] Voice input/accessibility

---

## Project Overview

Genesis4PD is a mobile app to help people with Parkinson's manage health through diet, fasting, and symptom tracking, with a focus on autophagy. The app provides tools for logging, progress tracking, and (in the future) personalized recommendations and reporting.

---

## Features

### MVP
- Log meals and fasting windows
- Log symptoms (motor and non-motor)
- View logs and progress
- Generate/email reports

### Next
- Reminders, data export, notifications

### Future
- AI recommendations, cloud sync, accessibility

---

## Background & References

This app is inspired by scientific research and existing apps for Parkinson's and fasting. See below for detailed rationale and references.

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

## Planned & Requested Features

### Fasting & Tracking
- Total accumulated fasting days per time period (weekly, monthly, yearly)
- Each fast as a "campaign" (track, label, and review individual fasts)
- Workout and movement reminder/tracker
- Monthly reporting metric (summarize fasting, symptoms, etc., and email to user based on circadian inputs)

### Symptom & Health Management
- Medication tracking (log, remind, and review medication use)
- Demedication tracking (track reduction or changes in medication)
- Symptom/mood trends visualization (charts, graphs, correlations)
- Facial expressions exercises (guided or suggested routines)

### Lifestyle & Environment
- Tips related to person's environment (e.g., "less furniture for more space at home," safety, accessibility, etc.)
- Diet plan (personalized or preset plans, with reminders and logging)
- Educational content (articles, videos, tips for PD, fasting, movement, etc.)

### Data & Reporting
- Export/share logs (CSV, PDF, email to self or provider)
- Monthly/periodic reports (auto-generated, optionally emailed)

### Reminders & Motivation
- Motivational notifications (at milestones, achievements, etc.)
- Customizable reminders (for all tracked activities)

### Accessibility & Usability
- Voice input for logging
- Dynamic font size and color contrast settings

### Account & Sync (Optional)
- User accounts/cloud sync (backup, multi-device support)