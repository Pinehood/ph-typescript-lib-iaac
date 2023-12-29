import { KibanaLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class KibanaLogParser implements ILogParser<KibanaLogObject> {
  parse(logLines: string[]): KibanaLogObject[] {
    const parsedLogs: KibanaLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): KibanaLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
