import { RedmineLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class RedmineLogParser implements ILogParser<RedmineLogObject> {
  parse(logLines: string[]): RedmineLogObject[] {
    const parsedLogs: RedmineLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): RedmineLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
