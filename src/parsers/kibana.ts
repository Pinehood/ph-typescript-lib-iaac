import { BaseLogParser } from "./base";
import { KibanaLogObject } from "../static/types";

export class KibanaLogParser extends BaseLogParser<KibanaLogObject> {
  parseLogLine(logLine: string): KibanaLogObject | null {
    try {
      const logObject = JSON.parse(logLine);
      const time = logObject["@timestamp"];
      const level =
        logObject.tags && logObject.tags.length > 0
          ? logObject.tags[0]
          : "unknown";
      const pid = logObject.pid;
      const message = logObject.message;
      const type = logObject.type || undefined;
      const tags = logObject.tags || undefined;
      return {
        time,
        level,
        pid,
        message: message.trim(),
        type,
        tags,
      };
    } catch {}
    return null;
  }
}
