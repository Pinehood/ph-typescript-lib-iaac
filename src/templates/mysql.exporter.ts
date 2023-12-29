import { createNetworksSection } from "../utils/creators";
import { MySqlInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: MySqlInstanceType): string => {
  /*
    Port: 9104
    Query:
        CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'exporter' WITH MAX_USER_CONNECTIONS 3;
        GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
  */
  return `
  ${instance.service}-${instance.id}-exporter:
    container_name: ${instance.name}-exporter
    image: quay.io/prometheus/mysqld-exporter:latest
    restart: unless-stopped
    command: -collect.info_schema.tablestats
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    environment:
      DATA_SOURCE_NAME: mysql://${instance.username}:${instance.password}@${
    instance.name
  }:3306/${instance.database}?sslmode=disable
    depends_on:
      - ${instance.service}-${instance.id}`;
};
