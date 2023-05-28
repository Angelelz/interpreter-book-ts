import readline from "readline/promises";
import os from "os";
import { start } from "./repl/repl.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// invoke userInfo() method
const userInfo = os.userInfo();

// async function main() {
const user = userInfo.username;

rl.write(`Hello ${user}! This is the Mokiy programming languge!\n`);
rl.write("Feel free to type in commands\n");

await start(rl);
rl.close();
// }

// await main();
