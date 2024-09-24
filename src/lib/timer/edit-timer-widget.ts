import {
    Button,
    HorizontalBox,
    Text,
    TextJustification,
    VerticalBox,
    Widget,
} from "@tabletop-playground/api";
import { Timer } from "./timer";

export class EditTimerWidget {
    private readonly _timer: Timer;
    private _scale: number = 1;

    constructor(timer: Timer) {
        this._timer = timer;
    }

    createWidget(): Widget {
        const fontSize: number = 12 * this._scale;
        const spacing: number = 10 * this._scale;

        let overallSeconds: number = Math.abs(this._timer.getSeconds());
        let seconds: number = Math.floor(overallSeconds % 60);
        let minutes: number = Math.floor(overallSeconds / 60) % 60;
        let hours: number = Math.floor(overallSeconds / 3600);

        const value: Text = new Text()
            .setFontSize(fontSize)
            .setJustification(TextJustification.Center)
            .setText("00 : 00 : 00");
        const updateValue = () => {
            const text: string = [
                String(hours).padStart(2, "0"),
                String(minutes).padStart(2, "0"),
                String(seconds).padStart(2, "0"),
            ].join(" : ");
            value.setText(text);

            overallSeconds = seconds + minutes * 60 + hours * 3600;
            if (this._timer.getCountdownFromSeconds() > 0) {
                overallSeconds =
                    this._timer.getCountdownFromSeconds() - overallSeconds;
            }
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
            hours = (hours + 1) % 100;
            updateValue();
        });
        addM.onClicked.add(() => {
            minutes = (minutes + 1) % 60;
            updateValue();
        });
        addS.onClicked.add(() => {
            seconds = (seconds + 1) % 60;
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
            hours = (hours + 99) % 100;
            updateValue();
        });
        subM.onClicked.add(() => {
            minutes = (minutes + 59) % 60;
            updateValue();
        });
        subS.onClicked.add(() => {
            seconds = (seconds + 59) % 60;
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
