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
      image: vs.string(),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
