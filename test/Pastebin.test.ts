import {
  assertEquals,
  assertRejects,
  assertThrows,
  MockFetch,
  resolvesNext,
  stub,
} from "../dev_deps.ts";
import { ExpirationTime, IPastebinOptions, Pastebin, PrivacyLevel } from "../mod.ts";

// We're mocking Pastebin with a timeout of 0, so we don't introduce unwanted timeouts
class TestPastebin extends Pastebin {
  requestTimeout = 0;
}

const defaultOptions: IPastebinOptions = {
  api_dev_key: "test",
  api_user_name: "User",
  api_user_password: "Password",
};

Deno.test("Pastebin", async (t) => {
  const mf = new MockFetch();

  const setKeyReturn = () =>
    mf.intercept("https://pastebin.com/api/api_login.php", {
      method: "POST",
    }).response("12345678901234567890123456789012");

  // // Not working yet
  // await t.step("getPaste - timeout", async () => {
  //   class DelayPastebin extends Pastebin {
  //     requestTimeout = 500;
  //   }

  //   mf.intercept("https://pastebin.com/raw.php?i=test2").response("Hello World!").delay(1000);

  //   assertRejects(
  //     () => {
  //       const pastebin = new DelayPastebin(defaultOptions);
  //       return pastebin.getPaste("https://pastebin.com/test2").then((res) => {
  //         console.log(res);
  //       }).catch((err) => {
  //         console.log(err);
  //       });
  //     },
  //     Error,
  //     "Request timed out",
  //   );
  // });

  await t.step("getPaste - anonymous (with debug)", async () => {
    const pastebin = new TestPastebin({
      debug: true,
    });

    mf.intercept("https://pastebin.com/raw.php?i=7EAT0yPS").response("Hello World!").times(2);

    const paste1 = await pastebin.getPaste("https://pastebin.com/7EAT0yPS");
    const paste2 = await pastebin.getPaste("7EAT0yPS");

    assertEquals(pastebin.debug, true, "debug should be set");
    pastebin.setDebug(false);
    assertEquals(pastebin.debug, false, "debug should be set");

    assertEquals(paste1, "Hello World!", "paste with url should return Hello World!");
    assertEquals(paste2, "Hello World!", "paste with id should return Hello World!");
  });

  await t.step("getPaste - user", async () => {
    const pastebin = new TestPastebin(defaultOptions);

    mf.intercept("https://pastebin.com/api/api_raw.php", {
      method: "POST",
    }).response("Hello World!").times(2);

    // Mimick a too small key
    mf.intercept("https://pastebin.com/api/api_login.php", {
      method: "POST",
    }).response("too_small_key");

    assertRejects(
      () => pastebin.getPaste("https://pastebin.com/test", true),
    );

    setKeyReturn();

    const paste1 = await pastebin.getPaste("https://pastebin.com/testid", true);
    assertEquals(
      pastebin.config.api_user_key,
      "12345678901234567890123456789012",
      "api_user_key should be set",
    );
    assertEquals(paste1, "Hello World!", "paste with url should return Hello World!");

    const paste2 = await pastebin.getPaste("testid", true);
    assertEquals(paste2, "Hello World!", "paste with id should return Hello World!");
  });

  await t.step("getPaste - errors", () => {
    const pastebin = new Pastebin("<USER_KEY>");

    assertRejects(
      () => pastebin.getPaste(""),
      Error,
      "Invalid paste url or id",
    );

    assertRejects(
      () => pastebin.getPaste("https://pastebin.com/test", true),
      Error,
    );
  });

  await t.step("createPaste - anonymous", async () => {
    const pastebinWithoutKey = new TestPastebin();
    const pastebinWithKey = new TestPastebin("DEV_KEY");

    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response("https://pastebin.com/test");

    assertRejects(
      // @ts-ignore - Testing invalid options
      () => pastebinWithoutKey.createPaste(),
    );

    assertRejects(
      // @ts-ignore - Testing invalid options
      () => pastebinWithKey.createPaste(),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          text: "",
        }),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          // @ts-ignore - Testing invalid options
          text: 1,
        }),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          text: "valid",
          expiration: "invalid",
        }),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          text: "valid",
          expiration: "invalid",
        }),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          text: "valid",
          format: "invalid",
        }),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          text: "valid",
          privacy: PrivacyLevel.PRIVATE,
        }),
    );

    assertRejects(
      () =>
        pastebinWithKey.createPaste({
          text: "valid",
          privacy: -1,
        }),
    );

    const paste = await pastebinWithKey.createPaste({
      text: "Hello World!",
      title: "Hello World",
      format: "apache",
      expiration: ExpirationTime.ONE_DAY,
    });

    assertEquals(paste, "https://pastebin.com/test", "paste should return url");
  });

  await t.step("createPaste - user", async () => {
    const pastebin = new TestPastebin(defaultOptions);

    setKeyReturn();
    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response("https://pastebin.com/test");

    const paste = await pastebin.createPaste({
      text: "Hello World!",
      title: "Hello World",
      format: "apache",
      expiration: ExpirationTime.ONE_DAY,
    });

    assertEquals(paste, "https://pastebin.com/test", "paste should return url");
  });

  await t.step("createPasteFromFile", async () => {
    const stubReadFile = stub(
      Deno,
      "readTextFile",
      resolvesNext([
        "Hellow world",
        "",
        Promise.reject(new Error("Error reading file!")),
      ]),
    );
    const pastebin = new TestPastebin(defaultOptions);
    const pastebinWithoutKey = new TestPastebin();

    assertRejects(
      () => pastebinWithoutKey.createPasteFromFile(),
    );

    setKeyReturn();
    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response("https://pastebin.com/test").times(2);

    const paste1 = await pastebin.createPasteFromFile({
      file: new Uint8Array(8).fill(0),
      title: "Hello World",
      format: "apache",
      expiration: ExpirationTime.ONE_DAY,
    });

    const paste2 = await pastebin.createPasteFromFile({
      file: "./test.txt",
      title: "Hello World",
      format: "apache",
      expiration: ExpirationTime.ONE_DAY,
    });

    assertRejects(
      () =>
        pastebin.createPasteFromFile({
          file: new Uint8Array(0),
          title: "Hello World",
          format: "apache",
          expiration: ExpirationTime.ONE_DAY,
        }),
    );

    assertRejects(
      () =>
        pastebin.createPasteFromFile({
          file: "./empty.txt",
          title: "Hello World",
          format: "apache",
          expiration: ExpirationTime.ONE_DAY,
        }),
    );

    assertRejects(
      () =>
        pastebin.createPasteFromFile({
          file: "./empty.txt",
          title: "Hello World",
          format: "apache",
          expiration: ExpirationTime.ONE_DAY,
        }),
    );

    assertEquals(paste1, "https://pastebin.com/test", "paste should return url");
    assertEquals(paste2, "https://pastebin.com/test", "paste should return url");

    stubReadFile.restore();
  });

  await t.step("deletePaste", async () => {
    const pastebin = new TestPastebin(defaultOptions);
    const pastebinWithoutKey = new TestPastebin();
    const pastebinWithoutKey2 = new TestPastebin({ api_dev_key: "test" });

    assertRejects(
      () => pastebinWithoutKey.deletePaste("test"),
    );

    assertRejects(
      () => pastebinWithoutKey2.deletePaste("test"),
    );

    setKeyReturn();
    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response("Paste Removed");

    const paste = await pastebin.deletePaste("https://pastebin.com/test");

    assertEquals(paste, "Paste Removed", "paste should return Paste Removed");
  });

  await t.step("listUserPastes", async () => {
    const pastebin = new TestPastebin(defaultOptions);
    const pastebinWithoutKey = new TestPastebin();
    const pastebinWithoutKey2 = new TestPastebin({ api_dev_key: "test" });

    assertRejects(
      () => pastebinWithoutKey.listUserPastes(),
    );

    assertRejects(
      () => pastebinWithoutKey2.listUserPastes(),
    );

    assertRejects(
      () => pastebin.listUserPastes(1200),
    );

    setKeyReturn();

    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response();

    assertRejects(
      () => pastebin.listUserPastes(),
    );

    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response(
      `<paste>
        <paste_key>test</paste_key>
        <paste_date>1234567890</paste_date>
        <paste_title>test</paste_title>
        <paste_size>1234</paste_size>
        <paste_expire_date>1234567890</paste_expire_date>
        <paste_private>1</paste_private>
        <paste_format_long>apache</paste_format_long>
        <paste_format_short>apache</paste_format_short>
        <paste_url>https://pastebin.com/test</paste_url>
        <paste_hits>123</paste_hits>
      </paste>`.repeat(10),
    );

    const pastes = await pastebin.listUserPastes();

    assertEquals(pastes.length, 10, "pastes should return 10 items");
  });

  await t.step("getUserInfo", async () => {
    const pastebin = new TestPastebin(defaultOptions);
    const pastebinWithoutKey = new TestPastebin();
    const pastebinWithoutKey2 = new TestPastebin({ api_dev_key: "test" });

    assertRejects(
      () => pastebinWithoutKey.getUserInfo(),
    );

    assertRejects(
      () => pastebinWithoutKey2.getUserInfo(),
    );

    setKeyReturn();

    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response();

    assertRejects(
      () => pastebin.getUserInfo(),
    );

    mf.intercept("https://pastebin.com/api/api_post.php", {
      method: "POST",
    }).response(
      `<user>
        <user_name>test</user_name>
        <user_format_short>apache</user_format_short>
        <user_expiration>1M</user_expiration>
        <user_avatar_url>https://pastebin.com/avatar/test</user_avatar_url>
        <user_private>1</user_private>
        <user_website>https://pastebin.com/test</user_website>
        <user_email>
        </user_email>
        <user_location>test</user_location>
        <user_account_type>0</user_account_type>
      </user>`,
    );

    const user = await pastebin.getUserInfo();

    assertEquals(user.user_name, "test", "user should return test");
  });

  await t.step("handleUserResponse", () => {
    const pastebin = new TestPastebin(defaultOptions);
    const id = "TEST";
    const rawURL = "https://pastebin.com/raw.php?i=TEST";

    mf.intercept(rawURL).response(undefined, { status: 404 });

    assertRejects(
      () => pastebin.getPaste(id),
    );

    mf.intercept(rawURL).response(null, { status: 403 });

    assertRejects(
      () => pastebin.getPaste(id),
    );

    mf.intercept(rawURL).response(null, { status: 500 });

    assertRejects(
      () => pastebin.getPaste(id),
    );

    mf.intercept(rawURL).response("Bad API request, invalid api_option");

    assertRejects(
      () => pastebin.getPaste(id),
    );

    mf.intercept(rawURL).response("Post limit");

    assertRejects(
      () => pastebin.getPaste(id),
    );
  });

  mf.deactivate();
});
