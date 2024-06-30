import { Button, Widget, WidgetSwitcher } from "@tabletop-playground/api";

/**
 * Two-stage button with a confirmation message requiring
 * an additional click.
 *
 * MUTATES THE GIVEN BUTTON, rewriting the button text to
 * the confirm message.
 */
export class ConfirmButton {
    private static readonly CONFIRM_TIMEOUT_MSECS = 3000;

    private readonly _wrappedButton: Button;
    private readonly _initialButton: Button;
    private readonly _switcher: WidgetSwitcher;

    private _confirmMessage: string = "Click again\nto confirm";
    private _confirmFontSize: number;

    private _confirmTimeoutHandle: timeout_handle | undefined = undefined;

    /**
     * Convert the given button into a two-stage button.
     *
     * @param wrapButton
     */
    constructor(wrapButton: Button) {
        this._wrappedButton = wrapButton;
        this._initialButton = new Button();
        this._switcher = new WidgetSwitcher();
        this._confirmFontSize = wrapButton.getFontSize() * 0.6;

        // Copy the wrapped button to the new initial button.
        this._initialButton
            .setBold(wrapButton.isBold())
            .setEnabled(wrapButton.isEnabled())
            .setFont(
                wrapButton.getFontFileName(),
                wrapButton.getFontPackageId()
            )
            .setFontSize(wrapButton.getFontSize())
            .setItalic(wrapButton.isItalic())
            .setJustification(wrapButton.getJustification())
            .setText(wrapButton.getText())
            .setTextColor(wrapButton.getTextColor())
            .setVisible(wrapButton.isVisible());

        // Rewrite the wrapped button to the confirm message.
        this._wrappedButton
            .setText(this._confirmMessage)
            .setFontSize(this._confirmFontSize);

        // Set up the switcher.
        this._switcher
            .addChild(this._initialButton)
            .addChild(this._wrappedButton);

        // Set up the initial button to switch to the wrapped button.
        this._initialButton.onClicked.add(() => {
            this._switcher.setActiveWidget(this._wrappedButton);
            if (this._confirmTimeoutHandle) {
                clearTimeout(this._confirmTimeoutHandle);
                this._confirmTimeoutHandle = undefined;
            }
            this._confirmTimeoutHandle = setTimeout(() => {
                // Confirm button not clicked in time, return to initial.
                this._confirmTimeoutHandle = undefined;
                this._switcher.setActiveWidget(this._initialButton);
            }, 3000);
        });
        this._wrappedButton.onClicked.add(() => {
            this._switcher.setActiveWidget(this._initialButton);
            if (this._confirmTimeoutHandle) {
                clearTimeout(this._confirmTimeoutHandle);
                this._confirmTimeoutHandle = undefined;
            }
        });
    }

    setConfirmFontSize(size: number): this {
        this._confirmFontSize = size;

        // Rewrite the wrapped button to the confirm message.
        this._wrappedButton
            .setText(this._confirmMessage)
            .setFontSize(this._confirmFontSize);

        return this;
    }

    setConfirmMessage(message: string): this {
        this._confirmMessage = message;

        // Rewrite the wrapped button to the confirm message.
        this._wrappedButton
            .setText(this._confirmMessage)
            .setFontSize(this._confirmFontSize);

        return this;
    }

    /**
     * Overall widget for the two-stage button.
     *
     * @returns {Widget}
     */
    getWidget(): Widget {
        return this._switcher;
    }
}
