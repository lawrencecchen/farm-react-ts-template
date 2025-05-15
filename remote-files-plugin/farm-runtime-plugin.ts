/**
 * Support import.meta.loadManaComponent in the browser
 */

import { loadManaComponent } from "./loadManaComponent";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let farmModuleSystem: any;

export default {
  name: "farm-runtime-load-mana-component-plugin",
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  bootstrap(moduleSystem: any) {
    farmModuleSystem = moduleSystem;
  },
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  moduleCreated(module: any) {
    // load the component from the remote server
    module.meta.loadManaComponent = (componentPath: string) => {
      return loadManaComponent(componentPath, farmModuleSystem);
    };
  },
};
