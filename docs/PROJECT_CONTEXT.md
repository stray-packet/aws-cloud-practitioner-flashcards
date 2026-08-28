# Project context

AWS Study is a public, English-language flashcard PWA for AWS certifications. The initial certification is AWS Certified Cloud Practitioner (CLF-C02); the content model is intentionally certification-aware so Solutions Architect can be added later.

## Content workflow

1. Run `prompts/gemini-daily-report.txt` at the end of a study chat.
2. Save the Markdown output to `knowledge/inbox/YYYY-MM-DD-gemini.md`.
3. Produce a reviewed daily note in `knowledge/daily/`.
4. Record adjacent but unstudied topics in `knowledge/gaps/`.
5. Generate cards in `flashcards/drafts/`; only user-approved cards move to `flashcards/approved/`.
6. Run `npm run content:build` and `npm run export:anki`.

Potential gaps never count as studied and never enter the review queue without approval.

## Product rules

- Daily Review uses FSRS and self-ratings. Exam Practice records separate correctness metrics and does not change FSRS state.
- The public repository contains only curated study material, never raw personal chats or secrets.
- Firebase is optional at runtime. Without its environment variables the app must remain fully usable in local mode.
- Preserve the Anki-inspired visual rules in `docs/UI_RESEARCH.md`.
