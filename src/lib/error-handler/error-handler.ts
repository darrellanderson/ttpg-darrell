import { GameWorld, world } from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { IGlobal } from "../global/i-global";

// This probably belongs in @TabletopPlayground.api?
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
    // eslint-disable-next-line no-var
    var $uncaughtException: (e: string) => void;
}

export type ErrorLocation = {
    method?: string;
    file: string; // relative to Scripts directory
    jsLine: number;
    jsColumn: number;
    tsLine?: number;
};

/**
 * Report stack traces with filenames relative to the Script directory,
 * use source mappings to report both js and transpiled ts line numbers.
 *
 * Add `"sourceMap": true` to the compilerOptions of your tsconfig.json.
 *
 * Install the error handler via `new ErrorHandler().init()`.
 */
export class ErrorHandler implements IGlobal {
    // Event that sends the rewritten error (line mapping).
    public static readonly onError: TriggerableMulticastDelegate<
        (error: string, rawError?: string) => void
    > = new TriggerableMulticastDelegate<(error: string) => void>();

    private readonly _reverseBase64Alphabet: Map<string, number>;
    private readonly _fileToLineMapping: {
        [key: string]: Array<number>; // jsFile line number indexed to tsFile line number
    } = {};

    constructor() {
        const base64Alphabet =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        this._reverseBase64Alphabet = new Map(
            base64Alphabet.split("").map((c: string, i: number) => [c, i])
        );
    }

    init() {
        // Arg is a string which inludes the stack trace.
        globalThis.$uncaughtException = (error: string) => {
            const rewrittenError = this.rewriteError(error);
            this.reportError(rewrittenError);
            ErrorHandler.onError.trigger(rewrittenError, error);
        };
    }

    reportError(error: string) {
        const msg: Array<string> = [];
        msg.push("----------");
        msg.push(error);
        msg.push("----------");
        console.log(msg.join("\n"));
    }

    rewriteError(error: string): string {
        const rewrite: Array<string> = [];
        for (const errorLine of error.split("\n")) {
            const errorLocation = this.parseErrorLocation(errorLine);
            if (errorLocation) {
                // Report JavaScript line number, and TypeScript if mapping exists.
                let line: string = `  at ${errorLocation.method} ${errorLocation.file}:${errorLocation.jsLine}`;
                if (errorLocation.tsLine !== undefined) {
                    line += ` <= .ts:${errorLocation.tsLine}`;
                }
                rewrite.push(line);
            } else {
                rewrite.push(errorLine);
            }
        }
        return rewrite.join("\n");
    }

    /**
     * Parse error location from a single line of a stack trace.
     *
     * @param stackTraceLine
     * @returns error location
     */
    parseErrorLocation(stackTraceLine: string): ErrorLocation | undefined {
        let errorLocation: ErrorLocation | undefined;

        // Two flavors:
        // "at file://.../Scripts/.../file.js:#:#"
        // "at x (file://.../Scripts/.../file.js:#:#)"
        const re1 = /at file:\/\/.*Scripts\/(.*\.js):([0-9]*):([0-9]*)/;
        const re2 =
            /at (.*) \(file:\/\/.*Scripts\/(.*\.js):([0-9]*):([0-9]*)\)/;
        let m: RegExpMatchArray | null;
        let method: string | undefined;
        let file: string | undefined;
        let jsLine: string | undefined;
        let jsColumn: string | undefined;

        m = stackTraceLine.match(re1);
        if (m) {
            file = m[1];
            jsLine = m[2];
            jsColumn = m[3];
        } else {
            m = stackTraceLine.match(re2);
            if (m) {
                method = m[1];
                file = m[2];
                jsLine = m[3];
                jsColumn = m[4];
            }
        }

        if (
            method === undefined &&
            file !== undefined &&
            jsLine !== undefined &&
            jsColumn !== undefined
        ) {
            errorLocation = {
                file,
                jsLine: Number.parseInt(jsLine),
                jsColumn: Number.parseInt(jsColumn),
            };
        } else if (
            method !== undefined &&
            file !== undefined &&
            jsLine !== undefined &&
            jsColumn !== undefined
        ) {
            errorLocation = {
                method,
                file,
                jsLine: Number.parseInt(jsLine),
                jsColumn: Number.parseInt(jsColumn),
            };
        }

        if (errorLocation) {
            // Attempt to read source mapping.
            const lineMapping: Array<number> | undefined = this.getLineMapping(
                errorLocation.file
            );
            if (lineMapping) {
                errorLocation.tsLine = lineMapping[errorLocation.jsLine];
            }
        }

        return errorLocation;
    }

