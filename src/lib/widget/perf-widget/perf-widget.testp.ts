import { ErrorHandler } from "../../error-handler/error-handler";
import { PerfWidget } from "./perf-widget";

new ErrorHandler().init();
new PerfWidget().attachToScreen();
