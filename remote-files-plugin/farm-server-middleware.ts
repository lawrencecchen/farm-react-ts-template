/**
 * Lazy compilation middleware. Using the same logic as HMR middleware
 */

import {
  type Server,
  type DevServerMiddleware,
  colors,
  getDynamicResources,
} from "@farmfe/core";
import type { Context, Next } from "koa";

export function compileManaComponentMiddleware(
  devSeverContext: Server,
): ReturnType<DevServerMiddleware> {
  const compiler = devSeverContext.getCompiler();

  return async (ctx: Context, next: Next) => {
    if (ctx.path === "/api/component/compile") {
      const path = ctx.query.path as string;

      devSeverContext.logger.info(
        `Compile mana component started for path ${colors.cyan(path)}.`,
      );
      const start = Date.now();

      let result: Awaited<ReturnType<typeof compiler.update>> | undefined;
      try {
        // compile the component incrementally
        result = await compiler.update([path]);
      } catch (e) {
        devSeverContext.logger.error(
          `Compile mana component failed for path ${colors.cyan(path)}. Error: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      if (!result) {
        devSeverContext.logger.error(
          `Compile mana component failed for path ${colors.cyan(path)}. result not found.`,
        );
        return;
      }

      devSeverContext.logger.info(
        `Compile mana component finished for path ${colors.cyan(path)} in ${colors.green(
          `${Date.now() - start}ms`,
        )}.`,
      );

      const {
        added,
        changed,
        removed,
        immutableModules,
        mutableModules,
        boundaries,
      } = result;

      const { dynamicResources, dynamicModuleResourcesMap } =
        getDynamicResources(result?.dynamicResourcesMap ?? null);

      const returnObj = `{
        added: [${formatCompileResult(added)}],
        changed: [${formatCompileResult(changed)}],
        removed: [${formatCompileResult(removed)}],
        immutableModules: ${JSON.stringify(immutableModules.trim())},
        mutableModules: ${JSON.stringify(mutableModules.trim())},
        boundaries: ${JSON.stringify(boundaries)},
        dynamicResources: ${JSON.stringify(dynamicResources)},
        dynamicModuleResourcesMap: ${JSON.stringify(dynamicModuleResourcesMap)}
      }`;

      const code = `export default ${returnObj}`;

      ctx.type = "application/javascript";
      ctx.body = code;
      // enable cors
      ctx.set("Access-Control-Allow-Origin", "*");
      ctx.set("Access-Control-Allow-Methods", "*");
      ctx.set("Access-Control-Allow-Headers", "*");
    } else {
      await next();
    }
  };
}

// For window compatibility
function formatCompileResult(array: string[]) {
  return array.map((item) => `'${item.replaceAll("\\", "\\\\")}'`).join(", ");
}
