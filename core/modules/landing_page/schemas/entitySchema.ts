import vs from "value_schema";

const entitySchema = {
  data: vs.object({
    schemaObject: {
      title: vs.string({
        maxLength: {
          length: 150,
          trims: true,
        },
      }),
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
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
