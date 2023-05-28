import type { Interface } from "readline/promises";
import { New } from "../lexer/lexer.js";
import { TOKENS } from "../token/token.js";

const PROMPT = ">> ";

export const start = async (rl: Interface) => {
  let scanner = await rl.question(PROMPT);

  while (scanner !== "exit") {
    if (!scanner) {
      return;
    }

    const l = New(scanner);
    let tok = l.nextToken();
    while (tok.type !== TOKENS.EOF) {
      console.log(tok);
      tok = l.nextToken();
    }
    scanner = await rl.question(PROMPT);
  }
};

// await start();
// rl.close();
