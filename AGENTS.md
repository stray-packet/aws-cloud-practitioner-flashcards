# Working agreement for coding agents

- Read `docs/PROJECT_CONTEXT.md` and `docs/UI_RESEARCH.md` before changing behavior or UI.
- Treat `flashcards/approved/` as the canonical published card source; do not hand-edit `src/data/generated-cards.json`.
- Never promote gaps or drafts without explicit user approval.
- Preserve stable card IDs because they own scheduling history.
- Run `npm run content:validate`, `npm test`, `npm run build`, and `npm run export:anki` after relevant changes.
- Keep Firebase optional and never commit `.env` or private credentials.
- Avoid gradients, glassmorphism, decorative AI imagery, generic dashboards, and gratuitous component restyling.
