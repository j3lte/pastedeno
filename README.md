# PasteDeno

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

<p align="center">
    <img src="https://raw.githubusercontent.com/j3lte/pastedeno/main/assets/logo.png">
</p>

> This is a continuation of [pastebin-ts](https://github.com/j3lte/pastebin-ts) and its predecessor [pastebin-js](https://github.com/j3lte/pastebin-js). The main difference between Pastedeno and its predecessors is that it is completely rewritten and uses less dependencies (and up-to-date ones). Alongside the Deno version a Node version is automatically published to NPM.

## Capabilities

### Pastebin API
- Create a new paste (with optional title, format, privacy and expiration)
- Get a paste (raw)
- Delete a paste
- Get user info
- Get user pastes

### Scraper [(PRO only)](https://pastebin.com/doc_scraping_api)
- Scrape latest pastes
- Get raw paste
- Get paste metadata

## Packages used

For the Deno version the following packages are used:
- [xml](https://deno.land/x/xml) (for parsing XML) ([MIT License](https://github.com/lowlighter/xml/blob/main/LICENSE))
- [evt](https://deno.land/x/evt) (for event handling in Scraper) ([MIT License](https://github.com/garronej/evt/blob/main/LICENSE))

For the Node version the following packages are used:
- [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser) (for parsing XML) ([MIT License](https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/LICENSE))
- [evt](https://www.npmjs.com/package/evt) (for event handling in Scraper) ([MIT License](https://github.com/garronej/evt/blob/main/LICENSE))
- [node-fetch](https://www.npmjs.com/package/node-fetch) (for fetching data) ([MIT License](https://github.com/node-fetch/node-fetch/blob/main/LICENSE.md))

## API

API Docs can be found on Deno Docs: [https://deno.land/x/pastedeno/mod.ts](https://deno.land/x/pastedeno/mod.ts)

## Installation

### Deno

```ts
import { Pastebin } from "https://deno.land/x/pastedeno/mod.ts";
```

### Node

Run `npm install pastedeno` or `yarn add pastedeno`

```ts
import { Pastebin } from "pastedeno";
```

## Usage

### Pastebin API

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
// paste = 'https://pastebin.com/XXXXXXXX'

// Get the raw paste (either use the paste url or the paste id)
const raw = await pastebin.getPaste('https://pastebin.com/XXXXXXXX');

// Get the raw private paste
const rawPrivate = await pastebin.getPaste('https://pastebin.com/XXXXXXXX', true);

// Delete the paste
await pastebin.deletePaste('<paste id>');

// Get user info
const userInfo = await pastebin.getUserInfo();

// Get user pastes
const userPastes = await pastebin.listUserPastes();

// Set debug mode
pastebin.setDebug(true);
```

### Scraper [(PRO only)](https://pastebin.com/doc_scraping_api)

```ts
import { Scraper } from "https://deno.land/x/pastedeno/mod.ts";

const scraper = new Scraper({
  intervalTime: 5000,
  limit: 10,
});

scraper.on("scrape", (data) => {
  console.table(data);
});

scraper.on("new", (data) => {
  console.log(`New paste: ${data.key}`);
});

scraper.on("error", (error) => {
  console.error(error);
});

scraper.start();
```

## License

[MIT](LICENSE)

---

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/j3lte)
