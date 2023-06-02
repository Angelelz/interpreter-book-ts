import { it, expect } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import {
  Integer,
  MonkeyObject,
  Boolean,
  MonkeyError,
  Function,
  Environment,
} from "../object/object.js";
import { NULL, evalMonkey } from "./evaluator.js";

it.each([
  {
    input: "5",
    expected: 5,
  },
  {
    input: "10",
    expected: 10,
  },
  {
    input: "-5",
    expected: -5,
  },
  {
    input: "-10",
    expected: -10,
  },
  {
    input: "5 + 5 + 5 + 5 - 10",
    expected: 10,
  },
  {
    input: "2 * 2 * 2 * 2 * 2",
    expected: 32,
  },
  {
    input: "-50 + 100 + -50",
    expected: 0,
  },
  {
    input: "5 * 2 + 10",
    expected: 20,
  },
  {
    input: "5 + 2 * 10",
    expected: 25,
  },
  {
    input: "20 + 2 * -10",
    expected: 0,
  },
  {
    input: "50 / 2 * 2 + 10",
    expected: 60,
  },
  {
    input: "2 * (5 + 10)",
    expected: 30,
  },
  {
    input: "3 * 3 * 3 + 10",
    expected: 37,
  },
  {
    input: "3 * (3 * 3) + 10",
    expected: 37,
  },
  {
    input: "(5 + 10 * 2 + 15 / 3) * 2 + -10",
    expected: 50,
  },
])(
  "should evaluate integer expression $input to $expected",
  ({ input, expected }) => {
    const evaluated = testEval(input);
    testIntegerObject(evaluated, expected);
  }
);

it.each([
  {
    input: "true",
    expected: true,
  },
  {
    input: "false",
    expected: false,
  },
  {
    input: "1 < 2",
    expected: true,
  },
  {
    input: "1 > 2",
    expected: false,
  },
  {
    input: "1 < 1",
    expected: false,
  },
  {
    input: "1 > 1",
    expected: false,
  },
  {
    input: "1 == 1",
    expected: true,
  },
  {
    input: "1 != 1",
    expected: false,
  },
  {
    input: "1 == 2",
    expected: false,
  },
  {
    input: "1 != 2",
    expected: true,
  },
  {
    input: "true == true",
    expected: true,
  },
  {
    input: "false == false",
    expected: true,
  },
  {
    input: "true == false",
    expected: false,
  },
  {
    input: "false != true",
    expected: true,
  },
  {
    input: "true != false",
    expected: true,
  },
  {
    input: "(1 < 2) == true",
    expected: true,
  },
  {
    input: "(1 < 2) == false",
    expected: false,
  },
  {
    input: "(1 > 2) == true",
    expected: false,
  },
  {
    input: "(1 > 2) == false",
    expected: true,
  },
])(
  "should evaluate boolean expression $input to $expected",
  ({ input, expected }) => {
    const evaluated = testEval(input);
    testBooleanObject(evaluated, expected);
  }
);

it.each([
  {
    input: "!true",
    expected: false,
  },
  {
    input: "!false",
    expected: true,
  },
  {
    input: "!5",
    expected: false,
  },
  {
    input: "!!true",
    expected: true,
  },
  {
    input: "!!false",
    expected: false,
  },
  {
    input: "!!5",
    expected: true,
  },
])(
  "should evaluate bang expression $input to $expected",
  ({ input, expected }) => {
    const evaluated = testEval(input);
    testBooleanObject(evaluated, expected);
  }
);

it.each([
  {
    input: "if (true) { 10 }",
    expected: 10,
  },
  {
    input: "if (false) { 10 }",
    expected: null,
  },
  {
    input: "if (1) { 10 }",
    expected: 10,
  },
  {
    input: "if (1 < 2) { 10 }",
    expected: 10,
  },
  {
    input: "if (1 > 2) { 10 }",
    expected: null,
  },
  {
    input: "if (1 > 2) { 10 } else { 20 }",
    expected: 20,
  },
  {
    input: "if (1 < 2) { 10 } else { 20 }",
    expected: 10,
  },
])(
  "should evaluate if expression $input to $expected",
  ({ input, expected }) => {
    const evaluated = testEval(input);

    if (typeof expected === "number") {
      testIntegerObject(evaluated, expected);
    } else {
      testNullObject(evaluated);
    }
  }
);

