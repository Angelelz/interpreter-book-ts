import { TOKENS, Token, lookupIdent } from "../token/token.js";

export class Lexer {
  input: string;
  position: number;
  readPosition: number;
  ch: string;
  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    // this.ch = input[0];
    this.readChar();
  }

  readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = "";
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition++;
  }

  nextToken(): Token {
    let tok: Token;
    this.skipWhitespace();

    switch (this.ch) {
      case "=":
        if (this.peekChar() === "=") {
          this.readChar();
          tok = { type: TOKENS.EQ, literal: "==" };
        } else {
          tok = { type: TOKENS.ASSIGN, literal: "=" };
        }
        break;
      case "+":
        tok = { type: TOKENS.PLUS, literal: "+" };
        break;
      case "-":
        tok = { type: TOKENS.MINUS, literal: "-" };
        break;
      case "!":
        if (this.peekChar() === "=") {
          this.readChar();
          tok = { type: TOKENS.NOT_EQ, literal: "!=" };
        } else {
          tok = { type: TOKENS.BANG, literal: "!" };
        }
        break;
      case "/":
        tok = { type: TOKENS.SLASH, literal: "/" };
        break;
      case "*":
        tok = { type: TOKENS.ASTERISK, literal: "*" };
        break;
      case ">":
        tok = { type: TOKENS.GT, literal: ">" };
        break;
      case "<":
        tok = { type: TOKENS.LT, literal: "<" };
        break;
      case ";":
        tok = { type: TOKENS.SEMICOLON, literal: ";" };
        break;
      case "(":
        tok = { type: TOKENS.LPAREN, literal: "(" };
        break;
      case ")":
        tok = { type: TOKENS.RPAREN, literal: ")" };
        break;
      case ",":
        tok = { type: TOKENS.COMMA, literal: "," };
        break;
      case "+":
        tok = { type: TOKENS.PLUS, literal: "+" };
        break;
      case "{":
        tok = { type: TOKENS.LBRACE, literal: "{" };
        break;
      case "}":
        tok = { type: TOKENS.RBRACE, literal: "}" };
        break;
      case "":
        tok = { type: TOKENS.EOF, literal: "" };
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = { literal, type: lookupIdent(literal) };
          return tok;
        } else if (this.isDigit(this.ch)) {
          tok = { type: TOKENS.INT, literal: this.readNumber() };
          return tok;
        } else {
          tok = { type: TOKENS.ILLEGAL, literal: this.ch };
        }
        break;
    }
    this.readChar();
    return tok;
  }

  skipWhitespace(): void {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\r" ||
      this.ch === "\n"
    ) {
      this.readChar();
    }
  }

  readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return "";
    } else {
      return this.input[this.readPosition];
    }
  }

  isDigit(ch: string): boolean {
    return (
      "0".charCodeAt(0) <= ch.charCodeAt(0) &&
      ch.charCodeAt(0) <= "9".charCodeAt(0)
    );
  }

  readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  isLetter(ch: string): boolean {
    return (
      ("a".charCodeAt(0) <= ch.charCodeAt(0) &&
        ch.charCodeAt(0) <= "z".charCodeAt(0)) ||
      ("A".charCodeAt(0) <= ch.charCodeAt(0) &&
        ch.charCodeAt(0) <= "Z".charCodeAt(0)) ||
      ch === "_"
    );
  }
}

// export function New(input: string): Lexer {
//   const l = new Lexer(input);
//   l.readChar();
//   return l;
// }
