import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import { BuiltInstance, ElasticsearchInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: ElasticsearchInstanceType): BuiltInstance => {
  const image = `elasticsearch:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      network.host: 0.0.0.0
      node.name: ${instance.node}
      cluster.name: ${instance.cluster}
      discovery.type: single-node
      discovery.seed_hosts: ${instance.node}
      bootstrap.memory_lock: "true"
      xpack.security.enabled: "true"
      xpack.monitoring.collection.enabled: "true"
      xpack.license.self_generated.type: trial
      ELASTIC_PASSWORD: ${instance.password}
      ES_JAVA_OPTS: "-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
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
