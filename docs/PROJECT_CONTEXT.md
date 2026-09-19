# Project context

AWS Study is a public, English-language flashcard PWA for AWS certifications. The initial certification is AWS Certified Cloud Practitioner (CLF-C02); the content model is intentionally certification-aware so Solutions Architect can be added later.

## Content workflow

1. Run `prompts/gemini-daily-report.txt` at the end of a study chat.
2. Save the Markdown output to `knowledge/inbox/YYYY-MM-DD-gemini.md`.
3. Produce a reviewed daily note in `knowledge/daily/`.
4. Record adjacent but unstudied topics in `knowledge/gaps/`.
5. Generate cards in `flashcards/drafts/`; only user-approved cards move to `flashcards/approved/`. Explicit delegated approval permits reviewed material to be written directly to approved.
6. Run `npm run content:build` and `npm run export:anki`.

Approved cards carry both `studyDate` and `sourceChat`. Reports that happen on the same date remain distinct chats. The `collection` field distinguishes genuinely studied chat material from approved `extra` cards added by the official coverage audit. Daily Review enforces the configured new-card allowance across the whole local calendar day; Custom Study supports 10/20/50/all matching cards filtered by collection, chat, exam domain, and topic. Random ordering is the default; scheduled ordering remains available.

Card answers should be concise and understandable without sacrificing accuracy. Use `explanation` for the why and the required `example` for a concrete, memorable real-world situation; every approved card and visual service entry carries all three layers, and the UI and Anki export render them. Placeholder examples that merely restate an exam cue are rejected during the content build.

Review mode is bilingual. Every approved card must have a complete static Spanish translation, while AWS product names remain in their official English form. The question information control offers type-specific beginner guidance without exposing the answer.

Potential gaps never count as studied and never enter the review queue without approval. Once the user delegates approval, official exam gaps may be promoted into the Extra collection with a clearly named audit source.

## Product rules

- Daily Review uses FSRS and self-ratings. Exam Practice records separate correctness metrics and does not change FSRS state.
- A repeated Daily Review card must be due according to FSRS; Custom Study may intentionally include future-scheduled cards and labels them as scheduled practice.
- Again, Hard, and Good learning steps due within 30 minutes are kept in the active session. A due repetition jumps ahead of untouched cards; a future repetition waits while untouched cards remain. If only future learning steps remain, show an exact countdown instead of displaying a card early. Easy always leaves the active session.
- The AWS services view is a visual-recognition deck with locally stored official icons, multiple cross-cutting categories, and an explicit official/supplementary scope filter.
- Local mode autosaves in browser storage and supports portable JSON export and import.
- The public repository contains only curated study material, never raw personal chats or secrets.
- Firebase is optional at runtime. Without its environment variables the app must remain fully usable in local mode.
- Preserve the Anki-inspired visual rules in `docs/UI_RESEARCH.md`.
