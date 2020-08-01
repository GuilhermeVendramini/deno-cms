import { UserRoles } from "../../../../core/modules/users/roles/UserRoles.ts";
import {
  Status,
} from "oak";
import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";
import { renderFileToString } from "dejs";
import currentUserSession from "../../../../shared/utils/sessions/currentUserSession.ts";

export default {
  async needToBeAuthor(
    context: Record<string, any>,
    next: Function,
    bundle: string,
  ) {
    try {
      let repository = new EntityRepository(bundle);
      let method = context.request.method;
      let currentUser = context.getCurrentUser;
      let id: string;

      if (method == "POST") {
        if (!context.request.hasBody) {
          context.throw(Status.BadRequest, "Bad Request");
        }

        let body = await context.request.body();
        let bodyValue = await body.value;

        id = bodyValue.get("id");
      } else {
        id = context.params.id;
      }

      let entity: any = await repository.findOneByID(id);

      if (
        currentUser._id.$oid != entity.author._id.$oid &&
        !currentUser.roles.includes(UserRoles.admin)
      ) {
        context.throw(Status.Unauthorized, "Unauthorized");
      }

      await next();
    } catch (error) {
      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${
          Deno.env.get("THEME")
        }templates/unknown_pages/notFound.ejs`,
        {},
      );
      return;
    }
  },

  async needToBePublished(
    context: Record<string, any>,
    next: Function,
    bundle: string,
  ) {
    try {
      let repository = new EntityRepository(bundle);
      let currentUser = await currentUserSession.get(context);
      let path: string = context.request.url.pathname;
      let entity: any = await repository.findOneByFilters({ path: path });

      if (!entity.published && !currentUser) {
        context.throw(Status.Unauthorized, "Unauthorized");
      }
      await next();
    } catch (error) {
      context.response.status = Status.NotFound;
      context.response.body = await renderFileToString(
        `${Deno.cwd()}${
          Deno.env.get("THEME")
        }templates/unknown_pages/notFound.ejs`,
        {},
      );
      return;
    }
  },
};
