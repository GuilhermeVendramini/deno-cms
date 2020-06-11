import { renderFileToString } from "dejs";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async home(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/home/views/homeView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
      },
    );
  },
};
