import { docker, executeCommand } from "../utils/helpers";
import { Logger } from "../utils/logger";
import {
  BuiltInstance,
  CommandShell,
  DetailedDockerContainerInfo,
  Instance,
  AdminerInstanceType,
  GiteaInstanceType,
  JenkinsInstanceType,
  MySqlInstanceType,
  PostgresInstanceType,
  RedisInstanceType,
  RedmineInstanceType,
  WikiJsInstanceType,
  CustomInstanceType,
  PrometheusInstanceType,
  GrafanaInstanceType,
  KibanaInstanceType,
  LogstashInstanceType,
  ElasticsearchInstanceType,
} from "../static/types";
import { IManager } from "../static/interfaces";
import { NAME_SPLITTER } from "../static/constants";
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
  WikijsLogParser,
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

export class InstanceManager implements IManager<Instance, BuiltInstance> {
  readonly objects: BuiltInstance[];
  private readonly logger = new Logger(InstanceManager);

  constructor() {
    this.objects = [];
  }

  build(instance: Instance): [boolean, BuiltInstance] {
    try {
      let builtInstance: BuiltInstance;
      if (instance.service.startsWith("gitea")) {
        if (!instance.logParser) instance.logParser = new GiteaLogParser();
        builtInstance = GITEA_TEMPLATE(instance as GiteaInstanceType);
      } else if (instance.service.startsWith("jenkins")) {
        if (!instance.logParser) instance.logParser = new JenkinsLogParser();
        builtInstance = JENKINS_TEMPLATE(instance as JenkinsInstanceType);
      } else if (instance.service.startsWith("adminer")) {
        if (!instance.logParser) instance.logParser = new AdminerLogParser();
        builtInstance = ADMINER_TEMPLATE(instance as AdminerInstanceType);
      } else if (instance.service.startsWith("postgres")) {
        if (!instance.logParser) instance.logParser = new PostgresLogParser();
        builtInstance = POSTGRES_TEMPLATE(instance as PostgresInstanceType);
      } else if (instance.service.startsWith("mysql")) {
        if (!instance.logParser) instance.logParser = new MySqlLogParser();
        builtInstance = MYSQL_TEMPLATE(instance as MySqlInstanceType);
      } else if (instance.service.startsWith("redis")) {
        if (!instance.logParser) instance.logParser = new RedisLogParser();
        builtInstance = REDIS_TEMPLATE(instance as RedisInstanceType);
      } else if (instance.service.startsWith("redmine")) {
        builtInstance = REDMINE_TEMPLATE(instance as RedmineInstanceType);
      } else if (instance.service.startsWith("wikijs")) {
        if (!instance.logParser) instance.logParser = new WikijsLogParser();
        builtInstance = WIKIJS_TEMPLATE(instance as WikiJsInstanceType);
      } else if (instance.service.startsWith("prometheus")) {
        if (!instance.logParser) instance.logParser = new PrometheusLogParser();
        builtInstance = PROMETHEUS_TEMPLATE(instance as PrometheusInstanceType);
      } else if (instance.service.startsWith("grafana")) {
        if (!instance.logParser) instance.logParser = new GrafanaLogParser();
        builtInstance = GRAFANA_TEMPLATE(instance as GrafanaInstanceType);
      } else if (instance.service.startsWith("kibana")) {
        if (!instance.logParser) instance.logParser = new KibanaLogParser();
        builtInstance = KIBANA_TEMPLATE(instance as KibanaInstanceType);
      } else if (instance.service.startsWith("logstash")) {
        if (!instance.logParser) instance.logParser = new LogstashLogParser();
        builtInstance = LOGSTASH_TEMPLATE(instance as LogstashInstanceType);
      } else if (instance.service.startsWith("elasticsearch")) {
        if (!instance.logParser)
          instance.logParser = new ElasticsearchLogParser();
        builtInstance = ELASTICSEARCH_TEMPLATE(
          instance as ElasticsearchInstanceType,
        );
      } else if (instance.service.startsWith("custom")) {
        builtInstance = CUSTOM_TEMPLATE(instance as CustomInstanceType);
      }
      const instanceIdx = this.objects.findIndex(
        (bi) => bi.instance.name === instance.name,
      );
      if (instanceIdx < 0) {
        this.objects.push(builtInstance);
      } else {
        this.objects[instanceIdx] = { ...builtInstance };
      }
      this.logger.info(
        `Built service '${instance.service}' with name '${instance.name}'`,
      );
      return [true, builtInstance];
    } catch (error) {
      this.logger.error(error);
      return [false, null];
    }
  }

