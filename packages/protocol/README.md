# @open-with-local-ide/protocol

Native Messaging contract shared by the extension and the native host. Both apps depend on this
package; they never import from each other.

```text
src/
├─ index.ts                     public entrypoint
├─ version.ts                   PROTOCOL_VERSION
├─ errors.ts                    NativeHostErrorCode
├─ schemas.ts                   request envelope and error response schemas
└─ actions/
   ├─ open-in-ide.ts            openInIde request / success response
   └─ scan-repositories.ts      scanRepositories request / success response
```

```ts
import {
  NativeHostErrorCode,
  openInIdeRequestSchema,
  type OpenInIdeRequest,
} from '@open-with-local-ide/protocol'
```

## Rules

- zod schemas are the single source of truth. TypeScript types are inferred from them; do not
  declare parallel hand-written types or guards.
- The native host validates requests with the request schemas. The extension validates native host
  responses with the response schemas.
- Request schemas are strict (unknown fields are rejected). Response schemas are not strict, so
  an extension tolerates new optional response fields.
- `protocolVersion` is transport metadata, not part of action schemas. The extension's Native
  Messaging client adds it; the native host checks and strips it before dispatch.
- Increment `PROTOCOL_VERSION` when a change breaks compatibility between extension and native host
  builds.
- Only the package root is public. Deep imports into `src/` are not allowed.
- Keep this package runtime-neutral: no Node.js APIs, no Browser APIs, no filesystem, process, or
  installer logic, and no UI text. ESLint enforces this.
- Keep `"sideEffects": false` in `package.json`, so bundles that only need constants do not pull
  in zod.

## How it is consumed

- The extension (Vite/WXT, `vue-tsc`) resolves the `source` export condition and uses
  `src/index.ts` directly, so no build step is needed during extension development.
- The native host (Node.js, `tsc`) uses the compiled `dist/` output. `apps/native-host` builds with
  `tsc -b`, which builds this package first through a project reference.
