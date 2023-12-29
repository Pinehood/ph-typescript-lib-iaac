import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
} from "../utils/creators";
import { getServicePorts } from "../utils/getters";
import { AdminerInstanceType, BuiltInstance } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: AdminerInstanceType): BuiltInstance => {
  const image = `adminer:${instance.version}`;
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    ${instance.options.expose === true ? createPortsSection(ports) : EMPTY}
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    ${
      instance.options.healthcheck === true
        ? createHealthcheckSection(instance.service)
        : EMPTY
    }
    ${instance.dependsOn ? createDependsOnSection(instance.dependsOn) : EMPTY}`;

  return {
    image,
    instance,
    ports,
    snippet,
    volumes: [],
  };
};
