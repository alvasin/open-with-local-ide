# Open With Local IDE

Browser extension + Native Messaging Host for opening GitHub files in a local IDE.

MVP scope:

- Git provider: GitHub
- IDE: VS Code
- Browser: Chrome / Chromium
- Extension: WXT + Vue + TypeScript
- Native host: Node.js + Chrome Native Messaging

## Repository Layout

npm workspace: applications in `apps/`, shared libraries in `packages/`.

```text
apps/extension/       Chrome extension (WXT + Vue)
apps/native-host/     Native Messaging host (Node.js)
packages/protocol/    @open-with-local-ide/protocol — message contract (zod schemas, error codes, version)
```

Install dependencies once from the repository root:

```bash
npm install
```

## Install Extension

Build the extension:

```bash
npm run build -w apps/extension
```

Open Chrome extensions page:

```text
chrome://extensions
```

Then:

1. Enable `Developer mode`.
2. Click `Load unpacked`.
3. Select:

```text
apps/extension/.output/chrome-mv3
```

After loading the extension, copy its `Extension ID`. It is required for native host installation.

## Install Native Host

Build the native host (after `npm install` in the repository root):

```bash
cd apps/native-host
npm run build
```

Register the native host for your installed extension:

```bash
node install-host.js <EXTENSION_ID>
```

Example:

```bash
node install-host.js abcdefghijklmnopqrstuvwxyzabcdef
```

The installer creates the Chrome Native Messaging manifest for host:

```text
com.local.repo_ide_opener
```

## Uninstall Native Host

Remove the registered native host manifest:

```bash
cd apps/native-host
node uninstall-host.js
```

## Configure Repository Mapping

Open the extension options page and either add a mapping manually:

```text
github.com/org/repo -> /absolute/path/to/local/repo
```

Windows example:

```text
github.com/org/repo -> C:\Users\me\projects\repo
```

Or add an absolute path under **Repository scan folders** and click **Scan**. Scanning is
manual and limited to the selected folder. The native host reads local Git metadata and imports
repositories that have supported GitHub remotes.

The MVP does not include a system folder picker. Enter the absolute folder path manually.

VS Code command defaults to:

```text
code
```

If needed, set an absolute command path, for example:

```text
C:\Users\<user>\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd
```

## Manual Test

1. Open a GitHub file page:

```text
https://github.com/org/repo/blob/main/src/index.ts#L42
```

2. Click the extension popup.
3. Confirm that the file, repo key, file path, line, and IDE are detected.
4. Click `Open with VS Code`.

Expected result:

```text
VS Code opens the local file at the selected line.
```

## Notes

- The extension talks to the native host via `chrome.runtime.sendNativeMessage`.
- The extension and the native host share the message contract through the `@open-with-local-ide/protocol` package. The apps never import from each other.
- Every request carries a protocol version. If the extension and the native host were built from different protocol versions, the extension shows a version mismatch error: rebuild and reinstall the native host.
- The extension does not start local programs directly.
- The native host validates paths before opening files.
- `filePath` must stay inside the configured `repoPath`.
