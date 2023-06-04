import { expect, it } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "./parser.js";
import {
  BooleanLiteral,
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
  IfExpression,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
  ArrayLiteral,
  IndexExpression,
  HashLiteral,
} from "../ast/ast.js";

it.each([
  {
    input: "let x = 5;",
    expectedIdentifier: "x",
    expectedValue: 5,
  },
  {
    input: "let y = true;",
    expectedIdentifier: "y",
    expectedValue: true,
  },
  {
    input: "let foobar = y;",
    expectedIdentifier: "foobar",
    expectedValue: "y",
  },
])(
  "should parse let $input as let statement",
  ({ input, expectedIdentifier, expectedValue }) => {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    testLetStatement(stmt, expectedIdentifier);

    if (!(stmt instanceof LetStatement)) {
      throw new Error("stmt not instanceof LetStatement");
    }
    testLiteralExpression(stmt.value, expectedValue);
  }
);

it("should parse let statements", () => {
  const input = `
  let x = 5;
  let y = 10;
  let foobar = 838383;
  `;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);
  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(3);

  const tests = [
    {
      exptectedIdentifier: "x",
    },
    {
      exptectedIdentifier: "y",
    },
    {
      exptectedIdentifier: "foobar",
    },
  ];

  tests.forEach((test, i) => {
    const stmt = program.statements[i];
    testLetStatement(stmt, test.exptectedIdentifier);
  });
});

it("should parse return statements", () => {
  const input = `
  return 5;
  return 10;
  return 993322;
  `;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(3);

  program.statements.forEach((stmt) => {
    expect(stmt).toBeInstanceOf(ReturnStatement);
    if (!(stmt instanceof ReturnStatement)) {
      throw new Error("stmt not instanceof ReturnStatement");
    }
    expect(stmt.tokenLiteral()).toBe("return");
  });
});

it("should parse identifiers", () => {
  const input = "foobar;";
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);

  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const exp = stmt.expression;
  expect(exp).toBeInstanceOf(Identifier);
  if (!(exp instanceof Identifier)) {
    throw new Error("stmt.expression not instanceof Identifier");
  }

  expect(exp.value).toBe("foobar");

  expect(exp.tokenLiteral()).toBe("foobar");
});

it("should parse integer literals", () => {
  const input = "5;";
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const literal = stmt.expression;
  expect(literal).toBeInstanceOf(IntegerLiteral);
  if (!(literal instanceof IntegerLiteral)) {
    throw new Error("stmt.expression not instanceof IntegerLiteral");
  }

  expect(literal.value).toBe(5);

  expect(literal.tokenLiteral()).toBe("5");
});

it("should parse boolean literals", () => {
  const input = "true;";
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  testBooleanLiteral(stmt.expression, true);
});

it.each([
  {
    input: "!5;",
    operator: "!",
    integerValue: 5,
  },
  {
    input: "-15;",
    operator: "-",
    integerValue: 15,
  },
  {
    input: "!true;",
    operator: "!",
    integerValue: true,
  },
  {
    input: "!false;",
    operator: "!",
    integerValue: false,
  },
])(
  "should parse $input as prefix expressions",
  ({ input, operator, integerValue }) => {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];

    expect(stmt).toBeInstanceOf(ExpressionStatement);
    if (!(stmt instanceof ExpressionStatement)) {
      throw new Error("stmt not instanceof ExpressionStatement");
    }

    const exp = stmt.expression;

    expect(exp).toBeInstanceOf(PrefixExpression);
    if (!(exp instanceof PrefixExpression)) {
      throw new Error("stmt.expression not instanceof PrefixExpression");
    }

    expect(exp.operator).toBe(operator);

    testLiteralExpression(exp.right, integerValue);
  }
);

it.each([
  {
    input: "5 + 5;",
    leftValue: 5,
    operator: "+",
    rightValue: 5,
  },
  {
    input: "5 - 5;",
    leftValue: 5,
    operator: "-",
    rightValue: 5,
  },
  {
    input: "5 * 5;",
    leftValue: 5,
    operator: "*",
    rightValue: 5,
  },
  {
    input: "5 / 5;",
    leftValue: 5,
    operator: "/",
    rightValue: 5,
  },
  {
    input: "5 > 5;",
    leftValue: 5,
    operator: ">",
    rightValue: 5,
  },
  {
    input: "5 < 5;",
    leftValue: 5,
    operator: "<",
    rightValue: 5,
  },
  {
    input: "5 == 5;",
    leftValue: 5,
    operator: "==",
    rightValue: 5,
  },
  {
    input: "5 != 5;",
    leftValue: 5,
    operator: "!=",
    rightValue: 5,
  },
  {
    input: "true == true",
    leftValue: true,
    operator: "==",
    rightValue: true,
  },
  {
    input: "true != false",
    leftValue: true,
    operator: "!=",
    rightValue: false,
  },
  {
    input: "false == false",
    leftValue: false,
    operator: "==",
    rightValue: false,
  },
])(
  "should parse $input as infix expressions",
  ({ input, leftValue, operator, rightValue }) => {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    if (!(stmt instanceof ExpressionStatement)) {
      throw new Error("stmt not instanceof ExpressionStatement");
    }

    const exp = stmt.expression;

    testInfixExpression(exp, leftValue, operator, rightValue);
  }
);

