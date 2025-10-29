# Repository Guidelines

## Project Structure & Module Organization
The entry point lives in `App.js`, where navigation stacks and global providers are composed. Feature UI sits in `screens/` (e.g., `HomeScreen`, `LogsScreen`), while shareable widgets belong in `components/`. Persistent state lives in `contexts/`, and cross-cutting helpers such as `theme` and `constants` sit under `utils/`. Static images and icons reside in `assets/`.

## Build, Test, and Development Commands
- `npm install` (or `npm ci` inside CI) restores dependencies.
- `npm start` launches the Expo development server with QR code pairing.
- `npm run android|ios|web` opens platform-specific simulators or a browser build.
- `npm test` runs the Jest suite headlessly; CI invokes this with `--ci --runInBand`.
- `npm run eas:build:dev|preview|production` and `npm run eas:submit` wrap the common EAS commands for internal and store releases.
Use `EXPO_DEBUG=true` when diagnosing build issues, and prefer `npx expo start --clear` after dependency upgrades.

## Coding Style & Naming Conventions
Follow the existing React Native style: functional components, hooks for state, and `StyleSheet.create` for styles. Indent with two spaces, keep lines under 100 characters, and prefer single quotes except when template literals are required. Name screens with the `*Screen.js` suffix, context providers as `*Context.js`, and reusable elements with PascalCase. Inline styles are prohibited—always create a StyleSheet entry. Favor the shared primitives in `components/ui` (Card, Button, Chip, etc.) so new work inherits the Figma visual system; the Chip exposes `size="lg"` and `contentStyle` overrides for selector grids. Use `theme.overlay.scrim` / `theme.overlay.scrimLight` for modal scrims instead of raw rgba values. Run `npx expo-doctor` before committing when you touch configuration.

## Testing Guidelines
Jest with `@testing-library/react-native` is configured; keep fast-running tests colocated as `ComponentName.test.js` or inside `__tests__/`. Focus on user-visible behavior and edge cases around fasting timers and logging summaries, and capture any manual smoke notes in the PR. A render smoke test lives in `__tests__/AppRender.test.js`; add similar coverage when introducing new screens or global providers. Shared primitives such as `Chip` have unit coverage—mirror that pattern for new UI building blocks. Keep coverage focused—UI regressions are prioritized over 100% coverage.

## Commit & Pull Request Guidelines
Commit messages in this repo use short, imperative summaries (example: `update meal logging`). Group related changes together and avoid bundling unrelated refactors. Pull requests should include: a concise description of user-facing impact, relevant screenshots or screen recordings for UI updates, reproduction or test notes, and links to tracked issues. Request review from the domain lead before merging and confirm Expo build status if the change touches native modules.

## CI & Expo Workflows
GitHub Actions run `npm ci` and `npm test` on every push and pull request (`.github/workflows/test.yml`). The `Expo EAS Build` workflow is triggered manually once `EXPO_TOKEN` is stored as a repository secret. For local release builds, authenticate with `eas login` and reuse the profiles defined in `eas.json`.
