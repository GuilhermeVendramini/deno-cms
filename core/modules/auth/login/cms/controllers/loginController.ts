import { renderFileToString } from "dejs";

export default {
  async login(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/auth/login/cms/views/loginView.ejs`,
      {
        error: false,
      },
    );
  },
};