it.each([
  {
    input: "-a * b",
    expected: "((-a) * b)",
  },
  {
    input: "!-a",
    expected: "(!(-a))",
  },
  {
    input: "a + b + c",
    expected: "((a + b) + c)",
  },
  {
    input: "a + b - c",
    expected: "((a + b) - c)",
  },
  {
    input: "a * b * c",
    expected: "((a * b) * c)",
  },
  {
    input: "a * b / c",
    expected: "((a * b) / c)",
  },
  {
    input: "a + b / c",
    expected: "(a + (b / c))",
  },
  {
    input: "a + b * c + d / e - f",
    expected: "(((a + (b * c)) + (d / e)) - f)",
  },
  {
    input: "3 + 4; -5 * 5",
    expected: "(3 + 4)((-5) * 5)",
  },
  {
    input: "5 > 4 == 3 < 4",
    expected: "((5 > 4) == (3 < 4))",
  },
  {
    input: "5 < 4 != 3 > 4",
    expected: "((5 < 4) != (3 > 4))",
  },
  {
    input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
    expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
  },
  {
    input: "true",
    expected: "true",
  },
  {
    input: "false",
    expected: "false",
  },
  {
    input: "3 > 5 == false",
    expected: "((3 > 5) == false)",
  },
  {
    input: "3 < 5 == true",
    expected: "((3 < 5) == true)",
  },
  {
    input: "1 + (2 + 3) + 4",
    expected: "((1 + (2 + 3)) + 4)",
  },
  {
    input: "(5 + 5) * 2",
    expected: "((5 + 5) * 2)",
  },
  {
    input: "2 / (5 + 5)",
    expected: "(2 / (5 + 5))",
  },
  {
    input: "-(5 + 5)",
    expected: "(-(5 + 5))",
  },
  {
    input: "!(true == true)",
    expected: "(!(true == true))",
  },
  {
    input: "a + add(b * c) + d",
    expected: "((a + add((b * c))) + d)",
  },
  {
    input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
    expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
  },
  {
    input: "add(a + b + c * d / f + g)",
    expected: "add((((a + b) + ((c * d) / f)) + g))",
  },
  {
    input: "a * [1, 2, 3, 4][b * c] * d",
    expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)",
  },
  {
    input: "add(a * b[2], b[1], 2 * [1, 2][1])",
    expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
  },
])(
  "should parse operator precedence $input as $expected",
  ({ input, expected }) => {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();

    expect(program.string()).toBe(expected);
  }
);

it("should parse an if expression", () => {
  const input = "if (x < y) { x }";
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const exp = stmt.expression;
  expect(exp).toBeInstanceOf(IfExpression);

  if (!(exp instanceof IfExpression)) {
    throw new Error("exp not instanceof IfExpression");
  }

  testInfixExpression(exp.condition, "x", "<", "y");

  expect(exp.consequence.statements.length).toBe(1);

  const consequence = exp.consequence.statements[0];
  expect(consequence).toBeInstanceOf(ExpressionStatement);
  if (!(consequence instanceof ExpressionStatement)) {
    throw new Error("consequence not instanceof ExpressionStatement");
  }

  testIdentifier(consequence.expression, "x");

  expect(exp.alternative).toBeNull();
});

it("should parse an if-else expression", () => {
  const input = "if (x < y) { x } else { y }";
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const exp = stmt.expression;
  expect(exp).toBeInstanceOf(IfExpression);

  if (!(exp instanceof IfExpression)) {
    throw new Error("exp not instanceof IfExpression");
  }

  testInfixExpression(exp.condition, "x", "<", "y");

  expect(exp.consequence.statements.length).toBe(1);

  const consequence = exp.consequence.statements[0];
  expect(consequence).toBeInstanceOf(ExpressionStatement);
  if (!(consequence instanceof ExpressionStatement)) {
    throw new Error("consequence not instanceof ExpressionStatement");
  }

  testIdentifier(consequence.expression, "x");

  expect(exp.alternative.statements.length).toBe(1);

  const alternative = exp.alternative.statements[0];
  expect(alternative).toBeInstanceOf(ExpressionStatement);
  if (!(alternative instanceof ExpressionStatement)) {
    throw new Error("alternative not instanceof ExpressionStatement");
  }

  testIdentifier(alternative.expression, "y");
});

