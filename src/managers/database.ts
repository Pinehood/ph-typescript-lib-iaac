import { IDatabaseManager, PostgresInstanceType } from "../static";
import { executeCommand, Logger } from "../utils";

export class DatabaseManager<T extends PostgresInstanceType>
  implements IDatabaseManager<T>
{
  private readonly logger = new Logger(DatabaseManager);

  async backup(object: T, path: string): Promise<boolean> {
    try {
      const name = `dump_${new Date().toISOString().replace(/:/g, "-")}.gz`;
      const dump = `docker exec -u postgres -ti ${object.name} bash -c "pg_dumpall -c -U ${object.username} -d ${object.database} | gzip > ~/dump.gz"`;
      const copy = `docker cp ${object.name}:/var/lib/postgresql/dump.gz ${path}/${name}`;
      const clear = `docker exec -u postgres -ti ${object.name} bash -c "rm -rf ~/dump.gz"`;
      await executeCommand(dump);
      await executeCommand(copy);
      await executeCommand(clear);
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async restore(object: T, path: string): Promise<boolean> {
    try {
      const gunzip = `gunzip < ${path} | docker exec -u postgres -ti ${object.name} bash -c "psql -U ${object.username} -d ${object.database}"`;
      await executeCommand(gunzip);
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
