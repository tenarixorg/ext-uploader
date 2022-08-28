import { VitePluginNode } from "vite-plugin-node";
import { builtinModules } from "module";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/index.ts",
      tsCompiler: "esbuild",
    }),
  ],
  build: {
    outDir: "../dist",
    lib: {
      entry: "index.ts",
      formats: ["es"],
    },
    sourcemap: false,
    minify: true,
    emptyOutDir: true,
    rollupOptions: {
      external: [...builtinModules],
      output: {
        entryFileNames: "[name].mjs",
      },
    },
  },
});
