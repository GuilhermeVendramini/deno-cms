import { renderFileToString } from "dejs";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async home(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}${
        Deno.env.get("THEME")
      }templates/home/homeView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
        page: context.getPage,
      },
    );
  },
};
