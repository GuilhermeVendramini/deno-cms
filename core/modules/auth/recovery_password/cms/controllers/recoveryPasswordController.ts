import { renderFileToString } from "dejs";
import smtpClient from "../../../../smtp/smtpClient.ts";
import {
  Status,
} from "oak";
import userRepository from "../../../../../../repositories/mongodb/user/userRepository.ts";
import recoveryPasswordHelper from "../../helpers/recoveryPasswordHelper.ts";

export default {
  async recoveryPassword(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}${
        Deno.env.get("THEME")
      }templates/auth/recoveryPasswordView.ejs`,
      {
        message: false,
        error: false,
      },
    );
  },
  async recoveryPasswordPost(context: Record<string, any>) {
    try {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let body = await context.request.body();
      let bodyValue = await body.value;

      if (body.type !== "form") {
        context.throw(Status.BadRequest, "Bad Request");
      }

      let email = bodyValue.get("email");

      let user = await userRepository.findOneByEmail(
        email,
      );

      let result;

      if (Object.keys(user).length !== 0) {
        let hash = await recoveryPasswordHelper.generateRecoveryPasswordLink(
          user,
        );

        let link: string = '/login/' + hash;
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
      } else {
        result = {
          message: "Email not registered in our database",
          error: true,
        };
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}${
          Deno.env.get("THEME")
        }templates/auth/recoveryPasswordView.ejs`,
        {
          message: result.message,
          error: result.error,
        },
      );
    } catch (error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${
          Deno.env.get("THEME")
        }templates/auth/recoveryPasswordView.ejs`,
        {
          message: error.message,
          error: true,
        },
      );
    }
  },
};
