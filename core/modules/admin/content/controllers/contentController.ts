import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async content(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/content/views/contentView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
      },
    );
  },
};
