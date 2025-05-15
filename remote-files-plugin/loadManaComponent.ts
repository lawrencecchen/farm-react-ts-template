import type { ReactElement } from "react";

interface Resource {
  path: string;
  type: 0 | 1; // 0: script, 1: link
}

type ModuleMap = Record<
  string,
  (
    // biome-ignore lint/suspicious/noExplicitAny: todo
    module: any,
    // biome-ignore lint/suspicious/noExplicitAny: todo
    exports: any,
    // biome-ignore lint/suspicious/noExplicitAny: todo
    require: (id: string) => any,
    // biome-ignore lint/suspicious/noExplicitAny: todo
    dynamicRequire: (id: string) => Promise<any>,
  ) => void
>;

interface RawComponentCompileResult {
  added: string[];
  changed: string[];

  immutableModules: string;
  mutableModules: string;
  dynamicResources: Resource[] | null;
  dynamicModuleResourcesMap: Record<string, number[]> | null;
}

type ComponentCompileResult = Omit<
  RawComponentCompileResult,
  "immutableModules" | "mutableModules"
> & {
  modules: ModuleMap;
};

export async function loadManaComponent(
  componentPath: string,
  // biome-ignore lint/suspicious/noExplicitAny: todo
  moduleSystem: any,
): Promise<ReactElement> {
  // 1. trigger the remote server to compile the component
  const module = await import(`/api/component/compile?path=${componentPath}`);
  const result: RawComponentCompileResult = module.default || module;

  // 2. apply the compiled modules to Farm's module system
  const immutableModules = new Function(`return ${result.immutableModules}`)();
  const mutableModules = new Function(`return ${result.mutableModules}`)();
  const modules = { ...immutableModules, ...mutableModules };

  await applyComponentCompileResult(
    {
      added: result.added,
      changed: result.changed,
      modules,
      dynamicResources: result.dynamicResources,
      dynamicModuleResourcesMap: result.dynamicModuleResourcesMap,
    },
    moduleSystem,
  );

  // 3. load and return the component
  const component = moduleSystem.require(componentPath);
  return component.default || component;
}

async function applyComponentCompileResult(
  result: ComponentCompileResult,
  // biome-ignore lint/suspicious/noExplicitAny: todo
  moduleSystem: any,
) {
  for (const id of result.added) {
    moduleSystem.register(id, result.modules[id]);
  }

  for (const id of result.changed) {
    moduleSystem.update(id, result.modules[id]);
  }

  if (result.dynamicResources && result.dynamicModuleResourcesMap) {
    moduleSystem.setDynamicModuleResourcesMap(
      result.dynamicResources,
      result.dynamicModuleResourcesMap,
    );
  }
}
