import { PostgresLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class PostgresLogParser implements ILogParser<PostgresLogObject> {
  parse(logLines: string[]): PostgresLogObject[] {
    const parsedLogs: PostgresLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): PostgresLogObject | null {
    try {
      const regex =
        /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d+\sUTC)\s\[(\d+)\]\s(\w+):\s(.*)$/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 5) {
        const [, time, , level, message] = matches;
        return { time, level, message: message.trimStart() };
      }
    } catch {}
    return null;
  }
}
