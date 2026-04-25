import path from "node:path";
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Parent folder has another lockfile; scope tracing to this app
  outputFileTracingRoot: appDir,
};

export default nextConfig;
