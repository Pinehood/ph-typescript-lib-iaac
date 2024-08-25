import { BaseLogParser } from "./base";
import { RedisLogObject } from "../static/types";

export class RedisLogParser extends BaseLogParser<RedisLogObject> {
  parseLogLine(logLine: string): RedisLogObject | null {
    try {
      const regex =
        /^(\d+):(\w) (\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\.\d+) (\*|#) (.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 6) {
        const [, pid, type, time, logLevelSymbol, message] = matches;
        let level = "";
        if (logLevelSymbol === "*") {
          level = "INFO";
        } else if (logLevelSymbol === "#") {
          level = "WARNING";
        }
        return {
          pid: parseInt(pid),
          time,
          level,
          message: message.trim(),
          type,
        };
      }
    } catch {}
    return null;
  }
}
