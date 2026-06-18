# Native Protocol

This directory contains browser-safe Native Messaging protocol modules used by the native host public API.

Files outside `native-host` must not import from this directory directly. The stable public entrypoint is:

```ts
import { NativeHostErrorCode } from '@native-protocol'
```

Keep this API safe for extension consumption:

- no Node.js APIs;
- no Browser APIs;
- no filesystem, process, or installer logic;
- no UI text or localization.
