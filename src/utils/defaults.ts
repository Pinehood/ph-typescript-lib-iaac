import { Instance } from "../static/types";
import { DEFAULT_MAPPINGS } from "../static/constants";

export const DEFAULT_POSTGRES = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.postgres.id,
    service: "postgres",
    version: "12.1",
    name: `${name ?? "default-postgres"}`,
    username: `default-${name ?? "postgres"}-user`,
    password: `default-${name ?? "postgres"}-pass`,
    database: `default-${name ?? "postgres"}-db`,
    options: {
      expose: true,
      persist: true,
      exporter: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_MYSQL = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.mysql.id,
    service: "mysql",
    version: "5.8",
    name: `${name ?? "default-mysql"}`,
    username: `default-${name ?? "mysql"}-user`,
    rootPassword: `default-${name ?? "mysql"}-root-pass`,
    password: `default-${name ?? "mysql"}-pass`,
    database: `default-${name ?? "mysql"}-db`,
    options: {
      expose: true,
      persist: true,
      exporter: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_ADMINER = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.adminer.id,
    service: "adminer",
    version: "latest",
    name: `${name ?? "default-adminer"}`,
    options: {
      expose: true,
      healthcheck: true,
      scalable: true,
    },
  };
};

export const DEFAULT_REDIS = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.redis.id,
    service: "redis",
    version: "latest",
    name: `${name ?? "default-redis"}`,
    password: `default-${name ?? "redis"}-pass`,
    options: {
      expose: true,
      persist: true,
      exporter: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_GITEA = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.gitea.id,
    service: "gitea",
    name: `${name ?? "default-gitea"}`,
    version: "latest",
    options: {
      expose: true,
      persist: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_JENKINS = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.jenkins.id,
    service: "jenkins",
    name: `${name ?? "defaut-jenkins"}`,
    version: "latest",
    options: {
      expose: true,
      persist: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_REDMINE = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.redmine.id,
    service: "redmine",
    name: `${name ?? "default-redmine"}`,
    version: "latest",
    mysql: {
      db: `default-${name ?? "redmine"}-db`,
      host: "0.0.0.0",
      port: 3306,
      pass: `default-${name ?? "redmine"}-pass`,
      user: `default-${name ?? "redmine"}-user`,
    },
    options: {
      expose: true,
      persist: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_WIKIJS = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.wikijs.id,
    service: "wikijs",
    name: `${name ?? "default-wikijs"}`,
    version: "latest",
    mysql: {
      db: `default-${name ?? "wikijs"}-db`,
      host: "0.0.0.0",
      port: 3306,
      pass: `default-${name ?? "wikijs"}-pass`,
      user: `default-${name ?? "wikijs"}-user`,
    },
    options: {
      expose: true,
      persist: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_PROMETHEUS = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.prometheus.id,
    service: "prometheus",
    name: `${name ?? "default-prometheus"}`,
    version: "latest",
    targets: ["localhost:9090", "host.docker.internal:3000"],
    options: {
      expose: true,
      healthcheck: true,
      persist: true,
    },
  };
};

export const DEFAULT_GRAFANA = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.grafana.id,
    service: "grafana",
    name: `${name ?? "default-grafana"}`,
    version: "latest",
    username: "default-grafana-user",
    password: "default-grafana-pass",
    options: {
      expose: true,
      healthcheck: true,
      persist: true,
    },
  };
};

export const DEFAULT_KIBANA = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.kibana.id,
    service: "kibana",
    name: `${name ?? "default-kibana"}`,
    version: "7.16.3",
    options: {
      expose: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_LOGSTASH = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.logstash.id,
    service: "logstash",
    name: `${name ?? "default-logstash"}`,
    version: "7.16.3",
    options: {
      expose: true,
      healthcheck: true,
    },
  };
};

export const DEFAULT_ELASTICSEARCH = (name?: string): Instance => {
  return {
    id: DEFAULT_MAPPINGS.elasticsearch.id,
    service: "elasticsearch",
    name: `${name ?? "default-elasticsearch"}`,
    version: "7.16.3",
    node: "es01",
    cluster: "es-docker-cluster",
    password: "default-es-pass",
    options: {
      expose: true,
      healthcheck: true,
      persist: true,
    },
  };
};
