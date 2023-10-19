import { useState } from "react";
import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil";
import { useWebSocket } from "./state/lib";
import { State } from "./state/types";
import { applyPatch } from "fast-json-patch";
import { HostInput } from "./HostInput";

const scannerState = atom<State | undefined>({
  key: "scannerState",
  default: undefined,
});

const temperatureState = selector({
  key: "temperatureState",
  get: ({ get }) => get(scannerState)?.detector?.temperature,
});

const xRaysOnState = selector({
  key: "xRaysOnState",
  get: ({ get }) => get(scannerState)?.source?.xrayOn,
});

const positionState = selector({
  key: "positionState",
  get: ({ get }) => get(scannerState)?.motion?.position,
});

const voltageState = selector({
  key: "voltageState",
  get: ({ get }) => get(scannerState)?.source?.kvMeasured,
});

const currentState = selector({
  key: "currentState",
  get: ({ get }) => get(scannerState)?.source?.uaMeasured,
});

const scansState = selector({
  key: "scansState",
  get: ({ get }) => get(scannerState)?.scans?.local,
});

function Recoil() {
  const [host, setHost] = useState<string | null>(
    new URLSearchParams(window.location.search).get("host")
  );
  const setScanner = useSetRecoilState(scannerState);
  useWebSocket(host, (patch) => {
    setScanner(
      (scanner) =>
        applyPatch(scanner ?? {}, patch, undefined, false).newDocument
    );
  });

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
  const value = useRecoilValue(temperatureState);
  if (value === undefined) return null;
  return <p>Temperature: {value}</p>;
}

function XRaysOn() {
  const value = useRecoilValue(xRaysOnState);
  if (value === undefined) return null;
  return <p>X-rays {value ? "on" : "off"}</p>;
}

function Position() {
  const value = useRecoilValue(positionState);
  if (value === undefined) return null;
  return (
    <p>
      position: [{value[0]}, {value[1]}, {value[2]}]
    </p>
  );
}

function Voltage() {
  const value = useRecoilValue(voltageState);
  if (value === undefined) return null;
  return <p>kv: {value}</p>;
}

function Current() {
  const value = useRecoilValue(currentState);
  if (value === undefined) return null;
  return <p>ua: {value}</p>;
}

function Scans() {
  const value = useRecoilValue(scansState);
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
  const scanner = useRecoilValue(scannerState);
  if (!scanner) return null;
  return <pre>{JSON.stringify(scanner, null, 2)}</pre>;
}

export default Recoil;
