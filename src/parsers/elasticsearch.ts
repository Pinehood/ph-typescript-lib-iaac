import { BaseLogParser } from "./base";
import { ElasticsearchLogObject } from "../static/types";

export class ElasticsearchLogParser extends BaseLogParser<ElasticsearchLogObject> {
  parseLogLine(logLine: string): ElasticsearchLogObject | null {
    try {
      const regex =
        /\[(.*?)\]\[(.*?)\]\[(.*?)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s(.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length >= 7) {
        const [, time, level, component, node, index, message] = matches;
        return {
          time,
          level,
          component,
          node,
          index,
          message: message.trim(),
        };
      }
    } catch {}
    return null;
  }
}
