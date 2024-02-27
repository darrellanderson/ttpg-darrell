#!env ts-node

/**
 * Call with the path to a CreateBoardParams config file.
 */

import * as fs from "fs-extra";
import * as yargs from "yargs";
import { CreateD6 } from "./create-d6";

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
            descript: "overwrite any existing output file?",
            type: "boolean",
        },
    })
    .parseSync(); // creates typed result

async function main() {
    const paramsJson: Buffer = fs.readFileSync(args.i);
    const createCardSheet = CreateD6.fromParamsJson(paramsJson);
    await createCardSheet.clean();
    await createCardSheet.writeFiles();
}

main();
