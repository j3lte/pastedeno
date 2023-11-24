// Copyright 2023 J.W. Lagendijk. All rights reserved. MIT license.

const getDirPath = (): string => {
  const filePath = new URL(import.meta.url).pathname;
  const dirPath = filePath.split("/").slice(0, -1).join("/");
  return dirPath;
};

async function update_npm_build_script(): Promise<void> {
  const path = `${getDirPath()}/build-npm.ts`;
  const file = await Deno.readTextFile(path);

  // Find the version number in for "evt@vX.X.X"
  const evtVersion = (file.match(/evt@v(\d+\.\d+\.\d+)/) as string[])[1];
  // Replace the version number in the build script
  const updatedFile = file.replace(
    /version: ".*",/,
    `version: "${evtVersion}",`,
  );

  // check if the updated file changed
  if (file === updatedFile) {
    console.log("No changes to npm build script needed.");
    return;
  }

  await Deno.writeTextFile(path, updatedFile);
}

async function update_npm_package(packageName: string, fileContent: string): Promise<string> {
  try {
    const npmJSON = await fetch(`https://registry.npmjs.org/${packageName}`).then((r) => r.json());
    const latest = npmJSON["dist-tags"].latest;

    // Replace the version number in Pastebin.ts
    const updatedFile = fileContent.replace(
      new RegExp(`npm:${packageName}@\\d+\\.\\d+\\.\\d+`),
      `npm:${packageName}@${latest}`,
    );

    return updatedFile;
  } catch (error) {
    console.error(`Error updating version in ${packageName}`);
    console.error(error);
  }

  return fileContent;
}

async function update_npm_packages(): Promise<void> {
  const pastebinPath = `${getDirPath()}/../src/node/Pastebin.ts`;
  const pastebinFile = await Deno.readTextFile(pastebinPath);

  try {
    // update node-fetch and fast-xml-parser
    const updatedPastebinFile = await update_npm_package("node-fetch", pastebinFile).then((f) =>
      update_npm_package("fast-xml-parser", f)
    );

    if (pastebinFile === updatedPastebinFile) {
      console.log("No changes to npm packages needed in Pastebin.ts");
    } else {
      console.log("Updating npm packages in Scraper.ts");
      await Deno.writeTextFile(pastebinPath, updatedPastebinFile);
    }
  } catch (error) {
    console.error("Error updating version in Pastebin.ts");
    console.error(error);
  }

  const scraperPath = `${getDirPath()}/../src/node/Scraper.ts`;
  const scraperFile = await Deno.readTextFile(scraperPath);

  try {
    // update node-fetch
    const updatedScraperFile = await update_npm_package("node-fetch", scraperFile);

    if (scraperFile === updatedScraperFile) {
      console.log("No changes to npm packages needed in Scraper.ts");
    } else {
      console.log("Updating npm packages in Scraper.ts");
      await Deno.writeTextFile(scraperPath, updatedScraperFile);
    }
  } catch (error) {
    console.error("Error updating version in Scraper.ts");
    console.error(error);
  }
}

async function update(_args: string[]): Promise<void> {
  await update_npm_build_script();
  await update_npm_packages();
}

update(Deno.args);
