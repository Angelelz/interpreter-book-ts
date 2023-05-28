import { Lexer } from "../lexer/lexer.js";
import { Token } from "../token/token.js";

export class Parser {
  l: Lexer;

  curToken: Token;
  peekToken: Token;
  constructor(l: Lexer) {
    this.l = l;
    this.nextToken();
    this.nextToken();
    return this;
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  parseProgram() {
    return null;
  }
}