it.each([
  {
    input: "return 10;",
    expected: 10,
  },
  {
    input: "return 10; 9;",
    expected: 10,
  },
  {
    input: "return 2 * 5; 9;",
    expected: 10,
  },
  {
    input: "9; return 2 * 5; 9;",
    expected: 10,
  },
  {
    input: `
      if (10 > 1) {
        if (10 > 1) {
          return 10;
        }
        return 1
      }
    `,
    expected: 10,
  },
])(
  "should evaluate return expression $input to $expected",
  ({ input, expected }) => {
    debugger;
    const evaluated = testEval(input);
    console.log(evaluated);
    testIntegerObject(evaluated, expected);
  }
);

it.each([
  {
    input: "5 + true;",
    expected: "type mismatch: INTEGER + BOOLEAN",
  },
  {
    input: "5 + true; 5;",
    expected: "type mismatch: INTEGER + BOOLEAN",
  },
  {
    input: "-true;",
    expected: "unknown operator: -BOOLEAN",
  },
  {
    input: "true + false;",
    expected: "unknown operator: BOOLEAN + BOOLEAN",
  },
  {
    input: "5; true + false; 5",
    expected: "unknown operator: BOOLEAN + BOOLEAN",
  },
  {
    input: "if (10 > 1) { true + false; }",
    expected: "unknown operator: BOOLEAN + BOOLEAN",
  },
  {
    input: `if (10 > 1) {
      if (10 > 1) {
        return true + false;
      }
      return 1
    }`,
    expected: "unknown operator: BOOLEAN + BOOLEAN",
  },
  {
    input: "foobar",
    expected: "identifier not found: foobar",
  },
])("should evaluate error $input to $expected", ({ input, expected }) => {
  const evaluated = testEval(input);

  expect(evaluated).toBeInstanceOf(MonkeyError);
  if (!(evaluated instanceof MonkeyError)) {
    throw new Error("object is not an instance of MonkeyError");
  }

  expect(evaluated.message).toBe(expected);
});

it.each([
  {
    input: "let a = 5; a;",
    expected: 5,
  },
  {
    input: "let a = 5 * 5; a;",
    expected: 25,
  },
  {
    input: "let a = 5; let b = a; b;",
    expected: 5,
  },
  {
    input: "let a = 5; let b = a; let c = a + b + 5; c;",
    expected: 15,
  },
])(
  "should evaluate let expression $input to $expected",
  ({ input, expected }) => {
    testIntegerObject(testEval(input), expected);
  }
);

it.each([
  {
    input: "fn(x) { x + 2; };",
    parameters: ["x"],
    expectedBody: "(x + 2)",
  },
])(
  "should evaluate function expression $input to parameters: $parameters and body: $expectedBody",
  ({ input, parameters, expectedBody }) => {
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(Function);
    if (!(evaluated instanceof Function)) {
      throw new Error("object is not an instance of Function");
    }

    expect(evaluated.parameters.length).toBe(parameters.length);

    evaluated.parameters.forEach((param, i) => {
      expect(param.string()).toBe(parameters[i]);
    });

    expect(evaluated.body.string()).toBe(expectedBody);
  }
);

it.each([
  {
    input: "let identity = fn(x) { x; }; identity(5);",
    expected: 5,
  },
  {
    input: "let identity = fn(x) { return x; }; identity(5);",
    expected: 5,
  },
  {
    input: "let double = fn(x) { x * 2; }; double(5);",
    expected: 10,
  },
  {
    input: "let add = fn(x, y) { x + y; }; add(5, 5);",
    expected: 10,
  },
  {
    input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
    expected: 20,
  },
  {
    input: "fn(x) { x; }(5)",
    expected: 5,
  },
])(
  "should evaluate function expression $input to $expected",
  ({ input, expected }) => {
    testIntegerObject(testEval(input), expected);
  }
);

function testNullObject(obj: MonkeyObject) {
  expect(obj).toBe(NULL);
}

function testEval(input: string) {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  const env = new Environment();
  return evalMonkey(program, env);
}

function testBooleanObject(obj: MonkeyObject, expected: boolean) {
  expect(obj).toBeInstanceOf(Boolean);
  if (!(obj instanceof Boolean)) {
    throw new Error("object is not an instance of Boolean");
  }
  expect(obj.value).toBe(expected);
}

function testIntegerObject(obj: MonkeyObject, expected: number) {
  expect(obj).toBeInstanceOf(Integer);
  if (!(obj instanceof Integer)) {
    throw new Error("object is not an instance of Integer");
  }
  expect(obj.value).toBe(expected);
}
