import userModel from "../../../../../../shared/models/user/userModel.ts";
import userService from "../../../../../../repositories/mongodb/user/userRepository.ts";
import hash from "../../../../../../shared/utils/hashes/bcryptHash.ts";
import registerSchema from "../../schemas/registerSchema.ts";
import vs from "value_schema";
import {
  Status,
} from "oak";

export default {
  async register(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "json") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let user: Partial<userModel> | undefined;
      user = vs.applySchemaObject(registerSchema, body.value);

      if (user) {
        user.password = await hash.bcrypt(user?.password as string);

        await userService.insertOne(user);

        context.response.body = user;
        context.response.type = "json";
        return;
      }
      context.throw(Status.BadRequest, "Bad Request");
    } catch (error) {
      console.log(error);
      context.response.body = { error: error.message };
      context.response.status = Status.BadRequest;
      context.response.type = "json";
    }
  },
};
