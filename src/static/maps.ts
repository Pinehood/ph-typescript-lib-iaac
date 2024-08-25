import { ServiceConfig } from "./types";
import {
  AdminerLogParser,
  ElasticsearchLogParser,
  GiteaLogParser,
  GrafanaLogParser,
  JenkinsLogParser,
  KibanaLogParser,
  LogstashLogParser,
  MySqlLogParser,
  PostgresLogParser,
  PrometheusLogParser,
  RedisLogParser,
  RedmineLogParser,
  WikiJsLogParser,
} from "../parsers";
import { default as GITEA_TEMPLATE } from "../templates/gitea";
import { default as JENKINS_TEMPLATE } from "../templates/jenkins";
import { default as ADMINER_TEMPLATE } from "../templates/adminer";
import { default as POSTGRES_TEMPLATE } from "../templates/postgres";
import { default as MYSQL_TEMPLATE } from "../templates/mysql";
import { default as REDIS_TEMPLATE } from "../templates/redis";
import { default as REDMINE_TEMPLATE } from "../templates/redmine";
import { default as WIKIJS_TEMPLATE } from "../templates/wikijs";
import { default as PROMETHEUS_TEMPLATE } from "../templates/prometheus";
import { default as GRAFANA_TEMPLATE } from "../templates/grafana";
import { default as KIBANA_TEMPLATE } from "../templates/kibana";
import { default as LOGSTASH_TEMPLATE } from "../templates/logstash";
import { default as ELASTICSEARCH_TEMPLATE } from "../templates/elasticsearch";
import { default as CUSTOM_TEMPLATE } from "../templates/custom";

export const SVC_MAP: { [key: string]: ServiceConfig } = {
  gitea: { logParser: GiteaLogParser, template: GITEA_TEMPLATE },
  jenkins: { logParser: JenkinsLogParser, template: JENKINS_TEMPLATE },
  adminer: { logParser: AdminerLogParser, template: ADMINER_TEMPLATE },
  postgres: { logParser: PostgresLogParser, template: POSTGRES_TEMPLATE },
  mysql: { logParser: MySqlLogParser, template: MYSQL_TEMPLATE },
  redis: { logParser: RedisLogParser, template: REDIS_TEMPLATE },
  redmine: { logParser: RedmineLogParser, template: REDMINE_TEMPLATE },
  wikijs: { logParser: WikiJsLogParser, template: WIKIJS_TEMPLATE },
  prometheus: { logParser: PrometheusLogParser, template: PROMETHEUS_TEMPLATE },
  grafana: { logParser: GrafanaLogParser, template: GRAFANA_TEMPLATE },
  kibana: { logParser: KibanaLogParser, template: KIBANA_TEMPLATE },
  logstash: { logParser: LogstashLogParser, template: LOGSTASH_TEMPLATE },
  elasticsearch: {
    logParser: ElasticsearchLogParser,
    template: ELASTICSEARCH_TEMPLATE,
  },
  custom: { logParser: null, template: CUSTOM_TEMPLATE },
};
