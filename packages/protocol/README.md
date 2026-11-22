# @open-with-local-ide/protocol

Native Messaging contract shared by the extension and the native host: request and response
types, error codes, and other protocol constants.

Both apps depend on this package; they never import from each other.

```ts
import { NativeHostErrorCode, type OpenInIdeRequest } from '@open-with-local-ide/protocol'
```

Only the package root is public. Deep imports into `src/` are not allowed.

Keep this package safe for both runtimes:

- no Node.js APIs;
- no Browser APIs;
- no filesystem, process, or installer logic;
- no UI text or localization.

ESLint enforces these boundaries.

## How it is consumed

- The extension (Vite/WXT, `vue-tsc`) resolves the `source` export condition and uses
  `src/index.ts` directly, so no build step is needed during extension development.
- The native host (Node.js, `tsc`) uses the compiled `dist/` output. `apps/native-host` builds with
  `tsc -b`, which builds this package first through a project reference.
