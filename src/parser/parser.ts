import {
  BlockStatement,
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
} from "../ast/ast.js";
import { Lexer } from "../lexer/lexer.js";
import { TOKENS, Token, TokenType } from "../token/token.js";

type prefixParseFn = () => Expression;
type infixParseFn = (left: Expression) => Expression;

const CONSTANTS = {
  _: 0,
  LOWEST: 1,
  EQUALS: 2,
  LESSGREATER: 3,
  SUM: 4,
  PRODUCT: 5,
  PREFIX: 6,
  CALL: 7,
};

const PRECEDENCE: Record<string, number> = {
  [TOKENS.EQ]: CONSTANTS.EQUALS,
  [TOKENS.NOT_EQ]: CONSTANTS.EQUALS,
  [TOKENS.LT]: CONSTANTS.LESSGREATER,
  [TOKENS.GT]: CONSTANTS.LESSGREATER,
  [TOKENS.PLUS]: CONSTANTS.SUM,
  [TOKENS.MINUS]: CONSTANTS.SUM,
  [TOKENS.ASTERISK]: CONSTANTS.PRODUCT,
  [TOKENS.SLASH]: CONSTANTS.PRODUCT,
  [TOKENS.LPAREN]: CONSTANTS.CALL,
};

export class Parser {
  l: Lexer;
  errors: string[];

  curToken: Token;
  peekToken: Token;

