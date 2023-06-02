import { BlockStatement, Identifier } from "../ast/ast.js";

type ObjectType = (typeof TYPE)[keyof typeof TYPE];

export const TYPE = {
  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
  NULL_OBJ: "NULL",
  RETURN_VALUE_OBJ: "RETURN_VALUE",
  ERROR_OBJ: "ERROR",
  FUNCTION_OBJ: "FUNCTION",
} as const;

export type MonkeyObject = {
  type(): ObjectType;
  inspect(): string;
};

export class Environment {
  store: Record<string, MonkeyObject>;
  constructor(store?: Record<string, MonkeyObject>) {
    this.store = store ?? {};
  }
  get(name: string): MonkeyObject {
    return this.store[name];
  }
  set(name: string, value: MonkeyObject) {
    this.store[name] = value;
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

export class Integer implements MonkeyObject {
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
}

export class Boolean implements MonkeyObject {
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
