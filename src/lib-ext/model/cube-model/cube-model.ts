export class CubeModel {
    static toModel(width: number, height:number) {}
        width: number,
        height: number
    ): string {
        //
        return { width, height };
    }

    oldtoModel(): string {
        return `v 0.5 0.5 0.5
        v 0.5 0.5 -0.5
        v -0.5 0.5 -0.5
        v -0.5 0.5 0.5
        v 0.5 -0.5 0.5
        v 0.5 -0.5 -0.5
        v -0.5 -0.5 -0.5
        v -0.5 -0.5 0.5
        
        # Use 1/128 bleed gutters
        vt 0.0078125 0.0078125
        vt 0.9921875 0.0078125
        vt 0.9921875 0.9921875
        vt 0.0078125 0.9921875
        
        vn 0 1 0
        vn 1 0 0
        vn 0 0 1
        vn -1 0 0
        vn 0 0 -1
        vn 0 -1 0
        
        # Top (only top has UVs)
        f 1/1/1 2/2/1 3/3/1
        f 1/1/1 3/3/1 4/4/1
        
        # Bottom
        f 5//6 7//6 6//6
        f 5//6 8//6 7//6 
        
        # Sides
        f 1//2 5//2 2//2
        f 5//2 6//2 2//2
        
        f 2//3 6//3 3//3
        f 6//3 7//3 3//3
        
        f 3//4 7//4 4//4
        f 7//4 8//4 4//4
        
        f 4//5 8//5 5//5
        f 1//5 4//5 5//5`;
    }
}
