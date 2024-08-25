import { BaseLogParser } from "./base";
import { LogstashLogObject } from "../static/types";

export class LogstashLogParser extends BaseLogParser<LogstashLogObject> {
  parseLogLine(logLine: string): LogstashLogObject | null {
    try {
      const regex =
        /\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2},\d+)\]\[(\w+)\]\[([^\]]+)\] (.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 5) {
        const [, time, level, logger, message] = matches;
        return {
          time,
          level,
          logger,
          message: message.trim(),
        };
      }
    } catch {}
    return null;
  }
}
