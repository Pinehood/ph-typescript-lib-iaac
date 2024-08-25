import * as fs from "node:fs";
import * as path from "node:path";
import { InstanceManager } from "./instance";
import {
  compose,
  docker,
  executeCommand,
  parseToMemValue,
  parseToIoValue,
} from "../utils/helpers";
import { Logger } from "../utils/logger";
import {
  ArrayMatch,
  BasicDockerContainerInfo,
  BuiltInstance,
  BuiltStack,
  BasicDockerContainerUsage,
  Instance,
  Network,
  Stack,
  DetailedDockerContainerUsage,
  ScaleCommand,
  BasicDockerNetworkInfo,
} from "../static/types";
import { IManager } from "../static/interfaces";
import { NAME_SPLITTER, YML_FILE_NAME } from "../static/constants";
import { default as STACK_TEMPLATE } from "../templates/stack";

export class StackManager implements IManager<Stack, BuiltStack> {
  readonly objects: BuiltStack[] = [];
  private readonly instanceManager: InstanceManager;
  private readonly logger = new Logger(StackManager);

  constructor() {
    this.objects = [];
    this.instanceManager = new InstanceManager();
  }

  getInstanceManager() {
    return this.instanceManager;
  }

  async build(stack: Stack, location?: string): Promise<[boolean, BuiltStack]> {
    try {
      if (!(await this.createExternalNetworks(stack))) {
        return [false, null];
      }
      const instances = stack[1];
      const builtInstances: BuiltInstance[] = [];
      instances.forEach((instance) => {
        const [success, built] = this.instanceManager.build(instance);
        if (success) builtInstances.push(built);
      });
      const builtStack = STACK_TEMPLATE(stack, builtInstances);
      if (location) {
        builtStack.location = location;
      }
      const stackIdx = this.objects.findIndex((bs) => bs.stack[0] === stack[0]);
      if (stackIdx < 0) {
        this.objects.push(builtStack);
      } else {
        this.objects[stackIdx] = { ...builtStack };
      }
      this.createFiles(builtStack);
      this.logger.info(
        `Built stack '${stack[0]}' with '${builtInstances.length}' services on location '${builtStack.location}'`,
      );
      return [true, builtStack];
    } catch (error) {
      this.logger.error(error);
      return [false, null];
    }
  }

