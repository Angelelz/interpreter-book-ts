import { BlockStatement, Identifier } from "../ast/ast.js";

type ObjectType = (typeof TYPE)[keyof typeof TYPE];

export const TYPE = {
  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
  NULL_OBJ: "NULL",
  RETURN_VALUE_OBJ: "RETURN_VALUE",
  ERROR_OBJ: "ERROR",
  FUNCTION_OBJ: "FUNCTION",
  STRING_OBJ: "STRING",
  BUILTIN_OBJ: "BUILTIN",
  ARRAY_OBJ: "ARRAY",
  HASH_OBJ: "HASH",
} as const;

export type MonkeyObject = {
  type(): ObjectType;
  inspect(): string;
};

export type Hashable = {
  hashKey(): string;
};

export class HashKey {
  type: ObjectType;
  value: number | string;
  constructor(type: ObjectType, value: string | number) {
    this.type = type;
    this.value = value;
  }
}

export class HashPair {
  key: MonkeyObject;
  value: MonkeyObject;
  constructor(key: MonkeyObject, value: MonkeyObject) {
    this.key = key;
    this.value = value;
  }
}

export class Hash implements MonkeyObject {
  pairs: Map<string, HashPair>;
  constructor(pairs: Map<string, HashPair>) {
    this.pairs = pairs;
  }
  type(): ObjectType {
    return TYPE.HASH_OBJ;
  }
  inspect() {
    const pairs = Array.from(this.pairs.values()).map((value) => {
      return `${value.key.inspect()}: ${value.value.inspect()}`;
    });
    return `{${pairs.join(", ")}}`;
  }
}

export type BuiltinFunction = (...args: MonkeyObject[]) => MonkeyObject;

export class MonkeyArray implements MonkeyObject {
  elements: MonkeyObject[];
  constructor(elements: MonkeyObject[]) {
    this.elements = elements;
  }
  type() {
    return TYPE.ARRAY_OBJ;
  }
  inspect() {
    return `[${this.elements.map((e) => e.inspect()).join(", ")}]`;
  }
}

export class Builtin implements MonkeyObject {
  fn: BuiltinFunction;
  constructor(fn: BuiltinFunction) {
    this.fn = fn;
  }
  type() {
    return TYPE.BUILTIN_OBJ;
  }
  inspect() {
    return "builtin function";
  }
}

export class Environment {
  store: Record<string, MonkeyObject>;
  outer: Environment | null;
  constructor({
    outer,
    store,
  }: {
    outer?: Environment;
    store?: Record<string, MonkeyObject>;
  }) {
    this.store = store ?? {};
    this.outer = outer ?? null;
  }
  get(name: string): MonkeyObject {
    const obj = this.store[name];
    if (!obj && this.outer) {
      return this.outer.get(name);
    }
    return this.store[name] ?? null;
  }
  set(name: string, value: MonkeyObject) {
    this.store[name] = value;
    return value;
  }
}

export class Function implements MonkeyObject {
  parameters: Identifier[];
  body: BlockStatement;
  env: Environment;
  constructor(
    parameters: Identifier[],
    body: BlockStatement,
    env: Environment
  ) {
    this.parameters = parameters;
    this.body = body;
    this.env = env;
  }
  type() {
    return TYPE.FUNCTION_OBJ;
  }
  inspect() {
    const params = this.parameters.map((p) => p.string()).join(", ");
    return `fn(${params}) {\n${this.body.string()}\n}`;
  }
}

export class MonkeyError implements MonkeyObject {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
  type() {
    return TYPE.ERROR_OBJ;
  }
  inspect() {
    return `ERROR: ${this.message}`;
  }
}

export class ReturnValue implements MonkeyObject {
  value: MonkeyObject;
  constructor(value: MonkeyObject) {
    this.value = value;
  }
  type() {
    return TYPE.RETURN_VALUE_OBJ;
  }
  inspect() {
    return this.value.inspect();
  }
}

export class MonkeyString implements MonkeyObject, Hashable {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  type() {
    return TYPE.STRING_OBJ;
  }
  inspect() {
    return this.value;
  }
  hashKey() {
    // const hash =
    //   this.value.length *
    //   this.value
    //     .split("")
    //     .map((c) => c.charCodeAt(0))
    //     .reduce((a, b) => a ^ b);
    return JSON.stringify(new HashKey(this.type(), this.value));
  }
}

export class Integer implements MonkeyObject, Hashable {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
  type() {
    return TYPE.INTEGER_OBJ;
  }
  inspect() {
    return this.value.toString();
  }
  hashKey() {
    return JSON.stringify(new HashKey(this.type(), this.value));
  }
}

export class Boolean implements MonkeyObject, Hashable {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }
  type() {
    return TYPE.BOOLEAN_OBJ;
  }
  inspect() {
    return this.value.toString();
  }
  hashKey() {
    return JSON.stringify(new HashKey(this.type(), this.value ? 1 : 0));
  }
}

export class Null implements MonkeyObject {
  constructor() {}
  type() {
    return TYPE.NULL_OBJ;
  }
  inspect() {
    return "null";
  }
}
