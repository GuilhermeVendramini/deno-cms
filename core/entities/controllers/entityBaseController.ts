import { renderFileToString } from "dejs";
import {
  Status,
} from "oak";

export default {
  async save(context: Record<string, any>) {
    let path: string | undefined = context?.getRedirect;

    if (path) {
      context.response.redirect(path);
      return;
    }

    let page = context.getPage;
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${page.entity.type}/cms/views/entityFormView.ejs`,
      {
        currentUser: context.getCurrentUser,
        page: page,
      },
    );
    return;
  },
};
