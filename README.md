# Pinehood TypeScript Infrastructure-as-a-Code

Simple proof-of-concept library that demonstrates possibilities of utilising simple command execution wrapping and Docker service templating to achieve an easily configurable Infrastructure-as-a-Code implementation, without fancy payment subscriptions, or overkilled Cloud services/providers usage requirements.

## Main Table of Contents

Mainly documentation of code and logic.

- [InstanceManager Class](#instancemanager-class)
- [StackManager Class](#stackmanager-class)
- [DatabaseManager Class](#databasemanager-class)
- [General Configuration](#general-configuration)
- [Utility Functions](#utility-functions)
- [Docker Utilities](#docker-utilities)
- [Docker Creators](#docker-creators)
- [Example Script](#example-script)

# InstanceManager Class

The `InstanceManager` class is responsible for managing instances by providing functionalities to build, start, stop, and perform various operations on different types of service instances within a Docker environment.

## Table of Contents

- [Imports: InstanceManager](#imports-instancemanager)
- [Class: InstanceManager](#class-instancemanager)
  - [Properties: InstanceManager](#properties-instancemanager)
  - [Constructor: InstanceManager](#constructor-instancemanager)
  - [Methods: InstanceManager](#methods-instancemanager)
    - [`build(instance: Instance): [boolean, BuiltInstance]`](#buildinstance-instance-boolean-builtinstance)
    - [`start(builtInstance: BuiltInstance): Promise<boolean>`](#startbuiltinstance-builtinstance-promiseboolean)
    - [`stop(builtInstance: BuiltInstance): Promise<boolean>`](#stopbuiltinstance-builtinstance-promiseboolean)
    - [`details(instance: Instance): BuiltInstance | null`](#detailsinstance-instance-builtinstance--null)
    - [`inspect(builtInstance: BuiltInstance): Promise<DetailedDockerContainerInfo>`](#inspectbuiltinstance-builtinstance-promisedetaileddockercontainerinfo)
    - [`logs(builtInstance: BuiltInstance, tail?: number): Promise<string>`](#logsbuiltinstance-builtinstance-tail-number-promisestring)
    - [`parseLogs(builtInstance: BuiltInstance, tail?: number): Promise<any[]>`](#parselogsbuiltinstance-builtinstance-tail-number-promiseany)
    - [`command(builtInstance: BuiltInstance, command: string, shell: CommandShell = 'sh'): Promise<string>`](#commandbuiltinstance-builtinstance-command-string-shell-commandshell--sh-promisestring)
    - [`scaled(builtInstance: BuiltInstance): boolean`](#scaledbuiltinstance-builtinstance-boolean)
    - [`remove(builtInstance: BuiltInstance): boolean`](#removebuiltinstance-builtinstance-boolean)

## Imports: InstanceManager

- `docker`, `executeCommand` from "../utils/helpers"
- `Logger` from "../utils/logger"
- Various types, interfaces, constants, parsers, and templates from respective paths

## Class: InstanceManager

### Properties: InstanceManager

- `objects: BuiltInstance[]` - Array holding built instances.
- `logger: Logger` - Instance of the Logger class for logging purposes.

### Constructor: InstanceManager

- `constructor()` - Initializes the `objects` array to an empty array.

### Methods: InstanceManager

#### `build(instance: Instance): [boolean, BuiltInstance]`

Builds the given instance based on its service type and returns a tuple indicating success and the built instance.

#### `start(builtInstance: BuiltInstance): Promise<boolean>`

Starts the Docker container associated with the given built instance.

#### `stop(builtInstance: BuiltInstance): Promise<boolean>`

Stops the Docker container associated with the given built instance.

#### `details(instance: Instance): BuiltInstance | null`

Gets details of the built instance by name or instance object.

#### `inspect(builtInstance: BuiltInstance): Promise<DetailedDockerContainerInfo>`

Inspects the detailed information of the Docker container associated with the built instance.

#### `logs(builtInstance: BuiltInstance, tail?: number): Promise<string>`

Retrieves logs from the Docker container associated with the built instance, optionally specifying the number of lines to fetch.

#### `parseLogs(builtInstance: BuiltInstance, tail?: number): Promise<any[]>`

Parses logs retrieved from the Docker container associated with the built instance using a log parser.

#### `command(builtInstance: BuiltInstance, command: string, shell: CommandShell = 'sh'): Promise<string>`

Executes a command inside the Docker container associated with the built instance using the specified shell.

#### `scaled(builtInstance: BuiltInstance): boolean`

Checks if there are scaled instances of the same service type.

#### `remove(builtInstance: BuiltInstance): boolean`

Removes the specified built instance from the `objects` array.

### Private Methods

- `allowed(builtInstance: BuiltInstance): boolean` - Checks if the built instance is allowed (exists in the `objects` array).
- `hasLogParser(builtInstance: BuiltInstance): boolean` - Checks if the built instance has a log parser associated with it.

# StackManager Class

The `StackManager` class manages Docker stacks, providing functionalities to build, start, stop, and perform various operations on stacks and associated instances within a Docker environment.

## Table of Contents

- [Imports: StackManager](#imports-stackmanager)
- [Class: StackManager](#class-stackmanager)
  - [Properties: StackManager](#properties-stackmanager)
  - [Constructor: StackManager](#constructor-stackmanager)
  - [Methods: StackManager](#methods-stackmanager)
    - [`build(stack: Stack, location?: string): Promise<[boolean, BuiltStack]>`](#buildstack-stack-location-string-promiseboolean-builtstack)
    - [`start(builtStack: BuiltStack): Promise<boolean>`](#startbuiltstack-builtstack-promiseboolean)
    - [`stop(builtStack: BuiltStack): Promise<boolean>`](#stopbuiltstack-builtstack-promiseboolean)
    - [`details(stack: Stack): BuiltStack | null`](#detailsstack-stack-builtstack--null)
    - [`networks(): Promise<BasicDockerNetworkInfo[]>`](#networks-promisebasicdockernetworkinfo)
    - [`containers(): Promise<BasicDockerContainerInfo[]>`](#containers-promisebasicdockercontainerinfo)
    - [`stats(): Promise<BasicDockerContainerUsage[]>`](#stats-promisebasicdockercontainerusage)
    - [`detailedStats(basic: BasicDockerContainerUsage[]): DetailedDockerContainerUsage[]`](#detailedstatsbasic-basicdockercontainerusage-detaileddockercontainerusage)
    - [`running(stack: Stack | BuiltStack, match: ArrayMatch = 'some'): Promise<boolean>`](#runningstack-stack--builtstack-match-arraymatch--some-promiseboolean)
    - [`scale(scaleCommand: ScaleCommand, builtStack: BuiltStack, builtInstance: BuiltInstance, amount: number): Promise<boolean>`](#scalescalecommand-scalecommand-builtstack-builtstack-builtinstance-builtinstance-amount-number-promiseboolean)

## Imports: StackManager

- `fs`, `path` from "node:fs", "node:path"
- `InstanceManager` from "./instance"
- Various utilities and types from "../utils/helpers", "../utils/logger", "../static/types", "../static/interfaces", "../static/constants", "../templates/stack"

## Class: StackManager

### Properties: StackManager

- `objects: BuiltStack[]` - Array holding built stacks.
- `instanceManager: InstanceManager` - Instance of the `InstanceManager` class for managing instances.
- `logger: Logger` - Instance of the Logger class for logging purposes.

### Constructor: StackManager

- `constructor()` - Initializes the `objects` array to an empty array and initializes the `instanceManager`.

### Methods: StackManager

#### `build(stack: Stack, location?: string): Promise<[boolean, BuiltStack]>`

Builds a Docker stack with instances and returns a tuple indicating success and the built stack.

#### `start(builtStack: BuiltStack): Promise<boolean>`

Starts the Docker stack associated with the given built stack.

#### `stop(builtStack: BuiltStack): Promise<boolean>`

Stops the Docker stack associated with the given built stack.

#### `details(stack: Stack): BuiltStack | null`

Gets details of the built stack by name or stack object.

#### `networks(): Promise<BasicDockerNetworkInfo[]>`

Retrieves information about Docker networks.

#### `containers(): Promise<BasicDockerContainerInfo[]>`

Retrieves information about Docker containers.

#### `stats(): Promise<BasicDockerContainerUsage[]>`

Retrieves basic statistics of Docker container usage.

#### `detailedStats(basic: BasicDockerContainerUsage[]): DetailedDockerContainerUsage[]`

Converts basic container usage statistics into detailed format.

#### `running(stack: Stack | BuiltStack, match: ArrayMatch = 'some'): Promise<boolean>`

Checks if instances in a stack are currently running.

#### `scale(scaleCommand: ScaleCommand, builtStack: BuiltStack, builtInstance: BuiltInstance, amount: number): Promise<boolean>`

Scales instances within a Docker stack.

### Private Methods

- `createExternalNetworks(stack: Stack): Promise<boolean>` - Creates external Docker networks used by the stack.
- `createFiles(builtStack: BuiltStack): boolean` - Creates necessary files associated with the built stack.

# DatabaseManager Class

The `DatabaseManager` class is responsible for performing backup and restore of the data for various SQL based systems. For now, only PostgreSQL is supported.

## Table of Contents

- [Imports: DatabaseManager](#imports-databasemanager)
- [Class: DatabaseManager](#class-databasemanager)
  - [Methods: DatabaseManager](#methods-databasemanager)
    - [backup(object: T, path: string)](#backupobject-t-path-string)
    - [restore(object: T, path: string)](#restoreobject-t-path-string)

## Imports: DatabaseManager

- `Logger`, `executeCommand` from "../utils/helpers"
- Various types, interfaces, constants, parsers, and templates from respective paths

## Class: DatabaseManager

### Methods: DatabaseManager

#### `backup(object: T, path: string): Promise<boolean>`

Creates a .gz archive file from the dumped database data at the given path for the given object (instance).

#### `restore(object: T, path: string): Promise<boolean>`

Restores a .gz archive file backup (using `gunzip`) for a database at the given path for the given object (instance).

# General Configuration

The general configuration manages the environmental variables, default mappings, and constants used in the application.

## Table of Contents

- [Imports: General Configuration](#imports-general-configuration)
- [Constants: General Configuration](#constants-general-configuration)
- [Environments: General Configuration](#environmental-configuration-general-configuration)
- [Default Mappings: General Configuration](#default-mappings-general-configuration)

## Imports: General Configuration

- `loadDotEnv` from "../utils/environment"
- `DefaultMappings`, `ServiceType` from "./types"

## Constants: General Configuration

- `NAME_SPLITTER`: Holds the string value "\_\_", used as a separator in names.
- `EMPTY`: Represents the string value "@empty@".
- `YML_FILE_NAME`: Holds the name of the YAML file, either taken from the environment variable `YML_FILE_NAME` or defaults to "docker-compose.yml".
- `ON_UPDATE_INTERVAL_MS`: Represents the time interval for update in milliseconds, fetched from the environment variable `ON_UPDATE_INTERVAL_MS`, defaulting to 7500 milliseconds.
- `VERBOSE_EXECUTE`: Represents a boolean value, extracted from the environment variable `VERBOSE_EXECUTE`, defaulting to true.
- `ALLOWED_COMMANDS`: Contains a list of allowed Docker commands fetched from the environment variable `ALLOWED_COMMANDS` or defaults to a predefined set of commands related to Docker operations.

## Environmental Configuration: General Configuration

- The `loadDotEnv()` function is called from "../utils/environment" to load the environment variables.

## Default Mappings: General Configuration

- `DEFAULT_MAPPINGS`: A mapping of `ServiceType` to `DefaultMappings` object representing default configurations for various services.
  - `adminer`, `gitea`, `jenkins`, `mysql`, `postgres`, `redis`, `redmine`, `wikijs`, `prometheus`, `grafana`, `kibana`, `logstash`, `elasticsearch`: Each service type has an associated `id`, `volumes` array, and `ports` array defining default settings for respective Docker services.
  - The `custom` service type is set to null, indicating that it doesn't have predefined default settings and is customizable.

# Utility Functions

This TypeScript file contains utility functions that manipulate and retrieve information related to Docker instances, networks, volumes, and service configurations.

## Functions

#### `getUniqueNetworks(builtInstances: BuiltInstance[]): Network[]`

- **Description**: Retrieves unique networks from an array of built instances.
- **Parameters**:
  - `builtInstances`: An array of `BuiltInstance` objects.
- **Returns**: An array of `Network` objects containing unique networks found in the provided `builtInstances`.

#### `getUniqueVolumes(builtInstances: BuiltInstance[]): string[]`

- **Description**: Fetches unique volumes from an array of built instances considering certain conditions.
- **Parameters**:
  - `builtInstances`: An array of `BuiltInstance` objects.
- **Returns**: An array of strings representing unique volumes adhering to specific criteria from the provided `builtInstances`.

#### `getServiceVolumes(instance: Instance): [string, string][]`

- **Description**: Retrieves service volumes for a given instance based on predefined default mappings.
- **Parameters**:
  - `instance`: An `Instance` object representing the Docker instance.
- **Returns**: An array of tuples `[string, string]` denoting service volumes for the provided `instance`.

#### `getServicePorts(instance: Instance): [number, number][]`

- **Description**: Obtains service ports for a given instance based on predefined default mappings.
- **Parameters**:
  - `instance`: An `Instance` object representing the Docker instance.
- **Returns**: An array of tuples `[number, number]` indicating service ports for the provided `instance`.

## Imported Modules and Constants

### Imported Modules

- `isWindows` from "./helpers"

### Imported Constants

- `DEFAULT_MAPPINGS`, `NAME_SPLITTER` from "../static/constants"

# Docker Utilities

This TypeScript file contains utility functions for managing Docker commands, executing shell commands, parsing memory and I/O values, and handling Docker stack operations.

## Functions

#### `isWindows(): boolean`

- **Description**: Checks if the current operating system is Windows.
- **Returns**: `true` if the operating system is Windows, otherwise `false`.

#### `printFunction(func: () => Promise<any> | any): void`

- **Description**: Executes a function and logs its output using the logger.
- **Parameters**:
  - `func`: A function that returns a promise or a value.
- **Side Effect**: Logs the output of the provided function using the logger.

#### `hasError(str: string): boolean`

- **Description**: Checks if a string contains common error keywords.
- **Parameters**:
  - `str`: The string to be checked.
- **Returns**: `true` if the string contains common error keywords, otherwise `false`.

#### `start(stackManager: StackManager, stack: Stack, onUpdate: (stackManager: StackManager, builtStack: BuiltStack) => Promise<void> = async (_) => {}, location?: string): Promise<void>`

- **Description**: Initiates and starts a Docker stack.
- **Parameters**:
  - `stackManager`: An instance of `StackManager`.
  - `stack`: The Docker stack to be started.
  - `onUpdate`: An optional function to perform actions after starting the stack.
  - `location`: Optional location path for the stack.
- **Side Effect**: Starts the Docker stack and triggers onUpdate function at specified intervals.

#### `docker(cmd: DockerCommand, obj?: any, opts: string = ""): Promise<boolean | string>`

- **Description**: Executes Docker commands and returns a boolean or command output.
- **Parameters**:
  - `cmd`: The Docker command to be executed.
  - `obj`: An optional object for command execution.
  - `opts`: Optional string parameter for additional command options.
- **Returns**: A boolean indicating command success or the output of certain commands.

#### `compose(cmd: DockerComposeCommand, obj: any): Promise<boolean>`

- **Description**: Executes Docker Compose commands.
- **Parameters**:
  - `cmd`: The Docker Compose command to be executed.
  - `obj`: An object for command execution.
- **Returns**: A boolean indicating command success.

#### `executeCommand(cmd: string): Promise<string>`

- **Description**: Executes a shell command and returns the output.
- **Parameters**:
  - `cmd`: The command to be executed.
- **Returns**: A promise resolving to the command output.

#### `parseToMemValue(mem: string): MemValue`

- **Description**: Parses a string into a memory value with unit.
- **Parameters**:
  - `mem`: The string to be parsed.
- **Returns**: An object with parsed memory value and unit.

#### `parseToIoValue(io: string): IoValue`

- **Description**: Parses a string into an I/O value with unit.
- **Parameters**:
  - `io`: The string to be parsed.
- **Returns**: An object with parsed I/O value and unit.

## Imported Modules and Constants

### Imported Modules

- `OS` from "node:os"
- `exec` from "node:child_process"
- `StackManager` from "../managers/stack"
- `Logger` from "./logger"

### Imported Constants

- `ALLOWED_COMMANDS`, `ON_UPDATE_INTERVAL_MS`, `VERBOSE_EXECUTE`, `YML_FILE_NAME` from "../static/constants"
- `BuiltStack`, `DockerCommand`, `DockerComposeCommand`, `IoUnit`, `IoValue`, `MemUnit`, `MemValue`, `Stack` from "../static/types"

# Docker Creators

This TypeScript file contains functions that generate various sections required for Docker configuration files based on specific parameters and conditions.

## Functions

#### `createNetworksSection(networks: Network[]): string`

- **Description**: Creates a Docker networks section.
- **Parameters**:
  - `networks`: Array of network objects.
- **Returns**: A string representing the networks section in the Docker configuration file.

#### `createVolumesSection(volumes: [string, string][]): string`

- **Description**: Creates a Docker volumes section.
- **Parameters**:
  - `volumes`: Array of volume pairs.
- **Returns**: A string representing the volumes section in the Docker configuration file.

#### `createPortsSection(ports: [number, number][]): string`

- **Description**: Creates a Docker ports section.
- **Parameters**:
  - `ports`: Array of port pairs.
- **Returns**: A string representing the ports section in the Docker configuration file.

#### `createDependsOnSection(dependsOn: string[] | BaseInstanceType[]): string`

- **Description**: Creates a Docker depends_on section.
- **Parameters**:
  - `dependsOn`: Array of dependencies as strings or BaseInstanceType objects.
- **Returns**: A string representing the depends_on section in the Docker configuration file.

#### `createEnvironmentSection(environment: Record<string, any>): string`

- **Description**: Creates a Docker environment section.
- **Parameters**:
  - `environment`: Object representing environment variables.
- **Returns**: A string representing the environment section in the Docker configuration file.

#### `createHealthcheckSection(service: ServiceType, instance?: any): string`

- **Description**: Creates a Docker healthcheck section based on the service type.
- **Parameters**:
  - `service`: Service type to determine healthcheck.
  - `instance`: Optional instance object for healthcheck generation.
- **Returns**: A string representing the healthcheck section in the Docker configuration file.

#### `createNetworksDefinitions(builtInstances: BuiltInstance[]): string`

- **Description**: Creates Docker network definitions based on built instances.
- **Parameters**:
  - `builtInstances`: Array of built instance objects.
- **Returns**: A string representing the network definitions in the Docker configuration file.

## Imported Modules and Constants

### Imported Types

- `BaseInstanceType`, `BuiltInstance`, `Network`, `ServiceType` from "../static/types"

### Imported Constants

- `EMPTY` from "../static/constants"

# Example Script

This example script initializes and configures multiple Docker service instances and manages their connectivity in a Docker environment. It orchestrates service creation, network setup, and stack management using predefined configurations and helper functions.

## Code

```typescript
// imports ...

const net: Network = {
  name: "loc",
  driver: "bridge",
  external: false,
};

const ext: Network = {
  name: "ext",
  external: true,
};

const postgres = DEFAULT_POSTGRES();
postgres.networks = [net, ext];

const mysql = DEFAULT_MYSQL();
mysql.networks = [net, ext];

const adminer = DEFAULT_ADMINER();
adminer.networks = [net, ext];

const redis = DEFAULT_REDIS();
redis.networks = [net];

const gitea = DEFAULT_GITEA();
gitea.networks = [net];

const jenkins = DEFAULT_JENKINS();
jenkins.networks = [net];

const redmine = DEFAULT_REDMINE();
redmine.networks = [net, ext];
(redmine as RedmineInstanceType).mysql.host = mysql.name;

const wikijs = DEFAULT_WIKIJS();
wikijs.networks = [net, ext];
(wikijs as WikiJsInstanceType).mysql.host = mysql.name;

const prometheus = DEFAULT_PROMETHEUS();
prometheus.networks = [net];

const grafana = DEFAULT_GRAFANA();
grafana.networks = [net];
grafana.dependsOn = [prometheus];
(grafana as GrafanaInstanceType).prometheus =
  prometheus as PrometheusInstanceType;

const elasticsearch = DEFAULT_ELASTICSEARCH();
elasticsearch.networks = [net];

const kibana = DEFAULT_KIBANA();
kibana.networks = [net];
kibana.dependsOn = [elasticsearch];
(kibana as KibanaInstanceType).elasticsearch =
  elasticsearch as ElasticsearchInstanceType;

const logstash = DEFAULT_LOGSTASH();
logstash.networks = [net];
logstash.dependsOn = [elasticsearch];
(logstash as LogstashInstanceType).elasticsearch =
  elasticsearch as ElasticsearchInstanceType;

const logger = new Logger("Main");

async function update(
  stackManager: StackManager,
  builtStack: BuiltStack,
): Promise<void> {
  try {
    logger.data(stackManager, "stackManager");
    logger.data(builtStack, "builtStack");
    // Do stuff here (check, parse, log, scale, alert, backup etc.)
  } catch (error) {
    logger.error(error);
  }
}

(async function entrypoint() {
  const devOpsStack: Stack = [
    "devops-stack",
    [adminer, jenkins, prometheus, grafana, gitea, redmine, wikijs],
  ];
  const storageStack: Stack = ["storage-stack", [postgres, redis, mysql]];
  const elkStack: Stack = ["elk-stack", [elasticsearch, kibana, logstash]];
  const stackManager = new StackManager();
  const promises = [
    start(stackManager, devOpsStack, update, "./stacks/devops"),
    start(stackManager, storageStack, update, "./stacks/storage"),
    start(stackManager, elkStack, update, "./stacks/elk"),
  ];
  await Promise.allSettled(promises);
})();

// You could also use available Builder pattern implementation for stack building in another way

const esObjRef = {
  instanceName: "default-elasticsearch",
  value: "elasticsearch",
};

const msObjRef = {
  instanceName: "default-mysql",
  fromKey: "name",
  toKey: "mysql.host",
};

const storageStack = new StackBuilder("storage-stack")
  .useInstance(DEFAULT_REDIS())
  .withNetworks([net])
  .and()
  .useInstance(DEFAULT_MYSQL())
  .withNetworks([net, ext])
  .and()
  .useInstance(DEFAULT_POSTGRES())
  .withNetworks([net, ext])
  .build();

const elkStackBuild = new StackBuilder("elk-stack")
  .useInstance(DEFAULT_ELASTICSEARCH())
  .withNetworks([net])
  .and()
  .useInstance(DEFAULT_KIBANA())
  .withNetworks([net])
  .withDependsOn(["default-elasticsearch"])
  .withObjectReferences([esObjRef])
  .and()
  .useInstance(DEFAULT_LOGSTASH())
  .withNetworks([net])
  .withDependsOn(["default-elasticsearch"])
  .withObjectReferences([esObjRef])
  .build();
```

## Imports

- `StackManager` from `./managers/stack`
- Various types like `BuiltStack`, `InstanceType`, `Network`, `Stack`, etc., from `./static/types`
- Default configurations for Docker services like `DEFAULT_ADMINER`, `DEFAULT_GITEA`, `DEFAULT_JENKINS`, etc., from `./utils/defaults`
- `start` function from `./utils/helpers`
- `Logger` from `./utils/logger`

## Configuration Initialization

- Defines two network configurations (`net` and `ext`) with different properties such as `name` and `external` to set up internal and external networks within Docker.
- Configures default settings for various Docker services using functions like `DEFAULT_POSTGRES()`, `DEFAULT_MYSQL()`, etc., and assigns networks to these service instances.
- Establishes connections between certain services by setting up dependencies (`dependsOn`) between them, for instance, Grafana depending on Prometheus, Kibana depending on Elasticsearch, Logstash depending on Elasticsearch.
- Initializes a `Logger` instance for logging purposes.

## Asynchronous Update Function

- Defines an asynchronous `update` function that takes in a `StackManager` and a `BuiltStack` as parameters.
- Attempts to log data related to the `stackManager` and `builtStack`. In case of an error, logs the error using the `Logger`.

## Entry Point

- Defines an asynchronous `entrypoint` function.
- Creates three stacks (`devOpsStack`, `storageStack`, `elkStack`) that group different sets of service instances.
- Instantiates a `StackManager`.
- Initiates the stacks asynchronously using the `start` function, triggering the `update` function for each stack, and awaits their settlement using `Promise.allSettled`.

This script acts as a configuration and management tool for Docker service instances, networks, and stacks, orchestrating the setup and interaction among different services within a Docker environment.
