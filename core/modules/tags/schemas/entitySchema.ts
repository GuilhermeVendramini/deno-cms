import vs from "value_schema";

const entitySchema = {
  title: vs.string({
    maxLength: {
      length: 255,
      trims: false,
    },
  }),
  published: vs.boolean(),
};

export default entitySchema;
