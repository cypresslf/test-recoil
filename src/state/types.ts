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
  settings: {
    filter: {
      filterSlots: Filter[];
    };
  };
};

export type Position = [number, number, number];

export type Filter = {
  filter: {
    material: string;
    thickness: number;
  } | null;
  position: number;
};

export type Scan = {
  metadata: {
    name: string;
    progress?: number;
  };
};

export type Subscriber = () => void;
