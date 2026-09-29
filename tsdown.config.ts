import { defineConfig } from "tsdown";

export default defineConfig({
    entry: { main: "src/index.ts", ext: "src/lib-ext/index.ts" },
    deps: { neverBundle: true },
    format: {
        cjs: { target: ["node16"] },
    },
});
