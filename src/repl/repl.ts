import type { Interface } from "readline/promises";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { evalMonkey } from "../evaluator/evaluator.js";

const PROMPT = ">> ";
const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
  \\ '- ,\\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '-----'
`;

export const start = async (rl: Interface) => {
  let scanner = await rl.question(PROMPT);

  while (scanner !== "exit") {
    if (!scanner) {
      return;
    }

    const l = new Lexer(scanner);
    const p = new Parser(l);

    const program = p.parseProgram();

    if (p.errors.length !== 0) {
      printParserErrors(p.errors);
      scanner = await rl.question(PROMPT);
      continue;
    }
    const evaluated = evalMonkey(program);
    if (evaluated) {
      console.log(evaluated.inspect(), "\n");
    }

    scanner = await rl.question(PROMPT);
  }
};

function printParserErrors(errors: string[]) {
  console.log(MONKEY_FACE);
  console.log("Woops! We ran into some monkey business here!");
  console.log(" parser errors:");
  errors.forEach((msg) => console.log(`\t${msg}\n`));
}

// await start();
// rl.close();
