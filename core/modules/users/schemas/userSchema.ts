import vs from "value_schema";

let entitySchema = {
  name: vs.string({
    minLength: 2,
    maxLength: {
      length: 100,
      trims: false,
    },
  }),
  email: vs.email(),
  password: vs.string({
    minLength: 8,
  }),
  roles: vs.array({
    ifUndefined: [1],
    separatedBy: ",",
    each: {
      schema: vs.number({ only: [0, 1] }),
      ignoresErrors: false,
    },
  }),
  status: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
