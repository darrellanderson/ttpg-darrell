import { Color } from "@tabletop-playground/api";

export type AbstractSetupParams = {
    playerSlot?: number;
    primaryColor?: Color;
    secondaryColor?: Color;
};

/**
 * Store owner information.
 */
export abstract class AbstractSetup {
    private readonly _playerSlot: number;
    private readonly _primaryColor: Color;
    private readonly _secondaryColor: Color;

    constructor(params?: AbstractSetupParams) {
        this._playerSlot = params?.playerSlot ?? -1;
        this._primaryColor = params?.primaryColor ?? new Color(1, 1, 1, 1);
        this._secondaryColor = params?.secondaryColor ?? new Color(0, 0, 0, 1);
    }

    getPlayerSlot(): number {
        return this._playerSlot;
    }

    getPrimaryColor(): Color {
        return this._primaryColor;
    }

    getSecondaryColor(): Color {
        return this._secondaryColor;
    }
}
