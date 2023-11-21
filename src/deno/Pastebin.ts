import { AbstractPastebin } from "../lib/Pastebin.ts";
import { ICreatePasteFileOptions, ICreatePasteTextOptions } from "../lib/interfaces.ts";

export class Pastebin extends AbstractPastebin {
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
