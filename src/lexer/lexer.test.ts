import { New } from "./lexer.js";
import { TOKENS, TokenType } from "../token/token.js";
import { expect, it } from "vitest";

function testNextToken() {
  const input = "=+(){},;";

  const tests: { expectedType: TokenType; expectedLiteral: string }[] = [
    {
      expectedType: TOKENS.ASSIGN,
      expectedLiteral: "=",
    },
    {
      expectedType: TOKENS.PLUS,
      expectedLiteral: "+",
    },
    {
      expectedType: TOKENS.LPAREN,
      expectedLiteral: "(",
    },
    {
      expectedType: TOKENS.RPAREN,
      expectedLiteral: ")",
    },
    {
      expectedType: TOKENS.LBRACE,
      expectedLiteral: "{",
    },
    {
      expectedType: TOKENS.RBRACE,
      expectedLiteral: "}",
    },
    {
      expectedType: TOKENS.COMMA,
      expectedLiteral: ",",
    },
    {
      expectedType: TOKENS.SEMICOLON,
      expectedLiteral: ";",
    },
    {
      expectedType: TOKENS.EOF,
      expectedLiteral: "",
    },
  ];

  const l = New(input);

  for (let i = 0; i < tests.length; i++) {
    const tok = l.nextToken();

    expect(tok.type).toBe(tests[i].expectedType);

    expect(tok.literal).toBe(tests[i].expectedLiteral);
  }
}

function testNextToken2() {
  const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
  x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;
if (5 < 10) {
    return true;
} else {
    return false;
}

10 == 10;
10 != 9;
`;

  const tests: { expectedType: TokenType; expectedLiteral: string }[] = [
    { expectedType: TOKENS.LET, expectedLiteral: "let" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "five" },
    { expectedType: TOKENS.ASSIGN, expectedLiteral: "=" },
    { expectedType: TOKENS.INT, expectedLiteral: "5" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.LET, expectedLiteral: "let" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "ten" },
    { expectedType: TOKENS.ASSIGN, expectedLiteral: "=" },
    { expectedType: TOKENS.INT, expectedLiteral: "10" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.LET, expectedLiteral: "let" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "add" },
    { expectedType: TOKENS.ASSIGN, expectedLiteral: "=" },
    { expectedType: TOKENS.FUNCTION, expectedLiteral: "fn" },
    { expectedType: TOKENS.LPAREN, expectedLiteral: "(" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "x" },
    { expectedType: TOKENS.COMMA, expectedLiteral: "," },
    { expectedType: TOKENS.IDENT, expectedLiteral: "y" },
    { expectedType: TOKENS.RPAREN, expectedLiteral: ")" },
    { expectedType: TOKENS.LBRACE, expectedLiteral: "{" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "x" },
    { expectedType: TOKENS.PLUS, expectedLiteral: "+" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "y" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.RBRACE, expectedLiteral: "}" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.LET, expectedLiteral: "let" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "result" },
    { expectedType: TOKENS.ASSIGN, expectedLiteral: "=" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "add" },
    { expectedType: TOKENS.LPAREN, expectedLiteral: "(" },
    { expectedType: TOKENS.IDENT, expectedLiteral: "five" },
    { expectedType: TOKENS.COMMA, expectedLiteral: "," },
    { expectedType: TOKENS.IDENT, expectedLiteral: "ten" },
    { expectedType: TOKENS.RPAREN, expectedLiteral: ")" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.BANG, expectedLiteral: "!" },
    { expectedType: TOKENS.MINUS, expectedLiteral: "-" },
    { expectedType: TOKENS.SLASH, expectedLiteral: "/" },
    { expectedType: TOKENS.ASTERISK, expectedLiteral: "*" },
    { expectedType: TOKENS.INT, expectedLiteral: "5" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.INT, expectedLiteral: "5" },
    { expectedType: TOKENS.LT, expectedLiteral: "<" },
    { expectedType: TOKENS.INT, expectedLiteral: "10" },
    { expectedType: TOKENS.GT, expectedLiteral: ">" },
    { expectedType: TOKENS.INT, expectedLiteral: "5" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.IF, expectedLiteral: "if" },
    { expectedType: TOKENS.LPAREN, expectedLiteral: "(" },
    { expectedType: TOKENS.INT, expectedLiteral: "5" },
    { expectedType: TOKENS.LT, expectedLiteral: "<" },
    { expectedType: TOKENS.INT, expectedLiteral: "10" },
    { expectedType: TOKENS.RPAREN, expectedLiteral: ")" },
    { expectedType: TOKENS.LBRACE, expectedLiteral: "{" },
    { expectedType: TOKENS.RETURN, expectedLiteral: "return" },
    { expectedType: TOKENS.TRUE, expectedLiteral: "true" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.RBRACE, expectedLiteral: "}" },
    { expectedType: TOKENS.ELSE, expectedLiteral: "else" },
    { expectedType: TOKENS.LBRACE, expectedLiteral: "{" },
    { expectedType: TOKENS.RETURN, expectedLiteral: "return" },
    { expectedType: TOKENS.FALSE, expectedLiteral: "false" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.RBRACE, expectedLiteral: "}" },
    { expectedType: TOKENS.INT, expectedLiteral: "10" },
    { expectedType: TOKENS.EQ, expectedLiteral: "==" },
    { expectedType: TOKENS.INT, expectedLiteral: "10" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.INT, expectedLiteral: "10" },
    { expectedType: TOKENS.NOT_EQ, expectedLiteral: "!=" },
    { expectedType: TOKENS.INT, expectedLiteral: "9" },
    { expectedType: TOKENS.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TOKENS.EOF, expectedLiteral: "" },
  ];

  const l = New(input);

  for (let i = 0; i < tests.length; i++) {
    const tok = l.nextToken();

    expect(tok.type).toBe(tests[i].expectedType);

    expect(tok.literal).toBe(tests[i].expectedLiteral);
  }
}

it("should tokenize =+(){},;", () => {
  testNextToken();
});

it("should tokenize let five = 5; let ten = 10; let add = fn(x, y) { x + y; }; let result = add(five, ten);", () => {
  testNextToken2();
});
