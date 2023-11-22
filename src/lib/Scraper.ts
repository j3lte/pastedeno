// Copyright 2023 J.W. Lagendijk. All rights reserved. MIT license.

import { Evt as Event, to as toEvent } from "https://deno.land/x/evt@v2.5.3/mod.ts";

const ENDPOINTS = {
  SCRAPE: "https://scrape.pastebin.com/api_scraping.php",
  RAW: "https://scrape.pastebin.com/api_scrape_item.php?i=",
  META: "https://scrape.pastebin.com/api_scrape_item_meta.php?i=",
};

export type EventType = "start" | "stop" | "error" | "scrape" | "new";
type EventTypes =
  | ["start", () => void]
  | ["stop", () => void]
  | ["error", (error: Error) => void]
  | ["scrape", (data: unknown[]) => void]
  | ["new", (data: unknown) => void];

export interface ScrapeOptions {
  /**
   * The interval time in milliseconds between scrapes.
   * @default 10000
   * @minimum 1000
   */
  intervalTime?: number;
  /**
   * Whether to start scraping immediately.
   * @default false
   */
  autoStart?: boolean;
  /**
   * The maximum number of pastes to scrape per interval.
   * @default 50
   * @minimum 1
   * @maximum 250
   */
  limit?: number;
  /**
   * Whether to stop scraping when an error occurs.
   * @default true
   */
  breakOnError?: boolean;
}

const defaultOptions: ScrapeOptions = {
  intervalTime: 10000,
  autoStart: false,
  limit: 50,
  breakOnError: true,
};

interface ScrapePasteRaw {
  scrape_url: string;
  full_url: string;
  date: string;
  key: string;
  size: string;
  expire: string;
  title: string;
  syntax: string;
  user: string;
  hits: string;
}

/**
 * The scraped paste.
 *
 * @property date {Date} The date the paste was created.
 * @property key {string} The key of the paste.
 * @property size {number} The size of the paste.
 * @property expire {Date | null} The date the paste will expire, or null if it won't.
 * @property title {string} The title of the paste.
 * @property syntax {string} The syntax of the paste.
 * @property user {string} The user who created the paste.
 * @property hits {number} The number of hits the paste has.
 */
export interface ScrapePaste {
  date: Date;
  key: string;
  size: number;
  expire: Date | null;
  title: string;
  syntax: string;
  user: string;
  hits: number;
}

const convertData = (paste: ScrapePasteRaw): ScrapePaste => {
  const date = new Date(parseInt(paste.date, 10) * 1000);
  const expireNum = parseInt(paste.expire, 10);
  const expire = expireNum === 0 ? null : new Date(expireNum * 1000);
  const size = parseInt(paste.size, 10);
  const hits = parseInt(paste.hits, 10);
  return {
    key: paste.key,
    title: paste.title,
    syntax: paste.syntax,
    user: paste.user,
    date,
    expire,
    size,
    hits,
  };
};

export class Scraper {
  // We're able to overwrite fetch because it is an abstract class
  fetch = globalThis.fetch;

  #events = new Event<EventTypes>();

  #limit = 50;
  #breakOnError = false;

  #intervalLength: number;
  #timeout: number | null = null;

  lastKeys: string[] = [];

  // Version
  static version = "0.4.2";

  /**
   * @param opts {ScrapeOptions} The options for the scraper.
   * @throws {Error} If the interval time is not an integer or is less than 1000.
   * @throws {Error} If the limit is not an integer between 1 and 250.
   * @example
   * ```ts
   * const scraper = new Scraper({
   *    intervalTime: 5000,
   *    limit: 10,
   * });
   * ```
   */
  constructor(opts?: ScrapeOptions) {
    const options = {
      ...defaultOptions,
      ...opts,
    };

    if (
      typeof options.intervalTime === "undefined" || !Number.isInteger(options.intervalTime) ||
      options.intervalTime < 1000
    ) {
      throw new Error("Interval time must be an integer and at least 1000!");
    }
    this.#intervalLength = options.intervalTime;

    if (
      typeof options.limit !== "undefined" && (
        Number.isNaN(options.limit) ||
        !Number.isInteger(options.limit) ||
        options.limit < 1 ||
        options.limit > 250
      )
    ) {
      throw new Error("Limit must be an integer between 1 and 250!");
    } else if (typeof options.limit !== "undefined") {
      this.#limit = options.limit;
    }

    if (typeof options.breakOnError !== "undefined") {
      this.#breakOnError = options.breakOnError;
    }

    if (options.autoStart) {
      this.start();
    }
  }

  /**
   * Starts the scraper.
   */
  start(): void {
    if (this.#timeout === null) {
      this.#fire("start");
      this.#scrapeAndFire(true);
    }
  }

