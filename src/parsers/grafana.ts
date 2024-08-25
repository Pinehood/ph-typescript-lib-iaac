import { BaseLogParser } from "./base";
import { GrafanaLogObject } from "../static/types";

export class GrafanaLogParser extends BaseLogParser<GrafanaLogObject> {
  parseLogLine(logLine: string): GrafanaLogObject | null {
    try {
      const regex =
        /t=(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{4}) lvl=(\w+) msg="([^"]+)" logger=([^\s]+)(?: userId=(\d+))?(?: orgId=(\d+))?(?: uname=([^\s]+))?(?: method=([^\s]+))?(?: path=([^\s]+))?(?: status=(\d+))?/;
      const matches = logLine.match(regex);
      if (matches) {
        const [
          ,
          time,
          level,
          message,
          logger,
          user,
          org,
          uname,
          method,
          path,
          status,
        ] = matches;
        return {
          time,
          level,
          message,
          logger,
          user: user ? parseInt(user) : undefined,
          org: org ? parseInt(org) : undefined,
          uname,
          method,
          path,
          status: status ? parseInt(status) : undefined,
        };
      }
    } catch {}
    return null;
  }
}
