import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";

import {
  ExpirationTime,
  FormatType,
  ICreatePasteTextOptions,
  IPasteAPIOptions,
  IPastebinOptions,
  Paste,
  PrivacyLevel,
  User,
} from "./interfaces.ts";

const isNull = (value?: unknown): value is null => value === null;
const isUndefined = (value?: unknown): value is undefined => typeof value === "undefined";
const ENDPOINTS = {
  POST: "https://pastebin.com/api/api_post.php",
  LOGIN: "https://pastebin.com/api/api_login.php",
  APIRAW: "https://pastebin.com/api/api_raw.php",
  RAW: "https://pastebin.com/raw.php?i=",
};

// @deno-fmt-ignore
const formatTypeArr: FormatType[] = [
  "4cs",  "6502acme",  "6502kickass",  "6502tasm",  "abap",  "actionscript",  "actionscript3",  "ada",  "aimms",  "algol68",  "apache",  "applescript",  "apt_sources",  "arduino",  "arm",  "asm",  "asp",  "asymptote",  "autoconf",  "autohotkey",  "autoit",  "avisynth",  "awk",  "bascomavr",  "bash",  "basic4gl",  "dos",  "bibtex",  "b3d",  "blitzbasic",  "bmx",  "bnf",  "boo",  "bf",  "c",  "csharp",  "c_winapi",  "cpp",  "cpp-winapi",  "cpp-qt",  "c_loadrunner",  "caddcl",  "cadlisp",  "ceylon",  "cfdg",  "c_mac",  "chaiscript",  "chapel",  "cil",  "clojure",  "klonec",  "klonecpp",  "cmake",  "cobol",  "coffeescript",  "cfm",  "css",  "cuesheet",  "d",  "dart",  "dcl",  "dcpu16",  "dcs",  "delphi",  "oxygene",  "diff",  "div",  "dot",  "e",  "ezt",  "ecmascript",  "eiffel",  "email",  "epc",  "erlang",  "euphoria",  "fsharp",  "falcon",  "filemaker",  "fo",  "f1",  "fortran",  "freebasic",  "freeswitch",  "gambas",  "gml",  "gdb",  "gdscript",  "genero",  "genie",  "gettext",  "go",  "godot-glsl",  "groovy",  "gwbasic",  "haskell",  "haxe",  "hicest",  "hq9plus",  "html4strict",  "html5",  "icon",  "idl",  "ini",  "inno",  "intercal",  "io",  "ispfpanel",  "j",  "java",  "java5",  "javascript",  "jcl",  "jquery",  "json",  "julia",  "kixtart",  "kotlin",  "ksp",  "latex",  "ldif",  "lb",  "lsl2",  "lisp",  "llvm",  "locobasic",  "logtalk",  "lolcode",  "lotusformulas",  "lotusscript",  "lscript",  "lua",  "m68k",  "magiksf",  "make",  "mapbasic",  "markdown",  "matlab",  "mercury",  "metapost",  "mirc",  "mmix",  "mk-61",  "modula2",  "modula3",  "68000devpac",  "mpasm",  "mxml",  "mysql",  "nagios",  "netrexx",  "newlisp",  "nginx",  "nim",  "nsis",  "oberon2",  "objeck",  "objc",  "ocaml",  "ocaml-brief",  "octave",  "pf",  "glsl",  "oorexx",  "oobas",  "oracle8",  "oracle11",  "oz",  "parasail",  "parigp",  "pascal",  "pawn",  "pcre",  "per",  "perl",  "perl6",  "phix",  "php",  "php-brief",  "pic16",  "pike",  "pixelbender",  "pli",  "plsql",  "postgresql",  "postscript",  "povray",  "powerbuilder",  "powershell",  "proftpd",  "progress",  "prolog",  "properties",  "providex",  "puppet",  "purebasic",  "pycon",  "python",  "pys60",  "q",  "qbasic",  "qml",  "rsplus",  "racket",  "rails",  "rbs",  "rebol",  "reg",  "rexx",  "robots",  "roff",  "rpmspec",  "ruby",  "gnuplot",  "rust",  "sas",  "scala",  "scheme",  "scilab",  "scl",  "sdlbasic",  "smalltalk",  "smarty",  "spark",  "sparql",  "sqf",  "sql",  "sshconfig",  "standardml",  "stonescript",  "sclang",  "swift",  "systemverilog",  "tsql",  "tcl",  "teraterm",  "texgraph",  "thinbasic",  "typescript",  "typoscript",  "unicon",  "uscript",  "upc",  "urbi",  "vala",  "vbnet",  "vbscript",  "vedit",  "verilog",  "vhdl",  "vim",  "vb",  "visualfoxpro",  "visualprolog",  "whitespace",  "whois",  "winbatch",  "xbasic",  "xml",  "xojo",  "xorg_conf",  "xpp",  "yaml",  "yara",  "z80",  "zxbasic" ];
