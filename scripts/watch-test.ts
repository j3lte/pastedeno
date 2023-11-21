import { emptyDir } from "../dev_deps.ts";

const watcher = Deno.watchFs([
  "./src/",
  "./test/",
], { recursive: true });

const runCmd = async (args: string[], deno = false) => {
  let cmd: Deno.Command;
  if (deno) {
    cmd = new Deno.Command(Deno.execPath(), {
      args,
    });
  } else {
    cmd = new Deno.Command(args[0], {
      args: args.slice(1),
    });
  }
  const { code, stdout, stderr } = await cmd.output();
  return {
    output: new TextDecoder().decode(stdout),
    error: new TextDecoder().decode(stderr),
    code,
  };
};

// Debounce runner
let timeout: number | undefined;

const runTest = (path: string) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(async () => {
    console.log(">>>>> runTest", path);
    await emptyDir("./.coverage/");
    const test = await runCmd(["test", "--coverage=./.coverage", "./test/"], true);
    console.log(test.output);

    if (test.code !== 0) {
      console.log(test.error);
      return;
    }
    const cov = await runCmd([
      "coverage",
      "./.coverage/",
      "--lcov",
      "--exclude=/test|scripts/",
    ], true);
    await Deno.writeTextFile("./.coverage/coverageFile.lcov", cov.output);

    await runCmd(["genhtml", "-o", "./.coverage/", "./.coverage/coverageFile.lcov"]);
  }, 100);
};

for await (const event of watcher) {
  // console.log(">>>>> event", event);
  const { kind, paths } = event;
  if (["modify", "create", "delete"].includes(kind) && paths[0]) {
    const [path] = paths;
    if (path.endsWith(".ts")) {
      runTest(path);
    }
  }
}
