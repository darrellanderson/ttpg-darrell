import {
    PlayerPermission,
    ScreenUIElement,
    WebBrowser,
    Widget,
    world,
} from "@tabletop-playground/api";
import { Perf } from "../../perf/perf";
import { SvgSparkline } from "../../svg/svg-sparkline";

export class PerfWidget {
    private readonly _perf: Perf;
    private readonly _webBrowser: WebBrowser;
    private readonly _refreshHandle: timeout_handle;
    private readonly _visibleToPlayerSlots: number[] = [];

    private _screenUI: ScreenUIElement | undefined;

    constructor() {
        this._perf = new Perf();
        this._webBrowser = new WebBrowser();
        this._refreshHandle = setTimeout(() => {
            this.refresh();
        }, 1000);
    }

    destroy(): void {
        clearTimeout(this._refreshHandle);
        this._perf.destroy();
    }

    refresh(): void {
        const fpsHistory: number[] = this._perf.getFpsHistory();
        const url: string = SvgSparkline.url(fpsHistory);
        this._webBrowser.setURL(url);
    }

    getWidget(): Widget {
        return this._webBrowser;
    }

    toggleVisibility(playerSlot: number): void {
        const index = this._visibleToPlayerSlots.indexOf(playerSlot);
        if (index >= 0) {
            this._visibleToPlayerSlots.splice(index, 1);
        } else {
            this._visibleToPlayerSlots.push(playerSlot);
        }

        if (this._screenUI) {
            this._screenUI.players = new PlayerPermission().setPlayerSlots(
                this._visibleToPlayerSlots
            );
            world.updateScreenUI(this._screenUI);
        }

        if (this._visibleToPlayerSlots.length === 0) {
            this.detach();
        } else if (!this._screenUI) {
            this.attachToScreen();
        }
    }

    attachToScreen(): void {
        // TODO XXX
    }

    detach(): void {}
}
