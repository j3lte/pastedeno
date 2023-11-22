import {
  assertEquals,
  assertRejects,
  assertThrows,
  MockFetch,
  resolvesNext,
  stub,
} from "../dev_deps.ts";
import { Scraper } from "../mod.ts";

async function runTest(
  context: Deno.TestContext,
  testName: string,
  testFn: () => void | Promise<void>,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0)); // Wait before running the test
  await context.step({
    name: testName,
    fn: testFn,
    sanitizeOps: false,
    sanitizeResources: false,
  });
  await new Promise((resolve) => setTimeout(resolve, 0)); // Wait after running the test
}

const simpleScrape = {
  scrape_url: "https://scrape.pastebin.com/api_scrape_item.php?i=abc",
  full_url: "https://pastebin.com/abc",
  expire: "0",
  key: "abc",
  size: "123",
  title: "abc",
  syntax: "abc",
  user: "abc",
  hits: "123",
};
const arr = (l: number) => Array(l).fill(simpleScrape);
const json = (l: number) => JSON.stringify(arr(l));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

Deno.test({
  name: "Scraper",
  fn: async (context) => {
    await runTest(context, "errors", () => {
      assertThrows(() => new Scraper({ intervalTime: 0, limit: 0 }));
      assertThrows(() => new Scraper({ intervalTime: 1000, limit: 0 }));
      assertThrows(() => new Scraper({ limit: -10 }));
    });

    await runTest(context, "scrape", async () => {
      const mf = new MockFetch();
      mf.intercept("https://scrape.pastebin.com/api_scraping.php?limit=1").response(json(1)).times(
        2,
      );

      const scraper = new Scraper({});

      const d = await scraper.getLast();

      assertEquals(d.key, "abc");
      assertEquals(d.title, "abc");
      assertEquals(d.user, "abc");
      assertEquals(d.size, 123);
      assertEquals(d.hits, 123);
      assertEquals(d.syntax, "abc");

      const single = await scraper.singleScrape(1);

      assertEquals(single.length, 1);
      assertEquals(single[0].key, "abc");
      assertEquals(single[0].title, "abc");
      assertEquals(single[0].user, "abc");
      assertEquals(single[0].size, 123);
      assertEquals(single[0].hits, 123);
      assertEquals(single[0].syntax, "abc");

      mf.deactivate();
    });

    await runTest(context, "scrape test", async () => {
      const mf = new MockFetch();
      mf.intercept("https://scrape.pastebin.com/api_scraping.php?limit=50").response(json(50))
        .persist();

      const started = await new Promise((resolve) => {
        const scraper = new Scraper({
          limit: 50,
        });

        scraper.on("start", async () => {
          await wait(1000).then(() => {
            scraper.stop();
            resolve(true);
          });
        });

        scraper.start();
      });

      const stopped = await new Promise((resolve) => {
        const scraper = new Scraper({
          limit: 50,
          autoStart: true,
        });

        scraper.on("stop", () => {
          resolve(true);
        });

        wait(1000).then(() => {
          scraper.stop();
        });
      });

      assertEquals(started, true);

      mf.deactivate();
    });

    await runTest(context, "scrape raw", async () => {
      const mf = new MockFetch();

      mf.intercept("https://scrape.pastebin.com/api_scrape_item.php?i=abc").response(
        "test",
      ).persist();
      mf.intercept("https://scrape.pastebin.com/api_scrape_item_meta.php?i=abc").response(
        JSON.stringify(arr(1)[0]),
      ).persist();

      const scraper = new Scraper({});

      const raw = await scraper.getRaw("abc");
      assertEquals(raw, "test");

      const data = await scraper.getMeta("abc");
      assertEquals(data.key, "abc");
      assertEquals(data.title, "abc");
      assertEquals(data.user, "abc");
      assertEquals(data.size, 123);
      assertEquals(data.hits, 123);
      assertEquals(data.syntax, "abc");

      mf.deactivate();
    });

    await runTest(context, "scrape error", async () => {
      const mf = new MockFetch();

      mf.intercept("https://scrape.pastebin.com/api_scraping.php?limit=1").response(
        "test",
        { status: 403 },
      );

      const scraper = new Scraper({});

      await assertRejects(
        () => scraper.getLast(),
        Error,
        "Pastebin blocked you, have you whitelisted your IP?",
      );

      mf.intercept("https://scrape.pastebin.com/api_scraping.php?limit=1").response(
        "test",
        { status: 500 },
      );

      await assertRejects(
        () => scraper.getLast(),
        Error,
        "Error scraping:",
      );

      await assertRejects(
        () => scraper.singleScrape(500),
        Error,
        "Limit must be an integer between 1 and 250!",
      );

      mf.intercept("https://scrape.pastebin.com/api_scrape_item.php?i=abc").response(
        "",
        { status: 500 },
      ).persist();
      mf.intercept("https://scrape.pastebin.com/api_scrape_item_meta.php?i=abc").response(
        "",
        { status: 500 },
      ).persist();

      await assertRejects(
        () => scraper.getRaw("abc"),
        Error,
        "Error fetching raw:",
      );

      await assertRejects(
        () => scraper.getMeta("abc"),
        Error,
        "Error fetching meta:",
      );

      mf.deactivate();
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
