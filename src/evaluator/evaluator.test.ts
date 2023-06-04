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
  MonkeyString,
  MonkeyArray,
  Hash,
} from "../object/object.js";
import { FALSE, NULL, TRUE, evalMonkey } from "./evaluator.js";

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
    const evaluated = testEval(input);
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
  {
    input: `"Hello" - "World"`,
    expected: "unknown operator: STRING - STRING",
  },
  {
    input: `{"name": "Monkey"}[fn(x) { x }];`,
    expected: "unusable as hash key: FUNCTION",
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

it("should evaluate closures", () => {
  const input = `let newAdder = fn(x) {
    fn(y) { x + y }
  };

  let addTwo = newAdder(2);
  addTwo(2);`;
  testIntegerObject(testEval(input), 4);
});

it("should evaluate string literals", () => {
  const input = `"Hello World!"`;

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyString);
  if (!(evaluated instanceof MonkeyString)) {
    throw new Error("not an instance of MonkeyString");
  }

  expect(evaluated.value).toBe("Hello World!");
});

it("should evaluate string concatenation", () => {
  const input = `"Hello" + " " + "World!"`;

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyString);
  if (!(evaluated instanceof MonkeyString)) {
    throw new Error("object not an instance of MonkeyString");
  }

  expect(evaluated.value).toBe("Hello World!");
});

it.each([
  {
    input: `len("")`,
    expected: 0,
  },
  {
    input: `len("four")`,
    expected: 4,
  },
  {
    input: `len("hello world")`,
    expected: 11,
  },
  {
    input: `len(1)`,
    expected: "argument to `len` not supported, got INTEGER",
  },
  {
    input: `len("one", "two")`,
    expected: "wrong number of arguments. got=2, want=1",
  },
])("should evaluate len $input to $expected", ({ input, expected }) => {
  const evaluated = testEval(input);

  if (typeof expected === "number") {
    testIntegerObject(evaluated, expected);
  }
  if (typeof expected === "string") {
    expect(evaluated).toBeInstanceOf(MonkeyError);
    if (!(evaluated instanceof MonkeyError)) {
      throw new Error("object is not an instance of MonkeyError");
    }
    expect(evaluated.message).toBe(expected);
  }
});

it("should evaluate array literals", () => {
  const input = "[1, 2 * 2, 3 + 3]";

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyArray);
  if (!(evaluated instanceof MonkeyArray)) {
    throw new Error("object is not an instance of MonkeyArray");
  }

  expect(evaluated.elements.length).toBe(3);

  testIntegerObject(evaluated.elements[0], 1);
  testIntegerObject(evaluated.elements[1], 4);
  testIntegerObject(evaluated.elements[2], 6);
});

it.each([
  {
    input: "[1, 2, 3][0]",
    expected: 1,
  },
  {
    input: "[1, 2, 3][1]",
    expected: 2,
  },
  {
    input: "[1, 2, 3][2]",
    expected: 3,
  },
  {
    input: "let i = 0; [1][i];",
    expected: 1,
  },
  {
    input: "[1, 2, 3][1 + 1];",
    expected: 3,
  },
  {
    input: "let myArray = [1, 2, 3]; myArray[2];",
    expected: 3,
  },
  {
    input: "let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];",
    expected: 6,
  },
  {
    input: "let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]",
    expected: 2,
  },
  {
    input: "[1, 2, 3][3]",
    expected: null,
  },
  {
    input: "[1, 2, 3][-1]",
    expected: null,
  },
])(
  "should evaluate index expression $input to $expected",
  ({ input, expected }) => {
    const evaluated = testEval(input);

    if (typeof expected === "number") {
      testIntegerObject(evaluated, expected);
    } else {
      testNullObject(evaluated);
    }
  }
);

it("should evaluate hash literals", () => {
  const input = `let two = "two";
    {
      "one": 10 - 9,
      two: 1 + 1,
      "thr" + "ee": 6 / 2,
      4: 4,
      true: 5,
      false: 6,
    }`;

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(Hash);
  if (!(evaluated instanceof Hash)) {
    throw new Error("object is not an instance of Hash");
  }

  const expected = new Map([
    [new MonkeyString("one").hashKey(), 1],
    [new MonkeyString("two").hashKey(), 2],
    [new MonkeyString("three").hashKey(), 3],
    [new Integer(4).hashKey(), 4],
    [TRUE.hashKey(), 5],
    [FALSE.hashKey(), 6],
  ]);

  expect(evaluated.pairs.size).toEqual(expected.size);

  for (let [expectedKey, expectedValue] of expected.entries()) {
    const pair = evaluated.pairs.get(expectedKey);
    expect(pair).toBeDefined();
    testIntegerObject(pair.value, expectedValue);
  }
});

it.each([
  {
    input: `{"foo": 5}["foo"]`,
    expected: 5,
  },
  {
    input: `{"foo": 5}["bar"]`,
    expected: null,
  },
  {
    input: `let key = "foo"; {"foo": 5}[key]`,
    expected: 5,
  },
  {
    input: `{}["foo"]`,
    expected: null,
  },
  {
    input: `{5: 5}[5]`,
    expected: 5,
  },
  {
    input: `{true: 5}[true]`,
    expected: 5,
  },
  {
    input: `{false: 5}[false]`,
    expected: 5,
  },
])("should evaluate $input to $expected", ({ input, expected }) => {
  const evaluated = testEval(input);
  if (expected === null) {
    testNullObject(evaluated);
  } else {
    testIntegerObject(evaluated, expected);
  }
});

function testNullObject(obj: MonkeyObject) {
  expect(obj).toBe(NULL);
}

function testEval(input: string) {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  const env = new Environment({});
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
