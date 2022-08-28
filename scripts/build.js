/* eslint-disable no-console */
/* eslint-disable no-undef */
process.env.NODE_ENV = "production";

import { build as viteBuild } from "vite";
import chalk from "chalk";

const TAG = chalk.bgBlue("[build.js]");

const viteConfigs = {
  main: "vite.config.ts",
};

async function build() {
  for (const [name, configPath] of Object.entries(viteConfigs)) {
    console.group(TAG, name);
    await viteBuild({
      configFile: configPath,
      mode: process.env.NODE_ENV,
    });
    console.groupEnd();
    console.log();
  }
}

await build();
