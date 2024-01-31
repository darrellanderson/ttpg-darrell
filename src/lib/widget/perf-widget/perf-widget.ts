import {
    Border,
    Canvas,
    PlayerPermission,
    ScreenUIElement,
    Text,
    TextJustification,
    VerticalBox,
    WebBrowser,
    Widget,
    world,
} from "@tabletop-playground/api";
import { Perf, PerfReport } from "../../perf/perf";
import { SvgSparkline } from "../../svg/svg-sparkline";

export class PerfWidget {
    private readonly _perf: Perf;
    private readonly _webBrowser: WebBrowser;
    private readonly _fpsText: Text;
    private readonly _refreshHandle: timeout_handle;
    private readonly _visibleToPlayerSlots: number[] = [];
    private _screenUI: ScreenUIElement | undefined;

    constructor() {
        this._perf = new Perf();
        this._webBrowser = new WebBrowser();
        this._fpsText = new Text()
            .setFontSize(10)
            .setJustification(TextJustification.Center);
        this._refreshHandle = setInterval(() => {
            this.refresh();
        }, 1000);
    }

    destroy(): void {
        clearInterval(this._refreshHandle);
        this._perf.destroy();
    }

    refresh(): this {
        // Browser.
        const fpsHistory: number[] = this._perf.getFpsHistory();
        const url: string = SvgSparkline.url(fpsHistory);
        this._webBrowser.setURL(url);

        // Summary.
        const report: PerfReport = this._perf.getReport();
        this._fpsText.setText(`FPS ${report.fps.toFixed(1)}`);
        return this;
    }

    getWidget(): Widget {
        const panel = new VerticalBox()
            .addChild(this._webBrowser, 85)
            .addChild(this._fpsText, 15);
        return new Border().setChild(panel);
    }

    toggleVisibility(playerSlot: number): this {
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
        return this;
    }

    attachToScreen(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }

        const playerPermission = new PlayerPermission().setPlayerSlots(
            this._visibleToPlayerSlots
        );

        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 1.2;
        this._screenUI.anchorY = 1.4;
        this._screenUI.players = playerPermission;
        this._screenUI.positionX = 1;
        this._screenUI.positionY = 1;
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = true;
        this._screenUI.width = SvgSparkline.WIDTH;
        this._screenUI.height = Math.round((SvgSparkline.HEIGHT * 100) / 85); // fixed svg aspect ratio
        this._screenUI.widget = this.getWidget();
        world.addScreenUI(this._screenUI);

        return this;
    }

    detach(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        return this;
    }
}
