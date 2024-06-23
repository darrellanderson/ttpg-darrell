export type WavefrontVector = {
    x: number;
    y: number;
    z: number;
};

export type WavefrontUV = {
    u: number;
    v: number;
};

export type WavefrontFaceEntry = {
    vertexIndexOneBased: number;
    normalIndexOneBased: number; // 0 for none
    uvIndexOneBased: number; // 0 for none
};

export type WavefrontFace = Array<WavefrontFaceEntry>;

/**
 * Parse and generate Wavefront OBJ files.
 */
export class WavefrontObj {
    private readonly _vertices: Array<WavefrontVector> = [];
    private readonly _normals: Array<WavefrontVector> = [];
    private readonly _uvs: Array<WavefrontUV> = [];
    private readonly _faces: Array<WavefrontFace> = [];

    addVertex(vertex: WavefrontVector): number {
        this._vertices.push(vertex);
        return this._vertices.length; // 1-based index
    }

    addNormal(normal: WavefrontVector): number {
        this._normals.push(normal);
        return this._normals.length; // 1-based index
    }

    addUV(uv: WavefrontUV): number {
        this._uvs.push(uv);
        return this._uvs.length; // 1-based index
    }

    addFace(face: WavefrontFace): void {
        this._faces.push(face);
    }

    getVertices(): Array<WavefrontVector> {
        return this._vertices;
    }

    load(fileData: string): this {
        const lines: Array<string> = fileData
            .toString()
            .split("\n")
            .map((line) => line.trim());

        for (const line of lines) {
            const parts: Array<string> = line
                .split(" ")
                .filter((s) => s.length > 0);
            const key: string = parts.shift() ?? "";

            if (key === "v") {
                const x: number = parseFloat(parts[0] ?? "0");
                const y: number = parseFloat(parts[1] ?? "0");
                const z: number = parseFloat(parts[2] ?? "0");
                this.addVertex({ x, y, z });
            } else if (key === "vn") {
                const x: number = parseFloat(parts[0] ?? "0");
                const y: number = parseFloat(parts[1] ?? "0");
                const z: number = parseFloat(parts[2] ?? "0");
                this.addNormal({ x, y, z });
            } else if (key === "vt") {
                const u: number = parseFloat(parts[0] ?? "0");
                const v: number = parseFloat(parts[1] ?? "0");
                this.addUV({ u, v });
            } else if (key === "f") {
                const face: WavefrontFace = parts.map((part) => {
                    const indices: Array<string> = part.split("/");
                    const vertexIndexOneBased: number = parseInt(
                        indices[0] ?? "0"
                    );
                    const uvIndexOneBased: number = parseInt(indices[1] ?? "0");
                    const normalIndexOneBased: number = parseInt(
                        indices[2] ?? "0"
                    );
                    return {
                        vertexIndexOneBased,
                        uvIndexOneBased,
                        normalIndexOneBased,
                    };
                });
                this.addFace(face);
            }
        }
        return this;
    }
}
