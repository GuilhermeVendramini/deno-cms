import { renderFileToString } from "dejs";

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
};
