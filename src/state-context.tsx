import { Operation } from "fast-json-patch";
import { MutableRefObject, createContext, useCallback, useRef } from "react";
import { State } from "./state-types";
import { applyPatch as apply } from "fast-json-patch";

type Subscriber = () => void;

export const StateContext = createContext<{
  stateRef: MutableRefObject<State>;
  subscribe: (path: string, callback: Subscriber) => void;
  unsubscribe: (path: string, callback: Subscriber) => void;
  applyPatch: (patch: Operation[]) => void;
} | null>(null);

export function StateProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
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
