import {
    Border,
    Button,
    Canvas,
    CheckBox,
    ContentButton,
    ImageButton,
    ImageWidget,
    LayoutBox,
    Panel,
    SelectionBox,
    Slider,
    TextBox,
    WebBrowser,
    Widget,
    WidgetSwitcher,
} from "@tabletop-playground/api";

/**
 * Utility class to clear UI listeners and containers recursively.
 * Intended to be called when destroying UI to aid garbage collection.
 *
 * In a clean world this is not necessary, this is more of a precaution.
 */
export class UiScrub {
    private readonly _toScrub: Array<Widget> = [];

    constructor(widget: Widget) {
        this._toScrub.push(widget);
        while (this._toScrub.length > 0) {
            const nextWidget: Widget | undefined = this._toScrub.pop();
            if (nextWidget) {
                this._scrubOne(nextWidget);
            }
        }
    }

    _scrubOne(widget: Widget): void {
        // Border
        if (widget instanceof Border) {
            const child: Widget | undefined = widget.getChild();
            if (child) {
                this._toScrub.push(child);
            }
            widget.setChild(undefined);
        }

        // Button
        if (widget instanceof Button) {
            widget.onClicked.clear();
        }

        // Canvas
        if (widget instanceof Canvas) {
            const children: Array<Widget> = widget.getChildren();
            for (const child of children) {
                this._toScrub.push(child);
                widget.removeChild(child);
            }
        }

        // CheckBox
        if (widget instanceof CheckBox) {
            widget.onCheckStateChanged.clear();
        }

        // ContentButton
        if (widget instanceof ContentButton) {
            widget.onClicked.clear();
            const child: Widget | undefined = widget.getChild();
            if (child) {
                this._toScrub.push(child);
            }
            widget.setChild(undefined);
        }

        // ImageButton
        if (widget instanceof ImageButton) {
            widget.onClicked.clear();
        }

        // ImageWidget
        if (widget instanceof ImageWidget) {
            widget.onImageLoaded.clear();
        }

        // LayoutBox
        if (widget instanceof LayoutBox) {
            const child: Widget | undefined = widget.getChild();
            if (child) {
                this._toScrub.push(child);
            }
            widget.setChild(undefined);
        }

        // MultilineTextBox
        // n/a

        // Panel
        if (widget instanceof Panel) {
            const children: Array<Widget> = widget.getAllChildren();
            for (const child of children) {
                this._toScrub.push(child);
            }
            widget.removeAllChildren();
        }

        // ProgressBar
        // n/a

        // RichText
        // n/a

        // SelectionBox
        if (widget instanceof SelectionBox) {
            widget.onSelectionChanged.clear();
        }

        // Slider
        if (widget instanceof Slider) {
            widget.onValueChanged.clear();
        }

        // Text
        // n/a

        // TextBox
        if (widget instanceof TextBox) {
            widget.onTextChanged.clear();
            widget.onTextCommitted.clear();
        }

        // WebBrowser
        if (widget instanceof WebBrowser) {
            widget.onLoadFinished.clear();
            widget.onLoadStarted.clear();
            widget.onURLChanged.clear();
        }

        // WidgetSwitcher
        if (widget instanceof WidgetSwitcher) {
            const children: Array<Widget> = widget.getAllChildren();
            for (const child of children) {
                this._toScrub.push(child);
            }
            widget.removeAllChildren();
        }
    }
}
