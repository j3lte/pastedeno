import { AbstractPastebin } from "../lib/Pastebin.ts";
import { ICreatePasteFileOptions, ICreatePasteTextOptions } from "../lib/interfaces.ts";

import fs from "node:fs/promises";
import { Buffer } from "node:buffer";

export class Pastebin extends AbstractPastebin {
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
