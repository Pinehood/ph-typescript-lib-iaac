import {
  BasicInstanceOptions,
  ILogParser,
  Instance,
  Network,
  Override,
  Reference,
  Stack,
} from "../static";

export class StackBuilder {
  private name: string;
  private instances: Instance[];

  constructor(name: string) {
    this.name = name;
    this.instances = [];
  }

  private get lastIndex() {
    return this.instances.length - 1;
  }

  and(): StackBuilder {
    return this;
  }

  useInstance(instance: Instance): StackBuilder {
    this.instances.push(instance);
    return this;
  }

  withNetworks(networks: Network[]): StackBuilder {
    this.instances[this.lastIndex].networks = networks;
    return this;
  }

  withDependsOn(dependsOn: string[]): StackBuilder {
    this.instances[this.lastIndex].dependsOn = this.instances.filter((i) =>
      dependsOn.includes(i.name),
    );
    return this;
  }

  withOptions(options: BasicInstanceOptions): StackBuilder {
    this.instances[this.lastIndex].options = options;
    return this;
  }

  withLogParser(logParser: ILogParser<any>): StackBuilder {
    this.instances[this.lastIndex].logParser = logParser;
    return this;
  }

  withOverrides(overrides: Override[]): StackBuilder {
    const toInstance = this.instances[this.lastIndex];
    for (let i = 0; i < overrides.length; i++) {
      const override = overrides[i];
      const fromInstance = this.instances.find(
        (i) => i.name === override.instanceName,
      );
      (toInstance as any)[override.toKey] = (fromInstance as any)[
        override.fromKey
      ];
    }
    this.instances[this.lastIndex] = toInstance;
    return this;
  }

  withObjectReferences(references: Reference[]): StackBuilder {
    const toInstance = this.instances[this.lastIndex];
    for (let i = 0; i < references.length; i++) {
      const reference = references[i];
      const fromInstance = this.instances.find(
        (i) => i.name === reference.instanceName,
      );
      (toInstance as any)[reference.value] = fromInstance as any;
    }
    this.instances[this.lastIndex] = toInstance;
    return this;
  }

  build(): Stack {
    return [this.name, this.instances];
  }
}
