export type State = {
  detector?: {
    temperature: number;
  };
  source?: {
    xrayOn: boolean;
  };
  scans?: {
    local: Record<string, Scan>;
  };
};

export type Scan = {
  metadata: {
    name: string;
    progress?: number;
  };
};
