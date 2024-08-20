import {
    PLASTIC_COLORS,
    PLASTIC_COLORS_SPECTRUM,
    RAW_COLORS,
    RAW_COLORS_SPECTRUM,
    RGB,
    WIDGET_COLORS,
    WIDGET_COLORS_SPECTRUM,
} from "./color-mapping.data";

import { LinearRegression, setBackend } from "scikitjs";
import { SGDRegressor } from "scikitjs/dist/es5/linear_model/SgdRegressor";
import * as tensorflow from "@tensorflow/tfjs";

setBackend(tensorflow);

function centerRGBs(colors: Array<RGB>): void {
    colors.forEach((rgb: RGB): void => {
        rgb[0] = rgb[0] - 0.5;
        rgb[1] = rgb[1] - 0.5;
        rgb[2] = rgb[2] - 0.5;
    });
}
centerRGBs(PLASTIC_COLORS);
centerRGBs(WIDGET_COLORS);
centerRGBs(RAW_COLORS);
centerRGBs(PLASTIC_COLORS_SPECTRUM);
centerRGBs(WIDGET_COLORS_SPECTRUM);
centerRGBs(RAW_COLORS_SPECTRUM);

// Because we are using squares, center values around [-0.5:0.5]
const raw = {
    R: RAW_COLORS.map(([r, _g, _b]) => r),
    G: RAW_COLORS.map(([_r, g, _b]) => g),
    B: RAW_COLORS.map(([_r, _g, b]) => b),

    RS: RAW_COLORS_SPECTRUM.map(([r, _g, _b]) => r),
    GS: RAW_COLORS_SPECTRUM.map(([_r, g, _b]) => g),
    BS: RAW_COLORS_SPECTRUM.map(([_r, _g, b]) => b),
};

async function processOne(channel: Array<number>, raw: Array<Array<number>>) {
    let best;
    let bestScore = 0;
    for (let i = 0; i < 20; i++) {
        const model: SGDRegressor = await new LinearRegression({
            fitIntercept: true,
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

async function processAll() {
    let result;

    console.log("----------------------------------------");

    result = {
        r: await processOne(raw.R, PLASTIC_COLORS),
        g: await processOne(raw.G, PLASTIC_COLORS),
        b: await processOne(raw.B, PLASTIC_COLORS),
        score: 0,
    };
    result.score = (result.r!.score + result.g!.score + result.b!.score) / 3;
    console.log("plastic", JSON.stringify(result));

    result = {
        r: await processOne(raw.R, WIDGET_COLORS),
        g: await processOne(raw.G, WIDGET_COLORS),
        b: await processOne(raw.B, WIDGET_COLORS),
        score: 0,
    };
    result.score = (result.r!.score + result.g!.score + result.b!.score) / 3;
    console.log("widget", JSON.stringify(result));

    console.log("----------------------------------------");

    result = {
        r: await processOneSq(raw.R, PLASTIC_COLORS),
        g: await processOneSq(raw.G, PLASTIC_COLORS),
        b: await processOneSq(raw.B, PLASTIC_COLORS),
        score: 0,
    };
    result.score = (result.r!.score + result.g!.score + result.b!.score) / 3;
    console.log("plasticSq", JSON.stringify(result));

    result = {
        r: await processOneSq(raw.R, WIDGET_COLORS),
        g: await processOneSq(raw.G, WIDGET_COLORS),
        b: await processOneSq(raw.B, WIDGET_COLORS),
        score: 0,
    };
    result.score = (result.r!.score + result.g!.score + result.b!.score) / 3;
    console.log("widgetSq", JSON.stringify(result));

    console.log("----------------------------------------");

    result = {
        r: await processOneSq(raw.RS, PLASTIC_COLORS_SPECTRUM),
        g: await processOneSq(raw.GS, PLASTIC_COLORS_SPECTRUM),
        b: await processOneSq(raw.BS, PLASTIC_COLORS_SPECTRUM),
        score: 0,
    };
    result.score = (result.r!.score + result.g!.score + result.b!.score) / 3;
    console.log("plasticSqSpectrum", JSON.stringify(result));

    result = {
        r: await processOneSq(raw.RS, WIDGET_COLORS_SPECTRUM),
        g: await processOneSq(raw.GS, WIDGET_COLORS_SPECTRUM),
        b: await processOneSq(raw.BS, WIDGET_COLORS_SPECTRUM),
        score: 0,
    };
    result.score = (result.r!.score + result.g!.score + result.b!.score) / 3;
    console.log("widgetSqSpectrun", JSON.stringify(result));

    console.log("----------------------------------------");
}

processAll();