  async start(builtInstance: BuiltInstance): Promise<boolean> {
    try {
      if (!this.allowed(builtInstance)) return false;
      this.logger.info(
        `Starting service '${builtInstance.instance.service}' with name '${builtInstance.instance.name}'`,
      );
      return docker("start", builtInstance) as Promise<boolean>;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async stop(builtInstance: BuiltInstance): Promise<boolean> {
    try {
      if (!this.allowed(builtInstance)) return false;
      this.logger.info(
        `Stopping service '${builtInstance.instance.service}' with name '${builtInstance.instance.name}'`,
      );
      return docker("stop", builtInstance) as Promise<boolean>;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  details(instance: Instance): BuiltInstance | null {
    try {
      if (typeof instance === "string") {
        return this.objects.find((o) => o.instance.name === instance);
      } else if (typeof instance === "object") {
        return this.objects.find((o) => o.instance.name === instance.name);
      }
    } catch (error) {
      this.logger.error(error);
    }
    return null;
  }

  async inspect(
    builtInstance: BuiltInstance,
  ): Promise<DetailedDockerContainerInfo> {
    try {
      if (!this.allowed(builtInstance)) return null;
      return (
        JSON.parse(
          await (docker("inspect", builtInstance) as Promise<string>),
        ) as DetailedDockerContainerInfo[]
      )[0];
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  logs(builtInstance: BuiltInstance, tail?: number): Promise<string> {
    try {
      if (!this.allowed(builtInstance)) return null;
      return docker(
        "logs",
        builtInstance,
        tail ? ` --tail ${tail}` : "",
      ) as Promise<string>;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async parseLogs(builtInstance: BuiltInstance, tail?: number): Promise<any[]> {
    try {
      if (!this.allowed(builtInstance)) return null;
      if (!this.hasLogParser(builtInstance)) return null;
      const logs = await this.logs(builtInstance, tail);
      return builtInstance.instance.logParser.parse(logs.split("\n"));
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async command(
    builtInstance: BuiltInstance,
    command: string,
    shell: CommandShell = "sh",
  ): Promise<string> {
    try {
      this.logger.info(
        `Executing command '${command}' for service '${builtInstance.instance.service}' with name '${builtInstance.instance.name}'`,
      );
      return await executeCommand(
        `docker exec -ti ${builtInstance.instance.name} ${shell} -c "${command}"`,
      );
    } catch {
      return null;
    }
  }

  scaled(builtInstance: BuiltInstance): boolean {
    try {
      const name = builtInstance.instance.service + NAME_SPLITTER;
      const instanceServices = this.objects.map((o) => o.instance.service);
      return instanceServices.some((is) => is.startsWith(name));
    } catch {
      return false;
    }
  }

  remove(builtInstance: BuiltInstance): boolean {
    try {
      const objs = [...this.objects].filter(
        (o) => o.instance.name !== builtInstance.instance.name,
      );
      while (this.objects.pop());
      objs.forEach((o) => this.objects.push(o));
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  private allowed(builtInstance: BuiltInstance): boolean {
    try {
      return !!this.objects.find(
        (o) => o.instance.name === builtInstance.instance.name,
      );
    } catch {
      return false;
    }
  }

  private hasLogParser(builtInstance: BuiltInstance): boolean {
    try {
      return !!this.objects.find(
        (o) => o.instance.name === builtInstance.instance.name,
      )?.instance.logParser;
    } catch {
      return false;
    }
  }
}
