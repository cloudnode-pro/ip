import {defineConfig} from "vitest/config";

declare const process: {env: Record<string, string>}

export default defineConfig({
    test: {
        reporters: process.env.GITHUB_ACTIONS ? "default" : ["default", "html"],
        coverage: {
            reporter: process.env.GITHUB_ACTIONS ? "text" : ["text", "html"],
            include: ["src/**"],
            all: true,
            thresholds: {
                100: true,
            },
        },
    },
});
