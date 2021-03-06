import { renderFileToString } from "dejs";
import { Status } from "oak";
import cmsErrors from "../../../shared/utils/errors/cms/cmsErrors.ts";
import currentUserSession from "../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async list(context: Record<string, any>) {
    try {
      let page = context.getPage;

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${
          page.entity.type
        }/cms/views/entityListView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        }
      );
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async addPost(context: Record<string, any>) {
    try {
      let path: string | undefined = context?.getRedirect;

      if (path) {
        context.response.redirect(path);
        return;
      }

      let page = context.getPage;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${
          page.entity.type
        }/cms/views/entityFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        }
      );
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async add(context: Record<string, any>) {
    try {
      let page = context.getPage;

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${
          page.entity.type
        }/cms/views/entityFormView.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        }
      );
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async view(context: Record<string, any>) {
    try {
      let page = context.getPage;
      let currentUser = await currentUserSession.get(context);

      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get("THEME")}templates/entities/${
          page.entity.bundle
        }/${page.entity.type}/entityViewDefault.ejs`,
        {
          currentUser: currentUser,
          page: page,
        }
      );
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async delete(context: Record<string, any>) {
    try {
      let page = context.getPage;

      context.response.body = await renderFileToString(
        `${Deno.cwd()}/core/modules/${
          page.entity.type
        }/cms/views/entityFormConfirmDelete.ejs`,
        {
          currentUser: context.getCurrentUser,
          page: page,
        }
      );
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },

  async deletePost(context: Record<string, any>) {
    try {
      let path: string = context.getRedirect;
      context.response.redirect(path);
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },
};
