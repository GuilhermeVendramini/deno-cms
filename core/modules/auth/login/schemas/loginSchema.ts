import vs from "value_schema";

const loginSchema = {
  email: vs.email(),
  password: vs.string({
    minLength: 8,
  }),
};

export default loginSchema;
