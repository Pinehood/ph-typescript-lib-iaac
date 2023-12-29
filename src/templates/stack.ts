import { createNetworksDefinitions } from "../utils/creators";
import { getUniqueVolumes } from "../utils/getters";
import { isWindows } from "../utils/helpers";
import { BuiltInstance, BuiltStack, Stack } from "../static/types";

export default (stack: Stack, builtInstances: BuiltInstance[]): BuiltStack => {
  const volumes = `${getUniqueVolumes(builtInstances)
    .map(
      (v) => `
  ${v}: {}`,
    )
    .join("")}`;

  const snippet = `version: "3"
    
services:@services@
  
networks:@networks@
  
volumes:@volumes@
    `
    .replace(
      "@services@",
      builtInstances
        .map((bi) => bi.snippet.replace(/\n    @empty@/g, ""))
        .join("\n"),
    )
    .replace("@networks@", createNetworksDefinitions(builtInstances))
    .replace("@volumes@", isWindows() ? volumes : "");

  return {
    location: `${process.cwd()}/${stack[0]}`,
    instances: builtInstances,
    snippet,
    stack,
  };
};
