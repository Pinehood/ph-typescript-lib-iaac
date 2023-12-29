import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { BuiltInstance, MySqlInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";
import { default as MYSQL_EXPORTER_TEMPLATE } from "./mysql.exporter";

export default (instance: MySqlInstanceType): BuiltInstance => {
  const image = `mysql:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  let snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${instance.database}
      MYSQL_USER: ${instance.username}
      MYSQL_PASSWORD: ${instance.password}
      MYSQL_ROOT_PASSWORD: ${instance.rootPassword}
    ${instance.options.persist === true ? createVolumesSection(volumes) : EMPTY}
    ${instance.options.expose === true ? createPortsSection(ports) : EMPTY}
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    ${
      instance.options.healthcheck === true
        ? createHealthcheckSection(instance.service)
        : EMPTY
    }
    ${instance.dependsOn ? createDependsOnSection(instance.dependsOn) : EMPTY}`;

  if (instance.options.exporter === true) {
    snippet += "\n" + MYSQL_EXPORTER_TEMPLATE(instance);
  }

  return {
    image,
    instance,
    ports,
    snippet,
    volumes,
  };
};
