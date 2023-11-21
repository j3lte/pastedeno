const ENDPOINTS = {
  SCRAPE: "https://scrape.pastebin.com/api_scraping.php",
  RAW: "https://scrape.pastebin.com/api_scrape_item.php?i=",
};

export abstract class Scraper {
  // We're able to overwrite fetch because it is an abstract class
  fetch = globalThis.fetch;
}