it("should parse a function literal", () => {
  const input = `fn(x, y) { x + y; }`;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const exp = stmt.expression;
  expect(exp).toBeInstanceOf(FunctionLiteral);
  if (!(exp instanceof FunctionLiteral)) {
    throw new Error("stmt not instanceof FunctionLiteral");
  }

  expect(exp.parameters.length).toBe(2);

  testLiteralExpression(exp.parameters[0], "x");
  testLiteralExpression(exp.parameters[1], "y");

  expect(exp.body.statements.length).toBe(1);

  const body = exp.body.statements[0];

  expect(body).toBeInstanceOf(ExpressionStatement);
  if (!(body instanceof ExpressionStatement)) {
    throw new Error("body not instanceof ExpressionStatement");
  }

  testInfixExpression(body.expression, "x", "+", "y");
});

it.each([
  {
    input: "fn() {};",
    expectedParams: [],
  },
  {
    input: "fn(x) {};",
    expectedParams: ["x"],
  },
  {
    input: "fn(x, y, z) {};",
    expectedParams: ["x", "y", "z"],
  },
])("should parse parameters $input", ({ input, expectedParams }) => {
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const func = stmt.expression;
  expect(func).toBeInstanceOf(FunctionLiteral);
  if (!(func instanceof FunctionLiteral)) {
    throw new Error("func not instanceof FunctionLiteral");
  }

  expect(func.parameters.length).toBe(expectedParams.length);

  expectedParams.forEach((param, i) => {
    testLiteralExpression(func.parameters[i], param);
  });
});

it("should parse a call expression", () => {
  const input = "add(1, 2 * 3, 4 + 5);";
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instanceof ExpressionStatement");
  }

  const exp = stmt.expression;
  expect(exp).toBeInstanceOf(CallExpression);
  if (!(exp instanceof CallExpression)) {
    throw new Error("exp not instanceof CallExpression");
  }

  testIdentifier(exp.func, "add");

  expect(exp.args.length).toBe(3);

  testLiteralExpression(exp.args[0], 1);
  testInfixExpression(exp.args[1], 2, "*", 3);
  testInfixExpression(exp.args[2], 4, "+", 5);
});

it("should parse string literals", () => {
  const input = `"hello world";`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instance of ExpressionStatement");
  }

  const literal = stmt.expression;
  expect(literal).toBeInstanceOf(StringLiteral);
  if (!(literal instanceof StringLiteral)) {
    throw new Error("literal not instance of StringLiteral");
  }

  expect(literal.value).toBe("hello world");
});

it("should parse Array identifiers", () => {
  const input = "[1, 2 * 2, 3 + 3]";

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instance of ExpressionStatement");
  }

  const array = stmt.expression;
  expect(array).toBeInstanceOf(ArrayLiteral);
  if (!(array instanceof ArrayLiteral)) {
    throw new Error("array not instance of ArrayLiteral");
  }

  expect(array.elements.length).toBe(3);

  testIntegerLiteral(array.elements[0], 1);
  testInfixExpression(array.elements[1], 2, "*", 2);
  testInfixExpression(array.elements[2], 3, "+", 3);
});

it("should parse index expressions", () => {
  const input = "myArray[1 + 1];";

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instance of ExpressionStatement");
  }

  const exp = stmt.expression;
  expect(exp).toBeInstanceOf(IndexExpression);
  if (!(exp instanceof IndexExpression)) {
    throw new Error("exp not instance of IndexExpression");
  }

  testIdentifier(exp.left, "myArray");

  testInfixExpression(exp.index, 1, "+", 1);
});

it.each([
  {
    input: `{"one": 1, "two": 2, "three": 3}`,
    keyType: "string",
    expected: new Map([
      ["one", 1],
      ["two", 2],
      ["three", 3],
    ]),
  },
  {
    input: `{1: 1, 2: 2, 3: 3}`,
    keyType: "number",
    expected: new Map([
      [1, 1],
      [2, 2],
      [3, 3],
    ]),
  },
  {
    input: `{true: 1, false: 2}`,
    keyType: "boolean",
    expected: new Map([
      [true, 1],
      [false, 2],
    ]),
  },
])("should parse hash literals $input", ({ input, keyType, expected }) => {
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instance of ExpressionStatement");
  }

  const hash = stmt.expression;
  expect(hash).toBeInstanceOf(HashLiteral);
  if (!(hash instanceof HashLiteral)) {
    throw new Error("hash not instance of HashLiteral");
  }

  expect(hash.pairs.size).toBe(expected.size);

  for (const [key, value] of hash.pairs) {
    if (keyType === "number") {
      expect(key).toBeInstanceOf(IntegerLiteral);
      if (!(key instanceof IntegerLiteral)) {
        throw new Error("key not instance of NumberLiteral");
      }
    }
    if (keyType === "string") {
      expect(key).toBeInstanceOf(StringLiteral);
      if (!(key instanceof StringLiteral)) {
        throw new Error("key not instance of StringLiteral");
      }
    }
    if (keyType === "boolean") {
      expect(key).toBeInstanceOf(BooleanLiteral);
      if (!(key instanceof BooleanLiteral)) {
        throw new Error("key not instance of BooleanLiteral");
      }
    }

    const expectedValue = expected.get((key as any).value as never);

    testIntegerLiteral(value, expectedValue);
  }
});

