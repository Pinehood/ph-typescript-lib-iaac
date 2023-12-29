import {
  createDependsOnSection,
  createEnvironmentSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { BuiltInstance, CustomInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: CustomInstanceType): BuiltInstance => {
  const image = `${instance.image}:${instance.version}`;
  const ports = instance.options.expose === true ? instance.ports ?? [] : [];
  const volumes = instance.volumes ?? [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    ${instance.options.persist === true ? createVolumesSection(volumes) : EMPTY}
    ${instance.options.expose === true ? createPortsSection(ports) : EMPTY}
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    ${
      instance.environment
        ? createEnvironmentSection(instance.environment)
        : EMPTY
    }
    ${instance.dependsOn ? createDependsOnSection(instance.dependsOn) : EMPTY}`;

  return {
    image,
    instance,
    ports,
    snippet,
    volumes,
  };
};
