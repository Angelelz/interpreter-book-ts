import { expect, it } from "vitest";
import { Boolean, Integer, MonkeyString } from "./object.js";

it("should generate same hash for same value string object", () => {
  const hello1 = new MonkeyString("Hello World");
  const hello2 = new MonkeyString("Hello World");
  const diff1 = new MonkeyString("My name is Angel");
  const diff2 = new MonkeyString("My name is Angel");
  console.log(hello1.hashKey());
  console.log(diff2.hashKey());

  expect(hello1.hashKey()).toBe(hello2.hashKey());
  expect(diff1.hashKey()).toBe(diff2.hashKey());
  expect(hello1.hashKey()).not.toBe(diff1.hashKey());
});

it("should generate same hash for same value integer object", () => {
  const hello1 = new Integer(1);
  const hello2 = new Integer(1);
  const diff1 = new Integer(2);
  const diff2 = new Integer(2);

  expect(hello1.hashKey()).toBe(hello2.hashKey());
  expect(diff1.hashKey()).toBe(diff2.hashKey());
  expect(hello1.hashKey()).not.toBe(diff1.hashKey());
});

it("should generate same hash for same value boolean object", () => {
  const hello1 = new Boolean(true);
  const hello2 = new Boolean(true);
  const diff1 = new Boolean(false);
  const diff2 = new Boolean(false);

  expect(hello1.hashKey()).toBe(hello2.hashKey());
  expect(diff1.hashKey()).toBe(diff2.hashKey());
  expect(hello1.hashKey()).not.toBe(diff1.hashKey());
});
