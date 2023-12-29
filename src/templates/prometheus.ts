import {
  createDependsOnSection,
  createHealthcheckSection,
  createNetworksSection,
  createPortsSection,
  createVolumesSection,
} from "../utils/creators";
import { getServicePorts, getServiceVolumes } from "../utils/getters";
import {
  BuiltInstance,
  BuiltInstanceConfig,
  PrometheusInstanceType,
} from "../static/types";
import { EMPTY } from "../static/constants";

const prometheusYml = (targets: string[]) => `global:
  scrape_interval: 30s
  scrape_timeout: 15s
  evaluation_interval: 45s
scrape_configs:
  - job_name: metrics-scrapper
    metrics_path: /metrics
    scheme: http
    honor_timestamps: true
    follow_redirects: true
    static_configs:
      - targets:
${targets.map((t) => `          - ${t}`).join("\n")}
`;

export default (instance: PrometheusInstanceType): BuiltInstance => {
  const image = `prom/prometheus:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const configs: BuiltInstanceConfig[] = [
    {
      create: "dir",
      path: "./prometheus-config",
    },
    {
      create: "file",
      path: "./prometheus-config/prometheus.yml",
      content: prometheusYml(instance.targets),
      volumeIdx: volumes.findIndex(([, volume]) =>
        volume.endsWith("prometheus.yml")
      ),
    },
  ];
  volumes[configs[1].volumeIdx][0] = configs[1].path;

  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    ${instance.options.expose === true ? createPortsSection(ports) : EMPTY}
    ${instance.options.persist === true ? createVolumesSection(volumes) : EMPTY}
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
    configs,
  };
};
