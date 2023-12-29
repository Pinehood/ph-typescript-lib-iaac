import { createNetworksSection } from "../utils/creators";
import { PostgresInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: PostgresInstanceType): string => {
  /*
    Port: 9187
  */
  return `
  ${instance.service}-${instance.id}-exporter:
    container_name: ${instance.name}-exporter
    image: prometheuscommunity/postgres-exporter:latest
    restart: unless-stopped
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    environment:
      DATA_SOURCE_NAME: postgresql://${instance.username}:${
    instance.password
  }@${instance.name}:5432/${instance.database}?sslmode=disable
    depends_on:
      - ${instance.service}-${instance.id}`;
};
