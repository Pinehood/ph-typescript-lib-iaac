import { BaseLogParser } from "./base";
import { PrometheusLogObject } from "../static/types";

export class PrometheusLogParser extends BaseLogParser<PrometheusLogObject> {
  parseLogLine(logLine: string): PrometheusLogObject | null {
    try {
      const regex =
        /level=(\w+)\s+ts=([\d-T:.Z]+)\s+caller=([^\s]+)\s+msg="([^"]+)"(?:\s+component="([^"]+)")?(?:\s+err="([^"]+)")?(?:\s+version="([^"]+)")?/;
      const matches = logLine.match(regex);
      if (matches && matches.length >= 5) {
        const [, level, time, caller, message, component, error, version] =
          matches;
        return {
          time,
          level,
          caller,
          message,
          component,
          error,
          version,
        };
      }
    } catch {}
    return null;
  }
}
