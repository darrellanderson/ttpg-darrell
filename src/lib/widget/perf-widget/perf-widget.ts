import {
    Border,
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
import { UiVisibility } from "../../ui-visibility/ui-visibility";

export class PerfWidget {
    private readonly _perf: Perf;
    private readonly _webBrowser: WebBrowser;
    private readonly _fpsText: Text;
    private readonly _screenUI: ScreenUIElement;
    private readonly _uiVisibility: UiVisibility;
    private readonly _refreshHandle: timeout_handle;

    constructor() {
        this._perf = new Perf();
        this._webBrowser = new WebBrowser();
        this._fpsText = new Text()
            .setFontSize(10)
            .setJustification(TextJustification.Center);

        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 1.2;
        this._screenUI.anchorY = 1.4;
        this._screenUI.positionX = 1;
        this._screenUI.positionY = 1;
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = true;
        this._screenUI.width = SvgSparkline.WIDTH;
        this._screenUI.height = Math.round((SvgSparkline.HEIGHT * 100) / 85); // fixed svg aspect ratio
        this._screenUI.widget = this.getWidget();

        this._uiVisibility = new UiVisibility(this._screenUI).setNone();
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
        this._uiVisibility.togglePlayer(playerSlot);
        return this;
    }

    attachToScreen(): this {
        world.addScreenUI(this._screenUI);
        return this;
    }

    detach(): this {
        world.removeScreenUIElement(this._screenUI);
        return this;
    }
}
