import {
    Button,
    HorizontalBox,
    Text,
    TextJustification,
    VerticalBox,
    Widget,
} from "@tabletop-playground/api";
import { Timer, TimerBreakdown } from "./timer";

export class EditTimerWidget {
    private readonly _timer: Timer;
    private _scale: number = 1;

    constructor(timer: Timer) {
        this._timer = timer;
    }

    createWidget(): Widget {
        const timerBreakdown: TimerBreakdown = new TimerBreakdown(
            this._timer.getSeconds()
        );

        const fontSize: number = 12 * this._scale;
        const spacing: number = 10 * this._scale;

        const value: Text = new Text()
            .setFontSize(fontSize)
            .setJustification(TextJustification.Center)
            .setText("00 : 00 : 00");
        const updateValue = () => {
            const text: string = timerBreakdown.toTimeString();
            value.setText(text);
        };
        updateValue();

        const addH = new Button().setFontSize(fontSize).setText("+");
        const addM = new Button().setFontSize(fontSize).setText("+");
        const addS = new Button().setFontSize(fontSize).setText("+");
        const addPanel = new HorizontalBox()
            .setChildDistance(spacing)
            .addChild(addH, 1)
            .addChild(addM, 1)
            .addChild(addS, 1);
        addH.onClicked.add(() => {
            timerBreakdown.incrHours();
            updateValue();
        });
        addM.onClicked.add(() => {
            timerBreakdown.incrMinutes();
            updateValue();
        });
        addS.onClicked.add(() => {
            timerBreakdown.incrSeconds();
            updateValue();
        });

        const subH = new Button().setFontSize(fontSize).setText("-");
        const subM = new Button().setFontSize(fontSize).setText("-");
        const subS = new Button().setFontSize(fontSize).setText("-");
        const subPanel = new HorizontalBox()
            .setChildDistance(spacing)
            .addChild(subH, 1)
            .addChild(subM, 1)
            .addChild(subS, 1);
        subH.onClicked.add(() => {
            timerBreakdown.decrHours();
            updateValue();
        });
        subM.onClicked.add(() => {
            timerBreakdown.decrMinutes();
            updateValue();
        });
        subS.onClicked.add(() => {
            timerBreakdown.decrSeconds();
            updateValue();
        });

        const timerPlanet = new VerticalBox()
            .setChildDistance(spacing)
            .addChild(addPanel)
            .addChild(value)
            .addChild(subPanel);

        return timerPlanet;
    }
}
