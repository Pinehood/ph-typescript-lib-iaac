import { ElasticsearchLogObject } from "../static/types";
import { ILogParser } from "../static/interfaces";

export class ElasticsearchLogParser
  implements ILogParser<ElasticsearchLogObject>
{
  parse(logLines: string[]): ElasticsearchLogObject[] {
    const parsedLogs: ElasticsearchLogObject[] = [];
    logLines.forEach((logLine) => parsedLogs.push(this.parseLogLine(logLine)));
    return parsedLogs.filter((logLine) => logLine !== null);
  }

  parseLogLine(logLine: string): ElasticsearchLogObject | null {
    try {
      console.log(logLine);
    } catch {}
    return null;
  }
}
