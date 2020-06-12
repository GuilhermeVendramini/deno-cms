import { renderFileToString } from "dejs";
import currentUserSession from "../../../../../shared/utils/sessions/currentUserSession.ts";
import contentRepository from "../../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async content(context: Record<string, any>) {
    let content: [] | undefined;
    content = await contentRepository.find();
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/content/views/contentView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
        content: content,
      },
    );
  },
};
