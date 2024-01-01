export class Vault {
    private readonly _uid: string;

    constructor(uid: string) {
        this._uid = uid;
    }

    clear(): void {}

    delete(key: string): void {}

    put(key: string, value: string): void {}

    get(key: string): string | undefined {
        return undefined;
    }
}
