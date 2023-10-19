import {
  MutableRefObject,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { State, Subscriber } from "./types";
import { Operation, applyJsonPatch, getSubscribers } from "./lib";

export const StateContext = createContext<{
  stateRef: MutableRefObject<State>;
  subscribe: (path: string, callback: Subscriber) => void;
  unsubscribe: (path: string, callback: Subscriber) => void;
  applyPatch: (patch: Operation[]) => void;
} | null>(null);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const stateRef = useRef<State>({});
  const subscribersRef = useRef<Map<string, Set<Subscriber>>>(new Map());
  const applyPatch = useCallback((patch: Operation[]) => {
    stateRef.current = applyJsonPatch(stateRef.current, patch);
    patch.forEach((operation) => {
      const subscribers = getSubscribers(
        operation.path,
        subscribersRef.current
      );
      if (subscribers) {
        subscribers.forEach((subscriber) => subscriber());
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

export const WebsocketContext = createContext<{
  websocket: WebSocket | null;
  setHost: (host: string | null) => void;
  seqNumRef: MutableRefObject<number>;
} | null>(null);

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  const seqNumRef = useRef(0);
  const [host, setHost] = useState<string | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!host) {
      return;
    }
    const socket = new WebSocket(`ws://${host}:3732`);
    setWebsocket(socket);
    return () => socket.close();
  }, [host]);

  return (
    <WebsocketContext.Provider value={{ websocket, setHost, seqNumRef }}>
      {children}
    </WebsocketContext.Provider>
  );
}
