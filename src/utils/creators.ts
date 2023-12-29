import {
  BaseInstanceType,
  BuiltInstance,
  Network,
  ServiceType,
} from "../static/types";
import { EMPTY } from "../static/constants";
import { getUniqueNetworks } from "./getters";
import { Logger } from "./logger";

export function createNetworksSection(networks: Network[]): string {
  try {
    if (!networks || networks.length === 0) return EMPTY;
    return `networks:${networks.map((n) => `\n      - ${n.name}`).join("")}`;
  } catch {
    return EMPTY;
  }
}

export function createVolumesSection(volumes: [string, string][]): string {
  try {
    if (!volumes || volumes.length === 0) return EMPTY;
    return `volumes:${volumes
      .map((v) => `\n      - "${v[0]}:${v[1]}"`)
      .join("")}`;
  } catch {
    return EMPTY;
  }
}

export function createPortsSection(ports: [number, number][]): string {
  try {
    if (!ports || ports.length === 0) return EMPTY;
    return `ports:${ports.map((p) => `\n      - ${p[0]}:${p[1]}`).join("")}`;
  } catch {
    return EMPTY;
  }
}

export function createDependsOnSection(
  dependsOn: string[] | BaseInstanceType[]
): string {
  try {
    if (!dependsOn || dependsOn.length === 0) return EMPTY;
    return `depends_on:${dependsOn
      ?.map((d: string | BaseInstanceType) => {
        if (typeof d === "string") {
          return `\n      - ${d}`;
        } else if (typeof d === "object") {
          return `\n      - ${d.service}-${d.id}`;
        }
      })
      .join("")}`;
  } catch {
    return EMPTY;
  }
}

export function createEnvironmentSection(environment: Record<string, any>) {
  try {
    if (!environment || Object.keys(environment).length === 0) return EMPTY;
    return `environment:${Object.keys(environment)
      .map((key) => {
        const env = environment[key];
        if (env) {
          if (typeof env === "boolean") {
            return `\n      ${key}: "${env}"`;
          } else {
            return `\n      ${key}: ${env}`;
          }
        }
      })
      .join("")}`;
  } catch {
    return EMPTY;
  }
}

export function createHealthcheckSection(
  service: ServiceType,
  instance?: any
): string {
  function curlHealthcheck(url: string): string {
    return `healthcheck:
      test: ["CMD-SHELL", "curl ${url} || exit 1"]
      interval: 15s
      timeout: 15s
      retries: 10`;
  }
  function wgetHealthcheck(url: string): string {
    return `healthcheck:
      test:
        [
          "CMD-SHELL",
          "wget --no-verbose --tries=1 --spider ${url} || exit 1",
        ]
      interval: 15s
      timeout: 15s
      retries: 10`;
  }
  try {
    if (service.startsWith("adminer")) {
      return `healthcheck:
      test: ["CMD-SHELL", "ps -ef | grep 8080 | grep -v grep | wc -l"]
      interval: 15s
      timeout: 15s
      retries: 10`;
    } else if (service.startsWith("postgres")) {
      return `healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \$\$\$POSTGRES_USER -d \$\$\$POSTGRES_DB"]
      interval: 15s
      timeout: 15s
      retries: 10`;
    } else if (service.startsWith("redis")) {
      return `healthcheck:
      test: ["CMD-SHELL", "redis-cli --raw -a ${instance.password} incr ping"]
      interval: 15s
      timeout: 15s
      retries: 10`;
    } else if (service.startsWith("mysql")) {
      return `healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -u \$\$\$MYSQL_USER --password=\$\$\$MYSQL_PASSWORD"]
      interval: 15s
      timeout: 15s
      retries: 10`;
    } else if (service.startsWith("gitea")) {
      return curlHealthcheck("http://localhost:3000/api/healthz");
    } else if (service.startsWith("jenkins")) {
      return curlHealthcheck("http://localhost:8080/login");
    } else if (service.startsWith("redmine")) {
      return curlHealthcheck("http://localhost:3000");
    } else if (service.startsWith("wikijs")) {
      return curlHealthcheck("http://localhost:3000/healthz");
    } else if (service.startsWith("prometheus")) {
      return wgetHealthcheck("http://localhost:9090/metrics");
    } else if (service.startsWith("grafana")) {
      return wgetHealthcheck("http://localhost:3000");
    } else if (service.startsWith("kibana")) {
      return curlHealthcheck("http://localhost:5601");
    } else if (service.startsWith("logstash")) {
      return curlHealthcheck("http://localhost:9600");
    } else if (service.startsWith("elasticsearch")) {
      return curlHealthcheck("http://localhost:9200");
    }
  } catch (error) {
    new Logger("Creators").error(error);
    return EMPTY;
  }
}

export function createNetworksDefinitions(
  builtInstances: BuiltInstance[]
): string {
  try {
    return `${getUniqueNetworks(builtInstances)
      .map((n) => {
        if (n.external === false) {
          return `
  ${n.name}:
    driver: ${n.driver}
    external: false`;
        } else if (n.external === true) {
          return `
  ${n.name}:
    external: true`;
        }
      })
      .join("")}`;
  } catch {
    return EMPTY;
  }
}
