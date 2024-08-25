import { ILogParser } from "./interfaces";

export type ArrayMatch = "every" | "some";
export type CreatePathType = "dir" | "file";
export type ScaleCommand = "up" | "down";
export type LogLevel = "info" | "warn" | "error";
export type CommandShell = "bash" | "sh";
export type MemUnit = "KiB" | "MiB" | "GiB";
export type IoUnit = "kB" | "B" | "MB" | "GB";
export type DockerComposeCommand = "up" | "down";

export type ServiceConfig = {
  logParser: new () => any;
  template: (instance: any) => any;
};

export type DockerCommand =
  | "start"
  | "stop"
  | "logs"
  | "inspect"
  | "stats"
  | "ps"
  | "network";

export type ServiceType =
  | "gitea"
  | "jenkins"
  | "adminer"
  | "postgres"
  | "mysql"
  | "redis"
  | "redmine"
  | "wikijs"
  | "prometheus"
  | "grafana"
  | "kibana"
  | "logstash"
  | "elasticsearch"
  | "custom";

export type DefaultMappings = {
  id: number;
  volumes: string[];
  ports: number[];
};

export type Override = {
  instanceName: string;
  fromKey: string;
  toKey: string;
};

export type Reference = {
  instanceName: string;
  value: string;
};

export type Network = {
  name: string;
  external: boolean;
  driver?: string;
};

export type BasicInstanceOptions = {
  expose?: boolean;
  persist?: boolean;
  healthcheck?: boolean;
  exporter?: boolean;
  scalable?: boolean;
};

export type BaseInstanceType = {
  id: number;
  service: ServiceType;
  version: string;
  name: string;
  dependsOn?: string[] | BaseInstanceType[];
  networks?: Network[];
  options?: BasicInstanceOptions;
  logParser?: ILogParser<any>;
};

export type GiteaInstanceType = BaseInstanceType & {
  service: "gitea";
};

export type JenkinsInstanceType = BaseInstanceType & {
  service: "jenkins";
};

export type AdminerInstanceType = BaseInstanceType & {
  service: "adminer";
};

export type PostgresInstanceType = BaseInstanceType & {
  service: "postgres";
  username: string;
  password: string;
  database: string;
  exporter?: boolean;
};

export type MySqlInstanceType = BaseInstanceType & {
  service: "mysql";
  username: string;
  password: string;
  rootPassword: string;
  database: string;
  exporter?: boolean;
};

export type RedisInstanceType = BaseInstanceType & {
  service: "redis";
  password: string;
  exporter?: boolean;
};

export type MySqlVars = {
  host: string;
  port: number;
  user: string;
  pass: string;
  db: string;
};

export type RedmineInstanceType = BaseInstanceType & {
  service: "redmine";
  mysql: MySqlVars;
};

export type WikiJsInstanceType = BaseInstanceType & {
  service: "wikijs";
  mysql: MySqlVars;
};

export type PrometheusInstanceType = BaseInstanceType & {
  service: "prometheus";
  targets: string[];
};

export type GrafanaInstanceType = BaseInstanceType & {
  service: "grafana";
  username: string;
  password: string;
  prometheus?: PrometheusInstanceType;
};

export type ElasticsearchInstanceType = BaseInstanceType & {
  service: "elasticsearch";
  node: string;
  cluster: string;
  password: string;
};

export type KibanaInstanceType = BaseInstanceType & {
  service: "kibana";
  elasticsearch?: ElasticsearchInstanceType;
};

export type LogstashInstanceType = BaseInstanceType & {
  service: "logstash";
  elasticsearch?: ElasticsearchInstanceType;
};

export type CustomInstanceType = BaseInstanceType & {
  service: "custom";
  image: string;
  ports?: [number, number][];
  volumes?: [string, string][];
  environment?: Record<string, any>;
};

export type Instance =
  | GiteaInstanceType
  | JenkinsInstanceType
  | AdminerInstanceType
  | PostgresInstanceType
  | MySqlInstanceType
  | RedisInstanceType
  | RedmineInstanceType
  | WikiJsInstanceType
  | PrometheusInstanceType
  | GrafanaInstanceType
  | KibanaInstanceType
  | LogstashInstanceType
  | ElasticsearchInstanceType
  | CustomInstanceType;

