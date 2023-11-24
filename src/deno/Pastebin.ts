// Copyright 2023 J.W. Lagendijk. All rights reserved. MIT license.

import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";

import { AbstractPastebin } from "../lib/Pastebin.ts";
import {
  ICreatePasteFileOptions,
  ICreatePasteTextOptions,
  IPastebinOptions,
} from "../lib/interfaces.ts";

export class Pastebin extends AbstractPastebin {
  constructor(config?: IPastebinOptions | string | null) {
    super(config, {
      parseXML: (xml: string): Record<string, string> => {
        const data = parse(xml) as unknown as Record<string, string>;
        return data;
      },
    });
  }

  /**
   * Create a paste from a file
   *
   * @param options { ICreatePasteFileOptions } options for creating a paste
   * @returns { Promise<string> } returns the url of the created paste
   */
  async createPasteFromFile(
    options: ICreatePasteFileOptions<Uint8Array> = { file: "" },
  ): Promise<unknown> {
    if (options.file === "") {
      return Promise.reject(new Error("File needed!"));
    }

    let data: string;

    try {
      // Check if options.file is a string or a Uint8Array
      if (typeof options.file === "string") {
        data = await Deno.readTextFile(options.file);
      } else {
        data = new TextDecoder().decode(options.file);
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
