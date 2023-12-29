import { Logger } from "./logger";

export async function loadDotEnv(): Promise<boolean> {
  const pckg = "dotenv";
  try {
    const dotenv = await import(pckg);
    dotenv.config();
    return true;
  } catch {
    new Logger("Environment").warn(`Package '${pckg}' not installed`);
    return false;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      YML_FILE_NAME?: string | null;
      ON_UPDATE_INTERVAL_MS?: string | null;
      VERBOSE_EXECUTE?: string | null;
      ALLOWED_COMMANDS?: string | null;
    }
  }
}
export {};
