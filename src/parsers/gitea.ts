import { GiteaLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class GiteaLogParser implements ILogParser<GiteaLogObject> {
  parse(logLines: string[]): GiteaLogObject[] {
    const parsedLogs: GiteaLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): GiteaLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
