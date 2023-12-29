import { LogLevel } from "../static/types";

export class Logger<T> {
  private readonly name: string;

  constructor(classOrName?: (new () => T) | string) {
    if (typeof classOrName === "string") {
      this.name = classOrName;
    } else {
      this.name = classOrName?.name ?? "General";
    }
  }

  info(message: string): void {
    this.message(message, "info");
  }

  warn(message: string): void {
    this.message(message, "warn");
  }

  error(message: string): void {
    this.message(message, "error");
  }

  data(data: any, label: string = "object:"): void {
    console.log(label, data);
  }

  private message(message: string, level: LogLevel): void {
    const msg = `[${new Date().toUTCString()}] :: [${level.toUpperCase()}] :: [${
      this.name
    }] :: ${message}`;
    if (level === "warn") {
      console.warn(msg);
    } else if (level === "error") {
      console.error(msg);
    } else if (level == "info") {
      console.log(msg);
    }
  }
}
