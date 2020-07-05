import { renderFileToString } from "dejs";

export default {
  async save(context: Record<string, any>) {

    let path : string | undefined = context?.getRedirect;

    if (path) {
      context.response.redirect(path);
      return;
    }

    let currentUser = context.getCurrentUser;

    if (context.getPage.error) {
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${context.getPage.type}/cms/views/entityFormView.ejs`,
        {
          currentUser: currentUser,
          page: context.getPage,
        },
      );
    }
  }
}