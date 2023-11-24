import { ScrapeOptions, Scraper as AbstractScraper } from "../lib/Scraper.ts";

import fetch from "npm:node-fetch@3.3.2";

export class Scraper extends AbstractScraper {
  constructor(opts?: ScrapeOptions) {
    super(opts, fetch as unknown as typeof globalThis.fetch);
  }
}
