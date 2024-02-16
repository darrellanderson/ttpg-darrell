#!env ts-node

/**
 * Call with the path to a CreateBoardParams config file.
 */

import * as fs from "fs-extra";
import * as yargs from "yargs";
import { CreateBoard } from "./create-board";

const args = yargs
    .options({
        i: {
            alias: "input",
            descript: "create-board-params config file",
            type: "string",
            demand: true,
        },
        f: {
            alias: "force",
            descript: "overwrite any existign output file?",
            type: "boolean",
        },
    })
    .parseSync(); // creates typed result

async function main() {
    const paramsJson: Buffer = fs.readFileSync(args.i);
    await CreateBoard.fromParamsJson(paramsJson).writeFiles();
}

main();
