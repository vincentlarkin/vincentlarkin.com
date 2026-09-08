import { defineConfig, mergeConfig } from "vite";
import config from "./vite.config.js";
import fs from "node:fs";
import { writeStartup } from "./build-startup.mjs";

export default mergeConfig(
  config,
  defineConfig({
    publicDir: false,
    plugins: [
      {
        name: "third-party-licenses",
        closeBundle() {
          const packages = [
            "@carbon/react",
            "react",
            "react-dom",
            "@fontsource/ibm-plex-sans",
            "@fontsource/ibm-plex-mono",
          ];
          const notices = packages
            .map(
              (name) =>
                `${name}\n${"=".repeat(60)}\n${fs.readFileSync(`node_modules/${name}/LICENSE`, "utf8")}`,
            )
            .join("\n\n");
          fs.writeFileSync("../assets/carbon/LICENSES.txt", notices);
          writeStartup();
        },
      },
    ],
    base: "/assets/carbon/",
    build: {
      outDir: "../assets/carbon",
      emptyOutDir: true,
      manifest: "manifest.json",
      rollupOptions: {
        input: "src/main.jsx",
        preserveEntrySignatures: "strict",
      },
    },
  }),
);
