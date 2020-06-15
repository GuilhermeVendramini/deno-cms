import vs from "value_schema";

const basicPageSchema = {
  title: vs.string({
    maxLength: {
      length: 255,
      trims: false,
    },
  }),
  published: vs.boolean(),
};

export default basicPageSchema;
