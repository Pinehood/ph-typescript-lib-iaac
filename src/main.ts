import { StackManager } from "./managers/stack";
import {
  BuiltStack,
  ElasticsearchInstanceType,
  GrafanaInstanceType,
  KibanaInstanceType,
  LogstashInstanceType,
  Network,
  PrometheusInstanceType,
  RedmineInstanceType,
  Stack,
  WikiJsInstanceType,
} from "./static/types";
import {
  DEFAULT_ADMINER,
  DEFAULT_GITEA,
  DEFAULT_JENKINS,
  DEFAULT_MYSQL,
  DEFAULT_POSTGRES,
  DEFAULT_REDIS,
  DEFAULT_REDMINE,
  DEFAULT_WIKIJS,
  DEFAULT_PROMETHEUS,
  DEFAULT_GRAFANA,
  DEFAULT_ELASTICSEARCH,
  DEFAULT_KIBANA,
  DEFAULT_LOGSTASH,
} from "./utils/defaults";
import { start } from "./utils/helpers";
import { Logger } from "./utils/logger";

const net: Network = {
  name: "loc",
  driver: "bridge",
  external: false,
};

const ext: Network = {
  name: "ext",
  external: true,
};

const postgres = DEFAULT_POSTGRES();
postgres.networks = [net, ext];

const mysql = DEFAULT_MYSQL();
mysql.networks = [net, ext];

const adminer = DEFAULT_ADMINER();
adminer.networks = [net, ext];

const redis = DEFAULT_REDIS();
redis.networks = [net];

const gitea = DEFAULT_GITEA();
gitea.networks = [net];

const jenkins = DEFAULT_JENKINS();
jenkins.networks = [net];

const redmine = DEFAULT_REDMINE();
redmine.networks = [net, ext];
(redmine as RedmineInstanceType).mysql.host = mysql.name;

const wikijs = DEFAULT_WIKIJS();
wikijs.networks = [net, ext];
(wikijs as WikiJsInstanceType).mysql.host = mysql.name;

const prometheus = DEFAULT_PROMETHEUS();
prometheus.networks = [net];

const grafana = DEFAULT_GRAFANA();
grafana.networks = [net];
grafana.dependsOn = [prometheus];
(grafana as GrafanaInstanceType).prometheus =
  prometheus as PrometheusInstanceType;

const elasticsearch = DEFAULT_ELASTICSEARCH();
elasticsearch.networks = [net];

const kibana = DEFAULT_KIBANA();
kibana.networks = [net];
kibana.dependsOn = [elasticsearch];
(kibana as KibanaInstanceType).elasticsearch =
  elasticsearch as ElasticsearchInstanceType;

const logstash = DEFAULT_LOGSTASH();
logstash.networks = [net];
logstash.dependsOn = [elasticsearch];
(logstash as LogstashInstanceType).elasticsearch =
  elasticsearch as ElasticsearchInstanceType;

const logger = new Logger("Main");

async function update(
  stackManager: StackManager,
  builtStack: BuiltStack,
): Promise<void> {
  try {
    const instanceManager = stackManager.getInstanceManager();
    const TEST = false;
    if (TEST) {
      const containers = await stackManager.containers();
      const stats = await stackManager.stats();
      const detailedStats = stackManager.detailedStats(stats);
      const instance = builtStack.instances[0].instance;
      const built = instanceManager.details(instance);
      const logs = await instanceManager.parseLogs(built, 10);
      const info = await instanceManager.inspect(built);
      const PRINT = false;
      if (PRINT) {
        logger.data(logs[0], "logs[0]:");
        logger.data(info.Args, "info.Args:");
        logger.data(containers[0], "containers[0]:");
        logger.data(detailedStats[0], "detailedStats[0]:");
      }
    }
    const SCALE = false;
    if (SCALE) {
      const builtInstance = builtStack.instances[2];
      let res = await stackManager.scale("up", builtStack, builtInstance, 1);
      if (res && instanceManager.scaled(builtInstance)) {
        res = await stackManager.scale("down", builtStack, builtInstance, 1);
      }
    }
  } catch (error) {
    logger.error(error);
  }
}

(async function entrypoint() {
  const devOpsStack: Stack = [
    "devops-stack",
    [adminer, jenkins, prometheus, grafana, gitea, redmine, wikijs],
  ];
  const storageStack: Stack = ["storage-stack", [postgres, redis, mysql]];
  const elkStack: Stack = ["elk-stack", [elasticsearch, kibana, logstash]];
  const stackManager = new StackManager();
  const promises = [
    start(stackManager, devOpsStack, update),
    start(stackManager, storageStack, update),
    start(stackManager, elkStack, update),
  ];
  await Promise.allSettled(promises);
})();
