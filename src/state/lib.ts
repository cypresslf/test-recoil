import { useContext, useEffect, useState } from "react";
import { StateContext, WebsocketContext } from "./context";
import { Subscriber } from "./types";

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("You must use this hook inside a `StateProvider`");
  }
  return context;
}

function useWebsocketContext() {
  const context = useContext(WebsocketContext);
  if (!context) {
    throw new Error("You must use this hook inside a `WebSocketProvider`");
  }
  return context;
}

export function useWebSocket(
  host: string | null,
  onPatch: (patch: Operation[]) => void
) {
  const { websocket, setHost } = useWebsocketContext();
  useEffect(() => setHost(host), [host, setHost]);
  useEffect(() => {
    if (!websocket) return;
    websocket.onopen = console.log;
    websocket.onclose = console.log;
    websocket.onerror = console.error;
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.topic === "state") onPatch(data.stateDelta);
    };
  }, [websocket, onPatch]);
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

export type Operation = {
  op: "add" | "remove" | "replace";
  path: string;
  value?: any;
};

const jsonPointerPopRight = (
  path: string
): { remainder: string; key: string } => {
  // Pops the right most key off of the JSON pointer path.
  // Returns { remainder, key }.
  //
  // The input path must not be empty; it must start with ``/``.
  // A ValueError will be raised if does not start with ``/``.
  // The returned remainder might be empty.

  if (path[0] !== "/") {
    throw new Error("Path must start with /");
  }

  const i = path.lastIndexOf("/");
  return {
    remainder: path.substring(0, i),
    key: path.substring(i + 1),
  };
};

const jsonPointerPopLeft = (
  path: string
): { key: string; remainder: string } => {
  // Pops the left most key off of the JSON pointer path.
  // Returns { key, remainder }.
  //
  // The input path must not be empty; it must start with ``/``.
  // A ValueError will be raised if does not start with ``/``.
  // The returned remainder might be empty.

  if (path[0] !== "/") {
    throw new Error("Path must start with /");
  }

  let i = path.indexOf("/", 1);
  if (i < 0) {
    i = path.length;
  }
  return {
    key: path.substring(1, i),
    remainder: path.substring(i),
  };
};

const isObjLike = (x: any): boolean => {
  // Returns True if the given value looks like a JSON object
  return typeof x === "object" && x !== null && !Array.isArray(x);
};

const isArrayLike = (x: any): boolean => {
  // Returns True if the given value looks like a JSON array
  return Array.isArray(x);
};

const editPathMut = (
  obj: any,
  path: string,
  op: (obj: any) => any,
  pathSoFar?: string
): any => {
  // Returns a new object matching the given one
  // but with the function ``op`` applied to the value at ``path``.

  // obj: The object or array to operate on
  // path: A JSONpointer to the path we want to change
  // op: A function containing the operation to perform.
  //     This function will be called
  //     with the value in ``obj`` at ``path``,
  //     and should return a replacement value.

  if (!pathSoFar) {
    pathSoFar = "";
  }

  if (!path) {
    // If we have exhausted the whole path, apply the op
    return op(obj);
  } else {
    // Else, recursively walk down the path
    const { key: strKey, remainder } = jsonPointerPopLeft(path);
    let key: number | string = strKey;

    let result;
    if (isObjLike(obj)) {
      result = { ...obj };
    } else if (isArrayLike(obj)) {
      result = [...obj];
      key = parseInt(key);
      if (key === undefined || isNaN(key)) {
        throw new Error("Non integer array key");
      }
    } else {
      throw new Error(
        `Unexpected type traversing path. \n path: ${path} \n object: ${JSON.stringify(
          obj
        )}`
      );
    }

    pathSoFar = `${pathSoFar}/${key}`;

    const value = result[key];
    if (value === undefined) {
      throw `Nonexistent key traversing path: ${pathSoFar}`;
    }

    const newValue = editPathMut(value, remainder, op, pathSoFar);
    result[key] = newValue;

    return result;
  }
};

const applyJsonPatchOp = (orig: any, op: Operation): any => {
  // Applies a single JsonPatch op without any mutation (including interior mutation)
  if (op.op === "add") {
    if (!op.path) {
      return op.value;
    } else {
      const { remainder, key: strKey } = jsonPointerPopRight(op.path);

      return editPathMut(orig, remainder, (obj: any): any => {
        if (isObjLike(obj)) {
          const result = { ...obj };
          result[strKey] = op.value;
          return result;
        } else if (isArrayLike(obj)) {
          const result = [...obj];
          let key: number;
          if (strKey === "-") {
            key = obj.length;
          } else {
            key = parseInt(strKey);
          }
          if (key === undefined || isNaN(key)) {
            throw new Error("Non integer array key");
          }
          result[key] = op.value;
          return result;
        } else {
          throw new Error("Unexpected type in add op");
        }
      });
    }
  } else if (op.op === "remove") {
    const { remainder, key: strKey } = jsonPointerPopRight(op.path);

    return editPathMut(orig, remainder, (obj: any): any => {
      if (isObjLike(obj)) {
        const result = { ...obj };
        delete result[strKey];
        return result;
      } else if (isArrayLike(obj)) {
        const result = [...obj];
        const key = parseInt(strKey);
        if (key === undefined || isNaN(key)) {
          throw new Error("Non integer array key");
        }
        delete result[key];
        return result;
      } else {
        throw new Error("Unexpected type in remove op");
      }
    });
  } else if (op.op === "replace") {
    if (!op.path) {
      return op["value"];
    } else {
      const { remainder, key: strKey } = jsonPointerPopRight(op.path);

      return editPathMut(orig, remainder, (obj: any): any => {
        if (isObjLike(obj)) {
          if (obj[strKey] === undefined) {
            throw new Error("Nonexistent key in replace op");
          }
          const result = { ...obj };
          result[strKey] = op.value;
          return result;
        } else if (isArrayLike(obj)) {
          const result = [...obj];
          const key = parseInt(strKey);
          if (key === undefined || isNaN(key)) {
            throw new Error("Non integer array key");
          }
          if (key >= obj.length) {
            throw new Error("Nonexistent index in replace op");
          }
          result[key] = op.value;
          return result;
        } else {
          throw new Error("Unexpected type in replace op");
        }
      });
    }
  } else {
    throw new Error("Unhandled op");
  }
};

/** Apply a JsonPatch without any mutation (including interior mutation) */
export const applyJsonPatch = (orig: any, patch: Operation[]): any => {
  let result = orig;
  for (const op of patch) {
    result = applyJsonPatchOp(result, op);
  }

  return result;
};
