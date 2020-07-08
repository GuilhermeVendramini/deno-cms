import userRepository from "../../../../../../repositories/mongodb/user/userRepository.ts";
import hash from "../../../../../../shared/utils/hashes/bcryptHash.ts";
import registerSchema from "../../schemas/registerSchema.ts";
import vs from "value_schema";
import {
  Status,
} from "oak";
import { UserBaseEntity } from "../../../../users/entities/UserBaseEntity.ts";
import { UserRoles } from "../../../../users/roles/UserRoles.ts";

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

      let userAlreadyExists = await userRepository.findOneByEmail(
        body.value?.email,
      );

      if (Object.keys(userAlreadyExists).length !== 0) {
        context.response.body = {
          error: "We already have a user with this email.",
        };
        context.response.status = Status.BadRequest;
        context.response.type = "json";
        return;
      }

      let user: UserBaseEntity | undefined;
      let validated: { name: string; email: string; password: string };
      validated = vs.applySchemaObject(registerSchema, body.value);

      if (validated) {
        validated.password = await hash.bcrypt(validated.password as string);
        user = new UserBaseEntity(
          validated.name,
          validated.email,
          validated.password,
          [UserRoles.writer],
          Date.now(),
        );

        await userRepository.insertOne(user);

        context.response.body = user;
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
