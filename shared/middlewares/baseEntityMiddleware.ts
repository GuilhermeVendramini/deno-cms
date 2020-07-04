import { UserRoles } from "../../core/modules/users/roles/UserRoles.ts";
import {
  Status,
} from "oak";
import entityRepository from "../../repositories/mongodb/entity/entityRepository.ts";
import { renderFileToString } from "dejs";
import currentUserSession from "../utils/sessions/currentUserSession.ts";

const taxonomyRepository = entityRepository.getRepository("taxonomy");
const contentRepository = entityRepository.getRepository("content");
const mediaRepository = entityRepository.getRepository("media");
const blockRepository = entityRepository.getRepository("block");

async function needTobeAuthor(
  context: Record<string, any>,
  next: Function,
  repository: any,
) {
  try {
    let method = context.request.method;
    let currentUser = context.getCurrentUser;
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
    let currentUser = await currentUserSession.get(context);
    let path: string = context.request.url.pathname;
    let entity: any = await repository.findOneByFilters({path: path});

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
  async needToBeBlockAuthor(
    context: Record<string, any>,
    next: Function,
  ) {
    await needTobeAuthor(context, next, blockRepository);
  },
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
  async needToBeMediaAuthor(
    context: Record<string, any>,
    next: Function,
  ) {
    await needTobeAuthor(context, next, mediaRepository);
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
  async mediaNeedToBePublished(
    context: Record<string, any>,
    next: Function,
  ) {
    await needToBePublished(context, next, mediaRepository);
  },
  async blockNeedToBePublished(
    context: Record<string, any>,
    next: Function,
  ) {
    await needToBePublished(context, next, blockRepository);
  },
};
