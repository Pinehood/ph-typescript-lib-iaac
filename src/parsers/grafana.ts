import { GrafanaLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class GrafanaLogParser implements ILogParser<GrafanaLogObject> {
  parse(logLines: string[]): GrafanaLogObject[] {
    const parsedLogs: GrafanaLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): GrafanaLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
