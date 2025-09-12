import fs from "fs/promises";
import ts from "typescript";

const fileContent = await fs.readFile(
  "./src/types/client/generated-client.ts",
  "utf-8",
);
const sourceFile = ts.createSourceFile(
  "temp.ts",
  fileContent,
  ts.ScriptTarget.Latest,
  true,
);

const interfaces: string[] = [];

ts.forEachChild(sourceFile, (node) => {
  if (ts.isInterfaceDeclaration(node)) {
    const text = node.getText(sourceFile);

    // const fixedText = text.replace(
    //   /(\W)(Create|Update|Get|Delete|Patch)(\w+)(\W)/g,
    //   "$1I$2$3$4",
    // );

    interfaces.push(text);
  }
});

await fs.writeFile("./src/types/client-types.ts", interfaces.join("\n\n"));
console.log("Interfaces extracted!");