const expirationTimeArr: string[] = Object.values(ExpirationTime);

export abstract class AbstractPastebin {
  #config: IPastebinOptions;

  // We're able to overwrite fetch because it is an abstract class
  fetch = globalThis.fetch;

  // RequestTimeout = 4000;
  requestTimeout = 4000;

  // DEBUG
  #debug = false;

  constructor(config?: IPastebinOptions | string | null) {
    if (isUndefined(config) || isNull(config)) {
      this.#config = {};
      return;
    }

    let conf: IPastebinOptions | string = config;
    if (typeof conf === "string") {
      conf = { api_dev_key: conf };
    }

    this.#debug = conf.debug === true;
    delete conf.debug;

    this.#config = Object.assign({
      api_dev_key: null,
      api_user_key: null,
      api_user_name: null,
      api_user_password: null,
    }, conf);
  }

  setDebug(debug: boolean): void {
    this.#debug = debug;
  }

  /**
   * Get the content of a paste
   *
   * @param id ID of the paste
   * @param isPrivate is the paste private? Needs authentication
   * @returns { Promise<string> } returns the content of the paste
   */
  async getPaste(
    id: string,
    isPrivate = false,
  ): Promise<string> {
    let ID = id;
    if (ID.startsWith("https://pastebin.com/")) {
      ID = ID.replace("https://pastebin.com/", "");
    }
    if (!ID || ID.length === 0) {
      return Promise.reject(new Error("Invalid paste url or id"));
    }
    if (isPrivate) {
      const params = this.#createParams("show_paste");
      params.api_paste_key = ID;
      try {
        await this.#createAPIuserKey();
        params.api_user_key = this.config.api_user_key as string;

        return this.#postRequest(ENDPOINTS.APIRAW, params);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    return this.#getRequest(ENDPOINTS.RAW + ID);
  }

  /**
   * Create a paste
   *
   * @param options { ICreatePasteTextOptions } options for creating a paste
   * @returns { Promise<string> } returns the url of the created paste
   */
  async createPaste(options: ICreatePasteTextOptions): Promise<string> {
    if (!this.hasDevKey) {
      return Promise.reject(new Error("Dev key needed!"));
    }
    if (typeof options === "undefined") {
      return Promise.reject(new Error("Create paste needs options!"));
    }

    const { text, title, format, expiration } = options;

    let { privacy } = options;

    if (isUndefined(privacy) || typeof privacy !== "number") {
      privacy = PrivacyLevel.PUBLIC_ANONYMOUS;
    } else if (privacy > 3 || privacy < 0) {
      return Promise.reject(new Error("Privacy level can only be 0 - 3"));
    }

    const params = this.#createParams("paste");

    params.api_paste_code = text;
    params.api_paste_private = privacy;

    if (typeof text !== "string") {
      return Promise.reject(
        new Error("text can only be of type string!"),
      );
    }

    if (!text || text.length === 0) {
      return Promise.reject(new Error("Paste cannot have empty content"));
    }

    if (typeof title === "string") {
      params.api_paste_name = title;
    }

    if (typeof format === "string") {
      if (formatTypeArr.includes(format as FormatType)) {
        params.api_paste_format = format as FormatType;
      } else {
        return Promise.reject(
          new Error(`Paste format ${options.format} is unknown!`),
        );
      }
    }

    if (
      privacy === PrivacyLevel.PRIVATE ||
      privacy === PrivacyLevel.PUBLIC_USER
    ) {
      try {
        await this.#createAPIuserKey();
      } catch (error) {
        return Promise.reject(error);
      }
      params.api_user_key = this.config.api_user_key as string;
    }

    if (typeof expiration === "string") {
      if (expirationTimeArr.includes(expiration)) {
        params.api_paste_expire_date = expiration as ExpirationTime;
      } else {
        return Promise.reject(
          new Error(`Expiration format '${expiration}' is unknown!`),
        );
      }
    }

    params.api_paste_private = privacy === PrivacyLevel.PUBLIC_USER
      ? PrivacyLevel.PUBLIC_ANONYMOUS
      : privacy;

    return this.#postRequest(ENDPOINTS.POST, params);
  }

  /**
   * Delete a paste
   *
   * @param pasteID { string } ID of the paste
   * @returns { Promise<string> } returns the response of the request
   */
  async deletePaste(pasteID: string): Promise<string> {
    if (!this.hasDevKey) {
      return Promise.reject(new Error("Dev key needed!"));
    }

    let ID = pasteID;
    if (ID.startsWith("https://pastebin.com/")) {
      ID = ID.replace("https://pastebin.com/", "");
    }

    const params = this.#createParams("delete");
    params.api_paste_key = ID;

    try {
      await this.#createAPIuserKey();
    } catch (error) {
      return Promise.reject(error);
    }
    params.api_user_key = this.config.api_user_key as string;

    return this.#postRequest(ENDPOINTS.POST, params);
  }

  /**
   * List all pastes of a user
   *
   * @param limit { number } limit of pastes to return (default: 50, max: 1000)
   * @returns { Promise<Paste[]> } returns an array of pastes
   * @throws { Error } throws an error if the limit is not between 1 and 1000
   * @throws { Error } throws an error if the dev key is missing
   */
  async listUserPastes(limit = 50): Promise<Paste[]> {
    if (limit < 1 || limit > 1000) {
      return Promise.reject(
        new Error(
          "listUserPastes only accepts a limit between 1 and 1000",
        ),
      );
    }
    if (!this.hasDevKey) {
      return Promise.reject(new Error("Dev key needed!"));
    }

    const params = this.#createParams("list");
    params.api_results_limit = limit;

    try {
      await this.#createAPIuserKey();
    } catch (error) {
      return Promise.reject(error);
    }
    params.api_user_key = this.config.api_user_key as string;

    return this.#postAndParse(params, this.#parsePastes);
  }

  /**
   * Get user information
   *
   * @returns { Promise<User> } returns the user information
   * @throws { Error } throws an error if the dev key is missing
   */
  async getUserInfo(): Promise<User> {
    if (!this.hasDevKey) {
      return Promise.reject(new Error("Dev key needed!"));
    }

    const params = this.#createParams("userdetails");

    try {
      await this.#createAPIuserKey();
    } catch (error) {
      return Promise.reject(error);
    }
    params.api_user_key = this.config.api_user_key as string;

    return this.#postAndParse(params, this.#parseUser);
  }

  #postAndParse<T>(params: IPasteAPIOptions, parseFunc: (data: string) => T): Promise<T> {
    return this.#postRequest(ENDPOINTS.POST, params)
      .then((data) => {
        return parseFunc.call(this, data);
      });
  }

  #createParams(option: string): IPasteAPIOptions {
    const opts: IPasteAPIOptions = {
      api_option: option,
    };
    if (this.config.api_dev_key) {
      opts.api_dev_key = this.config.api_dev_key;
    }
    return opts;
  }

  #validateConfig(...validateKeys: Array<keyof IPastebinOptions>): string | false {
    const missing = validateKeys.filter(
      (key) =>
        isUndefined(this.#config[key]) ||
        this.#config[key] === null ||
        this.#config[key] === "",
    );

    if (missing.length > 0) {
      return `The following keys are missing: ${missing.join(",")}`;
    }

    return false;
  }

  #createAPIuserKey(): Promise<void> {
    const inValid = this.#validateConfig(
      "api_dev_key",
      "api_user_name",
      "api_user_password",
    );
    if (typeof inValid === "string") {
      return Promise.reject(new Error(inValid));
    }
    if (
      !isUndefined(this.config.api_user_key) &&
      !isNull(this.config.api_user_key) &&
      this.config.api_user_key !== ""
    ) {
      // We already have a key. Returning
      return Promise.resolve();
    }
    const { api_dev_key, api_user_name, api_user_password } = this.config as {
      api_dev_key: string;
      api_user_name: string;
      api_user_password: string;
    };

    return this.#postRequest(ENDPOINTS.LOGIN, {
      api_dev_key,
      api_user_name,
      api_user_password,
    }).then((data) => {
      if (data.length !== 32) {
        return Promise.reject(
          new Error(`Error in creating user key: ${data}`),
        );
      }
      this.config.api_user_key = data;

      return Promise.resolve();
    });
  }

  // Parse

  #parseUser(xml: string): User {
    const data = parse(xml) as { user?: User };
    if (isUndefined(data) || isNull(data) || isUndefined(data.user)) {
      throw new Error("No data returned to _parseUser!");
    }
    return data.user;
  }

  #parsePastes(xml: string): Paste[] {
    const { root: data } = parse(`<root>${xml}</root>`) as unknown as { root: { paste: Paste[] } };
    if (isUndefined(data) || isNull(data) || isUndefined(data.paste)) {
      throw new Error("No data returned to _parsePastes!");
    }
    return data.paste;
  }

  // Request

  #getRequestOptions(
    method: "GET" | "POST",
    params: Record<string, string> | IPasteAPIOptions = {},
  ): RequestInit {
    const init: RequestInit = {
      headers: new Headers({
        "User-Agent": "Pastebin-ts",
        "Cache-Control": "no-cache",
      }),
      method,
      cache: "no-cache",
    };

    if (method === "POST") {
      // form
      const formData = new FormData();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, value);
      }
      init.body = formData;
    }

    return init;
  }

  async #handleResponse(
    res: Response,
  ): Promise<string> {
    if (res.status === 404) {
      return Promise.reject(new Error("Not found!"));
    }
    if (res.status === 403) {
      return Promise.reject(new Error("Forbidden! Is this paste private?"));
    }
    if (!res.ok) {
      return Promise.reject(new Error(`Response not ok: ${res.status} : ${res.statusText}`));
    }
    let buffer: ArrayBuffer;
    try {
      buffer = await res.arrayBuffer();
    } catch (error) {
      return Promise.reject(error);
    }
    // parse Buffer as text
    const text = new TextDecoder().decode(buffer);
    if (text.includes("Bad API request")) {
      return Promise.reject(new Error("Bad API request"));
    }
    if (text.includes("Post limit")) {
      return Promise.reject(new Error("Post limit reached"));
    }
    return text;
  }

  async #abstractRequest(
    method: "GET" | "POST",
    path: string,
    params?: Record<string, string> | IPasteAPIOptions,
  ): Promise<string> {
    const init = this.#getRequestOptions(method, params);
    let timeout: number | null = null;

    if (this.requestTimeout > 0 && AbortController) {
      const abortController = new AbortController();
      init.signal = abortController.signal;

      timeout = setTimeout(() => {
        this.#debugger(">>>>> aborting request");
        if (abortController) {
          abortController.abort();
        }
        timeout = null;
      }, this.requestTimeout);
    }

    try {
      const res = await this.fetch(path, init);
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      return this.#handleResponse(res);
    } catch (error) {
      console.log("error", error);
      return Promise.reject(error);
    }
  }

  #getRequest(path: string): Promise<string> {
    this.#debugger(">>>>> getRequest", path);
    return this.#abstractRequest("GET", path);
  }

  #postRequest(path: string, params: Record<string, string> | IPasteAPIOptions): Promise<string> {
    this.#debugger(">>>>> postRequest", path, params);
    return this.#abstractRequest("POST", path, params);
  }

  #debugger(...args: unknown[]): void {
    if (this.#debug) {
      console.log(...args);
    }
  }

  // Getters

  get debug(): boolean {
    return this.#debug;
  }

  get config(): IPastebinOptions {
    return this.#config;
  }

  get hasDevKey(): boolean {
    return this.#validateConfig("api_dev_key") === false;
  }
}
