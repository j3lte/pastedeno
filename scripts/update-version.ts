// Copyright 2024 J.W. Lagendijk. All rights reserved. MIT license.

async function update(args: string[]): Promise<void> {
  const version = args[0];
  if (!version) {
    console.error("No version provided.");
    Deno.exit(1);
  }

  const filePath = new URL(import.meta.url).pathname;
  const dirPath = filePath.split("/").slice(0, -1).join("/");

  const paths = [
    `${dirPath}/../src/lib/Pastebin.ts`,
    `${dirPath}/../src/lib/Scraper.ts`,
  ];

  for (const path of paths) {
    const file = await Deno.readTextFile(path);
    const updatedFile = file.replace(
      /static version = ".*";/,
      `static version = "${version}";`,
    );
    await Deno.writeTextFile(path, updatedFile);
  }

  console.log(`Updated version to ${version}.`);
}

update(Deno.args);
