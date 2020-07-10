import vs from "value_schema";

const entitySchema = {
  title: vs.string({
    trims: true,
    maxLength: {
      length: 150,
      trims: true,
    },
  }),
  data: vs.object({
    schemaObject: {
      video: vs.string(),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
