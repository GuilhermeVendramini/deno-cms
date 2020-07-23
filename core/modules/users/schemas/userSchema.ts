import vs from "value_schema";
import { UserRoles } from "../roles/UserRoles.ts";

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
      schema: vs.number({ only: [UserRoles.admin, UserRoles.writer] }),
      ignoresErrors: false,
    },
  }),
  status: vs.boolean({ ifUndefined: false }),
};

export default entitySchema;
