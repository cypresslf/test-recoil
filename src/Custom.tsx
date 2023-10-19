import { useState } from "react";
import {
  useStateContext,
  useSubscribe,
  useWebSocket,
  useClient,
} from "./state/lib";
import type { Scan, Position } from "./state/types";
import { HostInput } from "./HostInput";

export default function Custom() {
  const { applyPatch } = useStateContext();
  const [host, setHost] = useState<string | null>(
    new URLSearchParams(window.location.search).get("host")
  );
  useWebSocket(host, applyPatch);

  return (
    <div id="columns">
      <div>
        <HostInput onChange={setHost} value={host} />
        <Temperature />
        <XRaysOn />
        <Position />
        <Voltage />
        <Current />
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
  const send = useClient();
  if (value === undefined || send === null) return null;
  return (
    <label>
      X-rays on{" "}
      <input
        type="checkbox"
        checked={value}
        onChange={() => send("setXrays", { on: !value, userInitiated: true })}
      />
    </label>
  );
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

function Voltage() {
  const value = useSubscribe<number | undefined>("/source/kvMeasured");
  if (value === undefined) return null;
  return <p>kv: {value}</p>;
}

function Current() {
  const value = useSubscribe<number | undefined>("/source/uaMeasured");
  if (value === undefined) return null;
  return <p>ua: {value}</p>;
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
