import {
    AbstractModel,
    ObjVertexForFace,
} from "../abstract-model/abstract-model";

type Vector = { x: number; y: number; z: number };

export class CylinderModel extends AbstractModel {
    private readonly _numSides: number;

    constructor(numSides: number) {
        super();
        this._numSides = numSides;
    }

    _getCircle(isTop: boolean): Array<Vector> {
        const circle: Array<Vector> = [];
        for (let i = 0; i < this._numSides; i++) {
            const theta: number = (i / this._numSides) * 2 * Math.PI;
            const x: number = Math.cos(theta) * 0.5;
            const y: number = Math.sin(theta) * 0.5;
            circle.push({ x, y, z: isTop ? 0.5 : -0.5 });
        }
        return circle;
    }

    _getSideNormals(circle: Array<Vector>): Array<Vector> {
        return circle.map((point): Vector => {
            const length = Math.sqrt(point.x * point.x + point.y * point.y);
            if (length === 0) {
                return { x: 0, y: 0, z: 0 };
            }
            return {
                x: Math.round((point.x / length) * 1000) / 1000,
                y: Math.round((point.y / length) * 1000) / 1000,
                z: 0,
            };
        });
    }

    _toVertexLine(vertex: Vector): string {
        // TTPG uses flipped X/Y, Z is up, OBJ Y is up.
        vertex.x = Math.round(vertex.x * 10000) / 10000;
        vertex.y = Math.round(vertex.y * 10000) / 10000;
        vertex.z = Math.round(vertex.z * 10000) / 10000;

        return `v ${vertex.y} ${vertex.z} ${vertex.x}`;
    }

    toModel(): string {
        const lines: Array<string> = [`# Cylinder, ${this._numSides} sides`];

        const topCircle: Array<{ x: number; y: number; z: number }> =
            this._getCircle(true);
        const botCircle: Array<{ x: number; y: number; z: number }> =
            this._getCircle(false);

        // Vertices.
        lines.push("");
        lines.push("# Top vertices");
        topCircle.forEach((vertex) => {
            lines.push(this._toVertexLine(vertex));
        });
        lines.push("");
        lines.push("# Bottom vertices");
        botCircle.forEach((vertex) => {
            lines.push(this._toVertexLine(vertex));
        });

        // Faces.
        const topFaceEntries: Array<ObjVertexForFace> = topCircle.map(
            (_vertex, index): ObjVertexForFace => {
                return `${index + 1}//`;
            }
        );
        const botFaceEntries: Array<ObjVertexForFace> = botCircle.map(
            (_vertex, index): ObjVertexForFace => {
                return `${this._numSides + index + 1}//`;
            }
        );

        lines.push(
            "",
            "# Top triangles",
            ...AbstractModel.triangleStrip(topFaceEntries, true),
            "",
            "# Bottom triangles",
            ...AbstractModel.triangleStrip(botFaceEntries, false),
            "",
            "# Side triangles",
            ...AbstractModel.triangleSides(topFaceEntries, botFaceEntries)
        );

        return lines.join("\n");
    }
}
