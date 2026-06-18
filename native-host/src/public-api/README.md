# Native Host Public API

This directory is the stable browser-safe API consumed by the extension.

The only public entrypoint is `index.ts`. Extension code must import it through the `@native-protocol` alias only:

```ts
import { NativeHostErrorCode } from '@native-protocol'
```

Native host source must import it through `#native-protocol`.

Do not deep-import files from this directory outside the public API implementation. Keep exported modules limited to Native Messaging protocol types, constants, schemas, and error codes that are safe to bundle in the browser extension.
