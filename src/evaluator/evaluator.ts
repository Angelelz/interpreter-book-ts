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
  ReturnStatement,
  Statement,
} from "../ast/ast.js";
import {
  Integer,
  MonkeyObject,
  Boolean,
  Null,
  TYPE,
  ReturnValue,
  MonkeyError,
} from "../object/object.js";

export const TRUE = new Boolean(true),
  FALSE = new Boolean(false),
  NULL = new Null();

export function evalMonkey<TNode extends Node>(node: TNode): MonkeyObject {
  if (node instanceof Program) return evalProgram(node.statements);

  if (node instanceof ExpressionStatement) return evalMonkey(node.expression);

  if (node instanceof IntegerLiteral) return new Integer(node.value);

  if (node instanceof BooleanLiteral)
    return nativeBooleanToBooleanObject(node.value);

  if (node instanceof Null) return NULL;

  if (node instanceof PrefixExpression) {
    const right = evalMonkey(node.right);
    if (isError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }

  if (node instanceof InfixExpression) {
    const left = evalMonkey(node.left);
    if (isError(left)) {
      return left;
    }
    const right = evalMonkey(node.right);
    if (isError(right)) {
      return right;
    }
    return evalInfixExpression(node.operator, left, right);
  }

  if (node instanceof BlockStatement) return evalBlockStatement(node);

  if (node instanceof IfExpression) return evalIfExpression(node);

  if (node instanceof ReturnStatement) {
    const value = evalMonkey(node.returnValue);
    if (isError(value)) {
      return value;
    }
    return new ReturnValue(value);
  }

  return null;
}

function isError(obj: MonkeyObject): boolean {
  if (obj !== null) {
    return obj.type() === TYPE.ERROR_OBJ;
  }
  return false;
}

function newError(message: string): MonkeyObject {
  return new MonkeyError(message);
}

function evalIfExpression(node: IfExpression) {
  const condition = evalMonkey(node.condition);
  if (isError(condition)) {
    return condition;
  }

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
  if (left.type() !== right.type()) {
    return newError(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  }

  return newError(
    `unknown operator: ${left.type()} ${operator} ${right.type()}`
  );
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
      return newError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
      );
  }
}

function evalPrefixExpression(operator: string, right: MonkeyObject) {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return new MonkeyError(`unknown operator: ${operator}${right.type()}`);
  }
}

function evalMinusPrefixOperatorExpression(right: MonkeyObject) {
  if (right.type() !== TYPE.INTEGER_OBJ) {
    return newError(`unknown operator: -${right.type()}`);
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

function evalBlockStatement(block: BlockStatement): MonkeyObject {
  let result: MonkeyObject;

  for (let statement of block.statements) {
    result = evalMonkey(statement);

    if (
      result !== null &&
      (result.type() === TYPE.RETURN_VALUE_OBJ ||
        result.type() === TYPE.ERROR_OBJ)
    ) {
      return result;
    }
  }
  return result;
}

function evalProgram(statements: Statement[]) {
  let result: MonkeyObject;

  for (let statement of statements) {
    result = evalMonkey(statement);

    if (result instanceof ReturnValue) {
      return result.value;
    }

    if (result instanceof MonkeyError) {
      return result;
    }
  }

  return result;
}
