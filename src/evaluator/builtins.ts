import { Integer, MonkeyString } from "../object/object.js";
import { MonkeyError } from "../object/object.js";
import { Builtin, MonkeyObject } from "../object/object.js";

export const builtins: Record<string, Builtin> = {
  len: new Builtin((...args: MonkeyObject[]) => {
    if (args.length !== 1)
      return new MonkeyError(
        `wrong number of arguments. got=${args.length}, want=1`
      );

    if (args[0] instanceof MonkeyString) {
      return new Integer(args[0].value.length);
    }

    return new MonkeyError(
      `argument to \`len\` not supported, got ${args[0].type()}`
    );
  }),
};
