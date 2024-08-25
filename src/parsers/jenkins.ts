import { BaseLogParser } from "./base";
import { JenkinsLogObject } from "../static/types";

export class JenkinsLogParser extends BaseLogParser<JenkinsLogObject> {
  parseLogLine(logLine: string): JenkinsLogObject | null {
    try {
      const regex =
        /(\w+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} [AP]M) (\w+) ([\w.]+) (.*)/;
      const matches = logLine.match(regex);
      if (matches && matches.length === 5) {
        const [, time, level, logger, message] = matches;
        const jobRegex = /(.*) (#\d+)/;
        const jobMatches = message.match(jobRegex);
        let job: string;
        let build: string;
        if (jobMatches && jobMatches.length === 3) {
          job = jobMatches[1].trim();
          build = jobMatches[2].trim();
        }
        return {
          time,
          level,
          logger,
          job,
          build,
          message: message.trim(),
        };
      }
    } catch {}
    return null;
  }
}
