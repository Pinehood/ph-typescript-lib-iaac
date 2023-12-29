export interface IManager<T, R> {
  readonly objects: R[];

  build(object: T): Promise<[boolean, R]> | [boolean, R];

  start(object: R): Promise<boolean> | boolean;

  stop(object: R): Promise<boolean> | boolean;

  details(object: T): Promise<R> | R | null;
}

export interface ILogParser<T> {
  parse(logLines: string[]): T[];

  parseLogLine(logLine: string): T | null;
}