export type Stack = [string, Instance[]];

export type BuiltInstanceConfig = {
  path: string;
  volumeIdx?: number;
  content?: string;
  create?: CreatePathType;
};

export type BuiltInstance = {
  instance: Instance;
  image: string;
  volumes: [string, string][];
  ports: [number, number][];
  snippet: string;
  configs?: BuiltInstanceConfig[];
};

export type BuiltStack = {
  stack: Stack;
  instances: BuiltInstance[];
  location: string;
  snippet: string;
};

export type BaseLogObject = {
  time?: string;
  message?: string;
  level?: string;
};

export type AdminerLogObject = BaseLogObject & {
  address: string;
  port?: number;
  database?: string;
  type?: string;
};

export type ElasticsearchLogObject = BaseLogObject & {
  component: string;
  node: string;
  index: string;
};

export type GiteaLogObject = BaseLogObject & {
  module: string;
  file: string;
  func: string;
};

export type GrafanaLogObject = BaseLogObject & {
  logger: string;
  user?: number;
  org?: number;
  uname?: string;
  method?: string;
  path?: string;
  status?: number;
};

export type JenkinsLogObject = BaseLogObject & {
  logger: string;
  job?: string;
  build?: string;
};

export type KibanaLogObject = BaseLogObject & {
  pid: number;
  type?: string;
  tags?: string[];
};

export type LogstashLogObject = BaseLogObject & {
  logger: string;
};

export type MySqlLogObject = BaseLogObject & {
  code?: string;
  component?: string;
  connection?: number;
  user?: string;
  host?: string;
  db?: string;
};

export type PrometheusLogObject = BaseLogObject & {
  caller: string;
  component?: string;
  error?: string;
  version?: string;
};

export type RedmineLogObject = BaseLogObject & {
  pid: number;
  method?: string;
  request?: string;
  status?: string;
  response?: string;
  error?: string;
};

export type WikiJsLogObject = BaseLogObject & {
  time: string;
  source: string;
};

export type PostgresLogObject = BaseLogObject & {
  pid: number;
  user?: string;
  database?: string;
  application?: string;
  details?: string;
};

export type RedisLogObject = BaseLogObject & {
  type: string;
  pid: number;
};

export type BasicDockerContainerUsage = {
  containerId: string;
  name: string;
  cpuPercentage: string;
  memUsageAndLimit: string;
  memPercentage: string;
  netIO: string;
  blockIO: string;
  pids: string;
};

export type BasicDockerNetworkInfo = {
  networkId: string;
  name: string;
  driver: string;
  scope: string;
};

export type IoValue = {
  unit: IoUnit;
  value: number;
};

export type IoUsage = {
  input: IoValue;
  output: IoValue;
};

export type MemValue = {
  unit: MemUnit;
  value: number;
};

export type DetailedDockerContainerUsage = {
  info: {
    id: string;
    name: string;
    pids: number;
  };
  percentages: {
    cpu: number;
    mem: number;
  };
  mem: {
    usage: MemValue;
    limit: MemValue;
  };
  net: IoUsage;
  block: IoUsage;
};

export type BasicDockerContainerInfo = {
  containerId: string;
  image: string;
  created: string;
  status: string;
  ports: string;
  names: string;
};

