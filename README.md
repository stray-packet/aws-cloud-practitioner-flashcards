# AWS Study

An Anki-inspired progressive web app for studying AWS certifications with versioned knowledge, reviewed flashcards, FSRS scheduling, exam practice, optional Firebase sync, and Anki export.

Daily Review enforces one new-card allowance across the entire local calendar day. Custom Study can be scoped by individual Gemini chat, CLF-C02 exam domain, or topic; sessions can contain 10, 20, 50, or every matching card in scheduled or randomized order. After revealing an answer, the four Anki-style ratings preview their next FSRS interval before saving the review.

## Local development

Requirements: Node.js 24+ and npm.

```bash
npm install
npm run content:build
npm run dev
```

The app works without Firebase and saves progress in the browser. Copy `.env.example` to `.env.local` and add the Firebase Web App values to enable Google sign-in and Firestore sync.

## Content commands

```bash
npm run content:validate
npm run export:anki
npm test
npm run build
```

The generated Anki import is `exports/anki/aws-cloud-practitioner.tsv`. Import it as UTF-8 with HTML enabled. The first field is a stable note ID used for updates.

## Daily workflow

1. Run `prompts/gemini-daily-report.txt` in the completed Gemini study chat.
2. Save the report under `knowledge/inbox/`.
3. Review and normalize it into `knowledge/daily/`.
4. Keep unstudied suggestions in `knowledge/gaps/`.
5. Review generated cards in `flashcards/drafts/` before moving approved cards into `flashcards/approved/`.

Each approved card includes a stable `sourceChat` label. This keeps cards traceable to a particular chat even when multiple chats share the same study date. The seven reports from 2026-08-28 and the report from 2026-09-01 are exposed as eight distinct chats.

See `docs/PROJECT_CONTEXT.md` for the full content contract and `docs/UI_RESEARCH.md` for the visual guardrails.

## GitHub Pages

The included workflow tests and deploys the app after pushes to `main`. In the repository settings, select **GitHub Actions** as the Pages source. The build base path is already configured for `stray-packet/aws-cloud-practitioner-flashcards`.

## Firebase setup

1. Create a Firebase project and Web App.
2. Enable Google in Authentication → Sign-in method.
3. Create a Cloud Firestore Standard database.
4. Deploy `firestore.rules`.
5. Add the GitHub Pages hostname to Authentication → Authorized domains.
6. Supply the four `VITE_FIREBASE_*` values at build time.
