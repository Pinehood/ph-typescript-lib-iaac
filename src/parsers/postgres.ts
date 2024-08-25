import { BaseLogParser } from "./base";
import { PostgresLogObject } from "../static/types";

export class PostgresLogParser extends BaseLogParser<PostgresLogObject> {
  parseLogLine(logLine: string): PostgresLogObject | null {
    try {
      const regex =
        /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+) (\w+) \[(\d+)\] (\w+): (.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length >= 6) {
        const [, time, level, pid, , message] = matches;
        const kvRegex = /(\w+)=([^\s]+)/g;
        const kvMatches = [...message.matchAll(kvRegex)];
        let user: string;
        let database: string;
        let applicationName: string;
        kvMatches.forEach((match) => {
          if (match[1] === "user") user = match[2];
          else if (match[1] === "database") database = match[2];
          else if (match[1] === "application_name") applicationName = match[2];
        });
        return {
          time,
          level,
          pid: parseInt(pid),
          message: message.trim(),
          user,
          database,
          application: applicationName,
        };
      }
    } catch {}
    return null;
  }
}
