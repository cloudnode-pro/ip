import {defineConfig} from "vitepress";
import typedocSidebar from "../api/typedoc-sidebar.json";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "@cldn/ip",
    description: "Documentation",
    cleanUrls: true,
    themeConfig: {
        nav: [
            {text: "API Reference", link: "/api/"},
        ],

        sidebar: [
            {
                text: "API",
                items: typedocSidebar,
            },
        ],

        outline: [2, 3],

        socialLinks: [
            {icon: "github", link: "https://github.com/cloudnode-pro/ip"},
            {icon: "matrix", link: "https://matrix.to/#/@cloudnode:matrix.org"},
        ],

        search: {
            provider: "local",
        },

        footer: {
            copyright: `Copyright © 2024–2025 Cloudnode OÜ.`,
            message: `Released under the <a href="https://github.com/cloudnode-pro/ip/blob/master/COPYING" target="_blank">LGPL-3.0</a> licence.`
        }
    },
});
