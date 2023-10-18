import {
  MutableRefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Operation, applyPatch as apply } from "fast-json-patch";

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

function SlowRender() {
  const start = Date.now();
  while (Date.now() - start < 1000) {
    // wait for 1s
  }

  return <p>This takes 1s to render</p>;
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

function XRaysOn() {
  const value = useSubscribe<boolean>("/source/xrayOn");
  return <p>X-rays {value ? "on" : "off"}</p>;
}

function Temperature() {
  const value = useSubscribe<number>("/detector/temperature");
  return <p>Temp: {value}</p>;
}

function useWebSocket() {
  const { applyPatch } = useContext(StateContext);
  if (!applyPatch) {
    throw new Error(
      "You must use the `useWebsocket` hook inside a `StateProvider`"
    );
  }
  useEffect(() => {
    const socket = new WebSocket("ws://salem-oats:3732");
    socket.onopen = console.log;
    socket.onclose = console.log;
    socket.onerror = console.error;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.topic === "state") {
        applyPatch(data.stateDelta);
      }
    };
    return () => socket.close();
  }, [applyPatch]);
}

const StateContext = createContext<StateContext | NullStateContext>({
  stateRef: undefined,
  subscribe: undefined,
  unsubscribe: undefined,
  applyPatch: undefined,
});

export function StateProvider({ children }: { children: React.ReactNode }) {
  const stateRef = useRef<State>({});
  const subscribersRef = useRef<Map<string, Set<Subscriber>>>(new Map());
  const applyPatch = useCallback((patch: Operation[]) => {
    stateRef.current = apply(stateRef.current, patch).newDocument;
    patch.forEach((operation) => {
      switch (operation.op) {
        case "add":
        case "remove":
        case "replace":
        case "copy": {
          const subscribers = subscribersRef.current.get(operation.path);
          if (subscribers) {
            subscribers.forEach((subscriber) => subscriber());
          }
          break;
        }
        case "move": {
          const subscribersForPath = subscribersRef.current.get(operation.from);
          if (subscribersForPath) {
            subscribersForPath.forEach((subscriber) => subscriber());
          }
          const subscribersForToPath = subscribersRef.current.get(
            operation.path
          );
          if (subscribersForToPath) {
            subscribersForToPath.forEach((subscriber) => subscriber());
          }
          break;
        }
      }
    });
  }, []);

  const subscribe = useCallback((path: string, callback: Subscriber) => {
    const subscribers = subscribersRef.current.get(path);
    if (subscribers) {
      subscribers.add(callback);
    } else {
      subscribersRef.current.set(path, new Set([callback]));
    }
  }, []);

  const unsubscribe = useCallback((path: string, callback: Subscriber) => {
    const subscribers = subscribersRef.current.get(path);
    if (subscribers) {
      subscribers.delete(callback);
    }
  }, []);

  return (
    <StateContext.Provider
      value={{ subscribe, unsubscribe, applyPatch, stateRef }}
    >
      {children}
    </StateContext.Provider>
  );
}

function useSubscribe<T>(path: string): T | undefined {
  const { subscribe, unsubscribe, stateRef } = useContext(StateContext);
  const [, forceUpdate] = useState({});

  if (!subscribe)
    throw new Error(
      "You must use the `useSubscribe` hook inside a StateProvider"
    );

  useEffect(() => {
    const callback = () => forceUpdate({});
    subscribe(path, callback);
    return () => unsubscribe(path, callback);
  }, [path, subscribe, unsubscribe]);

  const keys = path.split("/").filter((k) => k !== "");
  let value: any = stateRef.current;
  for (const k of keys) {
    if (value != null) {
      value = value[k];
    }
  }
  return value as T;
}

type StateContext = {
  stateRef: MutableRefObject<State>;
  subscribe: (path: string, callback: Subscriber) => void;
  unsubscribe: (path: string, callback: Subscriber) => void;
  applyPatch: (patch: Operation[]) => void;
};

type NullStateContext = {
  stateRef: undefined;
  subscribe: undefined;
  unsubscribe: undefined;
  applyPatch: undefined;
};

type Subscriber = () => void;

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
