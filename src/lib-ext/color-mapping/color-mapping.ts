/**
 * In TTPG the "player slot color" is redered accurately for the text in the
 * chat window, but may change when used in UI or as an object's primary color.
 *
 * This script contains a series of potential colors (Andcat's "good" player
 * color choices) and what colors they render as in game (UI and top-face of a
 * cube with roughness=1, metallic=0 and standard lighting) extracting from a
 * screenshot.
 *
 * It estimates the transform between a source color and on-screen colors via
 * mutlivariate multiple regression, doing the regression from screen color to
 * source color to calculate the desired source color given a desired on-screen
 * color.
 */

// https://www.npmjs.com/package/ml-regression-multivariate-linear
import MLR from "ml-regression-multivariate-linear";
import {
    PLASTIC_COLORS,
    RAW_COLORS,
    WIDGET_COLORS,
} from "./color-mapping.data";

let x; //: Array<RGB>;
let y; //: Array<RGB>;
let mlr: MLR;

x = PLASTIC_COLORS.map(([r, g, b]) => [r, g, b]);
y = RAW_COLORS.map(([r, g, b]) => [r, g, b]);
mlr = new MLR(x, y);

console.log(mlr.toJSON());
console.log(x[0], mlr.predict(x[0]!), y[0]);

x = WIDGET_COLORS;
y = RAW_COLORS;
mlr = new MLR(x, y);

console.log(mlr.toJSON());
console.log(x[0], mlr.predict(x[0]!), y[0]);
