import { MutableRefObject, createContext, useCallback, useRef } from "react";
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
