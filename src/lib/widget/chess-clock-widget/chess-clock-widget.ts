import { Button, VerticalBox, Widget } from "@tabletop-playground/api";
import {
    IWindowWidget,
    WindowWidgetParams,
} from "../../ui/window/window-params";
import { ChessClockData } from "./chess-clock-data";

export class ChessClockWidget implements IWindowWidget {
    private readonly _chessClockData: ChessClockData;
    private readonly _playerButtons: Array<Button> = [];

    private _intervalUpdateWidget: NodeJS.Timeout | undefined = undefined;

    constructor(chessClockData: ChessClockData) {
        this._chessClockData = chessClockData;

        const playerCount: number = this._chessClockData.getPlayerCount();
        if (playerCount <= 0) {
            throw new Error("invalid player count");
        }

        for (let i: number = 0; i < playerCount; i++) {
            const button: Button = new Button().setText("Player " + i);
            this._playerButtons.push(button);
        }

        this.update();
    }

    create(params: WindowWidgetParams): Widget {
        this._intervalUpdateWidget = setInterval(() => {
            this.update();
        }, 1000);

        const widget: VerticalBox = new VerticalBox().setChildDistance(
            params.spacing
        );
        return widget;
    }

    destroy(): void {
        if (this._intervalUpdateWidget !== undefined) {
            clearInterval(this._intervalUpdateWidget);
            this._intervalUpdateWidget = undefined;
        }
    }

    update(): void {}
}
