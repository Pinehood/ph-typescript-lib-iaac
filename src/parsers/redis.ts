import { RedisLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class RedisLogParser implements ILogParser<RedisLogObject> {
  parse(logLines: string[]): RedisLogObject[] {
    const parsedLogs: RedisLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): RedisLogObject | null {
    try {
      const regex =
        /^\d+:(\w+)\s(\d{1,2}\s\w+\s\d{4}\s\d{2}:\d{2}:\d{2}\.\d+)\s#\s(.*)$/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 4) {
        const [, type, time, message] = matches;
        return { type, time, message };
      }
    } catch {}
    return null;
  }
}
