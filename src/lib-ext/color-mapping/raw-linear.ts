import fs from "fs";
import { RGB } from "./color-mapping.data";

import { LinearRegression, setBackend } from "scikitjs";
import { SGDRegressor } from "scikitjs/dist/es5/linear_model/SgdRegressor";
import * as tensorflow from "@tensorflow/tfjs";

setBackend(tensorflow);

const rawColors: Array<RGB> = [];
const objColors: Array<RGB> = [];
const widgetColors: Array<RGB> = [];

const rawFile: string = "src/lib-ext/color-mapping/raw.txt";
const rawLines: Array<string> = fs.readFileSync(rawFile, "utf-8").split("\n");
for (const rawLine of rawLines) {
    const parts: Array<number> = rawLine
        .split(" ")
        .map((s) => Number.parseInt(s));

    let r: number | undefined;
    let g: number | undefined;
    let b: number | undefined;

    r = parts[1];
    g = parts[2];
    b = parts[3];
    if (r !== undefined && g !== undefined && b !== undefined) {
        rawColors.push([r / 255, g / 255, b / 255]);
    }

    r = parts[5];
    g = parts[6];
    b = parts[7];
    if (r !== undefined && g !== undefined && b !== undefined) {
        objColors.push([r / 255, g / 255, b / 255]);
    }

    r = parts[9];
    g = parts[10];
    b = parts[11];
    if (r !== undefined && g !== undefined && b !== undefined) {
        widgetColors.push([r / 255, g / 255, b / 255]);
    }
}

console.log(
    "|raw|=",
    rawColors.length,
    "|obj|=",
    objColors.length,
    "|widget|=",
    widgetColors.length
);

async function processOne(channel: Array<number>, raw: Array<Array<number>>) {
    let best;
    let bestScore = 0;
    for (let i = 0; i < 20; i++) {
        const model: SGDRegressor = await new LinearRegression({
            fitIntercept: true,
            modelFitOptions: {},
        }).fit(raw, channel);
        const score: number = model.score(raw, channel);
        if (score > bestScore) {
            const coefs: number[] = model.coef.arraySync().flat();
            best = {
                intercept: model.intercept as number,
                coefs,
                score,
            };
            const scrub = (x: number): number => Math.round(x * 10000) / 10000;
            best.intercept = scrub(best.intercept);
            best.coefs = best.coefs.map(scrub);
            best.score = scrub(best.score);
            bestScore = score;
        }
    }
    return best;
}

async function processOneSq(channel: Array<number>, raw: Array<Array<number>>) {
    raw = raw.map((entry: Array<number>): Array<number> => {
        const result: Array<number> = [...entry];
        for (const value of entry) {
            result.push(value * value);
        }
        return result;
    });
    return await processOne(channel, raw);
}

const raw = {
    R: rawColors.map(([r, _g, _b]) => r),
    G: rawColors.map(([_r, g, _b]) => g),
    B: rawColors.map(([_r, _g, b]) => b),
};

async function processAll() {
    let result;

    console.log("----------------------------------------");

    result = {
        r: await processOne(raw.R, objColors),
        g: await processOne(raw.G, objColors),
        b: await processOne(raw.B, objColors),
        score: 0,
    };
    result.score = Math.min(result.r!.score, result.g!.score, result.b!.score);
    console.log("plastic", JSON.stringify(result));

    result = {
        r: await processOne(raw.R, widgetColors),
        g: await processOne(raw.G, widgetColors),
        b: await processOne(raw.B, widgetColors),
        score: 0,
    };
    result.score = Math.min(result.r!.score, result.g!.score, result.b!.score);
    console.log("widget", JSON.stringify(result));

    console.log("----------------------------------------");

    result = {
        r: await processOneSq(raw.R, objColors),
        g: await processOneSq(raw.G, objColors),
        b: await processOneSq(raw.B, objColors),
        score: 0,
    };
    result.score = Math.min(result.r!.score, result.g!.score, result.b!.score);
    console.log("plasticSq", JSON.stringify(result));

    result = {
        r: await processOneSq(raw.R, widgetColors),
        g: await processOneSq(raw.G, widgetColors),
        b: await processOneSq(raw.B, widgetColors),
        score: 0,
    };
    result.score = Math.min(result.r!.score, result.g!.score, result.b!.score);
    console.log("widgetSq", JSON.stringify(result));

    console.log("----------------------------------------");
}

processAll();
