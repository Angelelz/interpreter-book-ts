export type TokenType = (typeof TOKENS)[keyof typeof TOKENS];

export type Token = {
  type: TokenType;
  literal: string;
};

export const TOKENS = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",

  // Identifiers + literals
  IDENT: "IDENT", // add, foobar, x, y, ...
  INT: "INT", // 1343456
  STRING: "STRING",

  // Operators
  ASSIGN: "=",
  PLUS: "+",
  MINUS: "-",
  BANG: "!",
  ASTERISK: "*",
  SLASH: "/",

  LT: "<",
  GT: ">",
  EQ: "==",
  NOT_EQ: "!=",

  // Delimiters
  COMMA: ",",
  SEMICOLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",

  // Keywords
  FUNCTION: "FUNCTION",
  LET: "LET",
  TRUE: "TRUE",
  FALSE: "FALSE",
  IF: "IF",
  ELSE: "ELSE",
  RETURN: "RETURN",
} as const;

export const keywords: { [key: string]: TokenType } = {
  fn: TOKENS.FUNCTION,
  let: TOKENS.LET,
  true: TOKENS.TRUE,
  false: TOKENS.FALSE,
  if: TOKENS.IF,
  else: TOKENS.ELSE,
  return: TOKENS.RETURN,
};

export function lookupIdent(ident: string): TokenType {
  return keywords[ident] || TOKENS.IDENT;
}
