import { createNetworksSection } from "../utils/creators";
import { RedisInstanceType } from "../static/types";
import { EMPTY } from "../static/constants";

export default (instance: RedisInstanceType): string => {
  return `
  ${instance.service}-${instance.id}-exporter:
    container_name: ${instance.name}-exporter
    image: oliver006/redis_exporter:latest
    restart: unless-stopped
    command: -redis.addr redis://${instance.name}:6379 -redis.password ${
    instance.password
  }
    ${instance.networks ? createNetworksSection(instance.networks) : EMPTY}
    depends_on:
      - ${instance.service}-${instance.id}`;
};
