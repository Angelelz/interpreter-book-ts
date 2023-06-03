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
  Node,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
} from "../ast/ast.js";
import {
  Integer,
  MonkeyObject,
  Boolean,
  Null,
  TYPE,
  ReturnValue,
  MonkeyError,
  Environment,
  Function,
  MonkeyString,
  Builtin,
} from "../object/object.js";
import { builtins } from "./builtins.js";

export const TRUE = new Boolean(true),
  FALSE = new Boolean(false),
  NULL = new Null();

export function evalMonkey<TNode extends Node>(
  node: TNode,
  env: Environment
): MonkeyObject {
  if (node instanceof Program) return evalProgram(node.statements, env);

  if (node instanceof ExpressionStatement)
    return evalMonkey(node.expression, env);

  if (node instanceof StringLiteral) return new MonkeyString(node.value);

  if (node instanceof IntegerLiteral) return new Integer(node.value);

  if (node instanceof BooleanLiteral)
    return nativeBooleanToBooleanObject(node.value);

  if (node instanceof Null) return NULL;

  if (node instanceof PrefixExpression) {
    const right = evalMonkey(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }

  if (node instanceof InfixExpression) {
    const left = evalMonkey(node.left, env);
    if (isError(left)) {
      return left;
    }
    const right = evalMonkey(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evalInfixExpression(node.operator, left, right);
  }

  if (node instanceof BlockStatement) return evalBlockStatement(node, env);

  if (node instanceof IfExpression) return evalIfExpression(node, env);

  if (node instanceof ReturnStatement) {
    const value = evalMonkey(node.returnValue, env);
    if (isError(value)) {
      return value;
    }
    return new ReturnValue(value);
  }

  if (node instanceof LetStatement) {
    const value = evalMonkey(node.value, env);
    if (isError(value)) {
      return value;
    }
    env.set(node.name.value, value);
  }

  if (node instanceof Identifier) return evalIdentifier(node, env);

  if (node instanceof FunctionLiteral) {
    const params = node.parameters;
    const body = node.body;
    return new Function(params, body, env);
  }

  if (node instanceof CallExpression) {
    const functionObject = evalMonkey(node.func, env);
    if (isError(functionObject)) {
      return functionObject;
    }
    const args = evalExpressions(node.args, env);
    if (args.length === 1 && isError(args[0])) {
      return args[0];
    }
    return applyFunction(functionObject, args);
  }

  return null;
}

function applyFunction(fn: MonkeyObject, args: MonkeyObject[]): MonkeyObject {
  if (fn instanceof Function) {
    const extendedEnv = extendFunctionEnv(fn, args);
    const evaluated = evalMonkey(fn.body, extendedEnv);
    return unwrapReturnValue(evaluated);
  }

  if (fn instanceof Builtin) {
    return fn.fn(...args);
  }

  return new MonkeyError(`not a function: ${fn.type()}`);
}

function extendFunctionEnv(fn: Function, args: MonkeyObject[]): Environment {
  const env = new Environment({ outer: fn.env });

  fn.parameters.forEach((param, i) => {
    env.set(param.value, args[i]);
  });

  return env;
}

function unwrapReturnValue(obj: MonkeyObject): MonkeyObject {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }

  return obj;
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

function evalExpressions(exps: Expression[], env: Environment) {
  let result: MonkeyObject[] = [];

  for (let exp of exps) {
    const evaluated = evalMonkey(exp, env);

    if (isError(evaluated)) {
      return [evaluated];
    }

    result.push(evaluated);
  }

  return result;
}

function evalIdentifier(node: Identifier, env: Environment): MonkeyObject {
  const val = env.get(node.value);
  if (val) {
    return val;
  }
  const builtin = builtins[node.value];
  if (builtin) {
    return builtin;
  }
  return newError(`identifier not found: ${node.value}`);
}

function evalIfExpression(node: IfExpression, env: Environment): MonkeyObject {
  const condition = evalMonkey(node.condition, env);
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return evalMonkey(node.consequence, env);
  } else if (node.alternative) {
    return evalMonkey(node.alternative, env);
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
  if (left.type() === TYPE.STRING_OBJ && right.type() === TYPE.STRING_OBJ) {
    return evalStringInfixExpression(operator, left, right);
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

function evalStringInfixExpression(
  operator: string,
  left: MonkeyObject,
  right: MonkeyObject
) {
  if (operator !== "+") {
    return newError(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
  }

  const leftVal = (left as MonkeyString).value;
  const rightVal = (right as MonkeyString).value;
  return new MonkeyString(leftVal + rightVal);
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

function evalBlockStatement(
  block: BlockStatement,
  env: Environment
): MonkeyObject {
  let result: MonkeyObject;

  for (let statement of block.statements) {
    result = evalMonkey(statement, env);

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

function evalProgram(statements: Statement[], env: Environment) {
  let result: MonkeyObject;

  for (let statement of statements) {
    result = evalMonkey(statement, env);

    if (result instanceof ReturnValue) {
      return result.value;
    }

    if (result instanceof MonkeyError) {
      return result;
    }
  }

  return result;
}