  async start(builtStack: BuiltStack): Promise<boolean> {
    try {
      this.logger.info(`Starting stack '${builtStack.stack[0]}'`);
      return compose("up", builtStack);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async stop(builtStack: BuiltStack): Promise<boolean> {
    try {
      this.logger.info(`Stopping stack '${builtStack.stack[0]}'`);
      return compose("down", builtStack);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  details(stack: Stack): BuiltStack | null {
    try {
      if (typeof stack === "string") {
        return this.objects.find((o) => o.stack[0] === stack);
      } else if (typeof stack === "object") {
        return this.objects.find((o) => o.stack[0] === stack[0]);
      }
    } catch (error) {
      this.logger.error(error);
    }
    return null;
  }

  async networks(): Promise<BasicDockerNetworkInfo[]> {
    const networks: BasicDockerNetworkInfo[] = [];
    try {
      (await (docker("network", null, " ls") as Promise<string>))
        .trim()
        .split("\n")
        .slice(1)
        .forEach((entry) => {
          const parts = entry.trim().split(/\s{2,}/);
          if (parts && parts.length === 4) {
            const [networkId, name, driver, scope] = parts;
            networks.push({ networkId, name, driver, scope });
          }
        });
    } catch (error) {
      this.logger.error(error);
    }
    return networks;
  }

  async containers(): Promise<BasicDockerContainerInfo[]> {
    const containers: BasicDockerContainerInfo[] = [];
    try {
      (await (docker("ps") as Promise<string>))
        .split("\n")
        .slice(1)
        .forEach((entry) => {
          const parts = entry.split(/\s{2,}/);
          if (parts && parts.length === 7) {
            const [containerId, image, , created, status, ports, names] = parts;
            containers.push({
              containerId,
              image,
              created,
              status,
              ports,
              names,
            });
          }
        });
    } catch (error) {
      this.logger.error(error);
    }
    return containers;
  }

  async stats(): Promise<BasicDockerContainerUsage[]> {
    const usages: BasicDockerContainerUsage[] = [];
    try {
      (await (docker("stats", null, " --no-stream") as Promise<string>))
        .split("\n")
        .slice(1)
        .forEach((entry) => {
          const parts = entry.split(/\s{2,}/);
          if (parts.length === 8) {
            const [
              containerId,
              name,
              cpuPercentage,
              memUsageAndLimit,
              memPercentage,
              netIO,
              blockIO,
              pids,
            ] = parts;
            usages.push({
              containerId,
              name,
              cpuPercentage,
              memUsageAndLimit,
              memPercentage,
              netIO,
              blockIO,
              pids,
            });
          }
        });
    } catch (error) {
      this.logger.error(error);
    }
    return usages;
  }

  detailedStats(
    basic: BasicDockerContainerUsage[],
  ): DetailedDockerContainerUsage[] {
    const usages: DetailedDockerContainerUsage[] = [];
    try {
      basic.forEach((usage) => {
        const memUsageAndLimit = usage.memUsageAndLimit.split("/");
        const netIo = usage.netIO.split("/");
        const blockIo = usage.blockIO.split("/");
        usages.push({
          info: {
            id: usage.containerId,
            name: usage.name,
            pids: parseInt(usage.pids, 10),
          },
          percentages: {
            cpu: parseFloat(usage.cpuPercentage.replace("%", "")),
            mem: parseFloat(usage.memPercentage.replace("%", "")),
          },
          mem: {
            limit: parseToMemValue(memUsageAndLimit[1]),
            usage: parseToMemValue(memUsageAndLimit[0]),
          },
          net: {
            input: parseToIoValue(netIo[0]),
            output: parseToIoValue(netIo[1]),
          },
          block: {
            input: parseToIoValue(blockIo[0]),
            output: parseToIoValue(blockIo[1]),
          },
        });
      });
    } catch (error) {
      this.logger.error(error);
    }
    return usages;
  }

  async running(
    stack: Stack | BuiltStack,
    match: ArrayMatch = "some",
  ): Promise<boolean> {
    try {
      let instances: Instance[];
      if ("stack" in stack) {
        instances = (stack as BuiltStack).instances.map((bi) => bi.instance);
      } else {
        instances = stack[1] as Instance[];
      }
      const names = (await this.containers()).map(
        (container) => container.names,
      );
      const predicate = (i: Instance): boolean => names.includes(i.name);
      if (match === "some") {
        return instances.some(predicate);
      } else if (match === "every") {
        return instances.every(predicate);
      }
    } catch (error) {
      this.logger.error(error);
    }
    return false;
  }

  async scale(
    scaleCommand: ScaleCommand,
    builtStack: BuiltStack,
    builtInstance: BuiltInstance,
    amount: number,
  ): Promise<boolean> {
    try {
      const stack = builtStack.stack;
      const oldInstance = builtInstance.instance;
      if (!oldInstance.options?.scalable) {
        this.logger.warn(
          `Service '${oldInstance.service}' with name '${oldInstance.name}' in stack '${stack[0]}' is not scalable`,
        );
        return false;
      }
      let instances: Instance[] = [];
      if (scaleCommand === "up") {
        if (this.instanceManager.scaled(builtInstance)) {
          this.logger.warn(
            `Service '${oldInstance.service}' with name '${oldInstance.name}' in stack '${stack[0]}' is already scaled. Scale it down first to be able to scale it back up differently`,
          );
          return false;
        }
        instances = [...stack[1]];
        for (let i = 0; i < amount; i++) {
          const newInstance = { ...oldInstance };
          (newInstance.service as string) =
            oldInstance.service + NAME_SPLITTER + i;
          newInstance.name = oldInstance.name + NAME_SPLITTER + i;
          instances.push(newInstance);
        }
      } else if (scaleCommand === "down") {
        if (!this.instanceManager.scaled(builtInstance)) {
          this.logger.warn(
            `Service '${oldInstance.service}' with name '${oldInstance.name}' in stack '${stack[0]}' is not scaled, not able to scale down`,
          );
          return false;
        }
        instances = stack[1];
        for (let i = 0; i < amount; i++) {
          const firstInstance = instances.find((fi) =>
            fi.service.startsWith(oldInstance.service + NAME_SPLITTER),
          );
          if (firstInstance) {
            instances = instances.filter((i) => i.name !== firstInstance.name);
            this.instanceManager.remove(
              this.instanceManager.details(firstInstance),
            );
          }
        }
      }
      stack[1] = instances;
      const location = builtStack.location;
      const [success, built] = await this.build(stack, location);
      if (success) {
        this.logger.info(
          `Scaling ${scaleCommand} service '${
            oldInstance.service
          }' with name '${oldInstance.name}' in stack '${stack[0]}' ${
            scaleCommand === "up" ? "to" : "from"
          } '${amount}' instances`,
        );
        return await this.start(built);
      }
    } catch (error) {
      this.logger.error(error);
    }
    return false;
  }

  private async createExternalNetworks(stack: Stack): Promise<boolean> {
    try {
      const commands: string[] = [];
      const commandTemplate = (n: Network) =>
        `docker network create --driver ${n.driver ?? "bridge"} ${n.name}`;
      const networkNames = (await this.networks()).map((n) => n.name);
      stack[1].forEach(async (i) => {
        i.networks.forEach(async (n) => {
          if (n.external === true) {
            const command = commandTemplate(n);
            if (!commands.includes(command) && !networkNames.includes(n.name)) {
              commands.push(command);
            }
          }
        });
      });
      this.logger.info(
        `Creating '${commands.length}' external networks for stack '${stack[0]}'`,
      );
      commands.forEach(async (command) => await executeCommand(command));
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  private createFiles(builtStack: BuiltStack): boolean {
    try {
      if (!fs.existsSync(builtStack.location)) {
        fs.mkdirSync(builtStack.location, { recursive: true });
      }
      fs.writeFileSync(
        `${builtStack.location}/${YML_FILE_NAME}`,
        builtStack.snippet,
        {
          encoding: "utf8",
          flag: "w",
        },
      );
      this.logger.info(
        `Created file '${builtStack.location}/${YML_FILE_NAME}'`,
      );
      builtStack.instances
        .filter((bi) => !!bi.configs)
        .map((bi) => bi.configs)
        .forEach((cs) => {
          cs.forEach((c) => {
            const fullPath = path.resolve(builtStack.location, c.path);
            const dir = path.dirname(fullPath);
            fs.mkdirSync(dir, { recursive: true });
            if (c.create === "file") {
              fs.writeFileSync(fullPath, c.content, {
                encoding: "utf8",
                flag: "w",
              });
              this.logger.info(`Created file '${fullPath}'`);
            }
          });
        });
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
