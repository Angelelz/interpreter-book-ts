import { Integer, MonkeyArray, MonkeyString, TYPE } from "../object/object.js";
import { MonkeyError } from "../object/object.js";
import { Builtin, MonkeyObject } from "../object/object.js";
import { NULL } from "./evaluator.js";

export const builtins: Record<string, Builtin> = {
  len: new Builtin((...args: MonkeyObject[]) => {
    if (args.length !== 1)
      return new MonkeyError(
        `wrong number of arguments. got=${args.length}, want=1`
      );

    if (args[0] instanceof MonkeyString) {
      return new Integer(args[0].value.length);
    }

    if (args[0] instanceof MonkeyArray) {
      return new Integer(args[0].elements.length);
    }

    return new MonkeyError(
      `argument to \`len\` not supported, got ${args[0].type()}`
    );
  }),

  first: new Builtin((...args: MonkeyObject[]) => {
    if (args.length !== 1)
      return new MonkeyError(
        `wrong number of arguments. got=${args.length}, want=1`
      );

    if (args[0].type() !== TYPE.ARRAY_OBJ) {
      return new MonkeyError(
        `argument to \`first\` must be ARRAY, got ${args[0].type()}`
      );
    }

    const array = args[0] as MonkeyArray;
    if (array.elements.length > 0) {
      return array.elements[0];
    }

    return NULL;
  }),

  last: new Builtin((...args: MonkeyObject[]) => {
    if (args.length !== 1)
      return new MonkeyError(
        `wrong number of arguments. got=${args.length}, want=1`
      );

    if (args[0].type() !== TYPE.ARRAY_OBJ) {
      return new MonkeyError(
        `argument to \`first\` must be ARRAY, got ${args[0].type()}`
      );
    }

    const array = args[0] as MonkeyArray;
    if (array.elements.length > 0) {
      return array.elements[array.elements.length - 1];
    }

    return NULL;
  }),

  rest: new Builtin((...args: MonkeyObject[]) => {
    if (args.length !== 1)
      return new MonkeyError(
        `wrong number of arguments. got=${args.length}, want=1`
      );

    if (args[0].type() !== TYPE.ARRAY_OBJ) {
      return new MonkeyError(
        `argument to \`first\` must be ARRAY, got ${args[0].type()}`
      );
    }

    const array = args[0] as MonkeyArray;
    if (array.elements.length > 0) {
      const newElements = array.elements.slice(1);
      return new MonkeyArray(newElements);
    }

    return NULL;
  }),

  push: new Builtin((...args: MonkeyObject[]) => {
    if (args.length !== 2) {
      return new MonkeyError(
        `wrong number of arguments. got=${args.length}, want=2`
      );
    }

    if (args[0].type() !== TYPE.ARRAY_OBJ) {
      return new MonkeyError(
        `argument to \`push\` must be ARRAY, got ${args[0].type()}`
      );
    }

    const arr = args[0] as MonkeyArray;

    const newElements = [...arr.elements, args[1]];

    return new MonkeyArray(newElements);
  }),

  puts: new Builtin((...args: MonkeyObject[]) => {
    for (const arg of args) {
      console.log(arg.inspect());
    }
    return NULL;
  }),
};
