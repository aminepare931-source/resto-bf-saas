import { defineConfig, loadEnv, mergeConfig, type UserConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isDevBuild = command === "build" && mode === "development";

  const plugins: UserConfig["plugins"] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
  ];

  if (command === "build") {
    plugins.push(nitro({ defaultPreset: "cloudflare-module" }));
  }

  plugins.push(viteReact());

  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(loadedEnv).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  );

  let config: UserConfig = {
    define: envDefine,
    // Dev builds: keep React DevTools on the dev react-dom without flipping the
    // global NODE_ENV (a global flip would emit jsxDEV, which the SSR runtime can't resolve).
    ...(isDevBuild
      ? {
          environments: { client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } } },
          esbuild: { keepNames: true },
        }
      : {}),
    // Lightning CSS in dev too, so the preview matches the build's CSS pipeline.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    // Pre-bundle React core only: including @tanstack/react-start here would pull
    // its node:async_hooks server entry into the client bundle and crash hydration.
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
      ignoreOutdatedRequests: true,
    },
    plugins,
  };

  config = mergeConfig({ server: { host: "::", port: 8080 } }, config);
  config = mergeConfig(config, {
    server: {
      watch: {
        awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 },
      },
    },
  });

  return config;
});
