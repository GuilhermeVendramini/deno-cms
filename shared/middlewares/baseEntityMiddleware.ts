import { UserRoles } from "../../core/modules/users/roles/UserRoles.ts";
import {
  Status,
} from "oak";
import contentRepository from "../../repositories/mongodb/content/contentRepository.ts";
import taxonomyRepository from "../../repositories/mongodb/taxonomy/taxonomyRepository.ts";
import currentUserSession from "../../shared/utils/sessions/currentUserSession.ts";
import { renderFileToString } from "dejs";

async function needTobeAuthor(
  context: Record<string, any>,
  next: Function,
  repository: any,
) {
  try {
    let method = context.request.method;
    let currentUser: any | undefined = await currentUserSession.get(context);
    let id: string;

    if (method == "POST") {
      if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
      }

      const body = await context.request.body();
      id = body.value.get("id");
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
      `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
      {},
    );
    return;
  }
}

async function needToBePublished(
  context: Record<string, any>,
  next: Function,
  repository: any,
) {
  try {
    let currentUser: any | undefined = await currentUserSession.get(context);
    const id: string = context.params.id;
    let entity: any = await repository.findOneByID(id);

    if (!entity.published && !currentUser) {
      context.throw(Status.Unauthorized, "Unauthorized");
    }
    await next();
  } catch (error) {
    context.response.status = Status.NotFound;
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/unknownPages/views/notFound.ejs`,
      {},
    );
    return;
  }
}

export default {
  async needToBeTaxonomyAuthor(
    context: Record<string, any>,
    next: Function,
  ) {
    await needTobeAuthor(context, next, taxonomyRepository);
  },
  async needToBeContentAuthor(
    context: Record<string, any>,
    next: Function,
  ) {
    await needTobeAuthor(context, next, contentRepository);
  },
  async contentNeedToBePublished(
    context: Record<string, any>,
    next: Function,
  ) {
    await needToBePublished(context, next, contentRepository);
  },
  async taxonomyNeedToBePublished(
    context: Record<string, any>,
    next: Function,
  ) {
    await needToBePublished(context, next, taxonomyRepository);
  },
};
