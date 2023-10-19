import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "./redux";
import { useCallback, useState } from "react";
import { Operation, useWebSocket } from "./state/lib";
import { HostInput } from "./HostInput";

function Redux() {
  const [host, setHost] = useState<string | null>(
    new URLSearchParams(window.location.search).get("host")
  );
  const dispatch = useDispatch<AppDispatch>();
  const dispatchPatch = useCallback(
    (patch: Operation[]) => dispatch({ type: "patch", payload: patch }),
    [dispatch]
  );
  useWebSocket(host, dispatchPatch);

  return (
    <div id="columns">
      <div>
        <HostInput value={host} onChange={setHost} />
        <Temperature />
        <XRaysOn />
        <Position />
        <Voltage />
        <Current />
        <Scans />
      </div>
      <div>
        <FullState />
      </div>
    </div>
  );
}

function Temperature() {
  const value = useAppSelector((state) => state?.detector?.temperature);
  if (value === undefined) return null;
  return <p>Temperature: {value}</p>;
}

function XRaysOn() {
  const value = useAppSelector((state) => state?.source?.xrayOn);
  if (value === undefined) return null;
  return <p>X-rays {value ? "on" : "off"}</p>;
}

function Position() {
  const value = useAppSelector((state) => state?.motion?.position);
  if (value === undefined) return null;
  return (
    <p>
      position: [{value[0]}, {value[1]}, {value[2]}]
    </p>
  );
}

function Voltage() {
  const value = useAppSelector((state) => state?.source?.kvMeasured);
  if (value === undefined) return null;
  return <p>kv: {value}</p>;
}

function Current() {
  const value = useAppSelector((state) => state?.source?.uaMeasured);
  if (value === undefined) return null;
  return <p>ua: {value}</p>;
}

function Scans() {
  const value = useAppSelector((state) => state?.scans?.local);
  if (value === undefined) return null;
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
  const state = useAppSelector((state) => state);
  if (!state) return null;
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}

export default Redux;
