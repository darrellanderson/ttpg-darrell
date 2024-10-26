const REPLACE_REGEX = /(?<!\\){(?!#)(.*?)(?<!\\)}/gm;
const PLURAL_REGEX = /(?<!\\){#(.*?)(?<!\\)}/gm;
const PLURAL_SEPERATOR = /(?<!\\)\|/gm;

const _lang: { [key: string]: string } = {};

// Original author: ThatRobHuman
export const locale = (
    key: string,
    replacement?: { [key: string]: string | number }
): string => {
    const str = _lang[key];
    if (!str) {
        return key; // not registered, use key as stand-in
    }
    if (replacement === undefined) {
        return str; // no need for regex
    }
    return str
        .replace(REPLACE_REGEX, (match) => {
            const r =
                replacement[match.substring(1, match.length - 1)]?.toString();
            if (r === undefined) {
                return match;
            }
            return r;
        })
        .replace(PLURAL_REGEX, (match): string => {
            const [val, singular, plural] = match
                .substring(2, match.length - 1)
                .split(PLURAL_SEPERATOR);
            if (
                val === undefined ||
                singular === undefined ||
                plural === undefined
            ) {
                throw new Error("match failed");
            }
            const num = Number(replacement[val]);
            if (isNaN(num) || num === 0) {
                return plural;
            }
            if (num > 1) {
                return plural;
            }
            return singular;
        });
};

locale.inject = (dict: { [key: string]: string }): void => {
    for (const [k, v] of Object.entries(dict)) {
        _lang[k] = v;
    }
};
