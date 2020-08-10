import { renderFileToString } from "dejs";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";
import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";
import { Status } from "oak";
import cmsErrors from "../../../../shared/utils/errors/cms/cmsErrors.ts";

const repository = new EntityRepository("content");

export default {
  async home(context: Record<string, any>) {
    try {
      let currentUser = await currentUserSession.get(context);
      let front: {} | undefined;

      front = await repository.findOneByFilters({
        type: "landing_page",
        published: true,
        "data.front": true,
      });

      if (Object.keys(front).length != 0) {
        let page = context.getPage;
        page.content = front;

        context.response.body = await renderFileToString(
          `${Deno.cwd()}${Deno.env.get(
            "THEME"
          )}templates/entities/content/landing_page/entityViewDefault.ejs`,
          {
            currentUser: currentUser,
            page: page,
          }
        );
        return;
      }

      context.response.body = await renderFileToString(
        `${Deno.cwd()}${Deno.env.get("THEME")}templates/home/homeView.ejs`,
        {
          currentUser: currentUser,
          page: context.getPage,
        }
      );
      return;
    } catch (error) {
      await cmsErrors.NotFoundError(context, Status.NotFound, error);
      return;
    }
  },
};
