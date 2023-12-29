import {
  createDependsOnSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { GiteaInstanceType, BuiltInstance } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: GiteaInstanceType): BuiltInstance => {
  const image = `gitea/gitea:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    ${instance.options.persist === true ? createVolumesSection(volumes) : EMPTY}
    ${instance.options.expose === true ? createPortsSection(ports) : EMPTY}
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    ${instance.dependsOn ? createDependsOnSection(instance.dependsOn) : EMPTY}`;

  return {
    image,
    instance,
    ports,
    snippet,
    volumes,
  };
};
