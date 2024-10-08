// Copyright 2024 J.W. Lagendijk. All rights reserved. MIT license.

import { AbstractPastebin } from "../lib/Pastebin.ts";
import {
  ICreatePasteFileOptions,
  ICreatePasteTextOptions,
  IPastebinOptions,
} from "../lib/interfaces.ts";

import fs from "node:fs/promises";
import { Buffer } from "node:buffer";
import fetch from "npm:node-fetch@3.3.2";
import { XMLParser } from "npm:fast-xml-parser@4.5.0";

const parser = new XMLParser();

export class Pastebin extends AbstractPastebin {
  constructor(config?: IPastebinOptions | string | null) {
    super(config, {
      fetch: fetch as unknown as typeof globalThis.fetch,
      parseXML: (xml: string): Record<string, string> => {
        const data = parser.parse(xml);
        return data;
      },
    });
  }

  async createPasteFromFile(
    options: ICreatePasteFileOptions<Buffer> = { file: "" },
  ): Promise<unknown> {
    if (options.file === "") {
      return Promise.reject(new Error("File needed!"));
    }

    let data: string;

    try {
      if (Buffer.isBuffer(options.file)) {
        data = options.file.toString("utf-8");
      } else {
        data = await fs.readFile(options.file, "utf-8");
      }
    } catch (error) {
      return Promise.reject(new Error(`Error reading file! ${error}`));
    }

    if (data.length === 0) {
      return Promise.reject(new Error("Empty file!"));
    }

    const pasteOpts = options as ICreatePasteTextOptions;
    delete pasteOpts.file;
    pasteOpts.text = data;

    return this.createPaste(pasteOpts);
  }
}
