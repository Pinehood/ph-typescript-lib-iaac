import { JenkinsLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class JenkinsLogParser implements ILogParser<JenkinsLogObject> {
  parse(logLines: string[]): JenkinsLogObject[] {
    const parsedLogs: JenkinsLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): JenkinsLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
