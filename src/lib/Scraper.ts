import { Evt as Event, to as toEvent } from "https://deno.land/x/evt@v2.5.3/mod.ts";

const ENDPOINTS = {
  SCRAPE: "https://scrape.pastebin.com/api_scraping.php",
  RAW: "https://scrape.pastebin.com/api_scrape_item.php?i=",
};

export type EventType = "start" | "stop" | "error" | "scrape" | "new";
type EventTypes =
  | ["start", () => void]
  | ["stop", () => void]
  | ["error", (error: Error) => void]
  | ["scrape", (data: unknown[]) => void]
  | ["new", (data: unknown) => void];

export interface ScrapeOptions {
  intervalTime?: number;
  autoStart?: boolean;
}

const defaultOptions: ScrapeOptions = {
  intervalTime: 10000,
  autoStart: false,
};

export class Scraper {
  // We're able to overwrite fetch because it is an abstract class
  fetch = globalThis.fetch;

  #events = new Event<EventTypes>();
  #intervalLength: number;
  #interval: number | null = null;

  #timeout: number | null = null;

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

    if (options.autoStart) {
      this.start();
    }
  }

  start(): void {
    if (this.#timeout === null) {
    }
  }

  stop(): void {
    if (this.#timeout !== null) {
      this.#fire("stop");
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }
  }

  #scrapeAndFire = async (): Promise<void> => {
    try {
      const data = await this.#scrape();
      this.#fire("scrape", data);
    } catch (error) {
      this.#fire("error", error);
    }
  };

  on(eventName: "start", handler: () => void): void;
  on(eventName: "stop", handler: () => void): void;
  on(eventName: "error", handler: (error: Error) => void): void;
  on(eventName: "scrape", handler: (data: unknown[]) => void): void;
  on(eventName: "new", handler: (data: unknown) => void): void;
  on(eventName: EventType, handler: unknown): void {
    this.#events.$attach(toEvent(eventName), handler as never);
  }

  #scrape = async (): Promise<unknown[]> => {
    const response = await this.fetch(ENDPOINTS.SCRAPE);
    const data = await response.json();

    if (data.length === 0) {
      throw new Error("No data found!");
    }

    return data;
  };

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
