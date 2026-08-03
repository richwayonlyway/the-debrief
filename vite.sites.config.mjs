import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: ".sites-static",
  plugins: [
    cloudflare({
      config: {
        main: "./sites/worker.js",
        compatibility_flags: ["nodejs_compat"],
      },
    }),
  ],
});