it("should parse Empty HashLiteral", () => {
  const input = "{}";

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);
  if (!(stmt instanceof ExpressionStatement)) {
    throw new Error("stmt not instance of ExpressionStatement");
  }

  const hash = stmt.expression;
  expect(hash).toBeInstanceOf(HashLiteral);
  if (!(hash instanceof HashLiteral)) {
    throw new Error("hash not instance of HashLiteral");
  }

  expect(hash.pairs.size).toBe(0);
});

it.each([
  {
    input: `{"one": 0 + 1, "two": 10 - 8, "three": 15/5}`,
    expected: new Map([
      ["one", (exp: Expression) => testInfixExpression(exp, 0, "+", 1)],
      ["two", (exp: Expression) => testInfixExpression(exp, 10, "-", 8)],
      ["three", (exp: Expression) => testInfixExpression(exp, 15, "/", 5)],
    ]),
  },
])(
  "should parse hash literals with expressions $input",
  ({ input, expected }) => {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    checkParserErrors(p);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    if (!(stmt instanceof ExpressionStatement)) {
      throw new Error("stmt not instance of ExpressionStatement");
    }

    const hash = stmt.expression;
    expect(hash).toBeInstanceOf(HashLiteral);
    if (!(hash instanceof HashLiteral)) {
      throw new Error("hash not instance of HashLiteral");
    }

    expect(hash.pairs.size).toBe(3);

    for (const [key, value] of hash.pairs) {
      expect(key).toBeInstanceOf(StringLiteral);
      if (!(key instanceof StringLiteral)) {
        throw new Error("key not instance of StringLiteral");
      }

      const testFunc = expected.get(key.string());

      expect(testFunc).toBeDefined();

      testFunc(value);
    }
  }
);

function testLetStatement(stmt: Statement, identifier: string) {
  expect(stmt.tokenLiteral()).toBe("let");

  expect(stmt).toBeInstanceOf(LetStatement);
  if (!(stmt instanceof LetStatement)) {
    throw new Error("stmt not instanceof LetStatement");
  }
  expect(stmt.name.value).toBe(identifier);
  expect(stmt.name.tokenLiteral()).toBe(identifier);
}

function testInfixExpression(
  exp: Expression,
  left: number | string | boolean,
  operator: string,
  right: number | string | boolean
) {
  expect(exp).toBeInstanceOf(InfixExpression);
  if (!(exp instanceof InfixExpression)) {
    throw new Error("exp not instanceof InfixExpression");
  }

  testLiteralExpression(exp.left, left);

  expect(exp.operator).toBe(operator);

  testLiteralExpression(exp.right, right);
}

function testLiteralExpression(
  exp: Expression,
  expected: string | number | boolean
) {
  switch (typeof expected) {
    case "number":
      testIntegerLiteral(exp, expected);
      break;
    case "string":
      testIdentifier(exp, expected);
      break;
    case "boolean":
      testBooleanLiteral(exp, expected);
      break;
    default:
      throw new Error(`LiteralExpression not LiteralExpression, got ${exp}`);
  }
}

function testIntegerLiteral(il: Expression, value: number) {
  expect(il).toBeInstanceOf(IntegerLiteral);
  if (!(il instanceof IntegerLiteral)) {
    throw new Error(`Integer Literal not IntegerLiteral, got ${il}`);
  }

  expect(il.value).toBe(value);

  expect(il.tokenLiteral()).toBe(value.toString());
}

function testIdentifier(exp: Expression, value: string) {
  expect(exp).toBeInstanceOf(Identifier);
  if (!(exp instanceof Identifier)) {
    throw new Error(`Identifier not Identifier, got ${exp}`);
  }

  expect(exp.value).toBe(value);

  expect(exp.tokenLiteral()).toBe(value);
}

function testBooleanLiteral(il: Expression, value: boolean) {
  expect(il).toBeInstanceOf(BooleanLiteral);
  if (!(il instanceof BooleanLiteral)) {
    throw new Error(`Integer Literal not BooleanLiteral, got ${il}`);
  }

  expect(il.value).toBe(value);

  expect(il.tokenLiteral()).toBe(value.toString());
}

function checkParserErrors(p: Parser) {
  const errors = p.getErrors();
  errors.forEach((error) => {
    expect(error).toBe("");
  });
}
