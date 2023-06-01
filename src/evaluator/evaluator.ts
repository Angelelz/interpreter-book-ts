import {
  BlockStatement,
  BooleanLiteral,
  ExpressionStatement,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  Node,
  PrefixExpression,
  Program,
  Statement,
} from "../ast/ast.js";
import {
  Integer,
  MonkeyObject,
  Boolean,
  Null,
  TYPE,
} from "../object/object.js";

export const TRUE = new Boolean(true),
  FALSE = new Boolean(false),
  NULL = new Null();

export function evalMonkey<TNode extends Node>(node: TNode): MonkeyObject {
  if (node instanceof Program) return evalStatements(node.statements);

  if (node instanceof ExpressionStatement) return evalMonkey(node.expression);

  if (node instanceof IntegerLiteral) return new Integer(node.value);

  if (node instanceof BooleanLiteral)
    return nativeBooleanToBooleanObject(node.value);

  if (node instanceof Null) return NULL;

  if (node instanceof PrefixExpression) {
    const right = evalMonkey(node.right);
    return evalPrefixExpression(node.operator, right);
  }

  if (node instanceof InfixExpression) {
    const left = evalMonkey(node.left);
    const right = evalMonkey(node.right);
    return evalInfixExpression(node.operator, left, right);
  }

  if (node instanceof BlockStatement) return evalStatements(node.statements);

  if (node instanceof IfExpression) return evalIfExpression(node);

  return null;
}

function evalIfExpression(node: IfExpression) {
  const condition = evalMonkey(node.condition);

  if (isTruthy(condition)) {
    return evalMonkey(node.consequence);
  } else if (node.alternative) {
    return evalMonkey(node.alternative);
  } else {
    return NULL;
  }
}

function isTruthy(obj: MonkeyObject) {
  switch (obj.type()) {
    case TYPE.BOOLEAN_OBJ:
      return (obj as Boolean).value;
    case TYPE.NULL_OBJ:
      return false;
    default:
      return true;
  }
}

function evalInfixExpression(
  operator: string,
  left: MonkeyObject,
  right: MonkeyObject
) {
  if (left.type() === TYPE.INTEGER_OBJ && right.type() === TYPE.INTEGER_OBJ) {
    return evalIntegerInfixExpression(operator, left, right);
  }
  if (operator === "==") {
    return nativeBooleanToBooleanObject(left == right);
  }
  if (operator === "!=") {
    return nativeBooleanToBooleanObject(left != right);
  }
  return null;
}

function evalIntegerInfixExpression(
  operator: string,
  left: MonkeyObject,
  right: MonkeyObject
) {
  const leftVal = (left as Integer).value;
  const rightVal = (right as Integer).value;

  switch (operator) {
    case "+":
      return new Integer(leftVal + rightVal);
    case "-":
      return new Integer(leftVal - rightVal);
    case "*":
      return new Integer(leftVal * rightVal);
    case "/":
      return new Integer(leftVal / rightVal);
    case "<":
      return nativeBooleanToBooleanObject(leftVal < rightVal);
    case ">":
      return nativeBooleanToBooleanObject(leftVal > rightVal);
    case "==":
      return nativeBooleanToBooleanObject(leftVal === rightVal);
    case "!=":
      return nativeBooleanToBooleanObject(leftVal !== rightVal);
    default:
      return null;
  }
}

function evalPrefixExpression(operator: string, right: MonkeyObject) {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return NULL;
  }
}

function evalMinusPrefixOperatorExpression(right: MonkeyObject) {
  if (right.type() !== TYPE.INTEGER_OBJ) {
    return null;
  }

  const value = (right as Integer).value;
  return new Integer(-value);
}

function evalBangOperatorExpression(right: MonkeyObject) {
  switch (right) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      return FALSE;
  }
}

function nativeBooleanToBooleanObject(input: boolean): MonkeyObject {
  if (input) return TRUE;
  return FALSE;
}

function evalStatements(statements: Statement[]) {
  let result: MonkeyObject;

  statements.forEach((statement) => {
    result = evalMonkey(statement);
  });
  return result;
}
