import vs from "value_schema";

const entitySchema = {
  title: vs.string({
    maxLength: {
      length: 2,
      trims: true,
    },
  }),
  published: vs.boolean(),
};

export default entitySchema;
