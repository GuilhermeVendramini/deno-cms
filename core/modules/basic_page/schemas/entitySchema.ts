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
      body: vs.string({ ifUndefined: "", ifEmptyString: "" }),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
