import { BaseLogParser } from "./base";
import { WikiJsLogObject } from "../static/types";

export class WikiJsLogParser extends BaseLogParser<WikiJsLogObject> {
  parseLogLine(logLine: string): WikiJsLogObject | null {
    try {
      const regex =
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s\[(\w+)\]\s\(([^)]+)\)\s(.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 5) {
        const [, time, level, source, message] = matches;
        return {
          time,
          level,
          source,
          message: message.trim(),
        };
      }
    } catch {}
    return null;
  }
}
