import { Token } from "../token/token.js";

export interface Node {
  tokenLiteral(): string;
}

export interface Statement extends Node {
  statementNode(): void;
}

export interface Expression extends Node {
  expressionNode(): void;
}

export class Program implements Node {
  statements: Statement[];
  tokenLiteral(): string {
    if (this.statements.length === 0) {
      return "";
    }
    return this.statements[0].tokenLiteral();
  }
}

export class Identifier implements Expression {
  token: Token;
  value: string;
  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
}

export class LetStatement implements Statement {
  token: Token;
  name: Identifier;
  value: Expression;
  constructor(token: Token, name: Identifier, value: Expression) {
    this.token = token;
    this.name = name;
    this.value = value;
  }
  statementNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
}
