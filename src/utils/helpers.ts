import * as OS from "node:os";
import { exec } from "node:child_process";
import { StackManager } from "../managers/stack";
import {
  BuiltStack,
  DockerCommand,
  DockerComposeCommand,
  IoUnit,
  IoValue,
  MemUnit,
  MemValue,
  Stack,
} from "../static/types";
import {
  ALLOWED_COMMANDS,
  ON_UPDATE_INTERVAL_MS,
  VERBOSE_EXECUTE,
  YML_FILE_NAME,
} from "../static/constants";
import { Logger } from "./logger";

const logger = new Logger("Helpers");

export function isWindows() {
  try {
    return OS.platform() === "win32";
  } catch {
    return false;
  }
}

export function printFunction(func: () => Promise<any> | any): void {
  try {
    (async function () {
      logger.info(await func());
    })();
  } catch {}
}

export function hasError(str: string): boolean {
  try {
    return (
      str.toLowerCase().includes("error") ||
      str.toLowerCase().includes("exception") ||
      str.toLowerCase().includes("rejection")
    );
  } catch {
    return false;
  }
}

export async function start(
  stackManager: StackManager,
  stack: Stack,
  onUpdate: (
    stackManager: StackManager,
    builtStack: BuiltStack
  ) => Promise<void> = async (_) => {},
  location?: string
): Promise<void> {
  try {
    const [success, built] = await stackManager.build(stack, location);
    if (success && built && (await stackManager.start(built))) {
      setInterval(() => {
        logger.info(`Checking "${stack[0]}" at "${built.location}"...`);
        onUpdate(stackManager, built);
      }, ON_UPDATE_INTERVAL_MS);
    }
  } catch (error) {
    logger.error(error);
  }
}

export async function docker(
  cmd: DockerCommand,
  obj?: any,
  opts: string = ""
): Promise<boolean | string> {
  try {
    let result = "";
    if (obj) {
      if (typeof obj === "string") {
        result = await executeCommand(`docker ${cmd}${opts} ${obj}`);
      } else if (typeof obj === "object") {
        result = await executeCommand(
          `docker ${cmd}${opts} ${obj.instance.name}`
        );
      }
    } else {
      result = await executeCommand(`docker ${cmd}${opts}`);
    }
    const returnResultCmds = ["logs", "inspect", "stats", "ps", "network"];
    return returnResultCmds.includes(cmd) ? result : !hasError(result);
  } catch (error) {
    logger.error(error);
    return cmd === "logs" ? null : false;
  }
}

export async function compose(
  cmd: DockerComposeCommand,
  obj: any
): Promise<boolean> {
  try {
    let result = "";
    if (typeof obj === "string") {
      result = await executeCommand(
        `docker-compose -f ${obj}/${YML_FILE_NAME} ${
          cmd === "up" ? "up -d " : cmd
        }`
      );
    } else if (typeof obj === "object") {
      result = await executeCommand(
        `docker-compose -f ${obj.location}/${YML_FILE_NAME} ${
          cmd === "up" ? "up -d " : cmd
        }`
      );
    }
    return !hasError(result);
  } catch {
    return false;
  }
}

export function executeCommand(cmd: string): Promise<string> {
  const CHECK = ALLOWED_COMMANDS.some((v) => cmd.startsWith(v));
  try {
    if (VERBOSE_EXECUTE === true && CHECK === false) {
      const msg = `Verbose run of command -> ${cmd}`;
      logger.info(msg);
      return new Promise((resolve) => resolve(msg));
    } else {
      return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          } else {
            if (stdout && !stderr) {
              resolve(stdout);
            } else {
              resolve(stderr);
            }
          }
        });
      });
    }
  } catch {
    return null;
  }
}

export function parseToMemValue(mem: string): MemValue {
  try {
    const memWithUnit = mem.trim();
    const value = parseFloat(memWithUnit.substring(0, memWithUnit.length - 3));
    const unit = memWithUnit.substring(memWithUnit.length - 3) as MemUnit;
    return { unit, value };
  } catch {
    return { unit: "KiB", value: NaN };
  }
}

export function parseToIoValue(io: string): IoValue {
  try {
    const ioWithUnit = io.trim();
    let unit: IoUnit;
    if (ioWithUnit.endsWith("kB")) {
      unit = "kB";
    } else if (ioWithUnit.endsWith("MB")) {
      unit = "MB";
    } else if (ioWithUnit.endsWith("GB")) {
      unit = "GB";
    } else if (ioWithUnit.endsWith("B")) {
      unit = "B";
    }
    const value = parseFloat(ioWithUnit.replace(unit, ""));
    return { unit, value };
  } catch {
    return { unit: "B", value: NaN };
  }
}
