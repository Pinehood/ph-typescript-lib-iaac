import { BaseLogParser } from "./base";
import { AdminerLogObject } from "../static/types";

export class AdminerLogParser extends BaseLogParser<AdminerLogObject> {
  parseLogLine(logLine: string): AdminerLogObject | null {
    try {
      const regex =
        /\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s*(\[(\w+)\])?\s*from\s(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?\s*(database=([^\s]+))?\s*(query=(.*))?/;
      const matches = logLine.match(regex);
      if (matches) {
        const [, time, , level, address, port, , database, , query] = matches;
        const type = query ? query.split(" ")[0].toUpperCase() : undefined;
        return {
          time,
          address,
          port: parseInt(port),
          level,
          message: query || "No message",
          database,
          type,
        };
      }
    } catch {}
    return null;
  }
}
