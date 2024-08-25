import { BaseLogParser } from "./base";
import { RedmineLogObject } from "../static/types";

export class RedmineLogParser extends BaseLogParser<RedmineLogObject> {
  parseLogLine(logLine: string): RedmineLogObject | null {
    try {
      const regex =
        /^[I|F], \[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z) #(\d+)\]\s+(\w+)\s--\s:\s(.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length >= 5) {
        const [, time, pid, level, message] = matches;
        const requestRegex = /Started (\w+) "([^"]+)" for ([\d.]+) at (.*)/;
        const requestMatches = message.match(requestRegex);
        const responseRegex = /Completed (\d{3}) \w+ in (\d+ms)/;
        const responseMatches = message.match(responseRegex);
        const errorRegex = /ActionView::Template::Error \((.*)\)/;
        const errorMatches = message.match(errorRegex);
        const logObject: RedmineLogObject = {
          time,
          level,
          pid: parseInt(pid),
          message: message.trim(),
        };
        if (requestMatches && requestMatches.length >= 3) {
          logObject.method = requestMatches[1];
          logObject.request = requestMatches[2];
        }
        if (responseMatches && responseMatches.length >= 3) {
          logObject.status = responseMatches[1];
          logObject.response = responseMatches[2];
        }
        if (errorMatches && errorMatches.length >= 2) {
          logObject.error = errorMatches[1];
        }
        return logObject;
      }
    } catch {}
    return null;
  }
}
