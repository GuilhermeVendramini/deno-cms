import vs from "value_schema";

let entitySchema = {
  title: vs.string({
    trims: true,
    maxLength: {
      length: 150,
      trims: true,
    },
  }),
  data: vs.object({
    schemaObject: {
      references: vs.array({
        ifUndefined: [],
        separatedBy: ",",
        each: {
          schema: vs.object({
            schemaObject: {
              field: vs.string(),
              entity: vs.object(),
              weight: vs.number(),
            },
          }),
          ignoresErrors: false,
        },
      }),
      carousels: vs.array({
        ifUndefined: [],
        separatedBy: ",",
        each: {
          schema: vs.object({
            schemaObject: {
              field: vs.string(),
              entity: vs.object(),
              weight: vs.number(),
            },
          }),
          ignoresErrors: false,
        },
      }),
      front: vs.boolean({ ifUndefined: false, ifNull: false }),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
