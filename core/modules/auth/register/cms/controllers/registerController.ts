import { renderFileToString } from "dejs";
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
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/auth/register/cms/views/registerView.ejs`,
      {
        message: "",
      },
    );
  },
  async registerPost(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let email = body.value.get("email");

      let userAlreadyExists = await userRepository.findOneByEmail(
        email,
      );

      if (Object.keys(userAlreadyExists).length !== 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/auth/register/cms/views/registerView.ejs`,
          {
            message: "We already have a user with this email.",
          },
        );
        return;
      }

      let user: UserBaseEntity | undefined;
      let validated: { name: string; email: string; password: string };
      let name = body.value.get("name");
      let password = body.value.get("password");
      validated = vs.applySchemaObject(
        registerSchema,
        { name, email, password },
      );

      if (validated) {
        validated.password = await hash.bcrypt(validated.password);
        user = new UserBaseEntity(
          validated.name,
          validated.email,
          validated.password,
          [UserRoles.writer],
          Date.now(),
        );

        await userRepository.insertOne(user);

        context.response.body = await renderFileToString(
          `${Deno.cwd()}/core/modules/auth/login/cms/views/loginView.ejs`,
          {
            message: "User created successfully.",
          },
        );
        return;
      }
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/auth/register/cms/views/registerView.ejs`,
        {
          message: "Error submitting the form. Please try again.",
        },
      );
      return;
    } catch (error) {
      console.log(error.message);
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/auth/register/cms/views/registerView.ejs`,
        {
          message: error.message,
        },
      );
    }
  },
};