  prefixParseFns: { [key: string]: prefixParseFn } = {};
  infixParseFns: { [key: string]: infixParseFn } = {};
  constructor(l: Lexer) {
    this.l = l;
    this.errors = [];
    this.registerPrefix(TOKENS.IDENT, this.parseIdentifier);
    this.registerPrefix(TOKENS.INT, this.parseIntegerLiteral);
    this.registerPrefix(TOKENS.BANG, this.parsePrefixExpression);
    this.registerPrefix(TOKENS.MINUS, this.parsePrefixExpression);
    this.registerPrefix(TOKENS.TRUE, this.parseBoolean);
    this.registerPrefix(TOKENS.FALSE, this.parseBoolean);
    this.registerPrefix(TOKENS.LPAREN, this.parseGroupedExpression);
    this.registerPrefix(TOKENS.IF, this.parseIfExpression);
    this.registerPrefix(TOKENS.FUNCTION, this.parseFunctionLiteral);
    this.registerPrefix(TOKENS.STRING, this.parseStringLiteral);
    this.registerInfix(TOKENS.PLUS, this.parseInfixExpression);
    this.registerInfix(TOKENS.MINUS, this.parseInfixExpression);
    this.registerInfix(TOKENS.ASTERISK, this.parseInfixExpression);
    this.registerInfix(TOKENS.SLASH, this.parseInfixExpression);
    this.registerInfix(TOKENS.EQ, this.parseInfixExpression);
    this.registerInfix(TOKENS.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(TOKENS.LT, this.parseInfixExpression);
    this.registerInfix(TOKENS.GT, this.parseInfixExpression);
    this.registerInfix(TOKENS.LPAREN, this.parseCallExpression);
    this.nextToken();
    this.nextToken();
    return this;
  }

  curPrecedence(): number {
    return PRECEDENCE[this.curToken.type] || CONSTANTS.LOWEST;
  }

  peekPrecedence(): number {
    return PRECEDENCE[this.peekToken.type] || CONSTANTS.LOWEST;
  }

  parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  registerPrefix(tokenType: TokenType, fn: prefixParseFn): void {
    this.prefixParseFns[tokenType] = fn.bind(this);
  }

  registerInfix(tokenType: TokenType, fn: infixParseFn): void {
    this.infixParseFns[tokenType] = fn.bind(this);
  }

  noPrefixParseFnError(tokenType: TokenType): void {
    const msg = `no prefix parse function for ${tokenType} found`;
    this.errors.push(msg);
  }

  getErrors(): string[] {
    return this.errors;
  }

  peekError(t: TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.type}`;
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
        return this.parseExpressionStatement();
    }
  }

  parseExpression(precedence: number): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      return null;
    }

    let leftExpression = prefix();

    while (
      !this.peekTokenIs(TOKENS.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns[this.peekToken.type];
      if (!infix) {
        return leftExpression;
      }

      this.nextToken();
      leftExpression = infix(leftExpression);
    }

    return leftExpression;
  }

  parseCallExpression(func: Expression): Expression | null {
    const exp = new CallExpression(this.curToken, func, null);
    exp.args = this.parseCallArguments();
    return exp;
  }

  parseCallArguments(): Expression[] {
    const args: Expression[] = [];

    if (this.peekTokenIs(TOKENS.RPAREN)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    args.push(this.parseExpression(CONSTANTS.LOWEST));

    while (this.peekTokenIs(TOKENS.COMMA)) {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression(CONSTANTS.LOWEST));
    }

    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    return args;
  }

  parseFunctionLiteral(): Expression | null {
    const literal = new FunctionLiteral(this.curToken, null, null);

    if (!this.expectPeek(TOKENS.LPAREN)) {
      return null;
    }

    literal.parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TOKENS.LBRACE)) {
      return null;
    }

    literal.body = this.parseBlockStatement();

    return literal;
  }

  parseFunctionParameters(): Identifier[] {
    const identifiers: Identifier[] = [];

    if (this.peekTokenIs(TOKENS.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    const ident = new Identifier(this.curToken, this.curToken.literal);
    identifiers.push(ident);

    while (this.peekTokenIs(TOKENS.COMMA)) {
      this.nextToken();
      this.nextToken();
      identifiers.push(new Identifier(this.curToken, this.curToken.literal));
    }

    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    return identifiers;
  }

  parseIfExpression(): Expression | null {
    const expression = new IfExpression(this.curToken, null, null, null);

    if (!this.expectPeek(TOKENS.LPAREN)) {
      return null;
    }

    this.nextToken();
    expression.condition = this.parseExpression(CONSTANTS.LOWEST);

    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TOKENS.LBRACE)) {
      return null;
    }

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TOKENS.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TOKENS.LBRACE)) {
        return null;
      }

      expression.alternative = this.parseBlockStatement();
    }

    return expression;
  }

  parseBlockStatement(): BlockStatement | null {
    const block = new BlockStatement(this.curToken, []);

    this.nextToken();

    while (!this.curTokenIs(TOKENS.RBRACE) && !this.curTokenIs(TOKENS.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }
    return block;
  }

  parseGroupedExpression(): Expression | null {
    this.nextToken();

    const expression = this.parseExpression(CONSTANTS.LOWEST);
    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    return expression;
  }

  parseExpressionStatement(): ExpressionStatement | null {
    const stmt = new ExpressionStatement(this.curToken, null);

    stmt.expression = this.parseExpression(CONSTANTS.LOWEST);

    if (this.peekTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseInfixExpression(left: Expression): Expression | null {
    const expression = new InfixExpression(
      this.curToken,
      left,
      this.curToken.literal,
      null
    );

    const precedence = this.curPrecedence();
    this.nextToken();

    expression.right = this.parseExpression(precedence);

    return expression;
  }

  parsePrefixExpression(): Expression | null {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal,
      null
    );

    this.nextToken();

    expression.right = this.parseExpression(CONSTANTS.PREFIX);

    return expression;
  }

  parseStringLiteral(): Expression | null {
    return new StringLiteral(this.curToken, this.curToken.literal);
  }

  parseBoolean(): Expression | null {
    return new BooleanLiteral(this.curToken, this.curTokenIs(TOKENS.TRUE));
  }

  parseIntegerLiteral(): Expression | null {
    const integerValue = Number.parseInt(this.curToken.literal, 10);
    if (isNaN(integerValue)) {
      this.errors.push(`could not parse ${this.curToken.literal} as integer`);
      return null;
    }
    const lit = new IntegerLiteral(this.curToken, integerValue);

    return lit;
  }

  parseReturnStatement(): ReturnStatement | null {
    const stmt = new ReturnStatement(this.curToken, null);

    this.nextToken();

    stmt.returnValue = this.parseExpression(CONSTANTS.LOWEST);

    if (this.peekTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseLetStatement(): LetStatement | null {
    const stmt = new LetStatement(this.curToken, null, null);

    if (!this.expectPeek(TOKENS.IDENT)) {
      return null;
    }

    stmt.name = new Identifier(this.curToken, this.curToken.literal);

    if (!this.expectPeek(TOKENS.ASSIGN)) {
      return null;
    }

    this.nextToken();

    stmt.value = this.parseExpression(CONSTANTS.LOWEST);

    if (this.peekTokenIs(TOKENS.SEMICOLON)) {
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
