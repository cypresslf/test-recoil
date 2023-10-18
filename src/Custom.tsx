import { useSubscribe, useWebSocket } from "./state/lib";
import type { Scan, Position } from "./state/types";

export default function Custom() {
  useWebSocket();

  return (
    <div id="custom">
      <div>
        <Temperature />
        <XRaysOn />
        <Position />
        <Scans />
      </div>
      <FullState />
    </div>
  );
}

function Temperature() {
  const value = useSubscribe<number>("/detector/temperature");
  return <p>Temperature: {value}</p>;
}

function XRaysOn() {
  const value = useSubscribe<boolean>("/source/xrayOn");
  return <p>X-rays {value ? "on" : "off"}</p>;
}

function Position() {
  const value = useSubscribe<Position>("/motion/position");
  if (!value) return null;
  return (
    <p>
      position: [{value[0]}, {value[1]}, {value[2]}]
    </p>
  );
}

function Scans() {
  const value = useSubscribe<Record<string, Scan>>("/scans/local");
  if (!value) return null;
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

function FullState() {
  const value = useSubscribe("");
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}
