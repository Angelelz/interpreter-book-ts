import { expect, it } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "./parser.js";
import { LetStatement, Statement } from "../ast/ast.js";

it("should parse let statements", () => {
  const input = `
  let x = 5;
  let y = 10;
  let foobar = 838383;
  `;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
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

function testLetStatement(stmt: Statement, identifier: string) {
  expect(stmt.tokenLiteral()).toBe("let");

  expect(stmt).toBeInstanceOf(LetStatement);
  if (!(stmt instanceof LetStatement)) {
    throw new Error("stmt not instanceof LetStatement");
  }
  expect(stmt.name.value).toBe(identifier);
  expect(stmt.name.tokenLiteral()).toBe(identifier);
}
