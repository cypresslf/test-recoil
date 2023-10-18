import { useContext, useEffect, useState } from "react";
import { StateContext } from "./state-context";

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
