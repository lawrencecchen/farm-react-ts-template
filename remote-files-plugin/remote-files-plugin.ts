import type { JsPlugin } from "@farmfe/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchCustomComponent } from "./fetchCustomComponent";

import { compileManaComponentMiddleware } from "./farm-server-middleware";

export interface PluginOptions {
  _noop?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "..", "src");

const pathAliases = {
  "~": srcDir,
  "@tremor/react": path.join(srcDir, "tremor/components/index.ts"),
  "@manaflow/web": path.join(srcDir, "lib/manaflow-web.ts"),
  "@manaflow/grid": path.join(srcDir, "manaflow-grid/manaflow-grid.tsx"),
};

export default function remoteFilesPlugin(_options: PluginOptions): JsPlugin {
  // return a object that exposes hook
  return {
    name: "remote-files-plugin",
    config(config) {
      config.compilation ??= {};
      config.compilation.runtime ??= {};
      config.compilation.runtime.plugins ??= [];

      // alias
      config.compilation.resolve ??= {};
      config.compilation.resolve.alias ??= {};
      // Add the path aliases to the config
      for (const [alias, targetPath] of Object.entries(pathAliases)) {
        config.compilation.resolve.alias[alias] = targetPath;
      }

      // Add the farm-runtime-plugin to the runtime plugins
      config.compilation.runtime.plugins.push(
        path.join(__dirname, "farm-runtime-plugin.ts"),
      );

      config.server ??= {};
      config.server.middlewares ??= [];

      // Add the compileManaComponentMiddleware to the server middlewares
      config.server.middlewares.push(compileManaComponentMiddleware);

      return config;
    },

    resolve: {
      filters: {
        // Match both static and dynamic import patterns
        sources: [
          "^~/custom/.+", // For static imports starting with ~/custom/
          // ".*", // For dynamic imports using virtual-fs path
        ],
        // Match any importing file - using .+ matches any character
        importers: [".*"],
      },
      executor: (params) => {
        console.log("[resolve]", params);
        // // Check if source matches any of our aliases
        // for (const [alias, targetPath] of Object.entries(pathAliases)) {
        //   if (params.source.startsWith(alias)) {
        //     return {
        //       resolvedPath: params.source.replace(alias, targetPath),
        //     };
        //   }
        // }
        return {
          resolvedPath: params.source,
          sideEffects: false,
        };
      },
    },
    load: {
      filters: {
        resolvedPaths: ["~/custom/.*"],
      },
      async executor({ resolvedPath }) {
        console.log("[load]", resolvedPath);
        // example: [load] /Users/lawrencechen/fun/autobuild11/templates/farm-react-ts/src/custom/admin_panels_by_month_chart@2.tsx
        const componentKey = resolvedPath.split("/").pop()?.replace(".tsx", "");
        console.log("componentKey", componentKey);
        if (!componentKey) {
          throw new Error("Invalid component key");
        }
        const customComponent = await fetchCustomComponent(componentKey);
        if (!customComponent) {
          return {
            moduleType: "tsx",
            content: `\
export default function NewComponent() {
  return <div>Empty module: ${componentKey}</div>;
}`,
          };
        }
        return {
          content: customComponent.contents,
          moduleType: "tsx",
        };
        // if (resolvedPath.endsWith(".test")) {
        //   return {
        //     content: "test file",
        //     sourceMap: null,
        //     moduleType: "tsx",
        //   };
        // }
      },
    },
  };
}
