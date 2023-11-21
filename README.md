# Pastedeno

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/j3lte/pastedeno?style=for-the-badge)](https://github.com/j3lte/pastedeno/releases/latest "GitHub release (latest by date)")
[![NPM Version](https://img.shields.io/npm/v/pastedeno?style=for-the-badge)](https://www.npmjs.com/package/pastedeno "NPM Version")
[![GitHub Release Date](https://img.shields.io/github/release-date/j3lte/pastedeno?style=for-the-badge)](https://github.com/j3lte/pastedeno/releases/latest "GitHub Release Date")
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/j3lte/pastedeno?style=for-the-badge)
[![GitHub](https://img.shields.io/github/license/j3lte/pastedeno?style=for-the-badge)](https://github.com/j3lte/pastedeno/blob/main/LICENSE "GitHub License")
[![GitHub last commit](https://img.shields.io/github/last-commit/j3lte/pastedeno?style=for-the-badge)](https://github.com/j3lte/pastedeno/commits/main "GitHub last commit")
[![GitHub issues](https://img.shields.io/github/issues/j3lte/pastedeno?style=for-the-badge)](https://github.com/j3lte/pastedeno/issues "Github Issues")
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/j3lte/pastedeno/test.yml?branch=main&style=for-the-badge)](https://github.com/j3lte/pastedeno/actions/workflows/test.yml "GitHub Workflow Status")
[![Codecov](https://img.shields.io/codecov/c/github/j3lte/pastedeno?style=for-the-badge&token=RxcUQ1dItw)](https://codecov.io/gh/j3lte/pastedeno "Codecov")
[![Deno docs](https://img.shields.io/badge/Deno-Docs-blue?style=for-the-badge)](https://doc.deno.land/https/deno.land/x/pastedeno/mod.ts "Deno docs")

Pastebin Client for Deno/Node

> This is a fork of [pastebin-ts](https://github.com/j3lte/pastebin-ts), which is updated to work with both Deno and Node

## Capabilities

- Create a new paste (with optional title, format, privacy and expiration)
- Get a paste (raw)
- Delete a paste
- Get user info
- Get user pastes

## API

API Docs can be found on Deno Docs: [https://deno.land/x/pastedeno/mod.ts](https://deno.land/x/pastedeno/mod.ts)

## Usage

```ts
import { Pastebin, PrivacyLevel, ExpirationTime } from "https://deno.land/x/pastedeno/mod.ts";

// Create a new Pastebin instance
const pastebin = new Pastebin({
  api_dev_key: "<YOUR API DEV KEY>",
  api_user_name: "<YOUR USERNAME>",
  api_user_password: "<YOUR PASSWORD>",
})

// Create a new paste
const paste = await pastebin.createPaste({
    code: "console.log('Hello World!')",
    title: "Hello World",
    format: "javascript",
    privacy: PrivacyLevel.PRIVATE,
    expiration: ExpirationTime.ONE_DAY
});

// paste will contain the paste url

// Get the raw paste (either use the paste url or the paste id)
const raw = await pastebin.getPaste('https://pastebin.com/XXXXXXXX');

// Get the raw private paste
const rawPrivate = await pastebin.getPaste('https://pastebin.com/XXXXXXXX', true);

// Delete the paste
await pastebin.deletePaste('<paste id>');

// get user info
...
```

## License

[MIT](LICENSE)

---

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/j3lte)
