export type State = {
  detector?: {
    temperature: number;
  };
  source?: {
    xrayOn: boolean;
    kvMeasured: number;
    uaMeasured: number;
  };
  scans?: {
    local: Record<string, Scan>;
  };
  motion?: {
    turntableAngle: number;
    position: Position;
  };
};

export type Position = [number, number, number];

export type Scan = {
  metadata: {
    name: string;
    progress?: number;
  };
};

export type Subscriber = () => void;
