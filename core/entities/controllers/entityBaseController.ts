import { renderFileToString } from "dejs";
import {
  Status,
} from "oak";
import cmsErrors from "../../../shared/utils/errors/cms/cmsErrors.ts";
import currentUserSession from "../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async addPost(context: Record<string, any>) {
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

  async add(context: Record<string, any>) {
    let page = context.getPage;

    if (page.error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, page.message);
      return;
    }

    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${page.entity.type}/cms/views/entityFormView.ejs`,
      {
        currentUser: context.getCurrentUser,
        page: page,
      },
    );
    return;
  },

  async view(context: Record<string, any>) {
    let page = context.getPage;

    if (page.error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, page.message);
      return;
    }

    let currentUser = await currentUserSession.get(context);

    context.response.body = await renderFileToString(
      `${Deno.cwd()}${
        Deno.env.get("THEME")
      }templates/entities/${page.entity.bundle}/${page.entity.type}/entityViewDefault.ejs`,
      {
        currentUser: currentUser,
        page: page,
      },
    );
    return;
  },

  async delete(context: Record<string, any>) {
    let page = context.getPage;

    if (page.error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, page.message);
      return;
    }

    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/${page.entity.type}/cms/views/entityFormConfirmDelete.ejs`,
      {
        currentUser: context.getCurrentUser,
        page: page,
      },
    );
    return;
  },

  async deletePost(context: Record<string, any>) {
    let path: string = context.getRedirect;
    context.response.redirect(path);
    return;
  },
};
