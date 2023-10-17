import { useEffect, useRef, useState } from "react";
import { Operation, applyPatch } from "fast-json-patch";

type State = {
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

type Scan = {
  metadata: {
    name: string;
    progress?: number;
  };
};

export default function Custom() {
  const stateRef = useRef<State>({});
  const [patch, setPatch] = useState<Operation[]>([]);
  const [state, setState] = useState<State>({});
  useEffect(() => {
    initializeWebSocket(`ws://salem-oats:3732`, (newPatch) => {
      setPatch(newPatch);
      stateRef.current = applyPatch(stateRef.current, newPatch).newDocument;
      setState(stateRef.current);
    });
  }, []);
  return (
    <div id="custom">
      <Patch patch={patch} />
      <FullState state={state} />
      <div>
        <Temperature value={state.detector?.temperature} />
        <XRaysOn value={state.source?.xrayOn} />
        {state.scans && <Scans value={state.scans?.local} />}
      </div>
    </div>
  );
}

function Scans({ value }: { value: Record<string, Scan> }) {
  return (
    <div>
      <h1>Scans</h1>
      <ul>
        {Object.entries(value).map(([id, scan]) => (
          <li key={id}>
            progress: {scan.metadata.progress} {scan.metadata.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function XRaysOn({ value }: { value?: boolean }) {
  return <p>X-rays {value ? "on" : "off"}</p>;
}

function Temperature({ value }: { value?: number }) {
  return <p>Temp: {value}</p>;
}

function Patch({ patch }: { patch: Operation[] }) {
  return <pre>{JSON.stringify(patch, null, 2)}</pre>;
}

function FullState({ state }: { state: State }) {
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}

const initializeWebSocket = (
  url: string,
  onMessage: (patch: Operation[]) => void
) => {
  const ws = new WebSocket(url);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.topic === "state") {
      onMessage(data.stateDelta);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket Error: ", error);
    // Handle any errors that occur, potentially by reconnecting.
  };

  ws.onclose = (event) => {
    if (event.wasClean) {
      console.log(
        `Connection closed cleanly, code=${event.code}, reason=${event.reason}`
      );
    } else {
      console.error("Connection died");
      // Potentially handle retries here.
    }
  };

  return ws;
};
