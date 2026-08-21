# Copy Conversation

Copy Conversation is a free Chrome extension that lets you copy AI chatbot conversations in a clean question-and-answer format.

It supports both plain text and Markdown, making it easy to save conversations, paste them into notes, share them, or reuse them elsewhere.

## Features

- Copy complete AI conversations in one click
- Formats messages into Question and Answer sections
- Plain-text output
- Markdown output
- Preserves common formatting such as:
  - Headings
  - Bullet lists
  - Numbered lists
  - Links
  - Inline code
  - Code blocks
  - Blockquotes
  - Tables
- Preview the extracted conversation
- Copies the result directly to the clipboard
- No account required
- No subscriptions
- No paid features
- No ads
- No external server required for conversation processing

## Supported AI Providers

| Provider | Status |
| --- | --- |
| ChatGPT | Supported |
| Claude | Supported |
| Gemini | Supported |
| Microsoft Copilot | Supported |

## Example Output

Plain-text mode:

```text
Question: What is a REST API?

Answer: A REST API is an interface that allows applications to communicate over HTTP using standard methods such as GET, POST, PUT, and DELETE.
```

When Markdown mode is enabled, supported formatting from the conversation is preserved.

## Installation

### Install from Source

1. Clone or download this repository.
2. Open Google Chrome.
3. Go to:

```text
chrome://extensions/
```

4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extension folder containing `manifest.json`.
7. Open a supported AI chatbot website.
8. Click the **Copy Conversation** extension icon.
9. Turn Markdown formatting on or off.
10. Click **Copy Conversation**.

The extracted conversation will appear in the preview and will also be copied to your clipboard.

## Project Structure

```text
Extension/
├── css/
│   └── popup.css
├── js/
│   ├── extractor.js
│   └── popup.js
|
│
├── manifest.json
├── popup.html
└── README.md
```

## How It Works

When you click **Copy Conversation**, the extension:

1. Reads the currently active browser tab.
2. Detects the supported AI provider.
3. Extracts user and assistant messages.
4. Converts the conversation into plain text or Markdown.
5. Displays the result in the preview area.
6. Copies the result to your clipboard.

## Permissions

The extension uses the following Chrome permissions:

### `activeTab`

Allows the extension to access the currently active tab after you invoke it.

### `scripting`

Allows the extension to run the local extraction script on the active page.

### `clipboardWrite`

Allows the formatted conversation to be copied to your clipboard.

The extension is designed to request only the permissions needed for its current functionality.

## Privacy

Copy Conversation is designed to process conversation content locally in your browser.

- Conversations are read only when you use the extension.
- Extracted content is processed locally.
- Conversation content is not uploaded to an external server.
- Conversation content is not sold.
- Conversation content is not used for advertising.
- No account is required.

A separate privacy policy should be added before publishing the extension to the Chrome Web Store.

## Development

This extension uses **Chrome Manifest V3**.

The extraction logic is provider-specific because ChatGPT, Claude, Gemini, and Microsoft Copilot use different page structures.

If one of the supported websites changes its interface, the related extraction logic may need to be updated.

## Known Limitations

- AI providers can change their page structure without notice.
- Some advanced interface elements may not convert perfectly to Markdown.
- Only the listed providers are currently supported.
- Content that has not been loaded into the page may not be available to the extension.

## Reporting Issues

If you find a bug, please open a GitHub issue and include:

- AI provider
- Chrome version
- Extension version
- What you expected to happen
- What actually happened
- Whether Markdown mode was enabled

Please avoid posting private or sensitive conversation content in public issues.

## Contributing

Contributions, bug fixes, and improvements are welcome.

For significant changes, consider opening an issue first so the proposed change can be discussed.
---
Built to make AI conversations easier to copy, save, and reuse.
