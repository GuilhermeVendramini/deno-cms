import { renderFileToString } from "dejs";

export default {
  async recoveryPassword(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/auth/recovery_password/cms/views/recoveryPasswordView.ejs`,
      {
        error: false,
      },
    );
  },
};
