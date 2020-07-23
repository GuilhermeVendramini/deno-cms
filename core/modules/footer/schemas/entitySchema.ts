import vs from "value_schema";

let entitySchema = {
  title: vs.string({
    trims: true,
    maxLength: {
      length: 150,
      trims: true,
    },
  }),
  url: vs.string(),
  parent: vs.string({ ifUndefined: "", ifEmptyString: "", ifNull: "" }),
  data: vs.object({
    schemaObject: {
      target: vs.string({ ifUndefined: "_blank", ifEmptyString: "_blank" }),
      weight: vs.number({ ifUndefined: 0, ifEmptyString: 0 }),
    },
  }),
  published: vs.boolean({ ifUndefined: false, ifEmptyString: false }),
};

export default entitySchema;
