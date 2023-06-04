import { Token } from "../token/token.js";

export interface Node {
  tokenLiteral(): string;
  string(): string;
}

export interface Statement extends Node {
  statementNode(): void;
}

export interface Expression extends Node {
  expressionNode(): void;
}

export class Program implements Node {
  statements: Statement[];

  constructor() {
    this.statements = [];
  }
  tokenLiteral(): string {
    if (this.statements.length === 0) {
      return "";
    }
    return this.statements[0].tokenLiteral();
  }

  string(): string {
    return this.statements.map((s) => s.string()).join("");
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

  string(): string {
    return this.value;
  }
}

export class BooleanLiteral implements Expression {
  token: Token;
  value: boolean;
  constructor(token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.token.literal;
  }
}

export class IntegerLiteral implements Expression {
  token: Token;
  value: number;
  constructor(token: Token, value: number) {
    this.token = token;
    this.value = value;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.token.literal;
  }
}

export class StringLiteral implements Expression {
  token: Token;
  value: string;
  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    return this.token.literal;
  }
}

export class HashLiteral implements Expression {
  token: Token;
  pairs: Map<Expression, Expression>;
  constructor(token: Token, pairs: Map<Expression, Expression>) {
    this.token = token;
    this.pairs = pairs;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string(): string {
    const pairs: string[] = [];
    this.pairs.forEach((value, key) => {
      pairs.push(`${key.string()}:${value.string()}`);
    });

    return `{${pairs.join(", ")}}`;
  }
}
export class ArrayLiteral implements Expression {
  token: Token;
  elements: Expression[];
  constructor(token: Token, elements: Expression[]) {
    this.token = token;
    this.elements = elements;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    return `[${this.elements.map((e) => e.string()).join(", ")}]`;
  }
}

export class IndexExpression implements Expression {
  token: Token;
  left: Expression;
  index: Expression;
  constructor(token: Token, left: Expression, index: Expression) {
    this.token = token;
    this.left = left;
    this.index = index;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    return `(${this.left.string()}[${this.index.string()}])`;
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

  string(): string {
    return `${this.tokenLiteral()} ${this.name.string()} = ${
      this.value.string() ? this.value.string() : ";"
    }`;
  }
}

export class ReturnStatement implements Statement {
  token: Token;
  returnValue: Expression;
  constructor(token: Token, returnValue: Expression) {
    this.token = token;
    this.returnValue = returnValue;
  }
  statementNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `${this.tokenLiteral()} ${
      this.returnValue.string() ? this.returnValue.string() : ";"
    }`;
  }
}

export class ExpressionStatement implements Statement {
  token: Token;
  expression: Expression;
  constructor(token: Token, expression: Expression) {
    this.token = token;
    this.expression = expression;
  }
  statementNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return this.expression ? this.expression.string() : "";
  }
}

export class FunctionLiteral implements Expression {
  token: Token;
  parameters: Identifier[];
  body: BlockStatement;
  constructor(token: Token, parameters: Identifier[], body: BlockStatement) {
    this.token = token;
    this.parameters = parameters;
    this.body = body;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return `${this.tokenLiteral()}(${this.parameters
      .map((p) => p.string())
      .join(", ")}) ${this.body.string()}`;
  }
}

export class CallExpression implements Expression {
  token: Token;
  func: Expression;
  args: Expression[];
  constructor(token: Token, func: Expression, args: Expression[]) {
    this.token = token;
    this.func = func;
    this.args = args;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return `${this.func.string()}(${this.args
      .map((a) => a.string())
      .join(", ")})`;
  }
}

export class IfExpression implements Expression {
  token: Token;
  condition: Expression;
  consequence: BlockStatement;
  alternative: BlockStatement;
  constructor(
    token: Token,
    condition: Expression,
    consequence: BlockStatement,
    alternative: BlockStatement
  ) {
    this.token = token;
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return `${this.tokenLiteral()} ${this.condition.string()} ${this.consequence.string()}${
      this.alternative ? " else " + this.alternative.string() : ""
    }`;
  }
}

export class BlockStatement implements Statement {
  token: Token;
  statements: Statement[];
  constructor(token: Token, statements: Statement[]) {
    this.token = token;
    this.statements = statements;
  }
  statementNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.statements.map((s) => s.string()).join("");
  }
}

export class InfixExpression implements Expression {
  token: Token;
  left: Expression;
  operator: string;
  right: Expression;
  constructor(
    token: Token,
    left: Expression,
    operator: string,
    right: Expression
  ) {
    this.token = token;
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return `(${this.left.string()} ${this.operator} ${this.right.string()})`;
  }
}

export class PrefixExpression implements Expression {
  token: Token;
  operator: string;
  right: Expression;
  constructor(token: Token, operator: string, right: Expression) {
    this.token = token;
    this.operator = operator;
    this.right = right;
  }
  expressionNode(): void {}
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return `(${this.operator}${this.right.string()})`;
  }
}
