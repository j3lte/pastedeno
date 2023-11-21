# Pastedeno

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
