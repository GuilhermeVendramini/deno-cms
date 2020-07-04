import vs from "value_schema";

const entitySchema = {
  data: vs.object({
    schemaObject: {
      title: vs.string({
        trims: true,
        maxLength: {
          length: 150,
          trims: true,
        },
      }),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
