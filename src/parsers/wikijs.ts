import { WikiJsLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class WikijsLogParser implements ILogParser<WikiJsLogObject> {
  parse(logLines: string[]): WikiJsLogObject[] {
    const parsedLogs: WikiJsLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): WikiJsLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
