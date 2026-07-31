# Contributing to KeyFlow

Thanks for helping improve KeyFlow.

## Before you start

- Search existing issues before opening a new one.
- Use a focused issue for substantial behavior or design changes.
- Do not include secrets, production data, or personal training records.
- Keep changes aligned with KeyFlow's restrained, training-first design.

## Local setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Cloud credentials are optional. Use a disposable development project if you
test Supabase integration.

## Development guidelines

- Keep typing-engine work independent from visual rendering where possible.
- Do not add animation that can delay or block keyboard input.
- Respect `prefers-reduced-motion` and the in-app motion setting.
- Preserve light, dark, high-contrast, and responsive behavior.
- Add or update tests for calculation and state changes.
- Avoid introducing a dependency when a small local implementation is enough.
- Do not copy third-party components without confirming redistribution terms
  and adding the required notice.

## Validate your change

```bash
npm test
npm run build
```

## Pull requests

Keep each pull request scoped to one outcome. Include:

- What changed and why
- User-facing impact
- Screenshots or recordings for visual changes
- Tests performed
- Accessibility and performance considerations
- Any new third-party code or assets and their licenses

By contributing, you agree that your contribution may be distributed under
the repository's MIT License, except where you explicitly identify compatible
third-party material.
