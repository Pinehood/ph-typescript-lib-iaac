import { BaseLogParser } from "./base";
import { GiteaLogObject } from "../static/types";

export class GiteaLogParser extends BaseLogParser<GiteaLogObject> {
  parseLogLine(logLine: string): GiteaLogObject | null {
    try {
      const regex =
        /(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)] \[([^\]]+)] (.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 5) {
        const [, time, level, moduleInfo, message] = matches;
        const moduleRegex = /(.*):(\d+) (.*)/;
        const moduleMatches = moduleInfo.match(moduleRegex);
        if (moduleMatches && moduleMatches.length === 4) {
          const [, file, , func] = moduleMatches;
          return {
            time,
            level,
            module: moduleInfo,
            file,
            func,
            message: message.trim(),
          };
        }
      }
    } catch {}
    return null;
  }
}
