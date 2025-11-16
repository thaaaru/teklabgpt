# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router workspace. Core UI flows live in `src/app/page.tsx`, layout plus globals in `src/app/layout.tsx` and `src/app/globals.css`. Feature widgets belong in `src/components/*` (ChatInput, Sidebar, Settings, etc.), persistent helpers in `src/lib/storage.ts`, and shared contracts in `src/types/index.ts`. Static assets reside in `public/`. Keep `teklab-ui/` for design experiments only and port stable utilities back into `src/` via small, isolated commits.

## Build, Test, and Development Commands
- `npm run dev` — hot-reload server at http://localhost:3000.
- `npm run build` — creates the production bundle and performs type + lint checks.
- `npm run start` — serves the optimized output; mirrors deployment behavior.
- `npm run lint` — runs `next lint`; treat warnings as blockers.

## Coding Style & Naming Conventions
Use TypeScript, React function components, and 2-space indentation. Components and files are PascalCase (e.g., `ChatMessage.tsx`), hooks/utilities camelCase (`useSidebarState`, `handleSend`). Extract data-layer helpers into `src/lib`, and keep shared enums or provider definitions in `src/types` to avoid prop-drilling strings. Tailwind utilities plus the tokens defined in `globals.css` are the default styling tool; inline styles should only cover dynamic sizing. Favor descriptive props over booleans and keep local state minimal by lifting it to parent components when shared.

## Testing Guidelines
Automated tests are not yet wired up, so always pair `npm run lint` with manual smoke checks in `npm run dev` before pushing. When you add tests, use React Testing Library for component logic (`src/__tests__/Component.test.tsx`) and Playwright for end-to-end flows (`e2e/`). Target 80% coverage on new modules and document any gaps directly in the PR description so reviewers know what was exercised.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat: sidebar filters`, `fix: storage hydration`) and keep each change focused. PRs must summarize intent, list validation steps (`npm run lint`, `npm run build`, manual scenario), and attach screenshots or clips for UI updates. Note any configuration or dependency adjustments, especially those touching API key handling. Request review before merging; we rely on peer review in place of CI while the project is young.

## Configuration & Security Tips
API keys are injected through the in-app Settings modal and persisted via `src/lib/storage.ts`; never ship them in code or logs. Keep `.env*` files ignored, double-check new dependencies for browser-storage access, and mirror any Tailwind token changes across `tailwind.config.ts` and `globals.css` to avoid drift.
