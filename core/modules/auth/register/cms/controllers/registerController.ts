import { renderFileToString } from "dejs";
import userModel from "../../../../../../shared/models/user/userModel.ts";
import userRepository from "../../../../../../repositories/mongodb/user/userRepository.ts";
import hash from "../../../../../../shared/utils/hashes/bcryptHash.ts";
import registerSchema from "../../schemas/registerSchema.ts";
import vs from "value_schema";
import {
  Status,
} from "oak";

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

      let user: Partial<userModel> | undefined;
      let name = body.value.get("name");
      let email = body.value.get("email");
      let password = body.value.get("password");
      user = vs.applySchemaObject(
        registerSchema,
        { name, email, password },
      ) as {
        username: string;
        password: string;
      };

      if (user) {
        user.password = await hash.bcrypt(user?.password as string);

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
      console.log(error);
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/auth/register/cms/views/registerView.ejs`,
        {
          message: error.message,
        },
      );
    }
  },
};
