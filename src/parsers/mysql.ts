import { BaseLogParser } from "./base";
import { MySqlLogObject } from "../static/types";

export class MySqlLogParser extends BaseLogParser<MySqlLogObject> {
  parseLogLine(logLine: string): MySqlLogObject | null {
    try {
      const regex =
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s*(?:\[([A-Z]+)\])?\s*(?:\[MY-(\d+)\])?\s*(?:\[([^\]]+)\])?\s*(.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length >= 6) {
        const [, time, level, code, component, message] = matches;
        const connectionRegex = /(\d+)\sConnect\s(.+?)@(.*?)\son\s(.*)/;
        const connectionMatches = message.match(connectionRegex);
        let connectionId: number;
        let user: string;
        let host: string;
        let db: string;
        if (connectionMatches && connectionMatches.length === 5) {
          connectionId = parseInt(connectionMatches[1]);
          user = connectionMatches[2];
          host = connectionMatches[3];
          db = connectionMatches[4];
        }
        return {
          time,
          level,
          code,
          component,
          message: message.trim(),
          connection: connectionId,
          user,
          host,
          db,
        };
      }
    } catch {}
    return null;
  }
}
