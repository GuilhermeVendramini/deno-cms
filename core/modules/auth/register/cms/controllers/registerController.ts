import { renderFileToString } from "dejs";
import userRepository from "../../../../../../repositories/mongodb/user/userRepository.ts";
import hash from "../../../../../../shared/utils/hashes/bcryptHash.ts";
import registerSchema from "../../schemas/registerSchema.ts";
import vs from "value_schema";
import { Status } from "oak";
import { UserBaseEntity } from "../../../../users/entities/UserBaseEntity.ts";
import { UserRoles } from "../../../../users/roles/UserRoles.ts";
import cmsErrors from "../../../../../../shared/utils/errors/cms/cmsErrors.ts";

export default {
  async register(context: Record<string, any>) {
    try {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get("THEME")}templates/auth/registerView.ejs`,
        {
          message: "",
        }
      );
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },
  async registerPost(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let bodyValue = await body.value;
      let email = bodyValue.get("email");
      let emailAlreadyExists = await userRepository.findOneByEmail(email);

      if (Object.keys(emailAlreadyExists).length !== 0) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${Deno.env.get(
            "THEME"
          )}templates/auth/registerView.ejs`,
          {
            message: "We already have a user with this email",
          }
        );
        return;
      }

      let user: UserBaseEntity | undefined;
      let validated: { name: string; email: string; password: string };
      let name = bodyValue.get("name");
      let password = bodyValue.get("password");
      let password_confirm = bodyValue.get("password_confirm");

      if (password != password_confirm) {
        context.response.body = await renderFileToString(
          `${Deno.cwd()}${Deno.env.get(
            "THEME"
          )}templates/auth/registerView.ejs`,
          {
            message: "Passwords do not match",
          }
        );
        return;
      }

      validated = vs.applySchemaObject(registerSchema, {
        name,
        email,
        password,
      });

      if (validated) {
        validated.password = await hash.bcrypt(validated.password);
        user = new UserBaseEntity(
          validated.name,
          validated.email,
          validated.password,
          [UserRoles.writer],
          Date.now()
        );

        await userRepository.insertOne(user);

        context.response.body = await renderFileToString(
          `${Deno.cwd()}${Deno.env.get("THEME")}templates/auth/loginView.ejs`,
          {
            message: "User created successfully.",
          }
        );
        return;
      }
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get("THEME")}templates/auth/registerView.ejs`,
        {
          message: "Error submitting the form. Please try again.",
        }
      );
      return;
    } catch (error) {
      console.log(error.message);
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get("THEME")}templates/auth/registerView.ejs`,
        {
          message: error.message,
        }
      );
    }
  },
};
