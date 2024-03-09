import { CylinderModel } from "./cylinder-model";

it("toModel (4 sides)", () => {
    const numSides: number = 4;
    const model: string = new CylinderModel(numSides).toModel();
    expect(model).toEqual(
        `# Cylinder, 4 sides
      
        # Top vertices
        v 0 0.5 0.5
        v 0.5 0.5 0
        v 0 0.5 -0.5
        v -0.5 0.5 0
        
        # Bottom vertices
        v 0 -0.5 0.5
        v 0.5 -0.5 0
        v 0 -0.5 -0.5
        v -0.5 -0.5 0
        
        # Top triangles
        f 1// 2// 4//
        f 2// 3// 4//
        
        # Bottom triangles
        f 8// 6// 5//
        f 8// 7// 6//
        
        # Side triangles
        f 1// 5// 6//
        f 6// 2// 1//
        f 2// 6// 7//
        f 7// 3// 2//
        f 3// 7// 8//
        f 8// 4// 3//
        f 4// 8// 5//
        f 5// 1// 4//`
            .split("\n")
            .map((line) => line.trim())
            .join("\n")
    );
});
