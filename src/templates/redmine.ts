import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { BuiltInstance, RedmineInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: RedmineInstanceType): BuiltInstance => {
  const image = `redmine:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      REDMINE_DB_MYSQL: ${instance.mysql.host}
      REDMINE_DB_PORT: ${instance.mysql.port}
      REDMINE_DB_USERNAME: ${instance.mysql.user}
      REDMINE_DB_PASSWORD: ${instance.mysql.pass}
      REDMINE_DB_DATABASE: ${instance.mysql.db}
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
