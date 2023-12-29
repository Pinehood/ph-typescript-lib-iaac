import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
} from "../utils/creators";
import { getServicePorts } from "../utils/getters";
import { BuiltInstance, KibanaInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: KibanaInstanceType): BuiltInstance => {
  const image = `kibana:${instance.version}`;
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      server.host: 0.0.0.0
      xpack.monitoring.ui.container.elasticsearch.enabled: "true"
      SERVERNAME: kibana
      ELASTICSEARCH_URL: http://${
        instance.elasticsearch?.name ?? "localhost"
      }:9200
      ELASTICSEARCH_HOSTS: http://${
        instance.elasticsearch?.name ?? "localhost"
      }:9200
      ELASTICSEARCH_USERNAME: elastic
      ELASTICSEARCH_PASSWORD: ${instance.elasticsearch?.password ?? ""}
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
