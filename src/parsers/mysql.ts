import { MySqlLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class MySqlLogParser implements ILogParser<MySqlLogObject> {
  parse(logLines: string[]): MySqlLogObject[] {
    const parsedLogs: MySqlLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): MySqlLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
