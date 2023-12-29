import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
} from "../utils/creators";
import { getServicePorts } from "../utils/getters";
import { BuiltInstance, LogstashInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: LogstashInstanceType): BuiltInstance => {
  const image = `logstash:${instance.version}`;
  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      http.host: 0.0.0.0
      xpack.monitoring.enabled: "true"
      xpack.monitoring.elasticsearch.hosts: "http://${
        instance.elasticsearch?.name ?? "localhost"
      }:9200"
      xpack.monitoring.elasticsearch.username: elastic
      xpack.monitoring.elasticsearch.password: ${
        instance.elasticsearch?.password ?? ""
      }
      LS_JAVA_OPTS: "-Xms512m -Xmx512m"
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
