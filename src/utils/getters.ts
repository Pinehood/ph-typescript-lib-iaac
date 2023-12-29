import { isWindows } from "./helpers";
import { DEFAULT_MAPPINGS, NAME_SPLITTER } from "../static/constants";
import { BuiltInstance, Instance, Network } from "../static/types";

export function getUniqueNetworks(builtInstances: BuiltInstance[]): Network[] {
  const networksArray: Network[] = [];
  try {
    builtInstances.forEach((bi) =>
      bi.instance.networks?.forEach((n) => {
        if (networksArray.findIndex((nf) => nf.name === n.name) < 0) {
          networksArray.push(n);
        }
      })
    );
  } catch {}
  return networksArray;
}

export function getUniqueVolumes(builtInstances: BuiltInstance[]): string[] {
  const volumesArray: string[] = [];
  try {
    builtInstances.forEach((bi) =>
      bi.volumes?.forEach((v) => {
        if (
          volumesArray.findIndex((vf) => v[0] === vf[0]) < 0 &&
          bi.instance.options.persist === true &&
          !v[1].endsWith(".yml") &&
          !v[0].startsWith("./")
        ) {
          volumesArray.push(v[0]);
        }
      })
    );
  } catch {}
  return volumesArray;
}

export function getServiceVolumes(instance: Instance): [string, string][] {
  const volumes: [string, string][] = [];
  try {
    DEFAULT_MAPPINGS[instance.service.split(NAME_SPLITTER)[0]].volumes.forEach(
      (v: string, i: number) => {
        volumes.push(
          isWindows()
            ? [`${instance.service}-data-${instance.id}-vol${i}`, v]
            : [`./_data/${instance.service}-${instance.id}-vol${i}`, v]
        );
      }
    );
  } catch {}
  return volumes;
}

export function getServicePorts(instance: Instance): [number, number][] {
  const ports: [number, number][] = [];
  try {
    let add = 0;
    const split = instance.service.split(NAME_SPLITTER);
    if (instance.service.includes(NAME_SPLITTER)) {
      add = parseInt(split[1] ?? "0", 10);
    }
    DEFAULT_MAPPINGS[split[0]].ports.forEach((port: number) =>
      ports.push([port + instance.id + add, port])
    );
  } catch {}
  return ports;
}
