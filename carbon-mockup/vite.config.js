import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const imageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../images",
);
function imageMiddleware(server) {
  server.middlewares.use((request, response, next) => {
    if (!request.url?.startsWith("/images/")) return next();
    try {
      const filename = path.resolve(
        imageRoot,
        decodeURIComponent(request.url.split("?")[0].slice(8)),
      );
      if (
        !filename.startsWith(imageRoot + path.sep) ||
        !fs.statSync(filename).isFile()
      )
        return next();
      const types = {
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
      };
      response.setHeader(
        "Content-Type",
        types[path.extname(filename)] || "application/octet-stream",
      );
      fs.createReadStream(filename).pipe(response);
    } catch {
      next();
    }
  });
}

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    {
      name: "shared-site-images",
      configureServer: imageMiddleware,
      configurePreviewServer: imageMiddleware,
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          "legacy-js-api",
          "color-functions",
          "global-builtin",
          "import",
        ],
      },
    },
  },
  build: { chunkSizeWarningLimit: 900 },
});