export type DetailedDockerContainerInfo = {
  Id: string;
  Created: string;
  Path: string;
  Args: string[];
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    OOMKilled: boolean;
    Dead: boolean;
    Pid: number;
    ExitCode: number;
    Error: string;
    StartedAt: string;
    FinishedAt: string;
  };
  Image: string;
  ResolvConfPath: string;
  HostnamePath: string;
  HostsPath: string;
  LogPath: string;
  Name: string;
  RestartCount: number;
  Driver: string;
  Platform: string;
  MountLabel: string;
  ProcessLabel: string;
  AppArmorProfile: string;
  ExecIDs: unknown;
  HostConfig: {
    Binds: string[];
    ContainerIDFile: string;
    LogConfig: {
      Type: string;
      Config: Record<string, unknown>;
    };
    NetworkMode: string;
    PortBindings: {
      [key: string]: {
        HostIp: string;
        HostPort: string;
      }[];
    };
    RestartPolicy: {
      Name: string;
      MaximumRetryCount: number;
    };
    AutoRemove: boolean;
    VolumeDriver: string;
    VolumesFrom: string[];
    CapAdd: string[];
    CapDrop: string[];
    CgroupnsMode: string;
    Dns: string[];
    DnsOptions: string[];
    DnsSearch: string[];
    ExtraHosts: string[];
    GroupAdd: string[];
    IpcMode: string;
    Cgroup: string;
    Links: string[];
    OomScoreAdj: number;
    PidMode: string;
    Privileged: boolean;
    PublishAllPorts: boolean;
    ReadonlyRootfs: boolean;
    SecurityOpt: string[];
    UTSMode: string;
    UsernsMode: string;
    ShmSize: number;
    Runtime: string;
    ConsoleSize: [number, number];
    Isolation: string;
    CpuShares: number;
    Memory: number;
    NanoCpus: number;
    CgroupParent: string;
    BlkioWeight: number;
    BlkioWeightDevice: string[];
    BlkioDeviceReadBps: unknown;
    BlkioDeviceWriteBps: unknown;
    BlkioDeviceReadIOps: unknown;
    BlkioDeviceWriteIOps: unknown;
    CpuPeriod: number;
    CpuQuota: number;
    CpuRealtimePeriod: number;
    CpuRealtimeRuntime: number;
    CpusetCpus: string;
    CpusetMems: string;
    Devices: unknown;
    DeviceCgroupRules: unknown;
    DeviceRequests: unknown;
    KernelMemory: number;
    KernelMemoryTCP: number;
    MemoryReservation: number;
    MemorySwap: number;
    MemorySwappiness: unknown;
    OomKillDisable: unknown;
    PidsLimit: unknown;
    Ulimits: unknown;
    CpuCount: number;
    CpuPercent: number;
    IOMaximumIOps: number;
    IOMaximumBandwidth: number;
    MaskedPaths: string[];
    ReadonlyPaths: string[];
  };
  GraphDriver: {
    Data: {
      LowerDir: string;
      MergedDir: string;
      UpperDir: string;
      WorkDir: string;
    };
    Name: string;
  };
  Mounts: any[];
  Config: {
    Hostname: string;
    Domainname: string;
    User: string;
    AttachStdin: boolean;
    AttachStdout: boolean;
    AttachStderr: boolean;
    ExposedPorts: {
      [key: string]: object;
    };
    Tty: boolean;
    OpenStdin: boolean;
    StdinOnce: boolean;
    Env: string[];
    Cmd: string[];
    Image: string;
    Volumes: {
      [key: string]: object;
    };
    WorkingDir: string;
    Entrypoint: string[];
    OnBuild: unknown;
    Labels: {
      [key: string]: string;
    };
    StopSignal: string;
  };
  NetworkSettings: {
    Bridge: string;
    SandboxID: string;
    HairpinMode: boolean;
    LinkLocalIPv6Address: string;
    LinkLocalIPv6PrefixLen: number;
    Ports: {
      [key: string]: {
        HostIp: string;
        HostPort: string;
      }[];
    };
    SandboxKey: string;
    SecondaryIPAddresses: string;
    SecondaryIPv6Addresses: string;
    EndpointID: string;
    Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    IPAddress: string;
    IPPrefixLen: number;
    IPv6Gateway: string;
    MacAddress: string;
    Networks: {
      [key: string]: {
        IPAMConfig: unknown;
        Links: unknown;
        Aliases: string[];
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
        IPPrefixLen: number;
        IPv6Gateway: string;
        GlobalIPv6Address: string;
        GlobalIPv6PrefixLen: number;
        MacAddress: string;
        DriverOpts: unknown;
      };
    };
  };
};
