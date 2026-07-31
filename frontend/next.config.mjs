import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const redirectsConfig = JSON.parse(readFileSync(path.join(__dirname, "redirects.json"), "utf-8"));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // 301 redirects from old (e.g. WordPress) URLs to their new equivalents —
  // this is what preserves search ranking during a platform migration.
  // Edit redirects.json to add entries; no code changes needed here.
  async redirects() {
    return redirectsConfig.redirects || [];
  },
};

export default nextConfig;
