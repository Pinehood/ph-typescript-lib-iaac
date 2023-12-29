import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { BuiltInstance, PostgresInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";
import { default as POSTGRES_EXPORTER_TEMPLATE } from "./postgres.exporter";

export default (instance: PostgresInstanceType): BuiltInstance => {
  const image = `postgres:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  let snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${instance.password}
      POSTGRES_USER: ${instance.username}
      POSTGRES_DB: ${instance.database}
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
    snippet += "\n" + POSTGRES_EXPORTER_TEMPLATE(instance);
  }

  return {
    image,
    instance,
    ports,
    snippet,
    volumes,
  };
};
