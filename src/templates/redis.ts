import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { BuiltInstance, RedisInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";
import { default as REDIS_EXPORTER_TEMPLATE } from "./redis.exporter";

export default (instance: RedisInstanceType): BuiltInstance => {
  const image = `redis:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  let snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    command: redis-server --save 100 10 --loglevel warning --requirepass ${
      instance.password
    }
    ${instance.options.persist === true ? createVolumesSection(volumes) : EMPTY}
    ${instance.options.expose === true ? createPortsSection(ports) : EMPTY}
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    ${
      instance.options.healthcheck === true
        ? createHealthcheckSection(instance.service, instance)
        : EMPTY
    }
    ${instance.dependsOn ? createDependsOnSection(instance.dependsOn) : EMPTY}`;

  if (instance.options.exporter === true) {
    snippet += "\n" + REDIS_EXPORTER_TEMPLATE(instance);
  }

  return {
    image,
    instance,
    ports,
    snippet,
    volumes,
  };
};
