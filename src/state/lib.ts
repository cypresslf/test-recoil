import { useContext, useEffect, useState } from "react";
import { StateContext } from "./context";
import { Subscriber } from "./types";

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("You must use this hook inside a `StateProvider`");
  }
  return context;
}

export function useWebSocket() {
  const { applyPatch } = useStateContext();

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

export function useSubscribe<T>(path: string): T | undefined {
  const { subscribe, unsubscribe, stateRef } = useStateContext();
  const [, forceUpdate] = useState({});

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

/**
 * Returns all subscribers for a given path.
 *
 * Subscribers for a path are all subscribers for the path, it's parents, and its children
 *
 * If the path is "/a/b" then the following paths will match:
 * - ""
 * - "/a"
 * - "/a/b"
 * - "/a/b/c"
 *
 * but the following paths will not match:
 * - "/a/b/x"
 * - "/x"
 *
 * "" is equivalent to the root path
 *
 * @param path the path for the state change
 * @param subscribersByPath a map of subscribers by the path they're subscribed to
 */
export function getSubscribers(
  path: string,
  subscribersByPath: Map<string, Set<Subscriber>>
): Set<Subscriber> {
  const result = new Set<Subscriber>();
  for (const [key, subscribers] of subscribersByPath) {
    if (path.startsWith(key)) {
      subscribers.forEach((subscriber) => result.add(subscriber));
    }
    if (key.startsWith(path)) {
      subscribers.forEach((subscriber) => result.add(subscriber));
    }
  }
  return result;
}
