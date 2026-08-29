<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## localStorage Schema Versioning

All user settings are persisted under `pricepermile_*` keys in `localStorage` via the `useLocalStorage` hook (`packages/frontend/src/hooks/useLocalStorage.ts`).

A schema version guard lives at the top of `packages/frontend/src/app/page.tsx`:

```ts
const STORAGE_SCHEMA_VERSION = "1";
```

On every page load (client-side, before any `useLocalStorage` initialiser runs) the stored version is compared to `STORAGE_SCHEMA_VERSION`. If they differ — i.e. the user has stale data from an older app version — **all `pricepermile_*` keys are removed** and the new version is written. This forces the onboarding wizard to re-run with clean defaults, preventing unresponsive UI caused by incompatible stored values.

**Rule for agents:** whenever you change the shape or meaning of any stored key (add, remove, rename a key, or change the type/format of a value), increment `STORAGE_SCHEMA_VERSION` by 1. Do not skip this step — failing to bump the version leaves existing users in a broken state.
