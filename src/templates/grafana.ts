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
  GrafanaInstanceType,
  PrometheusInstanceType,
} from "../static/types";
import { EMPTY } from "../static/constants";

const datasourceYml = (prometheusHost?: string) => `apiVersion: 1

deleteDatasources:${
  prometheusHost
    ? `
  - name: Prometheus
    orgId: 1`
    : ""
}

datasources:${
  prometheusHost
    ? `
  - name: Prometheus
    orgId: 1
    id: 1
    uid: GaKO7Fx7k
    type: prometheus
    typeLogoUrl: public/app/plugins/datasource/prometheus/img/prometheus_logo.svg
    typeName: Prometheus
    access: proxy
    url: http://${prometheusHost}:9090
    jsonData:
      httpMethod: GET
    user:
    password:
    database:
    basicAuth: false
    readOnly: false
    isDefault: true`
    : ""
}
`;

const dashboardYml = () => `apiVersion: 1

providers:
`;

export default (instance: GrafanaInstanceType): BuiltInstance => {
  const image = `grafana/grafana:${instance.version}`;
  const volumes = getServiceVolumes(instance);
  const configs: BuiltInstanceConfig[] = [
    {
      create: "dir",
      path: "./grafana-config",
      volumeIdx: volumes.findIndex(([, volume]) =>
        volume.endsWith("provisioning")
      ),
    },
    {
      create: "file",
      path: "./grafana-config/datasources/datasource.yml",
      content: datasourceYml(instance.prometheus?.name),
    },
    {
      create: "file",
      path: "./grafana-config/dashboards/dashboard.yml",
      content: dashboardYml(),
    },
  ];
  volumes[configs[0].volumeIdx][0] = configs[0].path;

  const ports =
    instance.options.expose === true ? getServicePorts(instance) : [];

  const snippet = `
  ${instance.service}-${instance.id}:
    container_name: ${instance.name}
    image: ${image}
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: ${instance.username}
      GF_SECURITY_ADMIN_PASSWORD: ${instance.password}
      GF_USERS_DEFAULT_THEME: dark
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
