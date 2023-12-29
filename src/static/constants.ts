import { loadDotEnv } from "../utils/environment";
import { DefaultMappings, ServiceType } from "./types";

loadDotEnv();

export const NAME_SPLITTER = "__";
export const EMPTY = "@empty@";
export const YML_FILE_NAME = process.env.YML_FILE_NAME ?? "docker-compose.yml";
export const ON_UPDATE_INTERVAL_MS = parseInt(
  process.env.ON_UPDATE_INTERVAL_MS ?? "7500"
);
export const VERBOSE_EXECUTE =
  (process.env.VERBOSE_EXECUTE ?? "true") === "true";
export const ALLOWED_COMMANDS = (
  process.env.ALLOWED_COMMANDS ??
  "docker ps,docker logs,docker inspect,docker stats,docker network ls"
).split(",");

export const DEFAULT_MAPPINGS: Record<ServiceType, DefaultMappings> = {
  adminer: {
    id: 1,
    volumes: [],
    ports: [8080],
  },
  gitea: {
    id: 2,
    volumes: ["/data"],
    ports: [3000],
  },
  jenkins: {
    id: 3,
    volumes: ["/var/jenkins_home"],
    ports: [8080, 8443, 50000],
  },
  mysql: {
    id: 4,
    volumes: ["/var/lib/mysql"],
    ports: [3306],
  },
  postgres: {
    id: 5,
    volumes: ["/var/lib/postgresql/data"],
    ports: [5432],
  },
  redis: {
    id: 6,
    volumes: ["/data"],
    ports: [6379],
  },
  redmine: {
    id: 7,
    volumes: ["/home/redmine/data"],
    ports: [3000],
  },
  wikijs: {
    id: 8,
    volumes: ["/var/wiki/repo"],
    ports: [3000],
  },
  prometheus: {
    id: 9,
    volumes: ["/etc/prometheus", "/etc/prometheus/prometheus.yml"],
    ports: [9090],
  },
  grafana: {
    id: 10,
    volumes: ["/var/lib/grafana", "/etc/grafana/provisioning"],
    ports: [3000],
  },
  kibana: { id: 11, volumes: [], ports: [5601] },
  logstash: { id: 12, volumes: [], ports: [5000, 9600] },
  elasticsearch: {
    id: 13,
    volumes: ["/usr/share/elasticsearch/data"],
    ports: [9200, 9300],
  },
  custom: null,
};
