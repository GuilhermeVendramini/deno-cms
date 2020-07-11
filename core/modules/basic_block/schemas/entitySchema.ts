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
      body: vs.string({ ifUndefined: "", ifEmptyString: "" }),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
