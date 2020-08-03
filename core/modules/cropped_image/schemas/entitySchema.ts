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
      file: vs.string(),
      alt: vs.string(),
      cropper: vs.string({
        ifEmptyString: "",
        ifUndefined: "",
        ifNull: "",
      }),
    },
  }),
  published: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
