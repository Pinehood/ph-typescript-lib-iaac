import { PrometheusLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class PrometheusLogParser implements ILogParser<PrometheusLogObject> {
  parse(logLines: string[]): PrometheusLogObject[] {
    const parsedLogs: PrometheusLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): PrometheusLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
