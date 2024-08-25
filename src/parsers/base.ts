import { ILogParser } from "../static";

export abstract class BaseLogParser<T> implements ILogParser<T> {
  abstract parseLogLine(logLine: string): T | null;

  parse(logLines: string[]): T[] {
    const parsedLogs: T[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null) as T[];
  }
}
