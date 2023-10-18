import { expect, test } from "bun:test";
import { getSubscribers } from "./lib";

const callback1 = () => {};
const callback2 = () => {};
const callback3 = () => {};
const callback4 = () => {};
const callback5 = () => {};

test("it gets subscribers of path and parents", () => {
  const subscribersByPath = new Map([
    ["/a", new Set([callback1])],
    ["/a/b", new Set([callback2])],
    ["/x", new Set([callback3])],
    ["", new Set([callback4, callback5])],
  ]);
  expect(getSubscribers("/a/b", subscribersByPath)).toEqual(
    new Set([callback1, callback2, callback4, callback5])
  );
});

test("it gets subscribers of path and children", () => {
  const subscribersByPath = new Map([
    ["/a", new Set([callback1])],
    ["/a/b", new Set([callback2])],
    ["/x", new Set([callback3])],
    ["", new Set([callback4])],
  ]);
  expect(getSubscribers("/a", subscribersByPath)).toEqual(
    new Set([callback1, callback2, callback4])
  );
});

test("it gets all subscribers if given the root path", () => {
  const subscribersByPath = new Map([
    ["/a", new Set([callback1])],
    ["/a/b", new Set([callback2])],
    ["/x", new Set([callback3])],
    ["", new Set([callback4])],
  ]);
  expect(getSubscribers("", subscribersByPath)).toEqual(
    new Set([callback1, callback2, callback3, callback4])
  );
});
