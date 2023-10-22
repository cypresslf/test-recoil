import { useState } from "react";
import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil";
import { applyJsonPatch, useWebSocket } from "./state/lib";
import { State } from "./state/types";
import { HostInput } from "./HostInput";

const scannerState = atom<State | undefined>({
  key: "scanner",
  default: undefined,
});

const temperatureState = selector({
  key: "temperature",
  get: ({ get }) => get(scannerState)?.detector?.temperature,
});

const xRaysOnState = selector({
  key: "xRaysOn",
  get: ({ get }) => get(scannerState)?.source?.xrayOn,
});

const positionState = selector({
  key: "position",
  get: ({ get }) => get(scannerState)?.motion?.position,
});

const voltageState = selector({
  key: "voltage",
  get: ({ get }) => get(scannerState)?.source?.kvMeasured,
});

const currentState = selector({
  key: "current",
  get: ({ get }) => get(scannerState)?.source?.uaMeasured,
});

const scansState = selector({
  key: "scans",
  get: ({ get }) => get(scannerState)?.scans?.local,
});

const filterSettingsState = selector({
  key: "filterSettings",
  get: ({ get }) => get(scannerState)?.settings.filter.filterSlots,
});

function Recoil() {
  const [host, setHost] = useState<string | null>(
    new URLSearchParams(window.location.search).get("host")
  );
  const setScanner = useSetRecoilState(scannerState);
  useWebSocket(host, (patch) => {
    setScanner((scanner) => applyJsonPatch(scanner ?? {}, patch));
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
        <FilterSettings />
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

function FilterSettings() {
  const value = useRecoilValue(filterSettingsState);
  if (value === undefined) return null;
  return (
    <div>
      <h1>Filters</h1>
      <ul>
        {value.map((slot) =>
          slot.filter ? (
            <li key={slot.position}>
              {slot.filter.material} {slot.filter.thickness} mm
            </li>
          ) : (
            <li key={slot.position}>no filter</li>
          )
        )}
      </ul>
    </div>
  );
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
