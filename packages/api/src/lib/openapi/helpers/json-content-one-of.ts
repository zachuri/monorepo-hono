import { oneOf } from "./index.js";
import type { ZodSchema } from "./types.ts";

const jsonContentOneOf = <T extends ZodSchema>(
  schemas: T[],
  description: string,
) => {
  return {
    content: {
      "application/json": {
        schema: {
          oneOf: oneOf(schemas),
        },
      },
    },
    description,
  };
};

export default jsonContentOneOf;
