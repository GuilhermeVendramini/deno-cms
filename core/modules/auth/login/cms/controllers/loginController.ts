import { renderFileToString } from "dejs";
import vs from "value_schema";
import userModel from "../../../../../../shared/models/user/userModel.ts";
import { userLoginSchema } from "../../../../../../shared/utils/validators/schemas/userSchema.ts";
import {
  Status,
} from "oak";
import userToken from "../../../../../../shared/utils/tokens/userToken.ts";
import hash from "../../../../../../shared/utils/hashes/bcryptHash.ts";
import userService from "../../../../../../services/sqlite/user/userService.ts";
import currentUserSession from "../../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async login(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/auth/login/cms/views/loginView.ejs`,
      {
        message: "",
      },
    );
  },

  async loginPost(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let body = await context.request.body();

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      type userLogin = { email: string; password: string };
      let value: userLogin | undefined;
      let logged: boolean | undefined;
      let email = body.value.get("email");
      let password = body.value.get("password");

      value = vs.applySchemaObject(
        userLoginSchema,
        { email, password },
      ) as userLogin;

      let user: Partial<userModel> | undefined;

      if (value?.email && value?.password) {
        user = await userService.selectOneByEmail(value.email) as userModel;

        if (user) {
          logged = await hash.verify(
            user.password,
            value.password,
          );
        }
      }

      if (user && logged) {
        let token: string = userToken.generate(user.id);

        context.cookies.set("jwt", token);
        currentUserSession.setSession(context, user);
        context.response.redirect('/');
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/auth/login/cms/views/loginView.ejs`,
        {
          message: "Wrong login or email.",
        },
      );
      return;
    } catch (error) {
      console.log(error);
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/auth/login/cms/views/loginView.ejs`,
        {
          message: error.message,
        },
      );
      return;
    }
  },
};
