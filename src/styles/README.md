Centralized styles for the app

- `tokens.css` contains CSS variables (design tokens). Keep this as the single source of truth for colors, spacing, and typography tokens.
- `global.css` imports `tokens.css` and provides app-level resets and small helpers.

Migration guidance:
- Replace feature-level duplicated variables with tokens from `tokens.css`.
- Import `src/styles/global.css` once at app entry (e.g. `src/main.tsx`).
