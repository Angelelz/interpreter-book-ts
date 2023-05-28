import {
  Identifier,
  LetStatement,
  Program,
  ReturnStatement,
  Statement,
} from "../ast/ast.js";
import { Lexer } from "../lexer/lexer.js";
import { TOKENS, Token, TokenType } from "../token/token.js";

export class Parser {
  l: Lexer;

  curToken: Token;
  peekToken: Token;
  errors: string[];
  constructor(l: Lexer) {
    this.l = l;
    this.errors = [];
    this.nextToken();
    this.nextToken();
    return this;
  }

  getErrors(): string[] {
    return this.errors;
  }

  peekError(t: TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.type}`;
    console.log(msg);
    this.errors.push(msg);
  }

  nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  parseProgram(): Program | null {
    const program = new Program();

    while (!this.curTokenIs(TOKENS.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case TOKENS.LET:
        return this.parseLetStatement();
      case TOKENS.RETURN:
        return this.parseReturnStatement();
      default:
        return null;
    }
  }

  parseReturnStatement(): ReturnStatement | null {
    const returnToken = this.curToken;

    this.nextToken();

    // TODO: We're skipping the expression until we
    // encounter a semicolon

    while (!this.curTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }

    return new ReturnStatement(returnToken, null);
  }

  parseLetStatement(): LetStatement | null {
    const letStmt = this.curToken;
    if (!this.expectPeek(TOKENS.IDENT)) {
      return null;
    }

    const identifier = new Identifier(this.curToken, this.curToken.literal);

    if (!this.expectPeek(TOKENS.ASSIGN)) {
      return null;
    }

    const stmt = new LetStatement(letStmt, identifier, null);

    // TODO: We're skipping the expression until we
    // encounter a semicolon

    while (!this.curTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type;
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type;
  }

  expectPeek(type: TokenType): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(type);
      return false;
    }
  }
}
