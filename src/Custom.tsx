import { useSubscribe, useWebSocket } from "./state-hooks";
import { Scan } from "./state-types";

export default function Custom() {
  useWebSocket();

  return (
    <>
      <Temperature />
      <XRaysOn />
      <Scans />
      <SlowRender />
    </>
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

function SlowRender() {
  const start = Date.now();
  while (Date.now() - start < 1000) {
    /* wait for 1s */
  }
  return <p>This takes 1s to render</p>;
}
