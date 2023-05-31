type ObjectType = (typeof TYPE)[keyof typeof TYPE];

export const TYPE = {
  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
  NULL_OBJ: "NULL",
} as const;

export type MonkeyObject = {
  type(): ObjectType;
  inspect(): string;
};

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
