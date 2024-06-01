import { VerticalBox, Widget } from "@tabletop-playground/api";
import {
    IWindowWidget,
    WindowWidgetParams,
} from "../../ui/window/window-params";

export class ChessClockWidget implements IWindowWidget {
    private _intervalUpdateWidget: NodeJS.Timeout | undefined = undefined;

    constructor() {}

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
