# Open With Local IDE

Browser extension + Native Messaging Host for opening GitHub files in a local IDE.

MVP scope:

- Git provider: GitHub
- IDE: VS Code
- Browser: Chrome / Chromium
- Extension: WXT + Vue + TypeScript
- Native host: Node.js + Chrome Native Messaging

## Install Extension

Install dependencies and build the extension:

```bash
cd extension
npm install
npm run build
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
extension/.output/chrome-mv3
```

After loading the extension, copy its `Extension ID`. It is required for native host installation.

## Install Native Host

Install dependencies and build the native host:

```bash
cd native-host
npm install
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
cd native-host
node uninstall-host.js
```

## Configure Repository Mapping

Open the extension options page and add a mapping:

```text
github.com/org/repo -> /absolute/path/to/local/repo
```

Windows example:

```text
github.com/org/repo -> C:\Users\me\projects\repo
```

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
- The extension consumes the native host's stable browser-safe protocol API through `native-host/src/public-api/index.ts` via the `@native-protocol` alias. Deep imports from `native-host/src` are intentionally forbidden.
- The extension does not start local programs directly.
- The native host validates paths before opening files.
- `filePath` must stay inside the configured `repoPath`.