    /**
     * Get the "{x}.js.map" file contents as a string.
     *
     * @param jsFile
     * @returns
     */
    getMap(jsFile: string): string | undefined {
        for (const pkg of world.getAllowedPackages()) {
            if (pkg.getScriptFiles().includes(jsFile)) {
                const mapFile: string = jsFile + ".map";
                const map: string = world.importText(
                    mapFile,
                    pkg.getUniqueId()
                );
                if (map && map.length > 0) {
                    return map;
                }
                return undefined;
            }
        }
    }

    getLineMapping(jsFile: string): Array<number> | undefined {
        if (jsFile === "") {
            return undefined;
        }

        // Check cache.
        let lineMapping: Array<number> | undefined =
            this._fileToLineMapping[jsFile];
        if (lineMapping) {
            if (lineMapping.length === 0) {
                return undefined; // NACK entry
            }
            return lineMapping;
        }

        // Add emtpy cache entry, fill it in later if available.
        this._fileToLineMapping[jsFile] = [];

        const json: string | undefined = this.getMap(jsFile);
        if (!json) {
            return; // no map file (need to enable source mapping in tsConfig)
        }

        let map;
        try {
            map = JSON.parse(json);
        } catch (e) {
            console.log(
                `ErrorHandler.getLineMapping: JSON.parse failed for "${jsFile}"`
            );
            return; // bad map file
        }

        if (typeof map.mappings !== "string") {
            console.log(
                `ErrorHandler.getLineMapping: bad mappings entry for "${jsFile}"`
            );
            return; // bad mappings entry
        }

        lineMapping = this.parseSourceMappings(map.mappings);
        this._fileToLineMapping[jsFile] = lineMapping; // update cache

        return lineMapping;
    }

    parseSourceMappings(mappingsEncoded: string): Array<number> {
        const lineMapping: Array<number> = [];
        let lastTsLine: number = 0;
        const mappings: Array<string> = mappingsEncoded.split(";"); // one entry per line
        for (const mapping of mappings) {
            const segments: Array<string> = mapping.split(",");
            const firstSegment: string | undefined = segments[0];
            if (firstSegment !== undefined) {
                const fields = this.parseSourceMappingSegment(firstSegment);
                // [delta-js-col, src-index, delta-ts-line, delta-ts-col, names-index]
                let tsLine: number = fields[2] ?? -1;
                if (tsLine > 0) {
                    tsLine += lastTsLine;
                    lastTsLine = tsLine;
                }
                lineMapping.push(tsLine);
            }
        }
        return lineMapping;
    }

    parseSourceMappingSegment(segment: string): Array<number> {
        // Adapted from https://www.lucidchart.com/techblog/2019/08/22/decode-encoding-base64-vlqs-source-maps/
        const BIT_MASK = {
            LEAST_FOUR_BITS: 0b1111,
            LEAST_FIVE_BITS: 0b11111,
            CONTINUATION_BIT: 0b100000,
            SIGN_BIT: 0b1,
        };

        // Break into sextets (6-bit numbers).
        const sextets: Array<number> = segment.split("").map((c) => {
            const sextet = this._reverseBase64Alphabet.get(c);
            if (sextet === undefined) {
                throw new Error(`${segment} is not a valid base64 encoded VLQ`);
            }
            return sextet;
        });

        // Group continued sextets.
        const vlqs: Array<Array<number>> = [];
        let vlq: Array<number> = [];
        for (const sextet of sextets) {
            vlq.push(sextet);
            if ((sextet & BIT_MASK.CONTINUATION_BIT) === 0) {
                vlqs.push(vlq);
                vlq = [];
            }
        }
        if (vlq.length > 0) {
            throw new Error(
                `Malformed VLQ sequence "${segment}": The last VLQ never ended.`
            );
        }

        // Decode sextet groups.
        const result: Array<number> = [];
        for (const vlq of vlqs) {
            let x = 0;
            let isNegative = false;
            vlq.reverse().forEach((sextet: number, index: number) => {
                if (index === vlq.length - 1) {
                    isNegative = (sextet & BIT_MASK.SIGN_BIT) === 1;
                    sextet >>>= 1; // discard sign bit
                    x <<= 4;
                    x |= sextet & BIT_MASK.LEAST_FOUR_BITS;
                } else {
                    x <<= 5;
                    x |= sextet & BIT_MASK.LEAST_FIVE_BITS;
                }
            });
            result.push(isNegative ? -x : x);
        }
        return result;
    }
}

if (GameWorld.getExecutionReason() === "unittest") {
    afterEach(() => {
        ErrorHandler.onError.clear();
    });
}
