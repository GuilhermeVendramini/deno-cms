import { renderFileToString } from "dejs";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";
import contentRepository from "../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async content(context: Record<string, any>) {
    let content: [] | undefined;
    content = await contentRepository.find();
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/contentView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
        content: content,
      },
    );
  },

  async taxonomy(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/taxonomyView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
      },
    );
  },

  async media(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/mediaView.ejs`,
      {
        currentUser: await currentUserSession.get(context),
      },
    );
  },
};
