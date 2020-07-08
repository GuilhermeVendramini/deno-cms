import vs from "value_schema";
import loginSchema from "../../schemas/loginSchema.ts";
import {
  Status,
} from "oak";
import userToken from "../../../../../../shared/utils/tokens/userToken.ts";
import hash from "../../../../../../shared/utils/hashes/bcryptHash.ts";
import userService from "../../../../../../repositories/mongodb/user/userRepository.ts";

export default {
  async login(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let body = await context.request.body();

      if (body.type !== "json") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      type userLogin = { email: string; password: string };
      let value: userLogin | undefined;
      let logged: boolean | undefined;

      value = vs.applySchemaObject(
        loginSchema,
        body.value,
      ) as userLogin;

      let user: any | undefined;

      if (value?.email && value?.password) {
        user = await userService.findOneByEmail(value.email);

        if (user) {
          logged = await hash.verify(
            user.password,
            value.password,
          );
        }
      }

      if (logged) {
        let token: string = userToken.generate(user._id.$oid);
        context.response.body = {
          message: "User successfully logged in.",
          user: user,
          token: token,
        };
        context.response.type = "json";
        return;
      }

      context.throw(Status.BadRequest, "Bad Request");
    } catch (error) {
      console.log(error.message);
      context.response.body = { error: error.message };
      context.response.status = Status.BadRequest;
      context.response.type = "json";
    }
  },
};
