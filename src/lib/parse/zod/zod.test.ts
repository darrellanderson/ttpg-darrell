/**
 * No need for our own class, but still test zod works as documented.
 */

import { z } from "zod";

const ZOD_SCHEMA = z
    .object({
        foo: z.number(),
        bar: z.string().optional(),
    })
    .strict();

type ZOD_SCHEMA_TYPE = z.infer<typeof ZOD_SCHEMA>;

it("zod validate (success)", () => {
    const data = {
        foo: 1,
        bar: "abc",
    };
    const typedData: ZOD_SCHEMA_TYPE = ZOD_SCHEMA.parse(data);
    expect(typedData.foo).toEqual(1);
    expect(typedData.bar).toEqual("abc");
});

it("zod validate (success, missing optional)", () => {
    const data = {
        foo: 1,
    };
    const typedData: ZOD_SCHEMA_TYPE = ZOD_SCHEMA.parse(data);
    expect(typedData.foo).toEqual(1);
    expect(typedData.bar).toBeUndefined;
});

it("validate (error, missing required)", () => {
    const data = {
        bar: "abc",
    };
    expect(() => {
        ZOD_SCHEMA.parse(data);
    }).toThrow("Required");
});

it("validate (error, unknown field with 'strict' enabled)", () => {
    const data = {
        foo: 1,
        bar: "abc",
        whatIsThisUnexpectedField: true,
    };
    expect(() => {
        ZOD_SCHEMA.parse(data);
    }).toThrow("Unrecognized key(s) in object: 'whatIsThisUnexpectedField'");
});
