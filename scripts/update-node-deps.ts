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

async function update_npm_packages(): Promise<void> {
  const pastebinPath = `${getDirPath()}/../src/node/Pastebin.ts`;

  const pastebinFile = await Deno.readTextFile(pastebinPath);

  try {
    // Find the version number in "npm:node-fetch@x.x.x"
    const pastebinVersion = (
      pastebinFile.match(/npm:node-fetch@(\d+\.\d+\.\d+)/) as string[]
    )[1];

    const npmJSON = await fetch("https://registry.npmjs.org/node-fetch").then((r) => r.json());
    const latest = npmJSON["dist-tags"].latest;

    if (pastebinVersion === latest) {
      console.log("No changes to node/Pastebin.ts package needed.");
      return;
    } else {
      console.log(`Updating npm packages from ${pastebinVersion} to ${latest}`);

      // Replace the version number in Pastebin.ts
      const updatedFile = pastebinFile.replace(
        /npm:node-fetch@\d+\.\d+\.\d+/,
        `npm:node-fetch@${latest}`,
      );

      await Deno.writeTextFile(pastebinPath, updatedFile);
    }
  } catch (error) {
    console.error("Error updating version in Pastebin.ts");
    console.error(error);
  }
}

async function update(_args: string[]): Promise<void> {
  await update_npm_build_script();
  await update_npm_packages();
}

update(Deno.args);
