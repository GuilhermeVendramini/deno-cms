import { renderFileToString } from "dejs";
import contentRepository from "../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async content(context: Record<string, any>) {
    let content: [] | undefined;
    content = await contentRepository.find();
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/contentView.ejs`,
      {
        currentUser: context.getCurrentUser,
        content: content,
      },
    );
  },

  async taxonomy(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/taxonomyView.ejs`,
      {
        currentUser: context.getCurrentUser,
      },
    );
  },

  async media(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/mediaView.ejs`,
      {
        currentUser: context.getCurrentUser,
      },
    );
  },

  async block(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/blockView.ejs`,
      {
        currentUser: context.getCurrentUser,
      },
    );
  },
};
