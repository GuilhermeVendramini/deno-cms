import vs from "value_schema";

const userRegisterSchema = {
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
};

const userLoginSchema = {
  email: vs.email(),
  password: vs.string({
    minLength: 8,
  }),
};

export { userRegisterSchema, userLoginSchema };