  /**
   * Stops the scraper.
   */
  stop(): void {
    this.#fire("stop");
    if (this.#timeout !== null) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }
  }

  /**
   * Scrapes pastes.
   * @param limit {number} The maximum number of pastes to scrape.
   * @returns {Promise<ScrapePaste[]>} The scraped pastes.
   * @throws {Error} If the limit is not an integer between 1 and 250.
   * @example
   * ```ts
   * const pastes = await scraper.scrape(10);
   * ```
   */
  singleScrape(limit?: number): Promise<ScrapePaste[]> {
    return this.#scrape(limit);
  }

  /**
   * Scrapes the last paste.
   *
   * @returns {Promise<ScrapePaste>} The last scraped paste.
   */
  getLast(): Promise<ScrapePaste> {
    return this.#scrape(1).then((data) => data[0]);
  }

  /**
   * Gets the raw paste.
   *
   * @param key {string} The key of the paste to fetch.
   * @returns {Promise<string>} The raw paste.
   */
  getRaw(key: string): Promise<string> {
    const realKey = key
      .replace("https://scrape.pastebin.com/api_scrape_item.php?i=", "")
      .replace("https://pastebin.com/", "");
    return this.fetch(`${ENDPOINTS.RAW}${realKey}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching raw: ${response.statusText}`);
        }
        return response.text();
      });
  }

  /**
   * Gets the paste meta.
   *
   * @param key {string} The key of the paste to fetch.
   * @returns {Promise<ScrapePaste>} The paste meta.
   */
  getMeta(key: string): Promise<ScrapePaste> {
    const realKey = key
      .replace("https://scrape.pastebin.com/api_scrape_item.php?i=", "")
      .replace("https://pastebin.com/", "");
    return this.fetch(`${ENDPOINTS.META}${realKey}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching meta: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => convertData(data));
  }

  #scrapeAndFire = async (withTimeout = false): Promise<void> => {
    let errored = false;
    try {
      const data = await this.#scrape();
      this.#fire("scrape", data);
    } catch (error) {
      errored = true;
      this.#fire("error", error);
    }
    if (withTimeout) {
      if (errored && this.#breakOnError) {
        this.stop();
      } else {
        this.#timeout = setTimeout(
          () => this.#scrapeAndFire(true),
          this.#intervalLength,
        );
      }
    }
  };

  #scrape = async (limit?: number): Promise<ScrapePaste[]> => {
    if (typeof limit !== "undefined") {
      if (Number.isNaN(limit) || !Number.isInteger(limit) || limit < 1 || limit > 250) {
        throw new Error("Limit must be an integer between 1 and 250!");
      }
    }
    const limited = typeof limit !== "undefined" ? limit : this.#limit;
    const response = await this.fetch(`${ENDPOINTS.SCRAPE}?limit=${limited}`);
    if (response.status === 403) {
      const text = await response.text();
      throw new Error(`Pastebin blocked you, have you whitelisted your IP? \n\n Response: ${text}`);
    }

    if (!response.ok) {
      throw new Error(`Error scraping: ${response.statusText}`);
    }

    const raw = await response.json() as ScrapePasteRaw[];
    const data = raw.map(convertData);

    const newPastes = data.filter((paste) => !this.lastKeys.includes(paste.key));
    if (newPastes.length > 0) {
      // emit newPastes (reversed, so oldest first)
      newPastes.reverse().forEach((paste) => this.#fire("new", paste));
    }
    this.lastKeys = data.map((paste) => paste.key);

    return data;
  };

  /**
   * Adds an event listener.
   * @param eventName {EventType} The name of the event to listen for.
   * @param handler {Function} The function to call when the event is fired.
   * @example
   * ```ts
   * scraper.on("scrape", (data) => {
   *   console.table(data);
   * });
   * ```
   */
  on(eventName: "start", handler: () => void): void;
  on(eventName: "stop", handler: () => void): void;
  on(eventName: "error", handler: (error: Error) => void): void;
  on(eventName: "scrape", handler: (data: ScrapePaste[]) => void): void;
  on(eventName: "new", handler: (data: ScrapePaste) => void): void;
  on(eventName: EventType, handler: unknown): void {
    this.#events.$attach(toEvent(eventName), handler as never);
  }

  #fire(eventName: "start"): void;
  #fire(eventName: "stop"): void;
  #fire(eventName: "error", error: Error): void;
  #fire(eventName: "scrape", data: unknown[]): void;
  #fire(eventName: "new", data: unknown): void;
  #fire(eventName: EventType, ...args: never[]): void {
    const callArgs: unknown = [
      eventName,
      ...args,
    ];

    this.#events.post.call(this.#events, callArgs as never);
  }
}
