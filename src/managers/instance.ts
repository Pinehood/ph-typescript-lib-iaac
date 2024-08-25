import { docker, executeCommand } from "../utils/helpers";
import { Logger } from "../utils/logger";
import {
  BuiltInstance,
  CommandShell,
  DetailedDockerContainerInfo,
  Instance,
} from "../static/types";
import { IManager } from "../static/interfaces";
import { NAME_SPLITTER } from "../static/constants";
import { SVC_MAP } from "../static/maps";

export class InstanceManager implements IManager<Instance, BuiltInstance> {
  readonly objects: BuiltInstance[];
  private readonly logger = new Logger(InstanceManager);

  constructor() {
    this.objects = [];
  }

  build(instance: Instance): [boolean, BuiltInstance] {
    try {
      let builtInstance: BuiltInstance;
      const serviceKey = Object.keys(SVC_MAP).find((key) =>
        instance.service.startsWith(key),
      );
      if (serviceKey) {
        const { logParser, template } = SVC_MAP[serviceKey];
        if (logParser && !instance.logParser) {
          instance.logParser = new logParser();
        }
        builtInstance = template(instance);
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
      if (!this.allowed(builtInstance)) {
        return false;
      }
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
      if (!this.allowed(builtInstance)) {
        return false;
      }
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
      if (!this.allowed(builtInstance)) {
        return null;
      }
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
      if (!this.allowed(builtInstance)) {
        return null;
      }
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
      if (!this.allowed(builtInstance) || !this.hasLogParser(builtInstance)) {
        return null;
      }
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
