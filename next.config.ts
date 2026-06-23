import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    additionalData: `@use "${path.resolve("styles/_variables.scss")}" as *;`,
  },
  reactCompiler: false,
};

export default nextConfig;
