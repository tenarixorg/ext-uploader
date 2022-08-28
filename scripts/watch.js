/* eslint-disable no-console */
/* eslint-disable no-undef */
process.env.NODE_ENV = "development";
import { createServer, build as viteBuild } from "vite";
import { spawn } from "child_process";
import chalk from "chalk";

let server = null;
const TAG = chalk.bgBlue("[watch.js]");

/**
 * @param {{ name: string; configFile: string; writeBundle: import('rollup').OutputPlugin['writeBundle'] }} param0
 * @returns {import('rollup').RollupWatcher}
 */
function getWatcher({ name, configFile, writeBundle }) {
  return viteBuild({
    mode: process.env.NODE_ENV,
    build: {
      watch: {},
    },
    configFile,
    plugins: [{ name, writeBundle }],
  });
}

/**
 * @returns {Promise<import('rollup').RollupWatcher>}
 */
async function watchMain() {
  /**
   * @type {import('child_process').ChildProcessWithoutNullStreams | null}
   */

  /**
   * @type {import('rollup').RollupWatcher}
   */
  const watcher = getWatcher({
    name: "main-watcher",
    configFile: "vite.config.ts",
    writeBundle() {
      console.group(TAG, "main-watcher");
      server && server.kill();
      server = spawn("node", ["."], {
        stdio: "inherit",
      });
      console.groupEnd();
      console.log();
    },
  });

  return watcher;
}

const viteDevServer = await createServer({
  configFile: "vite.config.ts",
});

await viteDevServer.listen();
await watchMain();
