import { it, expect } from "vitest";
import { Identifier, LetStatement, Program } from "./ast.js";
import { TOKENS, Token } from "../token/token.js";

it("should construct a string of our program", () => {
  const program = new Program();
  program.statements = [
    new LetStatement(
      { type: TOKENS.LET, literal: "let" },
      new Identifier({ type: TOKENS.IDENT, literal: "myVar" }, "myVar"),
      new Identifier(
        { type: TOKENS.IDENT, literal: "anotherVar" },
        "anotherVar"
      )
    ),
  ];

  expect(program.string()).toBe("let myVar = anotherVar");
});
