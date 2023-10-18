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
          const subscribers = getSubscribers(
            operation.path,
            subscribersRef.current
          );
          if (subscribers) {
            subscribers.forEach((subscriber) => subscriber());
          }
          break;
        }
        case "move": {
          const subscribersForPath = getSubscribers(
            operation.from,
            subscribersRef.current
          );
          if (subscribersForPath) {
            subscribersForPath.forEach((subscriber) => subscriber());
          }
          const subscribersForToPath = getSubscribers(
            operation.path,
            subscribersRef.current
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

/**
 * If a path is a subset of another path, then the subscribers for the parent path should be notified
 *
 * @example
 *
 * const subscribersByPath = new Map([
 *  ["/", new Set([callback1])],
 *  ["/a", new Set([callback2])],
 *  ["/a/b/c", new Set([callback3])],
 *  ["/a/b/x", new Set([callback4])],
 *  ["/x", new Set([callback5])],
 * ]);
 *
 * getSubscribers("/a/b/c", subscribersByPath) // [callback1, callback2, callback3]
 *
 * @param path the path for the state change
 * @param subscribersByPath a map of subscribers by the path they're subscribed to
 */
function getSubscribers(
  path: string,
  subscribersByPath: Map<string, Set<Subscriber>>
): Set<Subscriber> {
  const result = new Set<Subscriber>();
  for (const [key, subscribers] of subscribersByPath) {
    if (path.startsWith(key)) {
      subscribers.forEach((subscriber) => result.add(subscriber));
    }
  }
  return result;
}
