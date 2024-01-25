import { Color } from "@tabletop-playground/api";
import { AbstractSetup, AbstractSetupParams } from "./abstract-setup";

it("getters (default)", () => {
    class MySetup extends AbstractSetup {}
    const mySetup = new MySetup();
    expect(mySetup.getPlayerSlot()).toEqual(-1);
    expect(mySetup.getPrimaryColor().toHex()).toEqual("FFFFFFFF");
    expect(mySetup.getSecondaryColor().toHex()).toEqual("000000FF");
});

it("getters (custom values)", () => {
    class MySetup extends AbstractSetup {}
    const params: AbstractSetupParams = {
        playerSlot: 7,
        primaryColor: new Color(0.1, 0.2, 0.3, 0.4),
        secondaryColor: new Color(0.5, 0.6, 0.7, 0.8),
    };
    const mySetup = new MySetup(params);
    expect(mySetup.getPlayerSlot()).toEqual(params.playerSlot);
    expect(mySetup.getPrimaryColor().toHex()).toEqual(
        params.primaryColor?.toHex()
    );
    expect(mySetup.getSecondaryColor().toHex()).toEqual(
        params.secondaryColor?.toHex()
    );
});
