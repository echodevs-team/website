import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "server-only": fileURLToPath(new URL("./tests/fixtures/server-only.ts", import.meta.url)) } },
  test: { include: ["tests/integration/**/*.test.{ts,tsx}"], fileParallelism: false, testTimeout: 30000, hookTimeout: 30000 },
});
