import vs from "value_schema";

let entitySchema = {
  title: vs.string({
    maxLength: {
      length: 150,
      trims: true,
    },
  }),
  data: vs.object({
    schemaObject: {
      items: vs.array({
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
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
