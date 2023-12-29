import { AdminerLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class AdminerLogParser implements ILogParser<AdminerLogObject> {
  parse(logLines: string[]): AdminerLogObject[] {
    const parsedLogs: AdminerLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): AdminerLogObject | null {
    try {
      const regex = /\[(.*?)\]\s\[(.*?)\]:(\d+) (.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 5) {
        const [, time, address, port, message] = matches;
        return { time, caller: { address, port: parseInt(port) }, message };
      }
    } catch {}
    return null;
  }
}
