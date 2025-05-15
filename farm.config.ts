import { defineConfig } from "@farmfe/core";
import tsconfigPaths from "vite-tsconfig-paths";
import remoteFilesPlugin from "./remote-files-plugin/remote-files-plugin";

export default defineConfig({
  vitePlugins: [tsconfigPaths()],
  plugins: ["@farmfe/plugin-react", remoteFilesPlugin({})],
  compilation: {
    lazyCompilation: true,
  },
  server: {
    port: 3000,
  },
});
