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

export class Scraper {
  // We're able to overwrite fetch because it is an abstract class
  fetch = globalThis.fetch;

  #events = new Event<EventTypes>();
  #intervalLength: number;
  #interval: number | null = null;

  constructor(
    intervalTime = 10000,
  ) {
    if (intervalTime < 1000) {
      throw new Error("Interval time should be at least 1000");
    }
    this.#intervalLength = intervalTime;
  }

  start(): void {
    this.#fire("start");

    if (this.#interval !== null) {
      this.stop();
    }

    this.#interval = setInterval(async () => {
      try {
        const data = await this.#scrape();
        this.#fire("scrape", data);
      } catch (error) {
        this.#fire("error", error);
      }
    }, this.#intervalLength);
  }

  stop(): void {
    this.#fire("stop");
    if (this.#interval !== null) {
      clearInterval(this.#interval);
      this.#interval = null;
    }
  }

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
