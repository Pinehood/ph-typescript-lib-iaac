import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { BuiltInstance, WikiJsInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: WikiJsInstanceType): BuiltInstance => {
  const image = `requarks/wiki:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      DB_TYPE: mysql
      DB_HOST: ${instance.mysql.host}
      DB_PORT: ${instance.mysql.port}
      DB_USER: ${instance.mysql.user}
      DB_PASS: ${instance.mysql.pass}
      DB_NAME: ${instance.mysql.db}
    ${instance.options.persist === true ? createVolumesSection(volumes) : EMPTY}
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
    volumes,
  };
};
