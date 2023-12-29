import { LogstashLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class LogstashLogParser implements ILogParser<LogstashLogObject> {
  parse(logLines: string[]): LogstashLogObject[] {
    const parsedLogs: LogstashLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): LogstashLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
