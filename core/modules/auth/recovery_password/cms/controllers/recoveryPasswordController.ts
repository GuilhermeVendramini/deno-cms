import { renderFileToString } from "dejs";
import smtpClient from "../../../../smtp/smtpClient.ts";
import { Status } from "oak";
import userRepository from "../../../../../../repositories/mongodb/user/userRepository.ts";
import recoveryPasswordHelper from "../../helpers/recoveryPasswordHelper.ts";
import cmsErrors from "../../../../../../shared/utils/errors/cms/cmsErrors.ts";
import userToken from "../../../../../../shared/utils/tokens/userToken.ts";
import currentUserSession from "../../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async recoveryPassword(context: Record<string, any>) {
    try {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get(
          "THEME"
        )}templates/auth/recoveryPasswordView.ejs`,
        {
          message: false,
          error: false,
        }
      );
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },
  async recoveryPasswordPost(context: Record<string, any>) {
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

      let user = await userRepository.findOneByEmail(email);

      let result: any;

      if (Object.keys(user).length !== 0) {
        let hash = await recoveryPasswordHelper.generateRecoveryPasswordLink(
          user
        );

        let link: string = "/recovery-password/login/" + hash;
        let message: string = `
        To create a new password, access the following address:

          ${link}
        `;

        result = await smtpClient.sendEmail({
          from: "denocms@denocms.com",
          to: email,
          subject: "Deno CMS recovery password",
          content: message,
        });

        result.message = "Please follow the instructions we send in your email";
      } else {
        result = {
          message: "Email not registered in our database",
          error: true,
        };
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get(
          "THEME"
        )}templates/auth/recoveryPasswordView.ejs`,
        {
          message: result.message,
          error: result.error,
        }
      );
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get(
          "THEME"
        )}templates/auth/recoveryPasswordView.ejs`,
        {
          message: error.message,
          error: true,
        }
      );
    }
  },
  async recoveryPasswordLogin(context: Record<string, any>) {
    try {
      let hash: string = context.params?.hash;
      let user: any = await recoveryPasswordHelper.findUserByHash(hash);

      if (user && user.status) {
        let token: string = await userToken.generate(user._id.$oid);
        delete user.password;
        context.cookies.set("jwt", token);
        currentUserSession.set(context, user);
        context.response.redirect(`/admin/user/edit/${user._id.$oid}`);
        return;
      }

      context.throw(Status.NotFound, "NotFound");
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error.message);
      return;
    }
  },
};
