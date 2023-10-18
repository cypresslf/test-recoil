import { useState } from "react";
import { useSubscribe, useWebSocket } from "./state/lib";
import type { Scan, Position } from "./state/types";

export default function Custom() {
  const initialHost = new URLSearchParams(window.location.search).get("host");
  const [host, setHost] = useState<string | null>(initialHost);
  const [input, setInput] = useState<string | null>(initialHost);
  useWebSocket(host ? `ws://${host}:3732` : undefined);

  return (
    <div id="custom">
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setHost(input);
            const url = new URL(window.location.href);
            if (input === null) url.searchParams.delete("host");
            else url.searchParams.set("host", input);
            history.pushState({}, "", url);
          }}
        >
          <input
            type="text"
            placeholder="scanner hostname"
            value={input ?? ""}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={host === input}>
            Connect
          </button>
        </form>
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
  if (value === undefined) return null;
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
