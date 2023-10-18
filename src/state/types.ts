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
  motion?: {
    turntableAngle: number;
    position: [number, number, number];
  };
};

export type Scan = {
  metadata: {
    name: string;
    progress?: number;
  };
};

export type Subscriber = () => void;
