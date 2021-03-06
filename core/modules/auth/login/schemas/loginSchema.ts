import vs from "value_schema";

let loginSchema = {
  email: vs.email(),
  password: vs.string({
    minLength: 8,
  }),
};

export default loginSchema;
