import { it, expect } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { Integer, MonkeyObject, Boolean } from "../object/object.js";
import { evalMonkey } from "./evaluator.js";

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

function testEval(input: string) {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  return evalMonkey(program);
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
