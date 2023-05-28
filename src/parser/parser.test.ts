import { expect, it } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "./parser.js";
import { LetStatement, ReturnStatement, Statement } from "../ast/ast.js";
import { TOKENS } from "../token/token.js";

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

function checkParserErrors(p: Parser) {
  const errors = p.getErrors();

  expect(errors.length).toBe(0);

  errors.forEach((error) => {
    expect(error).toBe("");
  });
}

function testLetStatement(stmt: Statement, identifier: string) {
  expect(stmt.tokenLiteral()).toBe("let");

  expect(stmt).toBeInstanceOf(LetStatement);
  if (!(stmt instanceof LetStatement)) {
    throw new Error("stmt not instanceof LetStatement");
  }
  expect(stmt.name.value).toBe(identifier);
  expect(stmt.name.tokenLiteral()).toBe(identifier);
}
