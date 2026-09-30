import { defineConfig } from "tsdown";

export default defineConfig({
    entry: { index: "src/index.ts", "ext/index": "src/lib-ext/index.ts" },
    deps: { neverBundle: true },
    format: {
        cjs: { target: ["node16"] },
    },
    outputOptions: {
        comments: false,
    },
    outExtensions({ format }) {
        return { js: `.js`, dts: `.d.ts` };
    },
    minify: false,
    treeshake: false,
});
