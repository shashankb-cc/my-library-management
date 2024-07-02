import readline from "node:readline";
const readChar = (question: string): Promise<string> => {
  console.log(question);
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    const onData = async (key: Buffer) => {
      const char = key.toString("utf-8");
      process.stdin.setRawMode(false);
      resolve(char);
    };
    process.stdin.resume();
    process.stdin.once("data", onData);
  });
};

const readLine = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

async function loop() {
  while (true) {
    const op = await readChar(
      `Which operation you want to perform?\na - Add\ne - exit\n\nChoice:`
    );

    switch (op.toLowerCase()) {
      case "a":
        console.log("a - Add");
        await addOp();
        break;
      case "e":
        console.log("e - Exit");
        process.exit(0);
      default:
        console.log("Invalid operation!");
    }
    console.log("\n");
  }
}
loop();

const memory = new Map<string, number>();
async function addOp() {
  const a = +(await readLine(`Enter first number: `));
  console.log(a);
  const b = +(await readLine(`Enter second number: `));
  console.log(b);
  const memKey1 = `add,${a},${b}`;
  const memKey2 = `add,${b},${a}`;
  let result: number;

  if (memory.has(memKey1)) {
    result = memory.get(memKey1)!;
  } else if (memory.has(memKey2)) {
    result = memory.get(memKey2)!;
  } else {
    result = add(a, b);
    memory.set(memKey1, result);
    memory.set(memKey2, result);
  }

  console.log(`Result: ${result}`);
}

function add(a: number, b: number) {
  console.log("add function called");
  return a + b;
}
